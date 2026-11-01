import test from 'node:test';
import assert from 'node:assert/strict';
import {handleOwnerIngest,handleIngest} from '../../src/lib/admin/handlers';
const origin='https://www.taocreativelabs.com';
const batch={schemaVersion:1,batchId:'synthetic_owner_import01',observedAt:'2026-11-01T00:00:00Z'};
const request=(body:unknown=batch,headers:Record<string,string>={})=>new Request(origin+'/api/admin/import',{method:'POST',headers:{'content-type':'application/json',origin,...headers},body:JSON.stringify(body)});
const privateResponse=(r:Response)=>{assert.match(r.headers.get('cache-control')??'',/private.*no-store/);assert.equal(r.headers.get('x-content-type-options'),'nosniff');};
test('owner import denies nonowners before reading body or accessing storage',async()=>{
 let reads=0,writes=0;
 for(const [state,status] of [['anonymous',401],['forbidden',403],['unconfigured',503]] as const){
  const req=request();Object.defineProperty(req,'body',{get(){reads++;throw Error('must not read');}});
  const r=await handleOwnerIngest(req,state,async()=>{writes++;});assert.equal(r.status,status);privateResponse(r);
 }
 assert.equal(reads,0);assert.equal(writes,0);
});
test('owner import rejects absent, null, sibling, attacker origins and cross-site metadata',async()=>{
 let writes=0;
 for(const value of ['', 'null','https://taocreativelabs.com','https://www.taocreativelabs.com.attacker.test']){
  const req=request();value?req.headers.set('origin',value):req.headers.delete('origin');
  assert.equal((await handleOwnerIngest(req,'owner',async()=>{writes++;})).status,403);
 }
 for(const site of ['cross-site','same-site','none'])assert.equal((await handleOwnerIngest(request(batch,{'sec-fetch-site':site}),'owner',async()=>{writes++;})).status,403);
 assert.equal(writes,0);
});
test('same-origin owner imports through existing schema with private acknowledgment only',async()=>{
 let writes=0;
 const r=await handleOwnerIngest(request(batch,{'sec-fetch-site':'same-origin'}),'owner',async(data)=>{writes++;assert.equal(data.batchId,batch.batchId);assert.deepEqual(data.publications,[]);});
 assert.equal(r.status,200);assert.deepEqual(await r.json(),{accepted:true,batchId:batch.batchId});assert.equal(writes,1);privateResponse(r);
});
test('owner import enforces schema, streamed size, media and content type before writes',async()=>{
 let writes=0;const write=async()=>{writes++;};
 assert.equal((await handleOwnerIngest(request({...batch,customerEmails:['private@example.test']}),'owner',write)).status,400);
 assert.equal((await handleOwnerIngest(request({...batch,mediaAssets:[{ref:'archive:media:'+'a'.repeat(64),contentType:'image/jpeg',base64:'not-image',alt:'Synthetic'}]}),'owner',write)).status,400);
 assert.equal((await handleOwnerIngest(request(batch,{'content-type':'text/plain'}),'owner',write)).status,415);
 assert.equal((await handleOwnerIngest(request({...batch,padding:'x'.repeat(512*1024)}),'owner',write)).status,413);
 assert.equal(writes,0);
});
test('owner conflicts and durable failures are private and do not expose backend details',async()=>{
 for(const [code,status] of [['23502',409],['secret backend detail',503]] as const){const r=await handleOwnerIngest(request(),'owner',async()=>{throw Object.assign(Error('private connection/token'),{code});});assert.equal(r.status,status);privateResponse(r);assert.ok(!JSON.stringify(await r.json()).includes('private connection'));}
});
test('machine bearer alone cannot invoke owner import and owner session cannot substitute for writer token',async()=>{
 const req=request(batch,{authorization:'Bearer read-only-machine-jwt'});let writes=0;
 assert.equal((await handleOwnerIngest(req,'anonymous',async()=>{writes++;})).status,401);
 assert.equal((await handleIngest(request(),undefined,async()=>{writes++;})).status,401);assert.equal(writes,0);
});
