import test from 'node:test';
import assert from 'node:assert/strict';
import {handleBusinessRead,handleBusinessIngest} from '../../src/lib/admin/business-handlers';
import type {Snapshot} from '../../src/lib/business-insights';
const empty:Snapshot={schemaVersion:2,generatedAt:'2026-10-31T12:00:00Z',observations:[],catalog:[]};
const token='test-only-ingestion-key-with-more-than-32-characters';
for(const state of ['anonymous','forbidden','unconfigured'] as const)test(`business ${state} denied before database read`,async()=>{let reads=0;const r=await handleBusinessRead(state,async()=>{reads++;return empty;});assert.equal(r.status,state==='anonymous'?401:state==='forbidden'?403:503);assert.equal(reads,0);assert.match(r.headers.get('cache-control')! ,/no-store/);});
test('owner business read/export protected and honest empty model',async()=>{const r=await handleBusinessRead('owner',async()=>empty);assert.equal(r.status,200);assert.deepEqual((await r.json()).rows,[]);const csv=await handleBusinessRead('owner',async()=>empty,{},true);assert.match(csv.headers.get('content-type')!,/csv/);assert.match(await csv.text(),/coverage/);});
test('business managed failure is unavailable, never empty success',async()=>{const r=await handleBusinessRead('owner',async()=>{throw Error('private connection detail');});assert.equal(r.status,503);assert.doesNotMatch(await r.text(),/private connection/);});
function request(body:unknown,key=token){return new Request('https://example.test/api/admin/business',{method:'POST',headers:{authorization:`Bearer ${key}`,'content-type':'application/json'},body:JSON.stringify(body)});}
test('unauthorized business ingestion cannot call writer',async()=>{let writes=0;const r=await handleBusinessIngest(request(empty,'wrong'),token,async()=>{writes++;});assert.equal(r.status,401);assert.equal(writes,0);});
test('aggregate schema rejects arbitrary customer payload',async()=>{let writes=0;const r=await handleBusinessIngest(request({...empty,customers:[{email:'synthetic@example.test'}]}),token,async()=>{writes++;});assert.equal(r.status,400);assert.equal(writes,0);});
test('bounded source snapshot accepted through dedicated machine authorization',async()=>{let written:Snapshot|undefined;const r=await handleBusinessIngest(request(empty),token,async s=>{written=s;});assert.equal(r.status,200);assert.deepEqual(written,empty);});
test('business snapshot conflicts remain409; transient durable errors503',async()=>{for(const [code,status]of [['23502',409],['08006',503]] as const){const r=await handleBusinessIngest(request(empty),token,async()=>{throw Object.assign(Error('hidden'),{code});});assert.equal(r.status,status);assert.doesNotMatch(await r.text(),/hidden/);}});
test('future generated snapshot rejected before writer',async()=>{let writes=0;const r=await handleBusinessIngest(request({...empty,generatedAt:'2099-01-01T00:00:00Z'}),token,async()=>{writes++;});assert.equal(r.status,400);assert.equal(writes,0);});
