import type { Metadata } from 'next';
import Link from 'next/link';
import UmrahJourney, { type Dh, type Step } from '@/components/UmrahJourney';
import { chapter } from '@/lib/books';
import { ADHKAR, loadAdhkar } from '@/lib/adhkar';

export const metadata: Metadata = { title: 'العمرة خطوة بخطوة', description: 'رحلة العمرة خطوة بخطوة مع أذكار كل خطوة وعدّاد أشواط الطواف والسعي، وصفة العمرة والمواقيت ومحظورات الإحرام.' };

const dh = async (ids: number[]): Promise<Dh[]> => Promise.all(ids.map(async (id) => ({ title: ADHKAR.find((c) => c.id === id)?.title ?? '', items: (await loadAdhkar(id)).items.map((d) => ({ n: d.n, t: d.t, r: d.r })) })));

function Read({ id, title, slug, n, open }: { id: string; title: string; slug: string; n: number; open?: boolean }) {
  const c = chapter(slug, n); if (!c) return null;
  return (
    <details className="um-read" id={id} open={open}>
      <summary><span>{title}</span><small>{c.blocks.length.toLocaleString('ar-EG')} فقرة</small></summary>
      <div className="um-read-body">{c.blocks.map((b, i) => <p key={i} lang="ar">{b.ar}</p>)}</div>
    </details>
  );
}

export default async function Umrah() {
  const steps: Step[] = [
    { id: 'safar', title: 'السفر', hint: 'دعاء الركوب ودعاء السفر', dhikr: await dh([96, 97]) },
    { id: 'ihram', title: 'الإحرام من الميقات', hint: 'التلبية', read: '#mawaqit', dhikr: await dh([116]) },
    { id: 'masjid', title: 'دخول المسجد الحرام', hint: 'دعاء دخول المسجد', dhikr: await dh([13]) },
    { id: 'tawaf', title: 'الطواف', hint: 'سبعة أشواط', read: '#sifa', laps: true, dhikr: await dh([117, 118]) },
    { id: 'rakatain', title: 'ركعتا الطواف', hint: 'بعد إتمام الطواف', read: '#sifa', dhikr: [] },
    { id: 'sai', title: 'السعي بين الصفا والمروة', hint: 'سبعة أشواط', read: '#sifa', laps: true, dhikr: await dh([119]) },
    { id: 'halq', title: 'الحلق أو التقصير', hint: 'وبه تتم العمرة', read: '#sifa', dhikr: [] },
  ];
  const after = await dh([14, 106]);
  return (
    <article className="um">
      <header className="um-hero">
        <svg className="um-hero-art" viewBox="0 0 200 200" aria-hidden="true">
          <defs><pattern id="um-p" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M20 0 L40 20 L20 40 L0 20 Z M20 8 L32 20 L20 32 L8 20 Z" fill="none" stroke="currentColor" strokeWidth="1" /></pattern></defs>
          <rect width="200" height="200" fill="url(#um-p)" />
        </svg>
        <div className="um-hero-in">
          <p className="um-kicker"><Link href="/hajj">الحج والعمرة</Link></p>
          <h1>العمرة خطوة بخطوة</h1>
          <p className="um-lead">رحلتك من السفر إلى التحلّل، وأذكار كل خطوة، وعدّاد لأشواط الطواف والسعي. تعمل الصفحة دون إنترنت بعد فتحها مرة.</p>
          <ul className="um-facts">
            <li><b>٧</b><span>أشواط الطواف</span></li>
            <li><b>٢</b><span>ركعتا الطواف</span></li>
            <li><b>٧</b><span>أشواط السعي</span></li>
          </ul>
          <a className="btn light" href="#steps">ابدأ رحلتك</a>
        </div>
      </header>

      <nav className="um-tabs" aria-label="أقسام الصفحة">
        <a href="#steps">الخطوات</a><a href="#learn">قبل السفر</a><a href="#services">الخدمات</a>
      </nav>

      <UmrahJourney steps={steps} after={after} />

      <section className="um-section" id="learn">
        <div className="um-section-head"><h2>اقرأ قبل السفر</h2><p>من كتب الشيخ محمد بن صالح العثيمين.</p></div>
        <Read id="sifa" title="صفة العمرة" slug="manhaj-umrah-hajj" n={6} />
        <Read id="mawaqit" title="المواقيت" slug="manhaj-umrah-hajj" n={3} />
        <Read id="mahzurat" title="محظورات الإحرام" slug="sifat-al-hajj" n={8} />
        <Read id="fidya" title="حكم من فعل شيئًا من المحظورات" slug="sifat-al-hajj" n={9} />
        <Read id="safar-ahkam" title="صلاة المسافر" slug="manhaj-umrah-hajj" n={2} />
        <p className="um-more"><Link href="/books/manhaj-umrah-hajj">الكتاب كاملًا بالأردية والتركية والإندونيسية</Link> · <Link href="/books/manasik">التحقيق والإيضاح — ابن باز</Link></p>
      </section>

      <section className="um-section" id="services">
        <div className="um-section-head"><h2>خدمات تحتاجها</h2></div>
        <div className="um-grid">
          <a className="um-tile um-tile-main" href="https://www.nusuk.sa" target="_blank" rel="noopener"><strong>نسك</strong><span>تصاريح العمرة والحجز — المنصة الرسمية</span></a>
          <Link className="um-tile" href="/times"><strong>مواقيت الصلاة</strong><span>بحسب مدينتك</span></Link>
          <Link className="um-tile" href="/travel"><strong>حقيبة المسافر</strong><span>القبلة وأدعية السفر والمساجد</span></Link>
          <Link className="um-tile" href="/live"><strong>البث المباشر</strong><span>من الحرمين</span></Link>
          <Link className="um-tile" href="/duas"><strong>الأدعية</strong><span>من القرآن والسنة</span></Link>
          <Link className="um-tile" href="/hajj"><strong>موسم الحج</strong><span>أيام الحج ومناسكه</span></Link>
        </div>
      </section>
    </article>
  );
}
