import { NextResponse } from 'next/server';
import { BOOKS, isHadith, loadSection, normHadith } from '@/lib/hadith';
import { rateLimited } from '@/lib/db';

export const dynamic = 'force-dynamic';
type Row = { book: string; ar: string; s: number; n: number; t: string; k: string };
let index: Promise<Row[]> | null = null;
const build = async () => {
  const rows: Row[] = [];
  for (const b of BOOKS) for (const sec of b.sections) for (const h of (await loadSection(b.key, sec.s)).filter(isHadith)) rows.push({ book: b.key, ar: b.doc.ar, s: sec.s, n: h.n, t: h.t, k: normHadith(h.t) });
  return rows;
};
export async function GET(req: Request) {
  if (rateLimited(req, 'hsearch', 60, 60_000)) return NextResponse.json({ error: 'محاولات كثيرة، انتظر دقيقة.' }, { status: 429 });
  const u = new URL(req.url); const q = normHadith(u.searchParams.get('q') ?? ''); const book = u.searchParams.get('book');
  if (q.length < 3) return NextResponse.json({ error: 'اكتب ثلاثة أحرف على الأقل.' }, { status: 400 });
  const terms = q.split(' ').filter(Boolean).slice(0, 6);
  const rows = await (index ??= build());
  const hits: Omit<Row, 'k'>[] = [];
  for (const r of rows) {
    if (book && r.book !== book) continue;
    if (terms.every((t) => r.k.includes(t))) { hits.push({ book: r.book, ar: r.ar, s: r.s, n: r.n, t: r.t }); if (hits.length >= 50) break; }
  }
  return NextResponse.json({ hits }, { headers: { 'cache-control': 'public, max-age=300' } });
}
