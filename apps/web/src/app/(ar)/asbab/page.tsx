import type { Metadata } from 'next';
import Link from 'next/link';
import { og } from '@/lib/og-page';
import { asbabFor } from '@/lib/asbab';
import { SURAHS } from '@/lib/quran';
import { libBook } from '@/lib/library';
export const metadata: Metadata = { title: 'أسباب النزول', description: 'أسباب نزول الآيات سورةً سورة من «لباب النقول» للسيوطي و«أسباب نزول القرآن» للواحدي.', openGraph: og('/asbab', 'ar', 'أسباب النزول') };
export default function Asbab() {
  const l = libBook('lubab'); const w = libBook('wahidi');
  return (
    <article style={{ maxWidth: 960, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/quran">القرآن</Link></p><h1>أسباب النزول</h1>
        <p>من كتابين: «لباب النقول في أسباب النزول» للسيوطي، و«أسباب نزول القرآن» للواحدي. يورد المؤلفان الروايات بأسانيدها أو بعزوها، وفيها الصحيح والضعيف.</p></header>
      <div className="row">{l && <Link className="btn ghost small" href="/library/lubab">مقدمة السيوطي وتنبيهاته</Link>}{w && <Link className="btn ghost small" href="/library/wahidi">مقدمة الواحدي، وأول ما نزل وآخره</Link>}</div>
      <ul className="athar-dir" style={{ marginTop: 16 }}>{SURAHS.map((s) => { const r = asbabFor(s.index); return r.length ? (
        <li key={s.index}><div className="card" style={{ padding: 14 }}><strong>{s.index.toLocaleString('ar-EG')}. سورة {s.name}</strong>
          <div className="row" style={{ marginTop: 6 }}>{r.map((x) => <Link key={x.book} className="btn ghost small" href={`/library/${x.book}/${x.i}`}>{x.book === 'lubab' ? 'السيوطي' : 'الواحدي'}</Link>)}</div></div></li>) : null; })}</ul>
    </article>
  );
}
