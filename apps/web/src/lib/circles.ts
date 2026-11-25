import 'server-only';
import { db } from './db';
import { newSlug } from './athar';
import { deleteFilesOf } from './recitations';
// eslint-disable-next-line no-control-regex
export const cleanName = (s: unknown, max = 60) => (typeof s === 'string' ? s.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '');
export async function createCircle(owner: number, name: string, kind: 'halaqa' | 'family') {
  const n = await db().query<{ n: number }>('SELECT count(*)::int AS n FROM circles WHERE owner_id = $1', [owner]); if (n.rows[0].n >= 10) return null;
  for (let i = 0; i < 5; i++) { const slug = newSlug(); const r = await db().query('INSERT INTO circles (slug, name, kind, owner_id) VALUES ($1,$2,$3,$4) ON CONFLICT (slug) DO NOTHING', [slug, name, kind, owner]); if (r.rowCount) return slug; }
  return null;
}
export async function myCircles(user: number) {
  const r = await db().query(`SELECT c.slug, c.name, c.kind, (c.owner_id = $1) AS owner, (SELECT count(*) FROM circle_members m WHERE m.circle_id = c.id)::int AS members
    FROM circles c WHERE c.owner_id = $1 OR EXISTS (SELECT 1 FROM circle_members m WHERE m.circle_id = c.id AND m.user_id = $1) ORDER BY c.created_at DESC`, [user]);
  return r.rows;
}
/** What a visitor of the invite link sees; members' progress only for the owner; a member sees their own notes. */
export async function circleView(slug: string, user: number | null) {
  const c = await db().query<{ id: string; name: string; kind: string; owner_id: string }>('SELECT id, name, kind, owner_id FROM circles WHERE slug = $1', [slug]);
  if (!c.rowCount) return null; const row = c.rows[0]; const owner = user != null && Number(row.owner_id) === user;
  const base = { name: row.name, kind: row.kind, owner, member: false, members: [] as unknown[], notes: [] as unknown[] };
  if (user == null) return base;
  const me = await db().query('SELECT 1 FROM circle_members WHERE circle_id = $1 AND user_id = $2', [row.id, user]); base.member = !!me.rowCount;
  if (owner) base.members = (await db().query(`SELECT m.user_id AS id, m.display_name, m.joined_at, h.total, h.learned, h.due, h.surahs, h.updated_at
    FROM circle_members m LEFT JOIN hifz_sync h ON h.user_id = m.user_id WHERE m.circle_id = $1 ORDER BY m.display_name`, [row.id])).rows;
  if (base.member) base.notes = (await db().query('SELECT note, created_at FROM circle_notes WHERE circle_id = $1 AND user_id = $2 ORDER BY created_at DESC LIMIT 30', [row.id, user])).rows;
  return base;
}
export async function circleAction(slug: string, user: number, b: Record<string, unknown>): Promise<boolean> {
  const c = await db().query<{ id: string; owner_id: string }>('SELECT id, owner_id FROM circles WHERE slug = $1', [slug]); if (!c.rowCount) return false;
  const id = c.rows[0].id; const owner = Number(c.rows[0].owner_id) === user; const target = Number(b.user);
  switch (b.action) {
    case 'join': { const name = cleanName(b.display_name); if (!name || owner) return false; const n = await db().query<{ n: number }>('SELECT count(*)::int AS n FROM circle_members WHERE circle_id = $1', [id]); if (n.rows[0].n >= 100) return false;
      await db().query('INSERT INTO circle_members (circle_id, user_id, display_name) VALUES ($1,$2,$3) ON CONFLICT (circle_id, user_id) DO UPDATE SET display_name = EXCLUDED.display_name', [id, user, name]); return true; }
    case 'leave': await deleteFilesOf(user, slug); await db().query('DELETE FROM circle_members WHERE circle_id = $1 AND user_id = $2', [id, user]); await db().query('DELETE FROM circle_notes WHERE circle_id = $1 AND user_id = $2', [id, user]); return true;
    case 'remove': if (!owner || !Number.isInteger(target)) return false; await deleteFilesOf(target, slug); await db().query('DELETE FROM circle_members WHERE circle_id = $1 AND user_id = $2', [id, target]); return true;
    case 'note': { const note = cleanName(b.note, 500); if (!owner || !note || !Number.isInteger(target)) return false; const r = await db().query('INSERT INTO circle_notes (circle_id, user_id, note) SELECT $1, $2, $3 WHERE EXISTS (SELECT 1 FROM circle_members WHERE circle_id = $1 AND user_id = $2)', [id, target, note]); return (r.rowCount ?? 0) > 0; }
    case 'delete': { if (!owner) return false; const f = await db().query<{ user_id: string }>('SELECT DISTINCT user_id FROM recitations WHERE circle_id = $1', [id]); for (const x of f.rows) await deleteFilesOf(Number(x.user_id), slug); await db().query('DELETE FROM circles WHERE id = $1', [id]); return true; }
    default: return false;
  }
}
