import type { Metadata } from 'next';
import Link from 'next/link';
import { SURAHS, arDigits } from '@/lib/quran';
export const metadata: Metadata = { title: 'غريب القرآن', description: 'معاني الكلمات الغريبة في القرآن من «غريب القرآن» لابن قتيبة (ت 276هـ)، مرتبة بالسورة والآية، مع البحث.' };
export const dynamic = 'force-dynamic';
async function search(q: string) {
  const norm = (t: string) => t.replace(/[ً-ٰٟـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
  const nq = norm(q); const hits: { s: number; a: string; t: string }[] = [];
  for (const s of SURAHS) { const g = (await import(`@/generated/gharib/${s.index}.json`).catch(() => ({ default: {} }))).default as Record<string, { q: string; t: string }[]>;
    for (const [a, es] of Object.entries(g)) for (const e of es) if (norm(e.q).includes(nq) || norm(e.t).includes(nq)) hits.push({ s: s.index, a, t: e.t }); if (hits.length > 80) break; }
  return hits;
}
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = String((await searchParams).q ?? '').trim().slice(0, 60); const hits = q.length > 1 ? await search(q) : [];
  return (
    <article style={{ maxWidth: 860, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow">القرآن</p><h1>غريب القرآن</h1><p>من كتاب «غريب القرآن» للإمام ابن قتيبة الدينوري (ت 276هـ)، بنصه كما في نسخة OpenITI لتحقيق أحمد صقر. وفي المصحف: الكلمات المسطّرة تفتح معناها عند الضغط عليها.</p></header>
      <form className="row" role="search"><input type="search" name="q" defaultValue={q} placeholder="ابحث عن كلمة: غشاوة، الصمد…" aria-label="بحث في غريب القرآن" style={{ flex: 1 }} /><button className="btn">بحث</button></form>
      {q && <p className="note">{hits.length ? `${arDigits(hits.length)} نتيجة` : 'لا نتائج'}</p>}
      {hits.length > 0 && <ul className="athar-dir">{hits.map((h, i) => <li key={i}><Link href={`/gharib/${h.s}#a${h.a}`}><strong>{SURAHS[h.s - 1].name}: {arDigits(Number(h.a))}</strong><small style={{ whiteSpace: 'pre-line' }}>{h.t.slice(0, 220)}</small></Link></li>)}</ul>}
      <p className="review-banner">نص المؤلف فقط (أُزيلت حواشي المحقق وأرقامها). رقم الآية كما في الكتاب. لم يراجعه مراجع المنصة بعد. الترخيص: CC BY-NC-SA 4.0 (OpenITI).</p>
      <ul className="surah-list">{SURAHS.map((s) => <li key={s.index}><Link href={`/gharib/${s.index}`}><span className="num">{arDigits(s.index)}</span><span className="nm">{s.name}</span></Link></li>)}</ul>
    </article>
  );
}
