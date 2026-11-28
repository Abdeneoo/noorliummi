import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SURAHS, arDigits, loadJalalayn, loadSurah } from '@/lib/quran';

export const dynamicParams = false;
export function generateStaticParams() { return SURAHS.map((s) => ({ n: String(s.index) })); }
export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const { n } = await params; const s = SURAHS[Number(n) - 1];
  return { title: s ? `تفسير سورة ${s.name} — الجلالين` : 'التفسير' };
}

export default async function TafsirPage({ params }: { params: Promise<{ n: string }> }) {
  const n = Number((await params).n);
  if (!Number.isInteger(n) || n < 1 || n > 114) notFound();
  const [{ meta, ayat }, tafsir, moy] = await Promise.all([loadSurah(n), loadJalalayn(n), import(`@/generated/moyassar/${n}.json`).then((m) => m.default as Record<string, string>)]);
  return (
    <article className="reader">
      <header>
        <h1>سورة {meta.name}</h1>
        <div className="meta"><span>تفسير الجلالين</span><span>جلال الدين المحلّي وجلال الدين السيوطي</span></div>
      </header>
      <ol className="tafsir-list">
        {ayat.map((a) => (
          <li key={a.n} id={`a${a.n}`} className="card">
            <p className="tafsir-ayah" lang="ar">{a.t} <span className="ayah-end">﴿{arDigits(a.n)}﴾</span></p>
            {tafsir[a.n]
              ? <p className="tafsir-text">{tafsir[a.n]}</p>
              : (() => { const prev = [...Array(a.n - 1).keys()].map((k) => a.n - 1 - k).find((k) => tafsir[k]); return <p className="tafsir-text missing">فُسِّرت هذه الآية في المصدر مع ما قبلها.{prev ? <> <a href={`#a${prev}`}>انظر تفسير الآية {arDigits(prev)}</a></> : null}</p>; })()}
            {moy[String(a.n)] && <details className="moyassar"><summary>التفسير الميسر (معاني الآية وكلماتها)</summary><p className="tafsir-text">{moy[String(a.n)]}</p></details>}
          </li>
        ))}
      </ol>
      <p className="note">«التفسير الميسر»: مجمع الملك فهد لطباعة المصحف الشريف، عبر موسوعة القرآن الكريم QuranEnc.com، دون تعديل.</p>
      <nav className="pager" aria-label="التنقل">
        {n > 1 ? <Link className="btn ghost" href={`/tafsir/${n - 1}`}>السورة السابقة</Link> : <span />}
        <Link className="btn ghost" href={`/quran/${n}`}>نص السورة</Link>
        {n < 114 ? <Link className="btn ghost" href={`/tafsir/${n + 1}`}>السورة التالية</Link> : <span />}
      </nav>
    </article>
  );
}
