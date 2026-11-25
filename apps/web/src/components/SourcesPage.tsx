import Link from 'next/link';
import { GROUPS, type Lang } from '@/lib/sources';
import registry from '@/generated/adhan-registry.json';

/** The single page that lists every outside source, licence and credit (pages themselves stay clean). */
export default function SourcesPage({ lang = 'ar' }: { lang?: Lang }) {
  const ar = lang === 'ar';
  const hosted = registry as { id: string; title: string; titleEn?: string; by: string; license: string; licenseUrl: string; source: string }[];
  return (
    <article className="sources">
      <header className="page-head">
        <p className="eyebrow">{ar ? 'الشفافية' : 'Transparency'}</p>
        <h1>{ar ? 'المصادر والتراخيص' : 'Sources and licences'}</h1>
        <p>{ar ? 'كل ما يعرضه الموقع من نصوص وصوتيات وبيانات، ومصدره وترخيصه، في مكان واحد. لا نكتب نصوصًا دينية بأنفسنا، وكل نص يُعرض كما ورد في مصدره.' : 'Every text, recording and dataset the site uses, with its source and licence, in one place. We write no religious text ourselves.'}</p>
      </header>
      <nav className="chips src-nav" aria-label={ar ? 'أقسام المصادر' : 'Source sections'}>
        {GROUPS.map((g) => <a key={g.id} href={`#${g.id}`}>{g.title[lang]}</a>)}
      </nav>
      {GROUPS.map((g) => (
        <section key={g.id} id={g.id} className="src-group">
          <h2>{g.title[lang]}</h2>
          <ul className="src-list">
            {g.items.map((s) => (
              <li key={s.what.en}>
                <div className="src-head"><strong>{s.what[lang]}</strong><span className="src-lic">{s.license}</span></div>
                <a href={s.url} rel="noopener" className="src-link">{s.source}</a>
                <p>{s.how[lang]}</p>
              </li>
            ))}
          </ul>
          {g.id === 'adhan' && (
            <details className="src-more">
              <summary>{ar ? `الأذانات المستضافة (${hosted.length}) ونسبة كل تسجيل` : `Hosted adhan recordings (${hosted.length}) and attribution`}</summary>
              <ul>{hosted.map((h) => <li key={h.id}>{ar ? h.title : h.titleEn ?? h.title} — {h.by}. <a href={h.licenseUrl} rel="noopener license">{h.license}</a> · <a href={h.source} rel="noopener">{ar ? 'المصدر' : 'source'}</a></li>)}</ul>
            </details>
          )}
        </section>
      ))}
      <p className="note">{ar ? <>إن رأيت خطأً في نص أو نسبة، فنرجو تنبيهنا ليُصحَّح. <Link href="/privacy">الخصوصية والشروط</Link></> : <>If you see an error in a text or attribution, please let us know. <Link href="/en/privacy">Privacy and terms</Link></>}</p>
    </article>
  );
}
