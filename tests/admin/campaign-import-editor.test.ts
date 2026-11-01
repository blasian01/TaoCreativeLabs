import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
const body=JSON.stringify({schemaVersion:1,batchId:'synthetic_campaign01',observedAt:'2026-11-01T00:00:00Z',publications:[]});
function host(){
 const slots:any[]=[];let cursor=0,refreshes=0;
 const requests:{url:string;init:any;resolve:(r:any)=>void;reject:(e:Error)=>void}[]=[];
 const hooks={useState(initial:any){const i=cursor++;if(!(i in slots))slots[i]=initial;return[slots[i],(v:any)=>{slots[i]=typeof v==='function'?v(slots[i]):v;}];},useRef(initial:any){const i=cursor++;if(!(i in slots))slots[i]={current:initial};return slots[i];}};
 const jsx=(type:any,props:any)=>({type,props});const compiled={exports:{} as any};
 const source=ts.transpileModule(readFileSync('src/components/admin/CampaignImport.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 runInNewContext(source,{module:compiled,exports:compiled.exports,require:(name:string)=>name==='react'?hooks:name==='react/jsx-runtime'?{jsx,jsxs:jsx}:name==='next/navigation'?{useRouter:()=>({refresh:()=>{refreshes++;}})}:null,fetch:(url:string,init:any)=>new Promise((resolve,reject)=>requests.push({url,init,resolve,reject}))});
 function nodes(n:any):any[]{if(!n||typeof n!=='object')return[];if(Array.isArray(n))return n.flatMap(nodes);return[n,...nodes(n.props?.children)];}
 function find(f:(n:any)=>boolean){cursor=0;const n=nodes(compiled.exports.CampaignImport()).find(f);assert.ok(n);return n;}
 const input=()=>find(n=>n.type==='input');
 const choose=(file:any)=>input().props.onChange({target:{files:[file],value:'selected'}});
 const select=async(text=body)=>{choose({name:'synthetic.json',size:Buffer.byteLength(text),text:async()=>text});await new Promise(resolve=>setImmediate(resolve));};
 const button=()=>find(n=>n.type==='button');
 const message=()=>find(n=>n.props?.role==='status').props.children;
 return{choose,select,input,button,message,requests,refreshes:()=>refreshes};
}
test('file review never imports automatically; duplicate clicks send only once until acknowledgment',async()=>{
 const h=host();await h.select();assert.equal(h.requests.length,0);
 const click=h.button().props.onClick;click();click();assert.equal(h.requests.length,1);assert.equal(h.input().props.disabled,true);
 assert.equal(h.requests[0].url,'/api/admin/import');assert.equal(h.requests[0].init.credentials,'same-origin');assert.equal(h.requests[0].init.body,body);
 h.requests[0].resolve({ok:true,json:async()=>({accepted:true,batchId:'synthetic_campaign01'})});await new Promise(resolve=>setImmediate(resolve));
 assert.match(h.message(),/Acknowledged/);assert.equal(h.refreshes(),1);assert.equal(h.button().props.disabled,false);
});
test('oversize and invalid files cannot leave an importable previous candidate',async()=>{
 const h=host();await h.select();h.choose({name:'huge.json',size:512*1024+1,text:()=>{throw Error('must not read');}});
 assert.match(h.message(),/512 KiB/);assert.throws(()=>h.button());await h.select('{invalid');assert.throws(()=>h.button());assert.equal(h.requests.length,0);
});
test('conflict retains exact selected body without refresh or automatic retry',async()=>{
 const h=host();await h.select();h.button().props.onClick();h.requests[0].resolve({ok:false,status:409,json:async()=>({error:'conflict'})});await new Promise(resolve=>setImmediate(resolve));
 assert.match(h.message(),/Conflict/);assert.equal(h.refreshes(),0);assert.equal(h.requests.length,1);assert.equal(h.button().props.disabled,false);
 h.button().props.onClick();assert.equal(h.requests[1].init.body,body);h.requests[1].reject(Error('offline'));await new Promise(resolve=>setImmediate(resolve));assert.match(h.message(),/not confirmed/);assert.equal(h.refreshes(),0);
});
test('pending file read cannot be replaced by a racing selection',async()=>{
 const h=host();let resolve!:(s:string)=>void;h.choose({name:'first.json',size:body.length,text:()=>new Promise<string>(r=>{resolve=r;})});
 h.choose({name:'second.json',size:1,text:async()=>'{'});resolve(body);await new Promise(r=>setImmediate(r));h.button().props.onClick();assert.equal(h.requests[0].init.body,body);h.requests[0].reject(Error('offline'));await new Promise(r=>setImmediate(r));
});
