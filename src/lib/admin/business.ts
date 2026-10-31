import 'server-only';
import { neon } from '@neondatabase/serverless';
import { parseSnapshot, type Snapshot } from '../business-insights';
function sqlClient(){if(!process.env.DATABASE_URL)throw new Error('Managed data unavailable');return neon(process.env.DATABASE_URL);}
export async function readBusiness(at?:string):Promise<Snapshot>{
 if(at&&!Number.isFinite(Date.parse(at)))throw new Error('Invalid snapshot date');
 const sql=sqlClient();
 const rows=at?await sql`SELECT payload FROM tao_admin_business_snapshots WHERE generated_at=${at}::timestamptz LIMIT 1`:await sql`SELECT payload FROM tao_admin_business_snapshots ORDER BY generated_at DESC LIMIT 1`;
 if(at&&!rows.length)throw new Error('Snapshot unavailable');
 return rows.length?parseSnapshot(rows[0].payload):{schemaVersion:2,generatedAt:new Date().toISOString(),observations:[],catalog:[]};
}
export async function writeBusiness(snapshot:Snapshot){
 await sqlClient()`INSERT INTO tao_admin_business_snapshots(generated_at,payload) VALUES(${snapshot.generatedAt},${JSON.stringify(snapshot)}::jsonb) ON CONFLICT(generated_at) DO UPDATE SET payload=CASE WHEN tao_admin_business_snapshots.payload=EXCLUDED.payload THEN tao_admin_business_snapshots.payload ELSE NULL END`;
}

export async function businessVersions():Promise<string[]>{const rows=await sqlClient()`SELECT generated_at FROM tao_admin_business_snapshots ORDER BY generated_at DESC LIMIT 200`;return rows.map(r=>new Date(r.generated_at).toISOString());}
