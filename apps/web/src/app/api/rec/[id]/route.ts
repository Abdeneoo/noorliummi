import { createReadStream, statSync } from 'node:fs';
import { join } from 'node:path';
import { db } from '@/lib/db';
import { REC_DIR } from '@/lib/own-rec';
export const dynamic = 'force-dynamic';
/** Serves a published own recording (with Range support). Download only when the «download» right was granted. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id); if (!Number.isInteger(id)) return new Response('not found', { status: 404 });
  const r = (await db().query<{ file_name: string; mime: string; rights: string[] }>("SELECT file_name, mime, rights FROM own_recordings WHERE id = $1 AND status = 'published'", [id]).catch(() => ({ rows: [] }))).rows[0];
  if (!r) return new Response('not found', { status: 404 });
  const p = join(REC_DIR, r.file_name); let size = 0; try { size = statSync(p).size; } catch { return new Response('not found', { status: 404 }); }
  const h: Record<string, string> = { 'content-type': r.mime, 'accept-ranges': 'bytes', 'cache-control': 'public, max-age=86400', 'content-disposition': r.rights.includes('download') ? 'inline' : 'inline; filename="noor.audio"' };
  const m = /bytes=(\d+)-(\d*)/.exec(req.headers.get('range') ?? '');
  if (m) { const s = Number(m[1]); const e = m[2] ? Math.min(Number(m[2]), size - 1) : size - 1; if (s >= size) return new Response(null, { status: 416, headers: { 'content-range': `bytes */${size}` } });
    return new Response(createReadStream(p, { start: s, end: e }) as unknown as ReadableStream, { status: 206, headers: { ...h, 'content-range': `bytes ${s}-${e}/${size}`, 'content-length': String(e - s + 1) } }); }
  return new Response(createReadStream(p) as unknown as ReadableStream, { headers: { ...h, 'content-length': String(size) } });
}
