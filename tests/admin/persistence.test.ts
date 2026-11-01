import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import {PGlite} from '@electric-sql/pglite';
import {adminSchema} from '../../src/lib/admin/schema';
import {dedupePublications,latestObservations,newestFirst} from '../../src/lib/admin/domain';
import {payloadDigest} from '../../src/lib/admin/security';
const req=createRequire(import.meta.url);
const newer='2026-10-31T10:00:00Z',older='2026-10-31T12:00:00+05:00';
const post={app:'aura',platform:'facebook',date:'2026-10-31',slot:'noon',status:'published',permalink:'https://facebook.com/test/posts/1',caption:'newer',concept:'synthetic',observedAt:newer,source:'synthetic:test'} as const;
test('offset chronology and equivalent measurement windows use instants',()=>{
 assert.equal([{observedAt:older},{observedAt:newer}].sort(newestFirst)[0].observedAt,newer);
 assert.equal(dedupePublications([post,{...post,caption:'older',observedAt:older}])[0].caption,'newer');
 const obs={app:'aura',platform:'facebook',entityUrl:post.permalink,entityType:'post',metric:'views',value:10,unit:'count',observedAt:newer,periodStart:'2026-10-30T00:00:00Z',periodEnd:'2026-10-31T00:00:00Z',source:'synthetic:test',owner:'Test'} as const;
 const rows=latestObservations([obs,{...obs,value:7,observedAt:older,periodStart:'2026-10-30T05:00:00+05:00',periodEnd:'2026-10-31T05:00:00+05:00'}]);assert.equal(rows.length,1);assert.equal(rows[0].value,10);
 assert.equal(latestObservations([{...obs,observedAt:'2026-10-31T10:00:00.000002Z',value:2},{...obs,observedAt:'2026-10-31T10:00:00.000001Z',value:1}])[0].value,2);
});
async function database(){const db=new PGlite();for(const s of adminSchema)await db.exec(s);return db;}
function load(file:string,db:PGlite){
 const sql=(parts:TemplateStringsArray,...values:unknown[])=>{const query=parts.reduce((s,p,i)=>s+(i?'$'+i:'')+p,'');return {query,values,then(resolve:(value:unknown)=>unknown,reject:(reason:unknown)=>unknown){return db.query(query,values).then(r=>r.rows).then(resolve,reject);}};};
 sql.transaction=async(queries:ReturnType<typeof sql>[])=>db.transaction(async tx=>{const rows=[];for(const q of queries)rows.push((await tx.query(q.query,q.values)).rows);return rows;});
 const exports={};vm.runInNewContext(ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,process:{env:{DATABASE_URL:'offline-only'}},require:(name:string)=>name==='server-only'?{}:name==='@neondatabase/serverless'?{neon:()=>sql}:name==='./domain'?{dedupePublications,publicationKey:()=> 'aura:2026-10-31:noon:facebook',canonicalUrl:(v:string)=>v}:name==='./security'?{payloadDigest}:name==='../business-insights'?{parseSnapshot:(x:unknown)=>x}:req(name)});return exports as Record<string,(...args:any[])=>Promise<any>>;
}
const batch=(id:string,at:string,label:string)=>({schemaVersion:1,batchId:id,observedAt:at,publications:[{...post,observedAt:at,caption:label}],agents:[{id:'test',name:label}],accounts:[{app:'aura',platform:'facebook',verifiedAt:null,owner:label}],experiments:[{id:'test',owner:label}],observations:[]});
test('offline Postgres: A/B/retry A is a no-op for every item; conflicts roll back',async()=>{
 const db=await database();try{const {ingestBatch}=load('src/lib/admin/db.ts',db);const a=batch('batch_AAAA',older,'A'),b=batch('batch_BBBB',newer,'B');await ingestBatch(a);await ingestBatch(b);await ingestBatch(a);const rows=await db.query<{payload:any}>('SELECT payload FROM tao_admin_items');assert.equal(rows.rows.length,4);for(const row of rows.rows)assert.equal(row.payload.caption??row.payload.name??row.payload.owner,'B');await assert.rejects(ingestBatch({...a,agents:[{id:'test',name:'conflict'}]}));assert.equal((await db.query('SELECT * FROM tao_admin_batches')).rows.length,2);await Promise.all([ingestBatch(b),ingestBatch(b)]);assert.equal((await db.query('SELECT * FROM tao_admin_batches')).rows.length,2);}finally{await db.close();}
});
test('offline Postgres: older offset publication cannot replace a newer instant',async()=>{const db=await database();try{const {ingestBatch}=load('src/lib/admin/db.ts',db);await ingestBatch(batch('batch_newer',newer,'newer'));await ingestBatch(batch('batch_older',older,'older'));const row=await db.query<{payload:any}>("SELECT payload FROM tao_admin_items WHERE kind='publications'");assert.equal(row.rows[0].payload.caption,'newer');}finally{await db.close();}});
test('offline Postgres: business history preserves microseconds and roundtrips distinct snapshots',async()=>{const db=await database();try{const {writeBusiness,businessVersions,readBusiness}=load('src/lib/admin/business.ts',db);const ats=['2026-10-31T01:02:03.123456Z','2026-10-31T01:02:03.123457Z'];for(const generatedAt of ats)await writeBusiness({schemaVersion:2,generatedAt,observations:[],catalog:[]});const versions=await businessVersions();assert.deepEqual(Array.from(versions),ats.toReversed());for(const at of versions)assert.equal((await readBusiness(at)).generatedAt,at);const ui=readFileSync('src/components/admin/BusinessWorkspace.tsx','utf8');assert.ok(ui.includes('value={snapshot.generatedAt}'));}finally{await db.close();}});

