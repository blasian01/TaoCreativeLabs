import{redirect}from 'next/navigation';import{ownerStatus}from '@/lib/admin/auth';import{YouTubeWorkspace}from '@/components/admin/YouTubeWorkspace';
export const dynamic='force-dynamic';export const revalidate=0;export const metadata={title:'YouTube script library',robots:{index:false,follow:false}};
export default async function Page(){if(await ownerStatus()!=='owner')redirect('/admin');return <YouTubeWorkspace/>;}
