import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SURAHS, arDigits, loadSurah } from '@/lib/quran';

export const dynamicParams = false;
export function generateStaticParams() { return SURAHS.map((s) => ({ n: String(s.index) })); }
export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const s = SURAHS[Number((await params).n) - 1];
  return { title: s ? `سورة ${s.name}` : 'القرآن الكريم' };
}

export default async function SurahPage({ params }: { params: Promise<{ n: string }> }) {
  const n = Number((await params).n);
  if (!Number.isInteger(n) || n < 1 || n > 114) notFound();
  const { meta, bismillah, ayat } = await loadSurah(n);
  return (
    <article className="reader">
      <header>
        <h1>سورة {meta.name}</h1>
        <div className="meta"><span>{meta.type === 'Meccan' ? 'مكية' : 'مدنية'}</span><span>{arDigits(meta.ayas)} آية</span><span>ترتيبها في المصحف {arDigits(meta.index)}</span></div>
      </header>
      {bismillah && <p className="bismillah" lang="ar">{bismillah}</p>}
      <div className="ayat" lang="ar">
        {ayat.map((a) => (
          <span key={a.n} id={`a${a.n}`}>{a.t}<span className="ayah-end" aria-label={`آية ${a.n}`}>﴿{arDigits(a.n)}﴾</span> </span>
        ))}
      </div>
      <nav className="pager" aria-label="التنقل بين السور">
        {n > 1 ? <Link className="btn ghost" href={`/quran/${n - 1}`}>السورة السابقة</Link> : <span />}
        <Link className="btn ghost" href="/quran">الفهرس</Link>
        {n < 114 ? <Link className="btn ghost" href={`/quran/${n + 1}`}>السورة التالية</Link> : <span />}
      </nav>
    </article>
  );
}
