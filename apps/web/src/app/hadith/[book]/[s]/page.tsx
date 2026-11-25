import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BOOKS, bookOf, isHadith, loadSection, sectionLabel } from '@/lib/hadith';

export const dynamicParams = false;
export function generateStaticParams() { return BOOKS.flatMap((b) => b.sections.map((s) => ({ book: b.key, s: String(s.s) }))); }
export async function generateMetadata({ params }: { params: Promise<{ book: string; s: string }> }): Promise<Metadata> {
  const p = await params; const b = bookOf(p.book); return { title: b ? `${b.doc.ar} — الكتاب ${p.s}` : 'الحديث' };
}

export default async function Section({ params }: { params: Promise<{ book: string; s: string }> }) {
  const p = await params; const b = bookOf(p.book); const s = Number(p.s);
  const idx = b?.sections.findIndex((x) => x.s === s) ?? -1; if (!b || idx < 0) notFound();
  const sec = b.sections[idx]; const list = await loadSection(b.key, s);
  const prev = b.sections[idx - 1]; const next = b.sections[idx + 1];
  return (
    <article className="reader">
      <header>
        <h1>{b.doc.ar}</h1>
        <div className="meta"><span>{sectionLabel(sec, list)}</span>{sec.s > 0 && sec.en && <span dir="ltr" lang="en">{sec.en}</span>}</div>
      </header>
      <p className="review-banner">نسخة تجريبية بانتظار مراجعة أهل العلم. لا تُعرض الدرجات ولا الحواشي. <Link href={`/hadith/${b.key}`}>مصدر النص وطبعته</Link>{b.doc.license ? ` · ${b.doc.license}` : ''}</p>
      <ol className="tafsir-list" style={{ listStyle: 'none', padding: 0 }}>
        {list.map((h, i) => isHadith(h) ? (
          <li key={i} id={list.findIndex((x) => isHadith(x) && x.n === h.n) === i ? `h${h.n}` : `h${h.n}-${i}`} className="card">
            <p className="meta"><span>الحديث {h.m ? `${h.m} ` : ''}{h.l ?? h.n}</span>{b.doc.arabic_number_label && h.an !== h.n && <span>{b.doc.arabic_number_label}: {h.an}</span>}</p>
            <p lang="ar" style={{ lineHeight: 2.1 }}>{h.t}</p>
          </li>
        ) : 'h' in h ? (
          <li key={i}><h2 style={{ fontSize: '1.1rem', margin: '18px 0 0', color: 'var(--accent-strong)' }}>{h.h}</h2></li>
        ) : (
          <li key={i}><p lang="ar" className="note" style={{ margin: '4px 0' }}>{h.u}</p></li>
        ))}
      </ol>
      <nav className="pager">
        {prev ? <Link className="btn ghost" href={`/hadith/${b.key}/${prev.s}`}>السابق</Link> : <span />}
        <Link className="btn ghost" href={`/hadith/${b.key}`}>فهرس الكتاب</Link>
        {next ? <Link className="btn ghost" href={`/hadith/${b.key}/${next.s}`}>التالي</Link> : <span />}
      </nav>
    </article>
  );
}
