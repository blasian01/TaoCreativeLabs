import { ownerStatus } from '@/lib/admin/auth';
import { readBusiness,writeBusiness } from '@/lib/admin/business';
import { handleBusinessRead,handleBusinessIngest } from '@/lib/admin/business-handlers';
export const dynamic='force-dynamic';
export async function GET(req:Request){const at=new URL(req.url).searchParams.get('snapshot')||undefined;return handleBusinessRead(await ownerStatus(),()=>readBusiness(at));}
export async function POST(req:Request){return handleBusinessIngest(req,process.env.ADMIN_INGEST_TOKEN,writeBusiness);}
