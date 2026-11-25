import { NextResponse } from 'next/server';
import { sameSite, sessionCookie, useLoginToken } from '@/lib/auth';
import { rateLimited } from '@/lib/db';

export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  if (!sameSite(req) || rateLimited(req, 'verify', 20, 3600_000)) return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 });
  let b: { t?: unknown } = {}; try { b = await req.json(); } catch { /* empty */ }
  const s = await useLoginToken(String(b.t ?? ''));
  if (!s) return NextResponse.json({ error: 'الرابط غير صالح أو انتهت مدته أو استُخدم من قبل. اطلب رابطًا جديدًا.' }, { status: 400 });
  return NextResponse.json({ ok: true }, { headers: { 'set-cookie': sessionCookie(s) } });
}
