import { redirect } from 'next/navigation';
import { ownerStatus } from '@/lib/admin/auth';
import { readBusiness,businessVersions } from '@/lib/admin/business';
import { BusinessWorkspace } from '@/components/admin/BusinessWorkspace';
export const dynamic='force-dynamic';
export const revalidate=0;
export const metadata={title:'Business insights',robots:{index:false,follow:false}};
export default async function BusinessPage({searchParams}:{searchParams:Promise<{snapshot?:string}>}){
 if(await ownerStatus()!=='owner')redirect('/admin');
 let snapshot,versions;
 try{const params=await searchParams;[snapshot,versions]=await Promise.all([readBusiness(params.snapshot),businessVersions()]);}
 catch{return <main><h1>Business evidence temporarily unavailable</h1><p>Refresh after the managed database recovers.</p><a href="/admin">Marketing workspace</a></main>;}
 return <BusinessWorkspace snapshot={snapshot} versions={versions}/>;
}
