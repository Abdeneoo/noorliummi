import type { Metadata } from 'next';
import Link from 'next/link';
import { ADHKAR, loadAdhkar } from '@/lib/adhkar';
import { loadSurah, SURAHS, arDigits } from '@/lib/quran';
export const metadata: Metadata = { title: 'الرقية الشرعية', description: 'سور وآيات من القرآن الكريم وأدعية من «حصن المسلم» بتخريجها — نصوص كما في مصادرها.' };
const QURAN: { s: number; from: number; to: number; label: string }[] = [
  { s: 1, from: 1, to: 7, label: 'سورة الفاتحة' },
  { s: 2, from: 255, to: 255, label: 'آية الكرسي' },
  { s: 2, from: 285, to: 286, label: 'خاتمة سورة البقرة' },
  { s: 112, from: 1, to: 4, label: 'سورة الإخلاص' },
  { s: 113, from: 1, to: 5, label: 'سورة الفلق' },
  { s: 114, from: 1, to: 6, label: 'سورة الناس' },
];
const HISN = [125, 50, 126, 49, 129, 127, 31, 35, 36];
export default async function Ruqyah() {
  const q = await Promise.all(QURAN.map(async (x) => ({ ...x, ayat: (await loadSurah(x.s)).ayat.slice(x.from - 1, x.to) })));
  const h = await Promise.all(HISN.map(async (id) => ({ id, title: ADHKAR.find((c) => c.id === id)?.title ?? '', items: (await loadAdhkar(id)).items })));
  return (
    <article style={{ maxWidth: 820, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/duas">الأدعية</Link></p><h1>الرقية الشرعية</h1><p>سور وآيات من القرآن الكريم، وأدعية من «حصن المسلم» بتخريجها، تقرؤها على نفسك وأهلك.</p></header>
      <p className="review-banner">النصوص كما في مصادرها دون إضافة. هذه الصفحة لا تقدّم علاجًا ولا تَعِد بشفاء، ولا تغني عن الطبيب؛ وللحالات الخاصة اسأل عالمًا ثقة.</p>
      <h2 className="section">من القرآن الكريم</h2>
      {q.map((x) => (
        <section key={`${x.s}-${x.from}`} className="card" style={{ marginBottom: 12 }}>
          <h3 style={{ marginTop: 0 }}>{x.label}</h3>
          <p className="dhikr-text" lang="ar" style={{ fontFamily: 'var(--font-quran)' }}>{x.ayat.map((a, i) => `${a.t} ﴿${arDigits(x.from + i)}﴾`).join(' ')}</p>
          <p className="dhikr-ref">سورة {SURAHS[x.s - 1].name}{x.from === 1 && x.to === x.ayat.length ? '' : `، الآيات ${arDigits(x.from)}${x.to > x.from ? `–${arDigits(x.to)}` : ''}`} — <Link href={`/quran/${x.s}#a${x.from}`}>في المصحف مع التلاوة</Link></p>
        </section>
      ))}
      <h2 className="section">من السنة («حصن المسلم»)</h2>
      {h.map((c) => (
        <section key={c.id} className="card" style={{ marginBottom: 12 }}>
          <h3 style={{ marginTop: 0 }} lang="ar">{c.title}</h3>
          {c.items.map((d) => <div key={d.n} style={{ borderTop: '1px solid var(--line)', padding: '10px 0' }}><p className="dhikr-text" lang="ar">{d.t}</p>{d.r && <p className="dhikr-ref">{d.r}</p>}</div>)}
          <Link className="btn ghost small" href={`/adhkar/${c.id}`}>في الأذكار</Link>
        </section>
      ))}
      <p className="note">المصادر: نص المصحف من مشروع Tanzil، والأدعية من «حصن المسلم» لسعيد بن وهف القحطاني بتخريجه. <Link href="/sources">المصادر والتراخيص</Link></p>
    </article>
  );
}
