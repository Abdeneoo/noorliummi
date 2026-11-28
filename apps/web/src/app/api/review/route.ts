import { NextResponse } from 'next/server';
import { ALL_KEYS, reviewerByToken, saveMark } from '@/lib/review-board';
import { rateLimited } from '@/lib/db';
export const dynamic = 'force-dynamic';
/** A reviewer saves one mark. The token travels in the body (never in the URL the server logs). */
export async function POST(req: Request) {
  if (rateLimited(req, 'review', 120, 60_000)) return NextResponse.json({ error: 'محاولات كثيرة.' }, { status: 429 });
  const b = await req.json().catch(() => null) as { token?: string; key?: string; verdict?: string; note?: string } | null;
  const who = b?.token ? await reviewerByToken(b.token) : null; if (!who) return NextResponse.json({ error: 'رابط المراجعة غير صالح.' }, { status: 401 });
  if (!b?.key || !ALL_KEYS.has(b.key) || !['ok', 'note', 'clear'].includes(String(b.verdict))) return NextResponse.json({ error: 'بيانات غير صالحة.' }, { status: 400 });
  await saveMark(who.id, b.key, b.verdict as 'ok' | 'note' | 'clear', String(b.note ?? '')); return NextResponse.json({ ok: true });
}
