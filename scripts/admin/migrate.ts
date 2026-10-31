import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { neon } from '@neondatabase/serverless';
import { adminSchema } from '../../src/lib/admin/schema';
async function main(){
const path=process.argv[2];
if(!path||process.env.VERCEL_ENV==='production')throw new Error('Explicit development env file required; production migration refused');
Object.assign(process.env,parseEnv(readFileSync(path,'utf8')));
if(!process.env.DATABASE_URL)throw new Error('Development database configuration missing');
const sql=neon(process.env.DATABASE_URL);
await sql.transaction(adminSchema.map(statement=>sql.query(statement)));
console.log('Development admin schema ready; no production configuration changed.');

}
main().catch(()=>{console.error("Admin operation failed; verify private configuration and schema without printing credentials");process.exitCode=1;});
