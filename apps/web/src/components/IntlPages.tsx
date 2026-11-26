import Link from 'next/link';
import { notFound } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import FontSize from './FontSize';
import Beacon from './Beacon';
import { INTL, TR_INFO, loadTr, type IntlLang } from '@/lib/intl';
import { SURAHS, arDigits, loadSurah } from '@/lib/quran';

const HEAD = "document.documentElement.classList.add('js');try{var t=localStorage.getItem('noor.theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}try{var f=Number(localStorage.getItem('noor.fs'));if(f>=0.85&&f<=1.4)document.documentElement.style.fontSize=(f*100)+'%'}catch(e){}";
export function IntlLayout({ lang, children }: { lang: IntlLang; children: React.ReactNode }) {
  const t = INTL[lang];
  return (
    <html lang={lang} dir={t.dir} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: HEAD }} />
        <header className="site"><div className="wrap">
          <Link href={`/${lang}`} className="brand"><span className="wordmark">{t.site}</span></Link>
          <nav className="intl-langs" aria-label="Languages">{(['ur', 'tr', 'id'] as const).filter((l) => l !== lang).map((l) => <Link key={l} href={`/${l}`} lang={l} hrefLang={l}>{INTL[l].native}</Link>)}<Link href="/en" lang="en" hrefLang="en">English</Link><Link href="/" lang="ar" hrefLang="ar">العربية</Link></nav>
          <div className="utils"><FontSize lang="en" /><ThemeToggle lang="en" /></div>
        </div></header>
        <main id="main"><div className="wrap">{children}</div></main>
        <footer className="site"><div className="wrap foot-bottom"><span>{t.tagline}</span><span>{t.source}: QuranEnc.com — {TR_INFO[lang].title} (v{TR_INFO[lang].version})</span></div></footer>
        <Beacon />
      </body>
    </html>
  );
}
export function IntlHome({ lang }: { lang: IntlLang }) {
  const t = INTL[lang];
  return (
    <article>
      <header className="page-head"><p className="eyebrow">{t.tagline}</p><h1>{t.quran}</h1><p>{TR_INFO[lang].title} — QuranEnc.com</p></header>
      <ul className="surah-list">{SURAHS.map((s) => <li key={s.index}><Link href={`/${lang}/quran/${s.index}`}><span className="num">{s.index}</span><span><span className="nm">{s.tname} <span lang="ar" dir="rtl">{s.name}</span></span><span className="sub">{s.type === 'Meccan' ? t.meccan : t.medinan} · {s.ayas} {t.ayat}</span></span></Link></li>)}</ul>
      <div className="row"><Link className="btn ghost" href="/hadith" lang="ar">{t.hadith}</Link><Link className="btn ghost" href={`/hadeeth?lang=${lang}`}>{t.encyc}</Link><Link className="btn ghost" href={`/adhkar/27?tr=${lang}`}>{t.adhkarExt}</Link></div>
      <p className="note">{t.other} <Link href="/en" lang="en">English</Link> · <Link href="/" lang="ar">العربية</Link>. {t.uiNote}</p>
    </article>
  );
}
export async function IntlSurah({ lang, n }: { lang: IntlLang; n: number }) {
  if (!Number.isInteger(n) || n < 1 || n > 114) notFound();
  const t = INTL[lang]; const [{ meta, bismillah, ayat }, tr] = await Promise.all([loadSurah(n), loadTr(lang, n)]);
  return (
    <article className="reader">
      <header><h1>{t.surah} {meta.tname} <span lang="ar" dir="rtl">({meta.name})</span></h1><div className="meta"><span>{meta.type === 'Meccan' ? t.meccan : t.medinan}</span><span>{meta.ayas} {t.ayat}</span></div></header>
      <p style={{ textAlign: 'center' }}><Link className="btn ghost" href={`/quran/${n}`} lang="ar">{t.listen}</Link></p>
      {bismillah && <p className="bismillah" lang="ar" dir="rtl">{bismillah}</p>}
      <ol className="tafsir-list" style={{ listStyle: 'none', padding: 0 }}>
        {ayat.map((a, i) => (
          <li key={a.n} id={`a${a.n}`} className="card">
            <p className="tafsir-ayah" lang="ar" dir="rtl">{a.t} <span className="ayah-end">﴿{arDigits(a.n)}﴾</span></p>
            <p className="en-tr" lang={lang} dir={t.dir}><span className="num">{a.n}.</span> {tr[i].tr}</p>
            {tr[i].fn && <p className="en-fn" lang={lang} dir={t.dir}><strong>{t.footnote}:</strong> {tr[i].fn}</p>}
          </li>))}
      </ol>
      <p className="note">{t.source}: <a href="https://quranenc.com" target="_blank" rel="noopener">QuranEnc.com</a> — {TR_INFO[lang].title}, v{TR_INFO[lang].version}. {TR_INFO[lang].description}</p>
      <nav className="pager">{n > 1 ? <Link className="btn ghost" href={`/${lang}/quran/${n - 1}`}>{t.prev}</Link> : <span />}<Link className="btn ghost" href={`/${lang}`}>{t.index}</Link>{n < 114 ? <Link className="btn ghost" href={`/${lang}/quran/${n + 1}`}>{t.next}</Link> : <span />}</nav>
    </article>
  );
}
