import { NextResponse } from 'next/server';
import { isAdmin, sameOrigin } from '@/lib/admin';
import { db } from '@/lib/db';
import { deleteFilesOf } from '@/lib/recitations';
export const dynamic = 'force-dynamic';
const deny = () => NextResponse.json({ error: 'غير مسموح.' }, { status: 401 });
/** Accounts list for the moderator: email, dates, status and how many athar pages each owns. */
export async function GET(req: Request) {
  if (!isAdmin(req)) return deny();
  const q = (new URL(req.url).searchParams.get('q') ?? '').trim().toLowerCase().slice(0, 100);
  const r = await db().query(
    `SELECT u.id, u.email, u.status, u.created_at, u.last_login, (SELECT count(*) FROM memorial_pages p WHERE p.owner_id = u.id AND p.status <> 'removed')::int AS pages
     FROM users u WHERE ($1 = '' OR u.email LIKE '%' || $1 || '%') ORDER BY u.created_at DESC LIMIT 200`, [q]);
  return NextResponse.json({ rows: r.rows }, { headers: { 'cache-control': 'no-store' } });
}
export async function POST(req: Request) {
  if (!isAdmin(req) || !sameOrigin(req)) return deny();
  let b: { id?: unknown; action?: unknown } = {}; try { b = await req.json(); } catch { /* empty */ }
  const id = Number(b.id); if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 });
  const d = db();
  switch (b.action) {
    case 'block': await d.query("UPDATE users SET status = 'blocked' WHERE id = $1", [id]); await d.query('DELETE FROM sessions WHERE user_id = $1', [id]); break;
    case 'unblock': await d.query("UPDATE users SET status = 'active' WHERE id = $1", [id]); break;
    case 'signout': await d.query('DELETE FROM sessions WHERE user_id = $1', [id]); break;
    // Freezes the account's pages (they stop showing) without deleting anything; the moderator reviews them in the athar tab.
    case 'freeze_pages': await d.query("UPDATE memorial_pages SET status = 'frozen' WHERE owner_id = $1 AND status = 'active'", [id]); break;
    // Deletes the account only. Its pages stay (ownership is cleared by the database) and remain editable by their edit links.
    case 'delete': await deleteFilesOf(id); await d.query('DELETE FROM users WHERE id = $1', [id]); break;
    default: return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
