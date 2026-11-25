import { NextResponse } from 'next/server';
import { isAdmin, sameOrigin } from '@/lib/admin';
import { db } from '@/lib/db';
export const dynamic = 'force-dynamic';
const deny = () => NextResponse.json({ error: 'غير مسموح.' }, { status: 401 });
export async function GET(req: Request) {
  if (!isAdmin(req)) return deny();
  const r = await db().query("SELECT id, path, wrong, correct, source, status, created_at FROM content_reports ORDER BY (status = 'open') DESC, created_at DESC LIMIT 200");
  return NextResponse.json({ rows: r.rows }, { headers: { 'cache-control': 'no-store' } });
}
export async function POST(req: Request) {
  if (!isAdmin(req) || !sameOrigin(req)) return deny();
  let b: { id?: unknown; status?: unknown } = {}; try { b = await req.json(); } catch { /* empty */ }
  if (!Number.isInteger(Number(b.id)) || !['open', 'fixed', 'dismissed'].includes(String(b.status))) return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 });
  await db().query('UPDATE content_reports SET status = $2 WHERE id = $1', [Number(b.id), String(b.status)]);
  return NextResponse.json({ ok: true });
}
