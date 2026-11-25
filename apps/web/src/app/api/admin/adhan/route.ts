import { NextResponse } from 'next/server';
import { isAdmin, sameOrigin } from '@/lib/admin';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
const deny = () => NextResponse.json({ error: 'غير مسموح.' }, { status: 401 });
const STATUSES = ['pending', 'permission_requested', 'approved', 'rejected'];

/** Review decisions recorded by the moderator. The catalogue itself ships with the site (metadata only). */
export async function GET(req: Request) {
  if (!isAdmin(req)) return deny();
  const { rows } = await db().query('SELECT item_id, status, note, updated_at FROM adhan_review');
  return NextResponse.json({ decisions: rows }, { headers: { 'cache-control': 'no-store' } });
}
export async function POST(req: Request) {
  if (!isAdmin(req) || !sameOrigin(req)) return deny();
  let b: { id?: unknown; status?: unknown; note?: unknown } = {}; try { b = await req.json(); } catch { /* empty */ }
  const id = String(b.id ?? ''); const status = String(b.status ?? ''); const note = String(b.note ?? '').slice(0, 1000);
  if (!/^[a-z0-9-]{3,64}$/.test(id) || !STATUSES.includes(status)) return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 });
  await db().query(
    `INSERT INTO adhan_review (item_id, status, note, updated_at) VALUES ($1, $2, $3, now())
     ON CONFLICT (item_id) DO UPDATE SET status = EXCLUDED.status, note = EXCLUDED.note, updated_at = now()`, [id, status, note]);
  return NextResponse.json({ ok: true });
}
