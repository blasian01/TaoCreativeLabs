import {ownerStatus} from '@/lib/admin/auth';
import {readMedia} from '@/lib/admin/db';
import {handleMedia} from '@/lib/admin/media';
export const dynamic='force-dynamic';
export async function GET(req:Request){return handleMedia(await ownerStatus(),new URL(req.url).searchParams.get('ref'),readMedia);}
