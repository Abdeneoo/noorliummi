import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { COMPANIONS, fiqhIndex, kitab } from '@/lib/fiqh';
import { bookMeta } from '@/lib/books';
import { arDigits } from '@/lib/quran';
import FiqhNotice from '@/components/FiqhNotice';
import FiqhSearchBox from '@/components/FiqhSearchBox';
const ALIAS: Record<string, string> = { sawm: 'siyam', siyaam: 'siyam', tahara: 'taharah', salat: 'salah', zakah: 'zakat' };
export const generateStaticParams = () => [...fiqhIndex().kitabs.map((k) => ({ kitab: k.slug })), ...Object.keys(ALIAS).map((kitab) => ({ kitab }))];
export const dynamicParams = false;
export async function generateMetadata({ params }: { params: Promise<{ kitab: string }> }): Promise<Metadata> { const k = kitab((await params).kitab); return { title: k ? `${k.title} — فقه العبادات` : 'الفقه' }; }
export default async function Kitab({ params }: { params: Promise<{ kitab: string }> }) {
  const s = (await params).kitab; if (ALIAS[s]) redirect(`/fiqh/${ALIAS[s]}`);
  const k = kitab(s); if (!k) notFound();
  const comp = (COMPANIONS[k.slug] ?? []).map((c) => ({ ...c, b: bookMeta(c.slug) })).filter((c) => c.b);
  return (
    <article style={{ maxWidth: 900, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/fiqh">فقه العبادات</Link></p><h1>{k.title}</h1>{k.intro.slice(1).map((t, i) => <p key={i}>{t}</p>)}</header>
      {k.slug === 'salah' && <p className="row"><Link className="btn" href="/books/how-to-pray">كيف تصلي؟ (ابن باز)</Link><Link className="btn ghost" href="/prayer">مواقيت الصلاة</Link><Link className="btn ghost" href="/adhan">الأذان</Link></p>}
      {k.slug === 'siyam' && <p className="row"><Link className="btn ghost" href="/calendar">التقويم والمواسم</Link><Link className="btn ghost" href="/books/fasting-fatawa">فتاوى صوم التطوع</Link></p>}
      <FiqhSearchBox />
      <FiqhNotice />
      <ol className="fiqh-abwab">{k.abwab.map((b) => (
        <li key={b.n} className="card"><Link href={`/fiqh/${k.slug}/${b.n}`}><strong>{b.title}</strong></Link>
          {b.masail.length > 0 && <ul>{b.masail.map((m, i) => <li key={i}><Link href={`/fiqh/${k.slug}/${b.n}#m${i + 1}`}>{m.replace(/[:.]$/, '')}</Link></li>)}</ul>}
        </li>))}</ol>
      {comp.length > 0 && <section className="section"><h2>كتب مساندة</h2><ul className="athar-dir">{comp.map((c) => <li key={c.slug}><Link href={`/books/${c.slug}`}><strong>{c.b!.title}</strong><small>{c.note}</small></Link></li>)}</ul></section>}
      <p className="note">{arDigits(k.abwab.length)} أبواب. المصدر: «{fiqhIndex().title}»، {fiqhIndex().publisher}، <a href={fiqhIndex().source} target="_blank" rel="noopener">IslamHouse ↗</a>.</p>
    </article>
  );
}
