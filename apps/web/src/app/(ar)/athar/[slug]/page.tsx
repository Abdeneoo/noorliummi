import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AtharTools from '@/components/AtharTools';
import KhatmaPlayer from '@/components/KhatmaPlayer';
import Tasbeeh from '@/components/Tasbeeh';
import { isSlug } from '@/lib/athar';
import { getPage } from '@/lib/athar-store';
import surahs from '@/generated/surahs.json';
import adhkar from '@/generated/adhkar/index.json';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'صفحة أثر', robots: { index: false, follow: false, nocache: true } };
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
      {p.items.filter((it) => it.kind === 'reciter').map((it) => <KhatmaPlayer key="k" reciter={it.ref} pageKey={slug.slice(0, 12)} />)}
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
      <Tasbeeh storeKey={`athar-${slug.slice(0, 12)}`} />
      <p className="note">كتب نصوص هذه الصفحة منشئُها، وليست من موقع نور لأمي. <Link href="/athar">اصنع صفحة لمن تحب</Link></p>
      <AtharTools slug={slug} initial={{ display_name: p.display_name, dedication: p.dedication, dua_text: p.dua_text, items: p.items }} />
    </article>
  );
}
