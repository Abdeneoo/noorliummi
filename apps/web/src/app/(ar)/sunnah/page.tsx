import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import Link from 'next/link';
import { WEEKLY, sunnahAt, weekIdx } from '@/lib/weekly-sunnah';
import { arDigits } from '@/lib/quran';
import ShareImageButton from '@/components/ShareImageButton';
export const metadata: Metadata = { title: 'أحيِ سنة', description: 'سنة نبوية كل أسبوع من «رياض الصالحين» للإمام النووي، بنص الحديث ورقمه.', openGraph: og('/sunnah', 'ar', 'أحيِ سنة', 'سنة نبوية كل أسبوع من «رياض الصالحين» للإمام النووي، بنص الحديث ورقمه.') };
export const revalidate = 3600;
export default async function Page() {
  const now = weekIdx(); const cur = await sunnahAt(now);
  const all = await Promise.all(WEEKLY.map((_, k) => sunnahAt(k)));
  return (
    <article style={{ maxWidth: 820, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow">الحديث</p><h1>أحيِ سنة</h1><p>سنة كل أسبوع من أبواب «رياض الصالحين» للإمام النووي، بنص الحديث ورقمه في الكتاب كما هو. تتجدد كل سبت.</p></header>
      <section className="card"><p className="eyebrow">سنة هذا الأسبوع</p><h2 style={{ marginTop: 0 }}>{cur.title}</h2>
        <p className="dhikr-text" lang="ar">{cur.text}</p>
        <p className="dhikr-ref">رياض الصالحين{cur.n ? `، الحديث رقم ${arDigits(Number(cur.n))}` : ''} — <Link href={cur.href}>الباب كاملًا</Link></p>
        <ShareImageButton story={{ text: cur.text, caption: `${cur.title} — رياض الصالحين${cur.n ? ` (${cur.n})` : ''}`, path: '/sunnah' }} /></section>
      <section className="section"><h2>كل السنن ({arDigits(all.length)})</h2>
        <ol className="fiqh-abwab">{all.map((x) => <li key={x.i} className="card" aria-current={x.k === now ? 'true' : undefined}><Link href={x.href}><strong>{x.title}</strong></Link><p className="note" style={{ margin: '6px 0 0' }}>{x.text.length > 220 ? `${x.text.slice(0, 220)}…` : x.text}</p></li>)}</ol></section>
    </article>
  );
}
