import type { Metadata } from 'next';
import Link from 'next/link';
import { ADHKAR } from '@/lib/adhkar';
export const metadata: Metadata = { title: 'أذكار حسب الموقف' };
/** Hisn al-Muslim chapters grouped by everyday situation. Titles and texts are the source's own; nothing is added. */
const GROUPS: [string, number[]][] = [
  ['النوم والاستيقاظ', [29, 1, 31]], ['البيت', [10, 11]], ['المسجد والأذان', [12, 13, 14, 15]], ['الوضوء والخلاء', [8, 9, 6, 7]],
  ['اللباس', [2, 3, 4]], ['الطعام', [70, 71, 72, 75]], ['السفر والركوب', [96, 97, 103, 106]], ['المطر والريح', [65, 66, 62]], ['مواقف أخرى', [78, 83, 99]],
];
export default function Situations() {
  return (
    <article style={{ maxWidth: 820, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow">الأذكار</p><h1>أذكار حسب الموقف</h1><p>من «حصن المسلم»: الذكر المناسب لما أنت فيه الآن.</p></header>
      {GROUPS.map(([title, ids]) => (
        <section key={title} className="section"><h2>{title}</h2>
          <ul className="athar-dir">{ids.map((id) => { const c = ADHKAR.find((x) => x.id === id); return c && <li key={id}><Link href={`/adhkar/${id}`}><strong lang="ar">{c.title}</strong></Link></li>; })}</ul>
        </section>
      ))}
      <p className="note"><Link href="/sakina?adhkar=sleep">وضع السكينة لأذكار النوم</Link> · <Link href="/adhkar">كل أبواب حصن المسلم</Link></p>
    </article>
  );
}
