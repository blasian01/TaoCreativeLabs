import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { ingestionSchema } from '../../src/lib/admin/validation';
import {parseSnapshot} from '../../src/lib/business-insights';
async function main(){
const [envFile,payloadFile,mode]=process.argv.slice(2);
if(!envFile||!payloadFile)throw new Error('Usage: npm run admin:ingest -- PRIVATE_ENV_FILE SANITIZED_BATCH_FILE');
const env=parseEnv(readFileSync(envFile,'utf8'));
if(!env.ADMIN_INGEST_TOKEN||!env.ADMIN_INGEST_URL)throw new Error('Ingestion credential and target URL must be configured privately');
const url=new URL(env.ADMIN_INGEST_URL);
if(url.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(url.hostname))throw new Error('Ingestion requires HTTPS except loopback');
if(mode&&mode!=='--business')throw new Error('Unknown ingestion mode');
const raw=JSON.parse(readFileSync(payloadFile,'utf8'));
const batch=mode==='--business'?parseSnapshot(raw):ingestionSchema.parse(raw);
if(mode==='--business')url.pathname='/api/admin/business';
const response=await fetch(url,{method:'POST',redirect:'error',headers:{Authorization:`Bearer ${env.ADMIN_INGEST_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify(batch)});
if(!response.ok)throw new Error(`Ingestion failed (${response.status}); retain batch ID and retry after diagnosis`);
console.log(`Durable ${mode==='--business'?'business snapshot':'marketing batch'} acknowledged`);

}
main().catch(()=>{console.error("Admin operation failed; verify private configuration and schema without printing credentials");process.exitCode=1;});
