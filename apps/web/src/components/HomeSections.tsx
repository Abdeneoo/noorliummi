import Link from 'next/link';
import Icon from './Icon';
import { sunnahAt, weekIdx } from '@/lib/weekly-sunnah';

/** Home page: the weekly sunnah. */
export default async function HomeSections() {
  const sunnah = await sunnahAt(weekIdx());
  return (
    <>
      <section className="section reveal home-block" aria-labelledby="hb-sunnah">
        <div className="section-head"><h2 id="hb-sunnah"><Icon name="hadith" /> أحيِ سنة هذا الأسبوع</h2><Link href="/sunnah">كل السنن</Link></div>
        <Link className="card home-promo" href="/sunnah"><strong>{sunnah.title}</strong><span lang="ar">{sunnah.text.length > 200 ? `${sunnah.text.slice(0, 200)}…` : sunnah.text}</span></Link>
      </section>
    </>
  );
}
