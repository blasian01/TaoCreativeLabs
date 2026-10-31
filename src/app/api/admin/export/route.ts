import { ownerStatus } from '@/lib/admin/auth';
import { readSnapshot } from '@/lib/admin/db';
import { handleRead, denied, EXPORT_KINDS, type ExportKind } from '@/lib/admin/handlers';
export const dynamic='force-dynamic';
export async function GET(request:Request){const state=await ownerStatus();if(state!=='owner')return denied(state);const kind=new URL(request.url).searchParams.get('kind')||'publications';if(!EXPORT_KINDS.includes(kind as ExportKind))return Response.json({error:'Unknown export dataset'},{status:400,headers:{'Cache-Control':'private, no-store'}});return handleRead(state,readSnapshot,kind as ExportKind);}
