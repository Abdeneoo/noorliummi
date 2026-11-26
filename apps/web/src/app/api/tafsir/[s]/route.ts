import { NextResponse } from 'next/server';
import { loadJalalayn } from '@/lib/quran';
/** Both tafsirs of one surah for the mushaf's tafsir panel (static data, cached). */
export async function GET(_req: Request, { params }: { params: Promise<{ s: string }> }) {
  const s = Number((await params).s); if (!Number.isInteger(s) || s < 1 || s > 114) return NextResponse.json({ error: 'bad surah' }, { status: 404 });
  const [jalalayn, moyassar] = await Promise.all([loadJalalayn(s), import(`@/generated/moyassar/${s}.json`).then((m) => m.default)]);
  return NextResponse.json({ jalalayn, moyassar }, { headers: { 'cache-control': 'public, max-age=86400' } });
}