test('offline Postgres: images are immutable, retry-safe and excluded from dashboard snapshot',async()=>{
 const db=await database();try{
  const {ingestBatch,readMedia,readSnapshot}=load('src/lib/admin/db.ts',db);
  const media={ref:'archive:media:'+'a'.repeat(64),contentType:'image/png',base64:'synthetic-offline-bytes',alt:'Synthetic'};
  const b={...batch('batch_media1',newer,'caption'),mediaAssets:[media]};
  await ingestBatch(b);await ingestBatch(b);
  assert.equal((await readMedia(media.ref)).base64,media.base64);
  const snap=await readSnapshot();assert.equal(snap.publications.length,1);assert.ok(!JSON.stringify(snap).includes(media.base64));
  await assert.rejects(ingestBatch({...b,batchId:'batch_media2',mediaAssets:[{...media,base64:'changed'}]}));
  assert.equal((await readMedia(media.ref)).base64,media.base64);
  assert.equal((await db.query('SELECT * FROM tao_admin_batches')).rows.length,1);
 }finally{await db.close();}
});

test('offline Postgres: owner import route preserves replay and rolls back changed batch',async()=>{
 const {handleOwnerIngest}=await import('../../src/lib/admin/handlers');
 const {ingestionSchema}=await import('../../src/lib/admin/validation');
 const db=await database();try{
  const {ingestBatch}=load('src/lib/admin/db.ts',db);
  const data=ingestionSchema.parse({schemaVersion:1,batchId:'owner_import_fixture_1',observedAt:newer,publications:[post]});
  const request=(body:unknown)=>new Request('https://example.test/api/admin/import',{method:'POST',headers:{origin:'https://example.test','content-type':'application/json'},body:JSON.stringify(body)});
  for(let i=0;i<2;i++)assert.equal((await handleOwnerIngest(request(data),'owner',ingestBatch)).status,200);
  assert.equal((await db.query('SELECT * FROM tao_admin_batches')).rows.length,1);
  assert.equal((await handleOwnerIngest(request({...data,publications:[{...post,caption:'conflicting'}]}),'owner',ingestBatch)).status,409);
  assert.equal((await db.query<{payload:any}>("SELECT payload FROM tao_admin_items WHERE kind='publications'")).rows[0].payload.caption,post.caption);
  assert.equal((await db.query('SELECT * FROM tao_admin_batches')).rows.length,1);
 }finally{await db.close();}
});
