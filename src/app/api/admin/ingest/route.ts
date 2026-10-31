import { handleIngest } from '@/lib/admin/handlers';
import { ingestBatch } from '@/lib/admin/db';
export const dynamic='force-dynamic';
export async function POST(request:Request){return handleIngest(request,process.env.ADMIN_INGEST_TOKEN,ingestBatch);}
