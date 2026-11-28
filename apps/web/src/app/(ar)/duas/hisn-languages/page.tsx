import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import Link from 'next/link';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
export const metadata: Metadata = { title: 'حصن المسلم بلغات العالم', description: 'ترجمات حصن المسلم من دار الإسلام بأكثر من خمسين لغة، تُفتح من موقعهم.', openGraph: og('/duas/hisn-languages', 'ar', 'حصن المسلم بلغات العالم', 'ترجمات حصن المسلم من دار الإسلام بأكثر من خمسين لغة، تُفتح من موقعهم.') };
interface Ed { id: number; title: string; lang: string; page: string; files: { url: string; size: string | null }[] }
export default function HisnLangs() {
  const D = JSON.parse(readFileSync(join(process.cwd(), 'src/generated/ih-quran/hisn.json'), 'utf8')) as Record<string, Ed[]>;
  const dn = new Intl.DisplayNames(['ar'], { type: 'language' }); const name = (c: string) => { try { return dn.of(c) ?? c; } catch { return c; } };
  const langs = Object.keys(D).sort((a, b) => name(a).localeCompare(name(b), 'ar'));
  const n = Object.values(D).reduce((s, v) => s + v.length, 0);
  return (
    <article style={{ maxWidth: 960, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/duas">الأدعية</Link></p><h1>حصن المسلم بلغات العالم</h1>
        <p>{n.toLocaleString('ar-EG')} إصدارًا بـ{langs.length.toLocaleString('ar-EG')} لغة، كما نشرتها دار الإسلام. أرسلها لمن يتكلم لغة أخرى.</p></header>
      <ul className="athar-dir">{langs.map((l) => <li key={l}><div className="card"><strong>{name(l)}</strong>
        {D[l].map((e) => <p key={e.id} style={{ margin: '6px 0 0' }}><span dir="auto">{e.title}</span><br />
          {e.files.map((f, i) => <a key={f.url} className="btn small ghost" href={f.url} target="_blank" rel="noopener" style={{ marginInlineEnd: 6 }}>{(f.url.split('.').pop() ?? '').toUpperCase()}{e.files.length > 1 ? ` ${i + 1}` : ''}{f.size ? ` · ${f.size}` : ''}</a>)}</p>)}
      </div></li>)}</ul>
    </article>
  );
}
