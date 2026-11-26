import Link from 'next/link';
import juz from '@/generated/juz.json';
import quarters from '@/generated/quarters.json';
import { SURAHS, arDigits } from '@/lib/quran';
import QuranPageJump from './QuranPageJump';
/** Navigate the mushaf by juz', hizb and quarter (Tanzil metadata), or by page number. */
export default function QuranJump() {
  const name = (s: number) => SURAHS[s - 1].name;
  const J = juz as [number, number][]; const Q = quarters as [number, number][];
  return (
    <section className="card quran-jump">
      <details open>
        <summary><strong>الأجزاء</strong></summary>
        <ul className="chips even">{J.map(([s, a], i) => <li key={i}><Link href={`/quran/${s}#a${a}`} title={`${name(s)} ${arDigits(a)}`}>الجزء {arDigits(i + 1)}</Link></li>)}</ul>
      </details>
      <details>
        <summary><strong>الأحزاب والأرباع</strong></summary>
        <ol className="hizb-list">{Array.from({ length: 60 }, (_, h) => (
          <li key={h}><span>الحزب {arDigits(h + 1)}</span>{[0, 1, 2, 3].map((r) => { const [s, a] = Q[h * 4 + r]; return <Link key={r} href={`/quran/${s}#a${a}`} title={`${name(s)}: ${arDigits(a)}`}>{['أوله', 'الربع', 'النصف', 'ثلاثة أرباع'][r]}</Link>; })}</li>
        ))}</ol>
      </details>
      <QuranPageJump />
    </section>
  );
}
