import test from 'node:test';
import assert from 'node:assert/strict';
import {isOwner,canonicalUrl,dedupePublications,latestObservations,comparableRate,isStale,publicationCsv} from '../../src/lib/admin/domain';
import {validIngestToken,boundedJson,MAX_INGEST_BYTES} from '../../src/lib/admin/security';
import {ingestionSchema} from '../../src/lib/admin/validation';
import {handleIngest,handleRead} from '../../src/lib/admin/handlers';
import type {Publication,Observation,MarketingSnapshot} from '../../src/lib/admin/types';
const now=new Date().toISOString();
const post:Publication={app:'aura',platform:'facebook',date:'2026-10-31',slot:'12:10',status:'published',permalink:'https://www.facebook.com/permalink.php?story_fbid=one&id=2',caption:'Public synthetic fixture',concept:'synthetic',observedAt:now,source:'synthetic:test'};
const observation:Observation={app:'aura',platform:'facebook',entityUrl:post.permalink!,entityType:'post',metric:'views',value:0,unit:'count',observedAt:now,periodStart:null,periodEnd:null,source:'synthetic:test',owner:'Test'};
const payload={schemaVersion:1,batchId:'synthetic-batch-1',observedAt:now,publications:[post],observations:[observation]};
const snapshot:MarketingSnapshot={generatedAt:now,lastSyncAt:null,agents:[],accounts:[],publications:[post],observations:[observation],experiments:[],business:[]};
const token='synthetic-test-key-with-32-characters';
function request(body:unknown=payload,auth=`Bearer ${token}`){return new Request('http://localhost/api/admin/ingest',{method:'POST',headers:{authorization:auth,'content-type':'application/json'},body:JSON.stringify(body)});}
test('only immutable GitHub owner subject grants access',()=>{assert.equal(isOwner({sub:'github|67053548'}),true);for(const u of [null,{}, {sub:'github|1'},{sub:'google-oauth2|67053548'},{sub:'blasian01'},{sub:'github|67053548 '}])assert.equal(isOwner(u),false);});
test('tracking normalization preserves Facebook post identity query fields',()=>{assert.equal(canonicalUrl(post.permalink!+'&utm_source=x#frag'),canonicalUrl(post.permalink!));assert.notEqual(canonicalUrl(post.permalink!),canonicalUrl(post.permalink!.replace('one','two')));});
test('duplicate source rows count same verified publication once',()=>{const rows=dedupePublications([post,{...post,source:'second-table'},{...post,slot:'different-source-slot'}]);assert.equal(rows.length,1);});
test('status upgrades dedupe natural key without counting old draft',()=>{assert.equal(dedupePublications([{...post,status:'draft',permalink:null},post])[0].status,'published');});
test('latest cumulative observations are selected, never added',()=>{const rows=latestObservations([observation,{...observation,observedAt:'2026-11-01T18:00:00Z',value:4}]);assert.equal(rows.length,1);assert.equal(rows[0].value,4);});
test('unknown metric is distinct from measured zero',()=>{assert.equal(ingestionSchema.parse({...payload,observations:[{...observation,value:null}]}).observations[0].value,null);assert.equal(ingestionSchema.parse(payload).observations[0].value,0);});
test('zero or missing denominator yields undefined rate',()=>{assert.equal(comparableRate(0,0),null);assert.equal(comparableRate(null,5),null);assert.equal(comparableRate(0,5),0);assert.equal(comparableRate(2,10),.2);});
test('stale or absent observation time cannot count as fresh',()=>{assert.equal(isStale(null),true);assert.equal(isStale(now,Date.parse(now)+49*3600000),true);assert.equal(isStale(now,Date.parse(now)),false);});
test('CSV escapes formulas and quotes',()=>{const csv=publicationCsv([{...post,caption:'=IMPORTXML("private")'}]);assert.ok(csv.includes("\"'=IMPORTXML(\"\"private\"\")\""));});
for(const state of ['anonymous','forbidden','unconfigured'] as const)test(`${state} denied before reading private data`,async()=>{let read=false;const response=await handleRead(state,async()=>{read=true;return snapshot;});assert.equal(read,false);assert.equal(response.status,{anonymous:401,forbidden:403,unconfigured:503}[state]);assert.ok(response.headers.get('cache-control')?.includes('no-store'));assert.equal((await response.text()).includes(post.caption),false);});
test('owner can read private data and protected CSV',async()=>{const r=await handleRead('owner',async()=>snapshot);assert.equal(r.status,200);assert.equal((await r.json()).publications.length,1);const csv=await handleRead('owner',async()=>snapshot,true);assert.equal(csv.headers.get('content-type'),'text/csv; charset=utf-8');});
test('storage failure is explicit unavailable, not fake analytics',async()=>{assert.equal((await handleRead('owner',async()=>{throw Error('private connection detail');})).status,503);});
test('wrong or missing ingestion credential denied before writes',async()=>{let writes=0;for(const auth of ['',`Bearer ${token}wrong`,'Basic data'])assert.equal((await handleIngest(request(payload,auth),token,async()=>{writes++;})).status,401);assert.equal(writes,0);assert.equal(validIngestToken(`Bearer ${token}`,undefined),false);});
test('valid machine-scoped ingestion accepted after schema validation',async()=>{let writes=0;const r=await handleIngest(request(),token,async()=>{writes++;});assert.equal(r.status,200);assert.equal(writes,1);});
test('published requires permalink and rejects mismatched platform URL',()=>{assert.equal(ingestionSchema.safeParse({...payload,publications:[{...post,permalink:null}]}).success,false);assert.equal(ingestionSchema.safeParse({...payload,publications:[{...post,permalink:'https://x.com/a/status/1'}]}).success,false);});
test('negative/infinite metrics and incomplete windows rejected',()=>{for(const obs of [{...observation,value:-1},{...observation,value:Infinity},{...observation,periodEnd:now},{...observation,unit:'percent',value:101}])assert.equal(ingestionSchema.safeParse({...payload,observations:[obs]}).success,false);});
test('internal source paths and unrecognized fields rejected',()=>{assert.equal(ingestionSchema.safeParse({...payload,publications:[{...post,source:'/Users/private/file'}]}).success,false);assert.equal(ingestionSchema.safeParse({...payload,customerEmails:[]}).success,false);});
test('body bound is enforced with absent length header',async()=>{await assert.rejects(boundedJson(new Request('http://localhost',{method:'POST',headers:{'content-type':'application/json'},body:'x'.repeat(MAX_INGEST_BYTES+1)})),/body_limit/);});
test('validation failure never invokes durable writer',async()=>{let writes=0;assert.equal((await handleIngest(request({}),token,async()=>{writes++;})).status,400);assert.equal(writes,0);});
test('durable conflict is a 409; transient writer failure is retriable 503',async()=>{assert.equal((await handleIngest(request(),token,async()=>{throw {code:'23502'};})).status,409);assert.equal((await handleIngest(request(),token,async()=>{throw Error('not logged');})).status,503);});

test('calendar-invalid publication dates rejected',()=>{assert.equal(ingestionSchema.safeParse({...payload,publications:[{...post,date:'2026-99-99'}]}).success,false);});

test('publishing date filters convert UTC timestamps to the source calendar',async()=>{const {publishingDay}=await import('../../src/lib/admin/calendar');assert.equal(publishingDay('2026-11-01T00:30:00Z'),'2026-10-31');assert.equal(publishingDay('2026-10-31'),'2026-10-31');});
