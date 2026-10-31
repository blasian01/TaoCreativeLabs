'use client';
import {useState} from 'react';
import type {Observation,Publication} from '@/lib/admin/types';
import {canonicalUrl,newestFirst} from '@/lib/admin/domain';
export function postObservations(post:Publication,rows:Observation[]){return post.permalink?rows.filter(o=>o.entityType==='post'&&o.app===post.app&&o.platform===post.platform&&canonicalUrl(o.entityUrl)===canonicalUrl(post.permalink!)).sort(newestFirst):[];}
export function PostEvidence({post,observations}:{post:Publication;observations:Observation[]}){
 const[failed,setFailed]=useState(false);
 const secured=!!post.mediaRef?.match(/^archive:media:[a-f0-9]{64}$/);
 const rows=postObservations(post,observations);
 return <section aria-label="Post media and measurements">
  <h4>Image preview</h4>
  {secured&&!failed?<a href={'/api/admin/media?ref='+encodeURIComponent(post.mediaRef!)} target="_blank" rel="noreferrer">{/* Owner-authenticated bytes; Next image optimizer must not cache these. */}
   {/* eslint-disable-next-line @next/next/no-img-element */}
   <img src={'/api/admin/media?ref='+encodeURIComponent(post.mediaRef!)} alt={post.concept||'Archived post image'} loading="lazy" onError={()=>setFailed(true)} style={{maxWidth:'100%',maxHeight:560,objectFit:'contain'}}/>
  </a>:<p>{failed?'Preview unavailable. The published post link remains below.':'No viewable image imported for this record.'}</p>}
  <h4>Post measurements</h4><p>Sourced observations only. Missing measurements are unknown, not zero. New posts do not yet have mature 24h/72h results.</p>
  {rows.length?<div className="ma-table-scroll" role="region" aria-label="Post measurement history" tabIndex={0}><table><thead><tr><th>Metric / value</th><th>Observed (UTC)</th><th>Reporting window</th><th>Source / collector</th></tr></thead><tbody>{rows.map((o,i)=><tr key={i}><td>{o.metric}: {o.value===null?'Unknown':`${o.value}${o.unit==='percent'?'%':''}`}</td><td>{o.observedAt}<br/>Retrieved: {o.retrievedAt??'Unknown'}</td><td>{o.periodStart??'Unknown start'} — {o.periodEnd??'Unknown end'}</td><td>{o.source}<br/>{o.owner}</td></tr>)}</tbody></table></div>:<p>No post measurements collected. Account totals are not post statistics.</p>}
 </section>;
}
