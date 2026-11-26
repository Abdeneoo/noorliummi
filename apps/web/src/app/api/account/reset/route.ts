import { NextResponse } from 'next/server';
import { sameSite, sessionCookie, useResetToken } from '@/lib/auth';
import { rateLimited } from '@/lib/db';

export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  if (!sameSite(req) || rateLimited(req, 'reset', 20, 3600_000)) return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 });
  let b: { t?: unknown; password?: unknown } = {}; try { b = await req.json(); } catch { /* empty */ }
  const r = await useResetToken(String(b.t ?? ''), typeof b.password === 'string' ? b.password : '');
  if ('error' in r) return NextResponse.json({ error: r.error }, { status: r.status });
  return NextResponse.json({ ok: true }, { headers: { 'set-cookie': sessionCookie(r.session) } });
}
