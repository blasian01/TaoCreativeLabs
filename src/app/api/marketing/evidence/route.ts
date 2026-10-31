import {configuredViewerVerifier}from '@/lib/admin/viewer-auth';
import {handleViewerRead}from '@/lib/admin/viewer';
import {readSnapshot}from '@/lib/admin/db';
export const dynamic='force-dynamic';
export async function GET(req:Request){return handleViewerRead(req,configuredViewerVerifier(),readSnapshot);}
