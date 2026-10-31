import { redirect } from 'next/navigation';
import { ownerStatus } from '@/lib/admin/auth';
export const dynamic='force-dynamic';
export const revalidate=0;
export const metadata={title:'Business insights',robots:{index:false,follow:false}};
export default async function BusinessPage(){
 if(await ownerStatus()!=='owner')redirect('/admin');
 return <main style={{minHeight:'100vh',background:'#f4f4ef',color:'#172c35',padding:'clamp(24px,6vw,72px)'}}><a href="/admin">← Marketing workspace</a><p style={{marginTop:40,letterSpacing:2,fontSize:12}}>TAO / BUSINESS INSIGHTS</p><h1 style={{fontSize:42,margin:'20px 0'}}>Evidence before totals.</h1><p style={{maxWidth:680,lineHeight:1.8}}>The separate Business Insights module is undergoing source and definition reconciliation. Source-project account aggregates have been collected; deployment mapping and internal/test exclusions remain unverified. They are not yet production customer or portfolio unique-user totals.</p><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:18,marginTop:32}}>{['Registered production users','Measured active users','First-time downloads','MRR by currency','Customer churn','Revenue churn'].map(label=><section key={label} style={{background:'white',border:'1px solid #e4e7e1',borderRadius:14,padding:24}}><h2 style={{fontSize:14}}>{label}</h2><strong style={{display:'block',fontSize:28,marginTop:12}}>Not yet certified</strong><p style={{fontSize:12,marginTop:10}}>Awaiting validated source coverage and definitions.</p></section>)}</div><p style={{marginTop:32}}>No business numbers are fabricated, inferred from downloads, or treated as zero.</p><a href="/auth/logout">Sign out</a></main>;
}
