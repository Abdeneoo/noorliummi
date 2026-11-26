import { NextResponse } from 'next/server';
import coverage from '@/generated/hadith-tr/coverage.json';
/** A section's hadith translations for one language, keyed by hadith number (fawazahmed0/hadith-api, same numbering as the Arabic). */
const COV = coverage as Record<string, Record<string, { translated: number; total: number }>>;
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams; const lang = q.get('lang') ?? ''; const book = q.get('book') ?? ''; const s = Number(q.get('s'));
  if (!COV[lang]?.[book] || !Number.isInteger(s) || s < 0 || s > 200) return NextResponse.json({ available: false, items: {} }, { headers: { 'cache-control': 'public, max-age=86400' } });
  try { const items = (await import(`@/generated/hadith-tr/${lang}/${book}/${s}.json`)).default as Record<string, string>; return NextResponse.json({ available: true, items }, { headers: { 'cache-control': 'public, max-age=86400' } }); }
  catch { return NextResponse.json({ available: true, items: {} }); }
}
