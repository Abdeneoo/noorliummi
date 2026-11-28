import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import Link from 'next/link';
import { HE_LANGS, heCategories, isHeLang } from '@/lib/hadeethenc';
export const metadata: Metadata = { title: 'أحاديث مترجمة مع الشرح', openGraph: og('/hadeeth', 'ar', 'أحاديث مترجمة مع الشرح') };
const ar = (n: number) => n.toLocaleString('ar-EG');
export default async function HadeethHome({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const l = (await searchParams).lang; const q = isHeLang(l) ? `?lang=${l}` : ''; const cats = await heCategories();
  const roots = (cats ?? []).filter((c) => c.parent_id == null);
  return (
    <article style={{ maxWidth: 900, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/hadith">الحديث الشريف</Link></p><h1>أحاديث مترجمة مع الشرح</h1>
        <p>أحاديث مختارة بالعربية مع درجتها وتخريجها وشرحها وفوائدها، وترجمتها الكاملة بالأردية والتركية والإندونيسية.</p></header>
      <nav aria-label="لغة الترجمة"><ul className="chips lib-groups" style={{ marginBottom: 14 }}><li><Link className={!q ? 'on' : ''} href="/hadeeth">العربية فقط</Link></li>{(Object.keys(HE_LANGS) as (keyof typeof HE_LANGS)[]).map((x) => <li key={x}><Link lang={x} className={l === x ? 'on' : ''} href={`/hadeeth?lang=${x}`}>{HE_LANGS[x].name}</Link></li>)}</ul></nav>
      {roots.length ? roots.map((r) => (
        <section key={r.id} className="section"><h2><Link href={`/hadeeth/c/${r.id}${q}`}>{r.title}</Link> <small className="note">{ar(Number(r.hadeeths_count))} حديثًا</small></h2>
          <ul className="chips">{(cats ?? []).filter((c) => c.parent_id === r.id).map((c) => <li key={c.id}><Link href={`/hadeeth/c/${c.id}${q}`}>{c.title}</Link></li>)}</ul></section>))
        : <p className="note">تعذّر الاتصال بالمصدر الآن. حاول لاحقًا.</p>}
    </article>
  );
}
