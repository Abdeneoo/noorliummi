import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import Link from 'next/link';
import { qeList } from '@/lib/quranenc-live';
export const metadata: Metadata = { title: 'ترجمات معاني القرآن الكريم', description: 'كل ترجمات موسوعة القرآن الكريم QuranEnc بأحدث إصداراتها، مع اسم المترجم والإصدار.', openGraph: og('/translations', 'ar', 'ترجمات معاني القرآن الكريم', 'كل ترجمات موسوعة القرآن الكريم QuranEnc بأحدث إصداراتها، مع اسم المترجم والإصدار.') };
export const revalidate = 86400;
export default async function Translations() {
  const L = await qeList(); const langs = [...new Set(L.map((t) => t.language_iso_code))].sort();
  const dn = new Intl.DisplayNames(['ar'], { type: 'language' }); const name = (c: string) => { try { return dn.of(c) ?? c; } catch { return c; } };
  return (
    <article style={{ maxWidth: 960, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/quran">القرآن</Link></p><h1>ترجمات معاني القرآن الكريم</h1>
        <p>{L.length.toLocaleString('ar-EG')} ترجمة بـ{langs.length.toLocaleString('ar-EG')} لغة من موسوعة القرآن الكريم، بأحدث إصدار، كما هي دون تعديل.</p></header>
      {!L.length && <p className="card">تعذّر الوصول إلى موسوعة القرآن الآن. حاول لاحقًا.</p>}
      {langs.map((c) => <section key={c} className="section"><h2>{name(c)}</h2><ul className="athar-dir">{L.filter((t) => t.language_iso_code === c).map((t) => <li key={t.key}><Link href={`/translations/${t.key}/1`}><strong dir={t.direction}>{t.title}</strong><small>الإصدار {t.version}</small></Link></li>)}</ul></section>)}
    </article>
  );
}
