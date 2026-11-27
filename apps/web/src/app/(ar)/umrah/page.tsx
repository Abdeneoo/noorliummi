import type { Metadata } from 'next';
import Link from 'next/link';
import UmrahSteps from '@/components/UmrahSteps';
import { chapter } from '@/lib/books';
import { ADHKAR, loadAdhkar } from '@/lib/adhkar';
export const metadata: Metadata = { title: 'العمرة — خطوة بخطوة', description: 'صفة العمرة للشيخ ابن عثيمين، والمواقيت ومحظورات الإحرام، وأذكار السفر والطواف والسعي، مع عدّاد للأشواط.' };
const GROUPS: { id: string; title: string; ids: number[] }[] = [
  { id: 'safar', title: 'أذكار السفر', ids: [96, 97, 98, 105] },
  { id: 'masjid', title: 'دخول المسجد والخروج منه', ids: [13, 14] },
  { id: 'talbiya', title: 'التلبية', ids: [116] },
  { id: 'tawaf-dhikr', title: 'في الطواف', ids: [117, 118] },
  { id: 'sai-dhikr', title: 'على الصفا والمروة', ids: [119] },
  { id: 'awda', title: 'الرجوع من السفر', ids: [106] },
];
function Text({ slug, n }: { slug: string; n: number }) {
  const c = chapter(slug, n); if (!c) return null;
  return <>{c.blocks.map((b, i) => <p key={i} className="tafsir-text" lang="ar" style={{ whiteSpace: 'pre-line' }}>{b.ar}</p>)}</>;
}
export default async function Umrah() {
  const adhkar = await Promise.all(GROUPS.map(async (g) => ({ ...g, chapters: await Promise.all(g.ids.map(async (id) => ({ id, title: ADHKAR.find((c) => c.id === id)?.title ?? '', items: (await loadAdhkar(id)).items }))) })));
  return (
    <article style={{ maxWidth: 760, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/hajj">الحج والعمرة</Link></p><h1>العمرة خطوة بخطوة</h1>
        <p>صفة العمرة من كلام الشيخ ابن عثيمين، وأذكارها من «حصن المسلم»، مع عدّاد للأشواط. الصفحة تعمل دون إنترنت بعد فتحها مرة.</p></header>
      <nav className="chips" aria-label="أقسام الصفحة" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {[['#steps', 'خطواتي'], ['#sifa', 'صفة العمرة'], ['#mawaqit', 'المواقيت'], ['#mahzurat', 'محظورات الإحرام'], ['#adhkar', 'الأذكار']].map(([h, t]) => <a key={h} href={h} className="btn ghost small">{t}</a>)}
      </nav>
      <UmrahSteps />
      <section className="section" id="sifa"><h2>صفة العمرة</h2><p className="note">من «المنهج لمريد العمرة والحج» للشيخ محمد بن صالح العثيمين — <Link href="/books/manhaj-umrah-hajj/6">بالترجمات</Link></p><Text slug="manhaj-umrah-hajj" n={6} /></section>
      <section className="section" id="mawaqit"><h2>المواقيت</h2><Text slug="manhaj-umrah-hajj" n={3} /></section>
      <section className="section" id="mahzurat"><h2>محظورات الإحرام</h2><p className="note">من «صفة الحج والعمرة» للشيخ ابن عثيمين — <Link href="/books/sifat-al-hajj/9">حكم من فعل شيئًا منها</Link></p><Text slug="sifat-al-hajj" n={8} /></section>
      <section className="section" id="adhkar"><h2>الأذكار — من «حصن المسلم»</h2>
        {adhkar.map((g) => <div key={g.id} id={g.id} className="card" style={{ marginBottom: 12 }}><h3 style={{ marginTop: 0 }}>{g.title}</h3>
          {g.chapters.map((c) => <div key={c.id}>{g.ids.length > 1 && <p className="eyebrow" lang="ar" style={{ margin: '8px 0 0' }}>{c.title}</p>}
            {c.items.map((d) => <div key={d.n}><p className="dhikr-text" lang="ar">{d.t}</p>{d.r && <p className="dhikr-ref">{d.r}</p>}</div>)}</div>)}</div>)}
      </section>
      <section className="card"><h2 style={{ marginTop: 0 }}>التصاريح والخدمات</h2>
        <p>تصاريح العمرة والحجز تكون من تطبيق «نسك» الرسمي فقط.</p>
        <div className="row"><a className="btn" href="https://www.nusuk.sa" target="_blank" rel="noopener">نسك ↗</a><Link className="btn ghost" href="/times">مواقيت الصلاة</Link><Link className="btn ghost" href="/travel">حقيبة المسافر</Link><Link className="btn ghost" href="/books/manasik">التحقيق والإيضاح — ابن باز</Link></div></section>
      <p className="note">أحكام المناسك تُؤخذ من أهل العلم؛ ما هنا نقل لكلامهم كما هو. <Link href="/sources">المصادر</Link></p>
    </article>
  );
}
