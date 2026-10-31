// Integration checks use the real Auth0 SDK cookie boundary with an ephemeral
// TEST-ONLY signing secret, and the provisioned development Neon database.
import fs from 'node:fs';
import {parseEnv} from 'node:util';
import {randomBytes} from 'node:crypto';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const [envFile,batchFile,businessFile]=process.argv.slice(2);
if(!envFile||!batchFile)throw Error('Private env file and sanitized batch file required');
const env={...process.env,...parseEnv(fs.readFileSync(envFile,'utf8'))};
const secret=randomBytes(32).toString('hex');
const base='http://localhost:3100';
const log=fs.openSync('/Users/bronsonwoods/OpenBot/Shared/Engineering/Bridge/MarketingAdmin/http-server.log','w');
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3100','-H','localhost'],{env:{...env,AUTH0_SECRET:secret,APP_BASE_URL:base},stdio:['ignore',log,log]});
const {encrypt}=await import(pathToFileURL(path.resolve('node_modules/@auth0/nextjs-auth0/dist/server/cookies.js')).href);
const now=Math.floor(Date.now()/1000);
async function cookie(sub,exp=now+3600){const encrypted=await encrypt({user:{sub},tokenSet:{accessToken:'synthetic-test-only',expiresAt:now+3600,scope:'openid profile'},internal:{sid:'synthetic-local-fixture',createdAt:now}},secret,exp);return '__session='+encrypted;}
let count=0;const pass=(name)=>{count++;console.log('PASS '+name);};
try{
 for(let i=0;i<60;i++){try{const r=await fetch(base+'/admin');if(r.ok)break;}catch{}await new Promise(r=>setTimeout(r,500));if(i===59)throw Error('Server startup timed out');}
 for(const route of ['/','/products','/contact','/about','/solutions']){assert.equal((await fetch(base+route)).status,200);}pass('public marketing pages remain available');
 const publicPage=await fetch(base+'/admin');const html=await publicPage.text();assert.ok(html.includes('Continue with GitHub'));assert.ok(!html.includes('story_fbid=')&&!html.includes('Post library'));assert.ok(publicPage.headers.get('cache-control').includes('no-store'));pass('anonymous page has login only, no dataset and private no-store');
 for(const endpoint of ['/api/admin/snapshot','/api/admin/export','/api/admin/business']){const r=await fetch(base+endpoint);assert.equal(r.status,401);pass('anonymous denied '+endpoint);}
 const bad=await fetch(base+'/api/admin/ingest',{method:'POST',headers:{'content-type':'application/json'},body:'{}'});assert.equal(bad.status,401);pass('unauthorized ingestion denied');
 const auth={authorization:'Bearer '+env.ADMIN_INGEST_TOKEN,'content-type':'application/json'};const body=fs.readFileSync(batchFile,'utf8');
 for(let i=0;i<2;i++){const r=await fetch(base+'/api/admin/ingest',{method:'POST',headers:auth,body});assert.equal(r.status,200);assert.equal((await r.json()).accepted,true);}pass('actual source batch durable and idempotently acknowledged twice');
 const ownerCookie=await cookie('github|67053548');const ownerHeaders={cookie:ownerCookie};const snap=await fetch(base+'/api/admin/snapshot',{headers:ownerHeaders});assert.equal(snap.status,200);const data=await snap.json();assert.equal(data.publications.length,90);assert.equal(data.publications.filter(p=>p.status==='published').length,9);assert.equal(data.accounts.length,25);assert.equal(data.agents.length,17);assert.equal(data.observations.length,8);assert.ok(data.observations.every(p=>p.value===0));assert.ok(!JSON.stringify(data).includes('/Users/'));pass('SDK-authenticated owner receives actual managed 90 records/9 posts/25 accounts/17 agents/8 zeros');
 const changed=JSON.parse(body);changed.publications[0].caption+=' changed';const conflict=await fetch(base+'/api/admin/ingest',{method:'POST',headers:auth,body:JSON.stringify(changed)});assert.equal(conflict.status,409);pass('same batch ID with different body rejected transactionally');
 const measureConflict=JSON.parse(body);measureConflict.batchId+='-observation-conflict';measureConflict.observations[0].value=1;const mr=await fetch(base+'/api/admin/ingest',{method:'POST',headers:auth,body:JSON.stringify(measureConflict)});assert.equal(mr.status,409);pass('measurement history cannot silently overwrite same timestamp');
 const recheck=await fetch(base+'/api/admin/snapshot',{headers:ownerHeaders});assert.ok((await recheck.json()).observations.every(p=>p.value===0));pass('failed conflict leaves measured zeros intact');
 const ownerPage=await fetch(base+'/admin',{headers:ownerHeaders});assert.equal(ownerPage.status,200);assert.ok((await ownerPage.text()).includes('Post library'));pass('owner private SSR renders dashboard');
 assert.equal((await fetch(base+'/admin/business',{headers:ownerHeaders})).status,200);pass('business tab remains owner guarded');
 if(businessFile){
 const businessBody=fs.readFileSync(businessFile,'utf8');
 assert.equal((await fetch(base+'/api/admin/business',{method:'POST',headers:{'content-type':'application/json'},body:businessBody})).status,401);pass('anonymous business ingestion denied');
 for(let i=0;i<2;i++)assert.equal((await fetch(base+'/api/admin/business',{method:'POST',headers:auth,body:businessBody})).status,200);pass('business snapshot stored and exact repeat idempotent');
 const br=await fetch(base+'/api/admin/business',{headers:ownerHeaders});assert.equal(br.status,200);const business=await br.json();assert.equal(business.rows.length,73);assert.equal(business.catalog.length,24);assert.equal(business.rows.filter(r=>r.observation.metric==='source_auth_accounts_current').length,4);assert.ok(business.rows.filter(r=>r.observation.metric==='registered_users').every(r=>r.observation.value===null));pass('source counts remain qualified and registered customers unknown');
 const conflictB=JSON.parse(businessBody);conflictB.observations[0].value+=1;assert.equal((await fetch(base+'/api/admin/business',{method:'POST',headers:auth,body:JSON.stringify(conflictB)})).status,409);pass('business same-time identity cannot replace immutable snapshot');
 const original=await fetch(base+'/api/admin/business?snapshot='+encodeURIComponent(JSON.parse(businessBody).generatedAt),{headers:ownerHeaders});assert.equal(original.status,200);assert.equal((await original.json()).rows[0].observation.value,JSON.parse(businessBody).observations[0].value);pass('business historic snapshot survives conflicting write unchanged');
 const businessPage=await fetch(base+'/admin/business',{headers:ownerHeaders});const bp=await businessPage.text();assert.equal(businessPage.status,200);assert.ok(bp.includes('Business performance, with evidence.')&&bp.includes('Source-project accounts'));pass('owner business SSR renders evidence catalog and explicit limitations');
 assert.equal((await fetch(base+'/api/admin/business',{headers:{cookie:await cookie('github|123')}})).status,403);pass('nonowner business evidence denied');
 }
 const outsider=await cookie('github|123');const denied=await fetch(base+'/api/admin/snapshot',{headers:{cookie:outsider}});assert.equal(denied.status,403);assert.ok(!(await denied.text()).includes('story_fbid'));pass('SDK-valid outsider GitHub identity denied before dataset');
 const expired=await cookie('github|67053548',now-120);assert.equal((await fetch(base+'/api/admin/snapshot',{headers:{cookie:expired}})).status,401);pass('expired SDK cookie denied');
 assert.equal((await fetch(base+'/api/admin/snapshot',{headers:{cookie:'__session=forged'}})).status,401);pass('forged cookie denied');
 const exportR=await fetch(base+'/api/admin/export',{headers:ownerHeaders});assert.equal(exportR.status,200);assert.ok(exportR.headers.get('content-type').startsWith('text/csv'));pass('owner export protected and available');
 const redirect=await fetch(base+'/auth/login?returnTo=https://attacker.invalid',{redirect:'manual'});assert.equal(redirect.status,400);pass('open return destination rejected');
 const login=await fetch(base+'/auth/login?returnTo=%2Fadmin',{redirect:'manual'});assert.ok([302,307].includes(login.status));const location=new URL(login.headers.get('location'));assert.equal(location.hostname,env.AUTH0_DOMAIN);assert.equal(location.searchParams.get('connection'),'github');assert.ok(location.searchParams.get('state'));assert.ok(location.searchParams.get('code_challenge'));assert.equal(location.searchParams.get('code_challenge_method'),'S256');pass('SDK login uses real Auth0 domain, GitHub connection, state and PKCE');
 const logout=await fetch(base+'/auth/logout',{headers:ownerHeaders,redirect:'manual'});assert.ok([302,307].includes(logout.status));assert.ok(logout.headers.get('set-cookie')?.includes('__session='));pass('SDK logout clears application session cookie');
 if(process.env.ADMIN_OPENBOT_PREVIEW==='1'){
   const {createServer}=await import('node:http');
   const preview=createServer(async(req,res)=>{
     if(req.method!=='GET'||req.url?.startsWith('/auth/')){res.writeHead(403);res.end('QA preview does not perform provider sign-in or writes');return;}
     try{const upstream=await fetch(base+(req.url||'/admin'),{headers:{cookie:ownerCookie,'rsc':String(req.headers.rsc||''),'next-router-state-tree':String(req.headers['next-router-state-tree']||'')},redirect:'manual'});
       res.writeHead(upstream.status,Object.fromEntries([...upstream.headers].filter(([name])=>!['set-cookie','content-encoding','content-length','transfer-encoding'].includes(name))));
       res.end(Buffer.from(await upstream.arrayBuffer()));
     }catch{res.writeHead(502);res.end('QA renderer unavailable');}
   });
   await new Promise(resolve=>preview.listen(3101,'127.0.0.1',resolve));
   console.log('LOCAL QA preview ready on http://127.0.0.1:3101/admin (synthetic owner SDK session, no live OAuth).');
   await new Promise(resolve=>{process.once('SIGTERM',resolve);process.once('SIGINT',resolve);});
   await new Promise(resolve=>preview.close(resolve));
 }

 console.log(JSON.stringify({passed:count,liveOAuth:false,note:'Synthetic encrypted sessions test SDK authorization locally; actual GitHub consent/connection setup remains pending.'}));
}finally{server.kill('SIGTERM');fs.closeSync(log);}
