import type { Publication, Observation } from './types';
export const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store, max-age=0', 'Vary': 'Cookie, Authorization', 'X-Content-Type-Options': 'nosniff' };
export const OWNER_GITHUB_ID = '67053548';
export function isOwner(user: { sub?: string } | null | undefined) { return user?.sub === `github|${OWNER_GITHUB_ID}`; }
export function canonicalUrl(value: string) { const u = new URL(value); for (const key of [...u.searchParams.keys()]) if (key.startsWith('utm_') || ['fbclid','igsh','mibextid'].includes(key)) u.searchParams.delete(key); u.searchParams.sort(); u.hash = ''; return u.toString().replace(/\/$/, ''); }
export function publicationKey(p: Publication) { return [p.app, p.date, p.slot, p.platform].join(':'); }
// Compare instants without discarding supported fractional timestamp precision.
export function instantKey(value: string) { const fraction=(value.match(/\.(\d+)(?:Z|[+-]\d\d:\d\d)$/)?.[1]??'').padEnd(6,'0').slice(3,6); return BigInt(Date.parse(value))*1000n+BigInt(fraction||'0'); }
export function newestFirst(a: {observedAt:string}, b: {observedAt:string}) { const aa=instantKey(a.observedAt),bb=instantKey(b.observedAt); return aa<bb?1:aa>bb?-1:0; }
export function dedupePublications(rows: Publication[]) {
  const byKey = new Map<string, Publication>();
  for (const row of rows) { const key = publicationKey(row); const previous = byKey.get(key); if (!previous || (row.status === 'published' && previous.status !== 'published') || (row.status === previous.status && instantKey(row.observedAt) > instantKey(previous.observedAt))) byKey.set(key, row); }
  const seen = new Set<string>();
  return [...byKey.values()].sort(newestFirst).filter(p => { if (!p.permalink) return true; const key = canonicalUrl(p.permalink); if (seen.has(key)) return false; seen.add(key); return true; });
}
export function latestObservations(rows: Observation[]) {
  const map = new Map<string, Observation>();
  for (const r of rows) { const key = [canonicalUrl(r.entityUrl),r.metric,r.periodStart?instantKey(r.periodStart):null,r.periodEnd?instantKey(r.periodEnd):null,r.source].join('|'); const old = map.get(key); if (!old || instantKey(r.observedAt) > instantKey(old.observedAt)) map.set(key,r); }
  return [...map.values()];
}
export function comparableRate(numerator: number | null, denominator: number | null) { return numerator === null || denominator === null || denominator <= 0 ? null : numerator / denominator; }
export function isStale(at: string | null, now = Date.now(), hours = 48) { return !at || !Number.isFinite(Date.parse(at)) || now - Date.parse(at) > hours * 3600000; }
export function csvCell(value: unknown) { let s = String(value ?? ''); if (/^[\s]*[=+@\-\t\r]/.test(s)) s = "'" + s; return `"${s.replace(/"/g,'""')}"`; }
export function publicationCsv(rows: Publication[]) { return [['app','platform','date','slot','status','permalink','caption','concept','conceptId','scriptId','hook','format','mediaRef','publishedAt','distribution','observedAt','retrievedAt','source','taskOwner','taskStatus','dependency','effortMinutes','costMinor','currency','effortSource'], ...rows.map(p=>[p.app,p.platform,p.date,p.slot,p.status,p.permalink,p.caption,p.concept,p.conceptId,p.scriptId,p.hook,p.format??'unknown',p.mediaRef,p.publishedAt,p.distribution??'unknown',p.observedAt,p.retrievedAt,p.source,p.task?.owner,p.task?.status,p.task?.dependency,p.effort?.minutes,p.effort?.costMinor,p.effort?.currency,p.effort?.source])].map(r=>r.map(csvCell).join(',')).join('\r\n'); }
