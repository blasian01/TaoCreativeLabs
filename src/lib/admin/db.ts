import 'server-only';
import { neon } from '@neondatabase/serverless';
import { dedupePublications, publicationKey, canonicalUrl } from './domain';
import { payloadDigest } from './security';
import type { MarketingSnapshot } from './types';
import type { Ingestion } from './validation';
function sqlClient() { if (!process.env.DATABASE_URL) throw new Error('Admin persistence is not configured'); return neon(process.env.DATABASE_URL); }
export async function readSnapshot(): Promise<MarketingSnapshot> {
  const sql=sqlClient();
  const [items,observations,latest] = await sql.transaction([
    sql`SELECT kind,payload FROM tao_admin_items ORDER BY kind,item_key`,
    sql`SELECT payload FROM tao_admin_observations ORDER BY observed_at DESC LIMIT 10001`,
    sql`SELECT max(received_at) AS last_sync FROM tao_admin_batches`,
  ],{readOnly:true,isolationLevel:'RepeatableRead'});
  const kind = (value:string) => items.filter(i=>i.kind===value).map(i=>i.payload);
  return {generatedAt:new Date().toISOString(),lastSyncAt:latest[0]?.last_sync || null,agents:kind('agents'),accounts:kind('accounts'),publications:dedupePublications(kind('publications')),observations:observations.slice(0,10000).map(r=>r.payload),observationHistoryTruncated:observations.length>10000,experiments:kind('experiments'),business:kind('business')};
}
export async function ingestBatch(batch: Ingestion) {
  const sql=sqlClient();
  const items = [
    ...batch.agents.map(p=>({kind:'agents',key:p.id,payload:p})),
    ...batch.accounts.map(p=>({kind:'accounts',key:`${p.app}:${p.platform}`,payload:p})),
    ...batch.publications.map(p=>({kind:'publications',key:publicationKey(p),payload:p})),
    ...batch.experiments.map(p=>({kind:'experiments',key:p.id,payload:p})),
  ];
  const observations=batch.observations.map(p=>({...p,entityUrl:canonicalUrl(p.entityUrl)}));
  const digest=payloadDigest(batch);
  // A matching retry returns no accepted row: every dependent write is a no-op.
  // A changed body deliberately violates digest NOT NULL and atomically rolls back.
  await sql`WITH accepted AS (
    INSERT INTO tao_admin_batches(batch_id,digest,observed_at) VALUES(${batch.batchId},${digest},${batch.observedAt})
    ON CONFLICT(batch_id) DO UPDATE SET digest=NULL WHERE tao_admin_batches.digest<>EXCLUDED.digest
    RETURNING batch_id
  ), written_items AS (
    INSERT INTO tao_admin_items(kind,item_key,payload)
      SELECT x->>'kind',x->>'key',x->'payload' FROM jsonb_array_elements(${JSON.stringify(items)}::jsonb) x CROSS JOIN accepted
      ON CONFLICT(kind,item_key) DO UPDATE SET payload=EXCLUDED.payload,updated_at=now()
      WHERE COALESCE((EXCLUDED.payload->>'observedAt')::timestamptz,(EXCLUDED.payload->>'verifiedAt')::timestamptz,'-infinity'::timestamptz)
        >= COALESCE((tao_admin_items.payload->>'observedAt')::timestamptz,(tao_admin_items.payload->>'verifiedAt')::timestamptz,'-infinity'::timestamptz)
    RETURNING item_key
  )
    INSERT INTO tao_admin_observations(entity_url,metric,observed_at,payload)
      SELECT x->>'entityUrl',x->>'metric',(x->>'observedAt')::timestamptz,x FROM jsonb_array_elements(${JSON.stringify(observations)}::jsonb) x CROSS JOIN accepted
      ON CONFLICT(entity_url,metric,observed_at) DO UPDATE SET payload=CASE WHEN tao_admin_observations.payload=EXCLUDED.payload THEN tao_admin_observations.payload ELSE NULL END`;
}
