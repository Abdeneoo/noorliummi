import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { allAbwab, bab, fiqhIndex, kitab } from '@/lib/fiqh';
import { arDigits } from '@/lib/quran';
import FiqhNotice from '@/components/FiqhNotice';
import ShareLink from '@/components/ShareLink';
export const dynamicParams = false;
export const generateStaticParams = () => allAbwab().map((b) => ({ kitab: b.kitab, n: String(b.n) }));
export async function generateMetadata({ params }: { params: Promise<{ kitab: string; n: string }> }): Promise<Metadata> { const b = bab(Number((await params).n)); return { title: b ? `${b.title} — الفقه الميسر` : 'الفقه' }; }
export default async function Bab({ params }: { params: Promise<{ kitab: string; n: string }> }) {
  const p = await params; const k = kitab(p.kitab); const b = bab(Number(p.n)); if (!k || !b || b.kitab !== k.slug) notFound();
  const all = allAbwab(); const at = all.findIndex((x) => x.n === b.n); const prev = all[at - 1]; const next = all[at + 1]; const x = fiqhIndex();
  let m = 0;
  return (
    <article className="reader book fiqh" style={{ maxWidth: 820 }}>
      <header><p className="eyebrow"><Link href="/fiqh">فقه العبادات</Link> ‹ <Link href={`/fiqh/${k.slug}`}>{k.title}</Link></p><h1 style={{ fontSize: '1.5rem' }}>{b.title}</h1>
        <p className="meta"><span>{x.title}</span><span>{x.by}</span></p></header>
      {k.abwab.find((a) => a.n === b.n)!.masail.length > 1 && <nav className="card fiqh-toc" aria-label="مسائل الباب"><strong>مسائل الباب</strong><ol>{k.abwab.find((a) => a.n === b.n)!.masail.map((t, i) => <li key={i}><a href={`#m${i + 1}`}>{t.replace(/[:.]$/, '')}</a></li>)}</ol></nav>}
      <div className="book-body">{b.blocks.map((blk, i) => {
        if (i === 0 && blk.tag === 'h2') return null;
        if (blk.tag === 'h3') { m += 1; return <h3 key={i} id={`m${m}`} className="ar"><span id={`p${i}`} />{blk.ar}</h3>; }
        if (blk.tag === 'ref') return <p key={i} id={`p${i}`} className="fiqh-ref">[{blk.ar.replace(/\.$/, '')}]</p>;
        if (blk.tag === 'lead') return <p key={i} id={`p${i}`} className="ar"><strong>{blk.ar}</strong></p>;
        return <p key={i} id={`p${i}`} className="ar">{blk.ar}</p>;
      })}</div>
      <p className="row"><ShareLink title={`${b.title} — الفقه الميسر`} /><Link className="btn ghost" href="/fiqh/search">بحث في الفقه</Link></p>
      <FiqhNotice />
      <p className="note">المصدر: «{x.title}» — إعداد {x.by}، {x.publisher}، {k.title}، {b.title}. النسخة الرقمية: <a href={x.cnt} target="_blank" rel="noopener">موسوعة المحتوى الإسلامي (IslamHouse) ↗</a> · <a href={x.source} target="_blank" rel="noopener">صفحة الكتاب ↗</a>. حالة المراجعة في منصتنا: موثّق المصدر، لم يراجعه مراجع المنصة.</p>
      <nav className="pager">{prev ? <Link className="btn ghost" href={`/fiqh/${prev.kitab}/${prev.n}`}>الباب السابق</Link> : <span />}<Link className="btn ghost" href={`/fiqh/${k.slug}`}>{k.title}</Link>{next ? <Link className="btn ghost" href={`/fiqh/${next.kitab}/${next.n}`}>الباب التالي</Link> : <span />}</nav>
    </article>
  );
}
