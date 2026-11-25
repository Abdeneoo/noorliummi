import { NextResponse } from 'next/server';
import { COOKIE, adminEnabled, tokenOk } from '@/lib/admin';
import { rateLimited } from '@/lib/db';

export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  if (!adminEnabled()) return NextResponse.json({ error: 'لوحة المراجعة غير مفعّلة على هذا الخادم.' }, { status: 503 });
  if (rateLimited(req, 'admin-login', 5, 15 * 60_000)) return NextResponse.json({ error: 'محاولات كثيرة. انتظر ربع ساعة.' }, { status: 429 });
  let token = ''; try { token = String((await req.json()).token ?? '').trim(); } catch { /* empty */ }
  if (!tokenOk(token)) return NextResponse.json({ error: 'رمز غير صحيح.' }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 8 * 3600 });
  return res;
}
export async function DELETE() {
  const res = NextResponse.json({ ok: true }); res.cookies.set(COOKIE, '', { path: '/', maxAge: 0 }); return res;
}
