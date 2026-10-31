import 'server-only';
import {neon}from '@neondatabase/serverless';
import{createHash}from 'node:crypto';
import{WRITE_SQL,type Draft,type Script}from './model';
const sql=()=>{if(!process.env.DATABASE_URL)throw Error('unavailable');return neon(process.env.DATABASE_URL)};
export async function listScripts(q:URLSearchParams){const app=q.get('app')||'',date=q.get('date')||'',status=q.get('status')||'',search=q.get('search')||'',offset=Number(q.get('offset')||0);if(!Number.isInteger(offset)||offset<0||offset>100000||search.length>300)throw Error('invalid');return sql()`SELECT payload-'body'-'notes'-'sourceDigest' AS payload FROM tao_admin_items WHERE kind='youtube_scripts' AND (${app}='' OR payload->>'app'=${app}) AND (${date}='' OR payload->>'date'=${date}) AND (${status}='' OR payload->>'status'=${status}) AND (${search}='' OR strpos(lower(payload->>'title'),lower(${search}))>0) ORDER BY payload->>'date' DESC,item_key LIMIT 201 OFFSET ${offset}`;}
export async function readScript(id:string,version?:number){const key=version?`${id}:v${version}`:id,kind=version?'youtube_versions':'youtube_scripts';const rows=await sql()`SELECT payload FROM tao_admin_items WHERE kind=${kind} AND item_key=${key}`;return rows[0]?.payload as Script|undefined;}
export async function versions(id:string){return sql()`SELECT (payload->>'version')::int AS version,payload->>'updatedAt' AS updated_at FROM tao_admin_items WHERE kind='youtube_versions' AND payload->>'id'=${id} ORDER BY (payload->>'version')::int DESC LIMIT 200`;}
export async function writeScript(draft:Draft,base:number,mode:'import'|'save'){
 const digest=createHash('sha256').update(JSON.stringify(draft)).digest('hex');
 if(mode==='import'&&base!==0)throw Error('conflict');
 const payload:Script={...draft,version:base+1,updatedAt:new Date().toISOString(),sourceDigest:digest};
 const rows=await sql().query(WRITE_SQL,[draft.id,JSON.stringify(payload),base]);
 if(rows.length)return {script:rows[0].payload,replayed:false};
 // Import replay never writes: even after owner edits, compare immutable v1.
 if(mode==='import'){const initial=await readScript(draft.id,1);if(initial?.sourceDigest===digest)return{script:await readScript(draft.id),replayed:true};}
 throw Error('conflict');
}
