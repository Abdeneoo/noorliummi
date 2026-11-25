import type { Metadata } from 'next';
import Link from 'next/link';
import HadithSearch from '@/components/HadithSearch';
import { searchAll } from '@/lib/search';
import { SURAHS, arDigits } from '@/lib/quran';
import { ayat as count } from '@/lib/arnum';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'البحث في المصادر', robots: { index: false } };
export default async function Search({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? '').slice(0, 100); const r = q ? await searchAll(q) : null;
  return (
    <article style={{ maxWidth: 860, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow">بحث</p><h1>البحث في المصادر</h1><p>بحث لفظي في نص المصحف والأذكار والأحاديث الموجودة في الموقع. أداة للبحث في المصادر، وليست بديلًا عن سؤال أهل العلم.</p></header>
      <form className="row" role="search" action="/search" style={{ marginTop: 0 }}><input type="search" name="q" defaultValue={q} placeholder="اكتب كلمة أو أكثر (دون تشكيل)" aria-label="كلمات البحث" autoFocus={!q} style={{ flex: '1 1 260px' }} /><button className="btn">بحث</button></form>
      {q && !r && <p className="note" role="alert">اكتب ثلاثة أحرف على الأقل.</p>}
      {r && <>
        {r.surahs.length > 0 && <section className="section"><h2>سور</h2><ul className="chips">{r.surahs.map((s) => <li key={s.index}><Link href={`/quran/${s.index}`}>سورة {s.name}</Link></li>)}</ul></section>}
        {r.names.length > 0 && <section className="section"><h2>من أسماء الله الحسنى</h2><ul className="chips">{r.names.map((n) => <li key={n}><Link href="/names">{n}</Link></li>)}</ul></section>}
        <section className="section"><h2>القرآن الكريم — {r.ayatTotal ? count(r.ayatTotal) : 'لا نتائج'}</h2>
          <ol className="tafsir-list" style={{ listStyle: 'none', padding: 0 }}>{r.ayat.map((x) => (
            <li key={`${x.s}:${x.a}`} className="card"><p className="tafsir-ayah" lang="ar">{x.t} <span className="ayah-end">﴿{arDigits(x.a)}﴾</span></p>
              <p className="meta" style={{ justifyContent: 'flex-start' }}><Link href={`/quran/${x.s}#a${x.a}`}>سورة {SURAHS[x.s - 1].name}، الآية {arDigits(x.a)}</Link><Link href={`/tafsir/${x.s}#a${x.a}`}>التفسير</Link></p></li>))}</ol>
          {r.ayatTotal > r.ayat.length && <p className="note">تُعرض أول {arDigits(r.ayat.length)} آية؛ أضف كلمة لتضييق البحث.</p>}</section>
        <section className="section"><h2>الأذكار — {r.adhkar.length ? arDigits(r.adhkar.length) : 'لا نتائج'}</h2>
          <ul className="tafsir-list" style={{ listStyle: 'none', padding: 0 }}>{r.adhkar.map((d) => <li key={`${d.c}:${d.n}`} className="card"><p lang="ar" style={{ lineHeight: 2, margin: 0 }}>{d.t.length > 260 ? `${d.t.slice(0, 260)}…` : d.t}</p><p className="meta" style={{ justifyContent: 'flex-start' }}><Link href={`/adhkar/${d.c}#dh${d.n}`} lang="ar">{d.title}</Link></p></li>)}</ul></section>
        <section className="section"><h2>الأحاديث</h2><HadithSearch initial={r.q} /></section>
      </>}
    </article>
  );
}
