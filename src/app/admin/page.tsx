import { ownerStatus } from '@/lib/admin/auth';
import { readSnapshot } from '@/lib/admin/db';
import MarketingDashboard from '@/components/admin/MarketingDashboard';
export const dynamic='force-dynamic';
export const revalidate=0;
export const metadata={title:'Private workspace',robots:{index:false,follow:false}};
export default async function AdminPage(){
 const state=await ownerStatus();
 if(state!=='owner')return <div style={{minHeight:'100vh',background:'#101e2a',color:'#edf6f2',display:'grid',placeItems:'center',padding:24}}><section style={{maxWidth:480}}><p style={{color:'#80d7c7',letterSpacing:3}}>TAO / PRIVATE WORKSPACE</p><h1 style={{fontSize:42,lineHeight:1.12,margin:'24px 0'}}>A clearer view of what’s working.</h1><p style={{color:'#bac9d4',marginBottom:30}}>{state==='forbidden'?'This workspace is restricted to its verified owner. Sign out and use the authorized GitHub account.':state==='unconfigured'?'Owner authentication is awaiting configuration. No workspace data is available publicly.':'Sign in with your authorized GitHub account to view marketing and business insights.'}</p>{state==='forbidden'?<a href="/auth/logout">Sign out</a>:state==='unconfigured'?<span>Setup required</span>:<a style={{display:'inline-block',padding:'14px 24px',borderRadius:12,background:'#9ee8d7',color:'#10222a',fontWeight:700}} href="/auth/login?returnTo=%2Fadmin">Continue with GitHub →</a>}<p style={{marginTop:28,fontSize:12,color:'#bac9d4'}}>Owner access only · Private data stays server protected</p></section></div>;
 let snapshot;try{snapshot=await readSnapshot();}catch{}
 if(!snapshot)return <main style={{padding:48}}><h1>Workspace temporarily unavailable</h1><p>Managed data could not be loaded. No measurements have been replaced with sample values.</p><a href="/admin">Retry</a> · <a href="/auth/logout">Sign out</a></main>;
 return <MarketingDashboard snapshot={snapshot}/>;
}
