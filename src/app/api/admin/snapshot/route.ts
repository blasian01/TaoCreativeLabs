import { ownerStatus } from '@/lib/admin/auth';
import { readSnapshot } from '@/lib/admin/db';
import { handleRead } from '@/lib/admin/handlers';
export const dynamic='force-dynamic';
export async function GET(){return handleRead(await ownerStatus(),readSnapshot);}
