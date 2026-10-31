import { parseSnapshot, buildBusinessInsights, exportRows, type Snapshot, type Filters } from '../business-insights';
import { validIngestToken, boundedJson } from './security';
import { PRIVATE_HEADERS } from './domain';
import { denied } from './handlers';
export async function handleBusinessRead(state:Parameters<typeof denied>[0],read:()=>Promise<Snapshot>,filters:Filters={},csv=false){
 if(state!=='owner')return denied(state);
 try{const model=buildBusinessInsights(await read(),filters,new Date().toISOString());
 return csv?new Response(exportRows(model.rows),{headers:{...PRIVATE_HEADERS,'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="tao-business.csv"'}}):Response.json(model,{headers:PRIVATE_HEADERS});
 }catch{return Response.json({error:'Managed business evidence temporarily unavailable'},{status:503,headers:PRIVATE_HEADERS});}
}
export async function handleBusinessIngest(req:Request,key:string|undefined,write:(s:Snapshot)=>Promise<void>){
 if(!validIngestToken(req.headers.get('authorization'),key))return Response.json({error:'Ingestion authorization required'},{status:401,headers:PRIVATE_HEADERS});
 let snapshot:Snapshot;
 try{snapshot=parseSnapshot(await boundedJson(req));
 if(Date.parse(snapshot.generatedAt)>Date.now()+300000)throw new Error('future');
 const serialized=JSON.stringify(snapshot);
 if(serialized.includes('/Users/')||serialized.includes('file://')||snapshot.observations.some(o=>o.evidence.authority==='synthetic_fixture')||snapshot.catalog.some(o=>o.evidence.authority==='synthetic_fixture'))throw new Error('source');
 }catch(error){const m=(error as Error).message;return Response.json({error:'Invalid bounded aggregate snapshot'},{status:m==='body_limit'?413:m==='content_type'?415:400,headers:PRIVATE_HEADERS});}
 try{await write(snapshot);return Response.json({accepted:true,generatedAt:snapshot.generatedAt},{headers:PRIVATE_HEADERS});}
 catch(error){const conflict=(error as {code?:string}).code==='23502';return Response.json({error:conflict?'Snapshot identity conflict':'Durable ingestion unavailable'},{status:conflict?409:503,headers:PRIVATE_HEADERS});}
}
