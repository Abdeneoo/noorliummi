import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SURAHS, arDigits, loadSurah } from '@/lib/quran';
export const dynamicParams = false;
export const generateStaticParams = () => SURAHS.map((s) => ({ s: String(s.index) }));
export async function generateMetadata({ params }: { params: Promise<{ s: string }> }): Promise<Metadata> { const s = SURAHS[Number((await params).s) - 1]; return { title: s ? `غريب سورة ${s.name}` : 'غريب القرآن' }; }
export default async function Page({ params }: { params: Promise<{ s: string }> }) {
  const n = Number((await params).s); if (!SURAHS[n - 1]) notFound();
  const g = (await import(`@/generated/gharib/${n}.json`).catch(() => ({ default: {} }))).default as Record<string, { q: string; t: string }[]>;
  const { ayat } = await loadSurah(n);
  const keys = Object.keys(g).map(Number).sort((a, b) => a - b);
  return (
    <article className="reader" style={{ maxWidth: 820 }}>
      <header><p className="eyebrow"><Link href="/gharib">غريب القرآن</Link></p><h1>غريب سورة {SURAHS[n - 1].name}</h1><p className="meta"><span>ابن قتيبة (ت 276هـ)</span><span>{arDigits(keys.length)} موضعًا</span></p></header>
      {!keys.length && <p className="note">لم يذكر المؤلف في هذه السورة شيئًا من الغريب.</p>}
      <ol className="tafsir-list">{keys.map((a) => (
        <li key={a} id={`a${a}`} className="card"><p className="tafsir-ayah" lang="ar">{ayat[a - 1]?.t} <Link className="ayah-end" href={`/quran/${n}#a${a}`}>﴿{arDigits(a)}﴾</Link></p>
          {g[String(a)].map((e, k) => <p key={k} className="tafsir-text" style={{ whiteSpace: 'pre-line' }}>{e.t}</p>)}</li>))}</ol>
      <nav className="pager">{n > 1 ? <Link className="btn ghost" href={`/gharib/${n - 1}`}>السورة السابقة</Link> : <span />}<Link className="btn ghost" href={`/quran/${n}`}>السورة في المصحف</Link>{n < 114 ? <Link className="btn ghost" href={`/gharib/${n + 1}`}>السورة التالية</Link> : <span />}</nav>
    </article>
  );
}
