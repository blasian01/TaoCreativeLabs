import { PRIVATE_HEADERS, publicationCsv, csvCell } from './domain';
import { validIngestToken, boundedJson } from './security';
import { ingestionSchema, type Ingestion } from './validation';
import type { MarketingSnapshot } from './types';
export const EXPORT_KINDS=['publications','observations','accounts','agents','experiments'] as const;
export type ExportKind=typeof EXPORT_KINDS[number];
type OwnerState = 'owner'|'anonymous'|'forbidden'|'unconfigured';
export function denied(state: OwnerState) { return Response.json({error:state==='unconfigured'?'Authentication setup required':state==='forbidden'?'Owner access required':'Authentication required'},{status:state==='unconfigured'?503:state==='forbidden'?403:401,headers:PRIVATE_HEADERS}); }
export async function handleRead(state:OwnerState, read:()=>Promise<MarketingSnapshot>, csv:boolean|ExportKind=false) {
  if(state!=='owner')return denied(state);
  try { const data=await read();
    if(!csv)return Response.json(data,{headers:PRIVATE_HEADERS});
    const kind=csv===true?'publications':csv;
    const fields:Record<ExportKind,string[]>={publications:[],observations:['app','platform','entityUrl','entityType','metric','value','unit','observedAt','periodStart','periodEnd','source','owner'],accounts:['app','platform','url','owner','verifiedAt','access','source'],agents:['id','name','role','kind','apps'],experiments:['id','app','owner','hypothesis','status','metric','evidence','outcome']};
    const rows=data[kind] as unknown as Record<string,unknown>[];
    const content=kind==='publications'?publicationCsv(data.publications):[fields[kind],...rows.map(row=>fields[kind].map(key=>Array.isArray(row[key])?(row[key] as string[]).join('; '):row[key]))].map(row=>row.map(csvCell).join(',')).join('\r\n');
    return new Response(content,{headers:{...PRIVATE_HEADERS,'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="tao-${kind}.csv"`,'X-Data-Coverage':data.observationHistoryTruncated?'partial-observation-history':'snapshot'}});
  }
  catch { return Response.json({error:'Managed data is temporarily unavailable'},{status:503,headers:PRIVATE_HEADERS}); }
}
export async function handleIngest(request:Request, expected:string|undefined, write:(data:Ingestion)=>Promise<void>) {
  if(!validIngestToken(request.headers.get('authorization'),expected))return Response.json({error:'Ingestion authorization required'},{status:401,headers:PRIVATE_HEADERS});
  return ingestValidated(request,write);
}
export async function handleOwnerIngest(request:Request,state:OwnerState,write:(data:Ingestion)=>Promise<void>) {
  if(state!=='owner')return denied(state);
  const origin=request.headers.get('origin');
  const site=request.headers.get('sec-fetch-site');
  if(origin!==new URL(request.url).origin||(site!==null&&site!=='same-origin'))return Response.json({error:'Same-origin owner request required'},{status:403,headers:PRIVATE_HEADERS});
  return ingestValidated(request,write);
}
async function ingestValidated(request:Request,write:(data:Ingestion)=>Promise<void>) {
  let json:unknown;
  try{json=await boundedJson(request);}catch(error){const reason=(error as Error).message;return Response.json({error:reason},{status:reason==='body_limit'?413:reason==='content_type'?415:400,headers:PRIVATE_HEADERS});}
  const parsed=ingestionSchema.safeParse(json);
  if(!parsed.success)return Response.json({error:'Invalid ingestion schema',issues:parsed.error.issues.map(i=>({path:i.path.join('.'),code:i.code}))},{status:400,headers:PRIVATE_HEADERS});
  try{await write(parsed.data);return Response.json({accepted:true,batchId:parsed.data.batchId},{headers:PRIVATE_HEADERS});}
  catch(error){const code=(error as {code?:string}).code;return Response.json({error:code==='23502'?'Idempotency conflict':'Durable ingestion failed; safe to retry same batch'},{status:code==='23502'?409:503,headers:PRIVATE_HEADERS});}
}
