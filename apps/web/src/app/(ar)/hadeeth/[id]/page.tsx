import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { HE_LANGS, heOne, heSource, isHeLang, tidy } from '@/lib/hadeethenc';
export const revalidate = 21600;
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> { const h = await heOne(Number((await params).id)); return { title: h?.title ?? 'حديث', description: h?.hadeeth?.slice(0, 160) }; }
export default async function HeHadithPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ lang?: string }> }) {
  const id = Number((await params).id); if (!Number.isInteger(id) || id < 1) notFound();
  const want = (await searchParams).lang; const raw = await heOne(id); if (!raw) notFound(); const h = tidy(raw);
  const lang = isHeLang(want) && h.translations.includes(want) ? want : null; const t = lang ? await heOne(id, lang) : null; const tr = t ? tidy(t) : null; const L = lang ? HE_LANGS[lang] : null;
  return (
    <article className="reader" style={{ maxWidth: 820 }}>
      <header><p className="eyebrow"><Link href="/hadeeth">أحاديث مترجمة مع الشرح</Link></p><h1 style={{ fontSize: '1.5rem' }}>{h.title}</h1></header>
      <nav aria-label="لغة الترجمة"><ul className="chips lib-groups" style={{ marginBottom: 14 }}><li><Link className={!lang ? 'on' : ''} href={`/hadeeth/${id}`}>العربية</Link></li>
        {(Object.keys(HE_LANGS) as (keyof typeof HE_LANGS)[]).map((l) => h.translations.includes(l) ? <li key={l}><Link className={lang === l ? 'on' : ''} href={`/hadeeth/${id}?lang=${l}`} lang={l}>{HE_LANGS[l].name}</Link></li> : null)}</ul></nav>
      <section className="card"><p className="hadith-text" style={{ fontSize: '1.3rem', lineHeight: 2.1 }}>{h.hadeeth}</p>
        <p className="meta"><span>الدرجة: {h.grade}</span><span>التخريج: {h.attribution}</span></p>
        {tr && L && <div lang={lang!} dir={L.dir} className="he-tr"><h2 style={{ fontSize: '1.05rem' }}>{tr.title}</h2><p style={{ lineHeight: 1.9 }}>{tr.hadeeth}</p><p className="note">{tr.grade} · {tr.attribution}</p></div>}</section>
      <section className="section"><h2>الشرح</h2><p style={{ lineHeight: 2 }}>{h.explanation}</p>
        {tr && L && tr.explanation && <div lang={lang!} dir={L.dir} className="he-tr"><p style={{ lineHeight: 1.9 }}>{tr.explanation}</p></div>}</section>
      {h.hints.length > 0 && <section className="section"><h2>من فوائد الحديث</h2><ul>{h.hints.map((x, i) => <li key={i}>{x}</li>)}</ul>
        {tr && L && tr.hints.length > 0 && <ul lang={lang!} dir={L.dir} className="he-tr">{tr.hints.map((x, i) => <li key={i}>{x}</li>)}</ul>}</section>}
      {h.words_meanings && h.words_meanings.length > 0 && <section className="section"><h2>معاني الكلمات</h2><dl>{h.words_meanings.map((w, i) => <div key={i}><dt><strong>{w.word}</strong></dt><dd>{w.meaning}</dd></div>)}</dl></section>}
      {h.reference && <section className="section"><h2>المراجع</h2><p className="note" style={{ whiteSpace: 'pre-line' }}>{h.reference}</p></section>}
      <p className="note">المصدر: <a href={heSource(id, lang ?? 'ar')} target="_blank" rel="noopener">هذا الحديث في HadeethEnc.com ↗</a> — النص والترجمة كما هما دون تعديل. حالة المراجعة في منصتنا: موثّق المصدر، لم يراجعه مراجع المنصة.</p>
    </article>
  );
}
