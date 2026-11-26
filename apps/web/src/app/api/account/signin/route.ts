import { NextResponse } from 'next/server';
import { normEmail, sameSite, sessionCookie, signIn } from '@/lib/auth';
import { rateLimited } from '@/lib/db';

export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  if (!sameSite(req)) return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 });
  if (rateLimited(req, 'signin', 20, 900_000)) return NextResponse.json({ error: 'محاولات كثيرة. حاول بعد ربع ساعة.' }, { status: 429 });
  let b: { email?: unknown; password?: unknown } = {}; try { b = await req.json(); } catch { /* empty */ }
  const email = normEmail(b.email);
  if (!email || typeof b.password !== 'string' || !b.password) return NextResponse.json({ error: 'اكتب البريد وكلمة المرور.' }, { status: 400 });
  const r = await signIn(email, b.password.slice(0, 256));
  if ('error' in r) return NextResponse.json({ error: r.error }, { status: r.status });
  return NextResponse.json({ ok: true }, { headers: { 'set-cookie': sessionCookie(r.session) } });
}
