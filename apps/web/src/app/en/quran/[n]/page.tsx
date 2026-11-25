import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Recitation from '@/components/Recitation';
import { LastRead } from '@/components/HomeWidgets';
import { SURAHS, arDigits, loadSurah } from '@/lib/quran';

export const dynamicParams = false;
export function generateStaticParams() { return SURAHS.map((s) => ({ n: String(s.index) })); }
export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const s = SURAHS[Number((await params).n) - 1]; return { title: s ? `Surah ${s.tname}` : 'Quran' };
}
type En = { v: string; ayat: { tr: string; fn: string }[] };

export default async function Surah({ params }: { params: Promise<{ n: string }> }) {
  const n = Number((await params).n); if (!Number.isInteger(n) || n < 1 || n > 114) notFound();
  const [{ meta, bismillah, ayat }, en] = await Promise.all([loadSurah(n), import(`@/generated/en/quran/${n}.json`).then((m) => m.default as En)]);
  return (
    <article className="reader">
      <header>
        <h1>Surah {meta.tname} <span lang="ar" dir="rtl">({meta.name})</span></h1>
        <div className="meta"><span>{meta.ename}</span><span>{meta.type === 'Meccan' ? 'Meccan' : 'Medinan'}</span><span>{meta.ayas} ayat</span></div>
      </header>
      <LastRead surah={n} />
      <Recitation surah={n} surahName={meta.tname} start={SURAHS.slice(0, n - 1).reduce((t, x) => t + x.ayas, 0) + 1} count={meta.ayas} lang="en" />
      <p className="note">English translation of the meanings: Noor International Center (Saheeh International), from QuranEnc.com, version {en.v}. A translation of the meanings is not the Quran itself.</p>
      {bismillah && <p className="bismillah" lang="ar" dir="rtl">{bismillah}</p>}
      <ol className="tafsir-list">
        {ayat.map((a, i) => (
          <li key={a.n} id={`a${a.n}`} className="card">
            <p className="tafsir-ayah" lang="ar" dir="rtl">{a.t} <span className="ayah-end">﴿{arDigits(a.n)}﴾</span></p>
            <p className="en-tr"><span className="num">{n}:{a.n}</span> {en.ayat[i].tr}</p>
            {en.ayat[i].fn && <p className="en-fn">{en.ayat[i].fn}</p>}
          </li>
        ))}
      </ol>
      <nav className="pager" aria-label="Surahs">
        {n > 1 ? <Link className="btn ghost" href={`/en/quran/${n - 1}`}>Previous surah</Link> : <span />}
        <Link className="btn ghost" href="/en/quran">Index</Link>
        {n < 114 ? <Link className="btn ghost" href={`/en/quran/${n + 1}`}>Next surah</Link> : <span />}
      </nav>
    </article>
  );
}
