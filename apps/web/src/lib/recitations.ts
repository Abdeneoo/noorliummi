import 'server-only';
import { randomBytes } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { db } from './db';
/**
 * Students' recitations for their circle supervisor. Private files outside the web root (random names), served only to
 * the student who recorded them and the supervisor of that circle. Kept 30 days, then deleted. Never used for anything else.
 */
export const MAX_BYTES = 6_000_000; export const KEEP_DAYS = 30;
const MIMES = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/aac'];
export const cleanMime = (m: string | null) => { const base = (m ?? '').split(';')[0].trim().toLowerCase(); return MIMES.includes(base) ? base : null; };
const dir = () => join(process.env.NOOR_HOME ?? '/opt/noorliummi', 'recordings');
const fileOf = (token: string) => join(dir(), token);

export async function purgeExpired() {
  const r = await db().query<{ token: string }>('DELETE FROM recitations WHERE expires_at < now() RETURNING token');
  for (const x of r.rows) await unlink(fileOf(x.token)).catch(() => undefined);
}
async function role(slug: string, user: number) {
  const c = await db().query<{ id: string; owner_id: string }>('SELECT id, owner_id FROM circles WHERE slug = $1', [slug]); if (!c.rowCount) return null;
  const owner = Number(c.rows[0].owner_id) === user;
  const member = !owner && !!(await db().query('SELECT 1 FROM circle_members WHERE circle_id = $1 AND user_id = $2', [c.rows[0].id, user])).rowCount;
  return { id: Number(c.rows[0].id), owner, member };
}
export async function saveRecitation(slug: string, user: number, meta: { surah: number; from: number; to: number; mime: string }, data: Buffer): Promise<'ok' | 'forbidden' | 'limit'> {
  const r = await role(slug, user); if (!r?.member) return 'forbidden';
  const n = await db().query<{ n: number }>("SELECT count(*)::int AS n FROM recitations WHERE user_id = $1 AND created_at > now() - interval '1 day'", [user]); if (n.rows[0].n >= 20) return 'limit';
  const token = randomBytes(24).toString('hex'); await mkdir(dir(), { recursive: true, mode: 0o700 }); await writeFile(fileOf(token), data, { mode: 0o600 });
  try { await db().query('INSERT INTO recitations (token, user_id, circle_id, surah, ayah_from, ayah_to, mime, bytes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [token, user, r.id, meta.surah, meta.from, meta.to, meta.mime, data.length]); }
  catch (e) { await unlink(fileOf(token)).catch(() => undefined); throw e; }
  return 'ok';
}
/** Member: own recordings in this circle. Supervisor: every member's. */
export async function listRecitations(slug: string, user: number) {
  await purgeExpired(); const r = await role(slug, user); if (!r || (!r.owner && !r.member)) return null;
  const q = await db().query(`SELECT x.id, x.user_id, m.display_name, x.surah, x.ayah_from, x.ayah_to, x.teacher_note, x.heard_at, x.created_at, x.expires_at
    FROM recitations x LEFT JOIN circle_members m ON m.circle_id = x.circle_id AND m.user_id = x.user_id WHERE x.circle_id = $1 AND ($2 OR x.user_id = $3) ORDER BY x.created_at DESC LIMIT 200`, [r.id, r.owner, user]);
  return { owner: r.owner, rows: q.rows };
}
async function allowed(id: number, user: number) {
  const q = await db().query<{ token: string; mime: string; user_id: string; owner_id: string }>('SELECT x.token, x.mime, x.user_id, c.owner_id FROM recitations x JOIN circles c ON c.id = x.circle_id WHERE x.id = $1 AND x.expires_at > now()', [id]);
  if (!q.rowCount) return null; const x = q.rows[0]; const mine = Number(x.user_id) === user; const teacher = Number(x.owner_id) === user;
  return mine || teacher ? { ...x, mine, teacher } : null;
}
export async function readRecitation(id: number, user: number) {
  const a = await allowed(id, user); if (!a) return null;
  if (a.teacher) await db().query('UPDATE recitations SET heard_at = coalesce(heard_at, now()) WHERE id = $1', [id]);
  try { return { data: await readFile(fileOf(a.token)), mime: a.mime }; } catch { return null; }
}
/** Only the student can delete their recording. */
export async function deleteRecitation(id: number, user: number) {
  const a = await allowed(id, user); if (!a?.mine) return false;
  await db().query('DELETE FROM recitations WHERE id = $1', [id]); await unlink(fileOf(a.token)).catch(() => undefined); return true;
}
export async function noteRecitation(id: number, user: number, note: string) {
  const a = await allowed(id, user); if (!a?.teacher) return false;
  await db().query('UPDATE recitations SET teacher_note = $2 WHERE id = $1', [id, note.slice(0, 500)]); return true;
}
/** When a user leaves a circle or deletes the account, the rows cascade; files are removed here. */
export async function deleteFilesOf(user: number, circleSlug?: string) {
  const q = await db().query<{ token: string }>(circleSlug ? 'DELETE FROM recitations x USING circles c WHERE c.id = x.circle_id AND c.slug = $2 AND x.user_id = $1 RETURNING x.token' : 'DELETE FROM recitations WHERE user_id = $1 RETURNING token', circleSlug ? [user, circleSlug] : [user]);
  for (const x of q.rows) await unlink(fileOf(x.token)).catch(() => undefined);
}
