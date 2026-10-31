import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';

// Exercise the actual component's handlers with deferred network responses.
// The tiny hook host makes state commits explicit without a browser dependency.
const fixture=(id:string)=>({id,app:'aura',date:'2026-10-31',title:id,body:'Saved '+id,notes:'',status:'draft',businessProcess:false,recordingRef:'',publishedUrl:'',version:1,updatedAt:'',sourceDigest:''});
function host(){
 const slots:any[]=[];let cursor=0;
 const pending:{url:string;resolve:(v:any)=>void;reject:(e:Error)=>void}[]=[];
 const hooks={useState(initial:any){const i=cursor++;if(!(i in slots))slots[i]=i===0?[fixture('A'),fixture('B')]:initial;return[slots[i],(v:any)=>{slots[i]=typeof v==='function'?v(slots[i]):v;}];},useRef(initial:any){const i=cursor++;if(!(i in slots))slots[i]={current:initial};return slots[i];},useEffect(){}};
 const jsx=(type:any,props:any)=>({type,props});
 const compiled={exports:{} as any};
 const source=ts.transpileModule(readFileSync('src/components/admin/YouTubeWorkspace.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 runInNewContext(source,{module:compiled,exports:compiled.exports,require:(name:string)=>name==='react'?hooks:name==='react/jsx-runtime'?{jsx,jsxs:jsx}:name.includes('/types')?{APPS:['aura']}:name.includes('/model')?{statuses:['draft']}:null,fetch:(url:string)=>new Promise((resolve,reject)=>pending.push({url,resolve,reject})),window:{confirm:()=>true},URLSearchParams,encodeURIComponent});
 function render(){cursor=0;return compiled.exports.YouTubeWorkspace();}
 function nodes(n:any):any[]{if(!n||typeof n!=='object')return[];if(Array.isArray(n))return n.flatMap(nodes);return[n,...nodes(n.props?.children)];}
 const find=(predicate:(n:any)=>boolean)=>{const n=nodes(render()).find(predicate);assert.ok(n);return n;};
 const open=(id:string)=>find(n=>n.type==='button'&&nodes(n.props.children).some(x=>x.type==='strong'&&x.props.children===id)).props.onClick();
 const respond=(i:number,id:string)=>pending[i].resolve({ok:true,json:async()=>({script:fixture(id),versions:[{version:1,updated_at:''}]})});
 const body=()=>find(n=>n.type==='textarea'&&n.props.className.includes('min-h-[500px]'));
 const save=()=>find(n=>n.type==='button'&&n.props.children==='Save new version');
 return{open,respond,pending,body,save,find};
}

test('delayed reopen preserves founder edits and enabled save',async()=>{
 const h=host();let p=h.open('A');h.respond(0,'A');await p;
 p=h.open('A');h.body().props.onChange({target:{value:'Founder text during load'}});
 assert.equal(h.body().props.value,'Founder text during load');assert.equal(h.save().props.disabled,false);
 h.respond(1,'A');await p;
 assert.equal(h.body().props.value,'Founder text during load');assert.equal(h.save().props.disabled,false);
});

test('out-of-order opens keep the latest selection',async()=>{
 const h=host(),a=h.open('A'),b=h.open('B');h.respond(1,'B');await b;h.respond(0,'A');await a;
 assert.equal(h.body().props.value,'Saved B');assert.equal(h.save().props.disabled,true);
});

test('stale read failures do not replace the current status',async()=>{
 const h=host(),a=h.open('A'),b=h.open('B');h.respond(1,'B');await b;h.pending[0].reject(Error('late network failure'));await a;
 assert.equal(h.body().props.value,'Saved B');
 assert.equal(h.find(n=>n.props?.role==='status').props.children,'Loading scripts…');
});

test('historical response cannot attach to another script',async()=>{
 const h=host();let p=h.open('A');h.respond(0,'A');await p;
 const old=h.find(n=>n.type==='button'&&Array.isArray(n.props.children)&&n.props.children[0]==='Version').props.onClick();
 p=h.open('B');h.respond(2,'B');await p;h.respond(1,'A');await old;
 assert.equal(h.body().props.value,'Saved B');
 assert.throws(()=>h.find(n=>n.type==='article'));
});
