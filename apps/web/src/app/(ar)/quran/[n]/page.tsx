import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AyatText from '@/components/AyatText';
import AyahShare from '@/components/AyahShare';
import Recitation from '@/components/Recitation';
import { LastRead } from '@/components/HomeWidgets';
import { SURAHS, arDigits, loadSurah } from '@/lib/quran';
import { ayat as ayahCount } from '@/lib/arnum';

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
        <div className="meta"><span>{meta.type === 'Meccan' ? 'مكية' : 'مدنية'}</span><span>{ayahCount(meta.ayas)}</span><span>ترتيبها في المصحف {arDigits(meta.index)}</span></div>
      </header>
      <div className="row" style={{ justifyContent: 'center', margin: '8px 0 4px' }}>
        <Link className="btn ghost" href={`/tafsir/${n}`}>تفسير السورة</Link>
        <Link className="btn ghost" href={`/mutashabihat/${n}`}>المتشابهات</Link>
        <Link className="btn ghost" href={`/quran/${n}/words`}>الكلمات وجذورها</Link>
        <Link className="btn ghost" href={`/sakina?s=${n}`}>وضع السكينة</Link>
      </div>
      <p className="note" style={{ textAlign: 'center' }}>اضغط على رقم أي آية لقراءة تفسيرها.</p>
      <LastRead surah={n} />
      <Recitation surah={n} surahName={meta.name} start={SURAHS.slice(0, n - 1).reduce((t, x) => t + x.ayas, 0) + 1} count={meta.ayas} />
      {bismillah && <p className="bismillah" lang="ar">{bismillah}</p>}
      <AyatText surah={n} ayat={ayat} />
      <AyahShare surah={n} name={meta.name} count={meta.ayas} />
      <nav className="pager" aria-label="التنقل بين السور">
        {n > 1 ? <Link className="btn ghost" href={`/quran/${n - 1}`}>السورة السابقة</Link> : <span />}
        <Link className="btn ghost" href={`/tafsir/${n}`}>التفسير</Link>
        <Link className="btn ghost" href={`/mutashabihat/${n}`}>المتشابهات</Link>
        <Link className="btn ghost" href="/quran">الفهرس</Link>
        {n < 114 ? <Link className="btn ghost" href={`/quran/${n + 1}`}>السورة التالية</Link> : <span />}
      </nav>
    </article>
  );
}
