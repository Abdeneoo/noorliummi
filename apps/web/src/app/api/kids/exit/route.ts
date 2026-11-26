import { NextResponse } from 'next/server';
import { sameSite } from '@/lib/auth';
import { rateLimited } from '@/lib/db';
import { clearKid, endKidSession, kidToken } from '@/lib/family';
export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  if (!sameSite(req)) return NextResponse.json({ error: 'طلب غير صحيح.' }, { status: 400 });
  const t = kidToken(req.headers.get('cookie')); if (!t) return NextResponse.json({ ok: true }, { headers: { 'set-cookie': clearKid } });
  if (rateLimited(req, 'kid-exit', 6, 10 * 60_000)) return NextResponse.json({ error: 'محاولات كثيرة. انتظر عشر دقائق.' }, { status: 429 });
  let b: { pin?: string } = {}; try { b = await req.json(); } catch { /* empty */ }
  const r = await endKidSession(t, b.pin); if (r === 'bad-pin') return NextResponse.json({ error: 'الرقم السري غير صحيح.' }, { status: 403 });
  return NextResponse.json({ ok: true }, { headers: { 'set-cookie': clearKid } });
}
