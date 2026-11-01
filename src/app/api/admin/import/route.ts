import {ownerStatus} from '@/lib/admin/auth';
import {ingestBatch} from '@/lib/admin/db';
import {handleOwnerIngest} from '@/lib/admin/handlers';

export const dynamic='force-dynamic';
export async function POST(request:Request){return handleOwnerIngest(request,await ownerStatus(),ingestBatch);}
