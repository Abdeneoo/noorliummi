import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AtharTools from '@/components/AtharTools';
import KhatmaPlayer from '@/components/KhatmaPlayer';
import Tasbeeh from '@/components/Tasbeeh';
import Lantern from '@/components/Lantern';
import AtharShare from '@/components/AtharShare';
import { isSlug } from '@/lib/athar';
import { getPage } from '@/lib/athar-store';
import { ogVersion } from '@/lib/og-meta';
import surahs from '@/generated/surahs.json';
import adhkar from '@/generated/adhkar/index.json';

export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const robots = { index: false, follow: false, nocache: true };
  try {
    const p = isSlug(slug) ? await getPage(slug) : null;
    if (p && p.status === 'active') {
      const title = `${p.display_name} — صفحة أثر`; const d = (p.dedication || 'صدقة جارية: سور وأذكار ودعاء. ادخل واقرأ وادعُ.').slice(0, 160);
      const img = { url: `/api/og/athar/${slug}?v=${ogVersion(p.display_name, p.dedication)}`, width: 1200, height: 630, alt: `صدقة جارية — ${p.display_name} — نور لأمي`, type: 'image/png' };
      return { title, description: d, robots, alternates: { canonical: `/athar/${slug}` }, openGraph: { type: 'article', title: `${title} — نور لأمي`, description: d, url: `/athar/${slug}`, siteName: 'نور لأمي', locale: 'ar', images: [img] }, twitter: { card: 'summary_large_image', title: `${title} — نور لأمي`, description: d, images: [img.url] } };
    }
  } catch { /* db unavailable */ }
  return { title: 'صفحة أثر', robots };
}
const S = surahs as { index: number; name: string; ayas: number }[];
const A = adhkar as { id: number; title: string }[];

export default async function AtharPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isSlug(slug)) notFound();
  const p = await getPage(slug);
  if (!p) notFound();
  if (p.status === 'frozen') {
    return <article className="card" style={{ maxWidth: 720, margin: '24px auto' }}><h1>الصفحة موقوفة مؤقتًا</h1><p>وصلت عن هذه الصفحة بلاغات، فأُوقفت حتى تُراجَع.</p></article>;
  }
  return (
    <article style={{ maxWidth: 720, margin: '24px auto', display: 'grid', gap: 20 }}>
      <section className="card dedication" style={{ textAlign: 'center' }}>
        <p className="meta"><span>صفحة أثر</span></p>
        <h1 style={{ margin: '8px 0' }}>{p.display_name}</h1>
        {p.dedication && <p style={{ whiteSpace: 'pre-line' }}>{p.dedication}</p>}
      </section>
      <Lantern slug={slug} name={p.display_name} />
      {p.items.filter((it) => it.kind === 'reciter').map((it) => <KhatmaPlayer key="k" reciter={it.ref} pageKey={slug.slice(0, 12)} atharSlug={slug} />)}
      {p.items.some((it) => it.kind !== 'reciter') && (
        <section className="card">
          <h2 style={{ marginTop: 0 }}>اقرأ ما تيسّر</h2>
          <ul className="athar-items">
            {p.items.filter((it) => it.kind !== 'reciter').map((it) => it.kind === 'surah'
              ? <li key={`s${it.ref}`}><Link href={`/quran/${it.ref}`}>سورة {S[it.ref - 1].name}</Link></li>
              : <li key={`d${it.ref}`}><Link href={`/adhkar/${it.ref}`}>{A.find((a) => a.id === it.ref)?.title}</Link></li>)}
          </ul>
        </section>
      )}
      {p.dua_text && (
        <section className="card">
          <h2 style={{ marginTop: 0 }}>دعاء صاحب الصفحة</h2>
          <p style={{ whiteSpace: 'pre-line', lineHeight: 2.1 }}>{p.dua_text}</p>
        </section>
      )}
      <Tasbeeh storeKey={`athar-${slug.slice(0, 12)}`} atharSlug={slug} />
      <AtharShare slug={slug} name={p.display_name} dua={p.dua_text} />
      <p className="note">كتب نصوص هذه الصفحة منشئُها، وليست من موقع نور لأمي. <Link href="/athar">اصنع صفحة لمن تحب</Link></p>
      <AtharTools slug={slug} initial={{ display_name: p.display_name, dedication: p.dedication, dua_text: p.dua_text, items: p.items, listed: p.listed }} />
    </article>
  );
}
