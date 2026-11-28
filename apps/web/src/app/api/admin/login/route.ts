import { NextResponse } from 'next/server';
import { COOKIE, adminEnabled, tokenOk } from '@/lib/admin';
import { db, rateLimited } from '@/lib/db';
import { currentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  if (!adminEnabled()) return NextResponse.json({ error: 'لوحة المراجعة غير مفعّلة على هذا الخادم.' }, { status: 503 });
  let body: { token?: string; mode?: string } = {}; try { body = await req.json(); } catch { /* empty */ }
  const user = await currentUser(req);
  // 1) Signed in with an admin account: no token needed.
  if (body.mode === 'account') {
    if (rateLimited(req, 'admin-account', 60, 15 * 60_000)) return NextResponse.json({ error: 'محاولات كثيرة.' }, { status: 429 });
    const ok = user ? await db().query('SELECT 1 FROM users WHERE id = $1 AND is_admin', [user.id]).then((r) => !!r.rowCount).catch(() => false) : false;
    if (!ok) return NextResponse.json({ error: user ? 'هذا الحساب ليس حساب إدارة.' : 'سجّل دخولك بحسابك أولًا.' }, { status: 401 });
  } else {
    // 2) The server token; when entered while signed in, the account becomes an admin account for next time.
    if (rateLimited(req, 'admin-login', 5, 15 * 60_000)) return NextResponse.json({ error: 'محاولات كثيرة. انتظر ربع ساعة.' }, { status: 429 });
    const token = String(body.token ?? '').trim();
    if (!tokenOk(token)) return NextResponse.json({ error: 'رمز غير صحيح.' }, { status: 401 });
    if (user) await db().query('UPDATE users SET is_admin = true WHERE id = $1', [user.id]).catch(() => {});
  }
  const res = NextResponse.json({ ok: true, linked: !!user });
  res.cookies.set(COOKIE, (process.env.ADMIN_TOKEN ?? '').trim(), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 8 * 3600 });
  return res;
}
export async function DELETE() {
  const res = NextResponse.json({ ok: true }); res.cookies.set(COOKIE, '', { path: '/', maxAge: 0 }); return res;
}
