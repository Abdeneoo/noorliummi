import type { Metadata } from 'next';
import Link from 'next/link';
import { ayat } from '@/lib/arnum';
import MutashabihatQuiz from '@/components/MutashabihatQuiz';
import { SURAHS, arDigits, loadMutashabihat } from '@/lib/quran';
export const metadata: Metadata = { title: 'متشابهات القرآن' };
export default async function MutashabihatIndex() {
  const counts = await Promise.all(SURAHS.map(async (s) => Object.keys(await loadMutashabihat(s.index)).length));
  return (
    <article>
      <header className="page-head"><p className="eyebrow">المعرفة</p><h1>متشابهات القرآن</h1><p>الآيات المتشابهة في اللفظ، عونًا على الحفظ والمراجعة. اختر سورة.</p></header>
      <MutashabihatQuiz />
      <h2>السور</h2>
      <ul className="surah-list">
        {SURAHS.map((s, i) => counts[i] > 0 && (
          <li key={s.index}><Link href={`/mutashabihat/${s.index}`}><span className="num">{arDigits(s.index)}</span><span><span className="nm">{s.name}</span><span className="sub">{ayat(counts[i])} لها متشابهات</span></span></Link></li>
        ))}
      </ul>
    </article>
  );
}
