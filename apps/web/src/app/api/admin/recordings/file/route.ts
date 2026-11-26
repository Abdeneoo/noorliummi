import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { isAdmin } from '@/lib/admin';
import { db } from '@/lib/db';
import { REC_DIR } from '@/lib/own-rec';
export const dynamic = 'force-dynamic';
/** Admin preview of any uploaded recording (review before publishing). */
export async function GET(req: Request) {
  if (!isAdmin(req)) return new Response('forbidden', { status: 401 });
  const id = Number(new URL(req.url).searchParams.get('id'));
  const r = (await db().query<{ file_name: string; mime: string }>('SELECT file_name, mime FROM own_recordings WHERE id = $1', [id])).rows[0];
  if (!r) return new Response('not found', { status: 404 });
  return new Response(await readFile(join(REC_DIR, r.file_name)), { headers: { 'content-type': r.mime, 'cache-control': 'no-store' } });
}
