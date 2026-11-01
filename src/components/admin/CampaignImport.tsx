'use client';

import {useRef,useState} from 'react';
import {useRouter} from 'next/navigation';

type Candidate={body:string;batchId:string;file:string;counts:string};
const maxBytes=512*1024;
export function CampaignImport(){
 const router=useRouter();
 const [candidate,setCandidate]=useState<Candidate|null>(null);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('Select one prepared JSON batch. Import image batches before publication batches.');
 const active=useRef(false);
 async function select(file:File|undefined){
  if(active.current)return;
  setCandidate(null);
  if(!file)return;
  if(file.size>maxBytes){setMessage('File exceeds the 512 KiB batch limit.');return;}
  active.current=true;setBusy(true);
  try{
   const body=await file.text(),data=JSON.parse(body);
   if(!data||typeof data!=='object'||Array.isArray(data)||typeof data.batchId!=='string'||data.batchId.length>120)throw Error('invalid');
   const names=['mediaAssets','publications','observations','agents','accounts','experiments'];
   const counts=names.map(name=>`${Array.isArray(data[name])?data[name].length:0} ${name}`).join(' · ');
   setCandidate({body,batchId:data.batchId,file:file.name,counts});setMessage('Review the batch below, then import. The server validates every record before storage.');
  }catch{setMessage('Could not read a prepared JSON batch. Nothing was imported.');}
  finally{active.current=false;setBusy(false);}
 }
 async function send(){
  if(active.current||!candidate)return;
  active.current=true;setBusy(true);setMessage('Importing batch…');
  try{
   const response=await fetch('/api/admin/import',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:candidate.body});
   const result=await response.json();
   if(!response.ok){setMessage(response.status===409?'Conflict: this batch or measurement differs from stored evidence. Nothing in this batch was changed. Keep the exact file and investigate.':response.status===401||response.status===403?'Owner session or same-origin verification failed. Nothing was imported.':response.status===400||response.status===413||response.status===415?'Batch validation failed. Nothing was imported.':'Import was not confirmed. Keep the exact file and inspect stored evidence before retrying.');return;}
   if(result.accepted!==true||result.batchId!==candidate.batchId)throw Error('unconfirmed');
   setMessage(`Acknowledged ${candidate.batchId}. An identical replay makes no changes. Refresh and open the publications to verify images, captions and measurements.`);router.refresh();
  }catch{setMessage('Import was not confirmed. Keep the exact file and inspect stored evidence before retrying.');}
  finally{active.current=false;setBusy(false);}
 }
 return <section className="ma-panel ma-import" aria-label="Import prepared campaign evidence"><h2>Import prepared campaign evidence</h2><p>Owner-only manual import. This does not publish posts or collect new analytics. Exact batches can be replayed safely; changed content under an existing batch ID is rejected.</p><label className="ma-button">Choose JSON batch<input aria-label="Choose campaign JSON batch" type="file" accept=".json,application/json" disabled={busy} onChange={event=>{const file=event.target.files?.[0];event.target.value='';void select(file);}}/></label>{candidate&&<div className="ma-evidence"><strong>{candidate.file}</strong><span>Batch: {candidate.batchId}</span><span>{candidate.counts}</span><button className="ma-button ma-button-dark" type="button" disabled={busy} onClick={()=>void send()}>{busy?'Importing…':'Import batch'}</button></div>}<p role="status" aria-live="polite">{message}</p></section>;
}
