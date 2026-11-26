import { NextResponse } from 'next/server';
import { normEmail, register, sameSite, sessionCookie } from '@/lib/auth';
import { rateLimited } from '@/lib/db';

export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  if (!sameSite(req)) return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 });
  if (rateLimited(req, 'register', 5, 3600_000)) return NextResponse.json({ error: 'محاولات كثيرة. حاول بعد ساعة.' }, { status: 429 });
  let b: { email?: unknown; password?: unknown } = {}; try { b = await req.json(); } catch { /* empty */ }
  const email = normEmail(b.email);
  if (!email) return NextResponse.json({ error: 'اكتب بريدًا إلكترونيًا صحيحًا.' }, { status: 400 });
  const r = await register(email, typeof b.password === 'string' ? b.password : '');
  if ('error' in r) return NextResponse.json({ error: r.error }, { status: r.status });
  return NextResponse.json({ ok: true }, { headers: { 'set-cookie': sessionCookie(r.session) } });
}
