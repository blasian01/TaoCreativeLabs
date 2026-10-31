import { createHash, timingSafeEqual } from 'node:crypto';
export function payloadDigest(value: unknown) { return createHash('sha256').update(JSON.stringify(value)).digest('hex'); }
export function validIngestToken(header: string | null, expected: string | undefined) {
  if (!expected || expected.length < 32 || !header?.startsWith('Bearer ')) return false;
  const candidate = header.slice(7);
  return timingSafeEqual(createHash('sha256').update(candidate).digest(), createHash('sha256').update(expected).digest());
}
export const MAX_INGEST_BYTES = 512 * 1024;
export async function boundedJson(request: Request) {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new Error('content_type');
  const length = Number(request.headers.get('content-length') || 0);
  if (length > MAX_INGEST_BYTES) throw new Error('body_limit');
  if (!request.body) throw new Error('invalid_json');
  const reader = request.body.getReader(); let size = 0; const chunks: Uint8Array[] = [];
  try { for (;;) { const r = await reader.read(); if (r.done) break; size += r.value.byteLength; if (size > MAX_INGEST_BYTES) { await reader.cancel(); throw new Error('body_limit'); } chunks.push(r.value); } }
  finally { reader.releaseLock(); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new Error('invalid_json'); }
}
