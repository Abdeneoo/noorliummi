import { NextResponse } from 'next/server';
import { kidOf, kidToken } from '@/lib/family';
import { allows } from '@/lib/family-rules';
import { loadSurah } from '@/lib/quran';
export const dynamic = 'force-dynamic';
/** A surah's text for the child — only when the parent allowed that surah and today's time is not used up. */
export async function GET(req: Request, { params }: { params: Promise<{ n: string }> }) {
  const k = await kidOf(kidToken(req.headers.get('cookie'))); if (!k) return NextResponse.json({ error: 'لا جلسة.' }, { status: 401 });
  const n = Number((await params).n); if (!Number.isInteger(n) || n < 1 || n > 114) return NextResponse.json({ error: 'غير موجود.' }, { status: 404 });
  if (k.timeUp) return NextResponse.json({ error: 'انتهى وقت اليوم.' }, { status: 403 });
  if (!allows(k.allowed, 'quran', n)) return NextResponse.json({ error: 'غير مسموح لك بهذه السورة.' }, { status: 403 });
  return NextResponse.json(await loadSurah(n), { headers: { 'cache-control': 'no-store' } });
}
