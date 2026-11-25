import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import KhatmaPlayer from '@/components/KhatmaPlayer';
import Tasbeeh from '@/components/Tasbeeh';
import { isSlug } from '@/lib/athar';
import { getPage } from '@/lib/athar-store';
import { loadAdhkar, ADHKAR } from '@/lib/adhkar';
import surahs from '@/generated/surahs.json';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Athar page', robots: { index: false, follow: false, nocache: true } };
const S = surahs as { index: number; name: string; tname: string; ename: string }[];

export default async function AtharPageEn({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isSlug(slug)) notFound();
  const p = await getPage(slug);
  if (!p) notFound();
  if (p.status === 'frozen') return <article className="card" style={{ maxWidth: 720, margin: '24px auto' }}><h1>This page is paused</h1><p>It received reports and is paused until reviewed.</p></article>;
  // The dua for the deceased (Hisn al-Muslim) with its sourced English translation — not a machine translation.
  const dead = (await loadAdhkar(56)).items[0] as { t: string; en?: string; r?: string };
  const dhikr = p.items.filter((it) => it.kind === 'dhikr');
  return (
    <article style={{ maxWidth: 720, margin: '24px auto', display: 'grid', gap: 20 }}>
      <section className="card dedication" style={{ textAlign: 'center' }}>
        <p className="meta"><span>Athar page</span></p>
        <h1 style={{ margin: '8px 0' }} dir="auto">{p.display_name}</h1>
        {p.dedication && <p style={{ whiteSpace: 'pre-line' }} dir="auto">{p.dedication}</p>}
      </section>
      {p.items.filter((it) => it.kind === 'reciter').map((it) => <KhatmaPlayer key="k" reciter={it.ref} pageKey={slug.slice(0, 12)} lang="en" />)}
      {p.items.some((it) => it.kind !== 'reciter') && (
        <section className="card">
          <h2 style={{ marginTop: 0 }}>Read what you can</h2>
          <ul className="athar-items">
            {p.items.filter((it) => it.kind === 'surah').map((it) => <li key={`s${it.ref}`}><Link href={`/en/quran/${it.ref}`}>Surah {S[it.ref - 1].tname} — {S[it.ref - 1].ename}</Link></li>)}
            {dhikr.map((it) => <li key={`d${it.ref}`}><Link href={`/en/adhkar/${it.ref}`}><span lang="ar">{ADHKAR.find((a) => a.id === it.ref)?.title}</span></Link></li>)}
          </ul>
        </section>
      )}
      <section className="card">
        <h2 style={{ marginTop: 0 }}>A dua for the deceased</h2>
        <p lang="ar" style={{ lineHeight: 2.1 }}>{dead.t}</p>
        {dead.en && <p>{dead.en}</p>}
        <p className="note">Hisn al-Muslim, {dead.r}. English translation from the same source.</p>
      </section>
      {p.dua_text && (
        <section className="card">
          <h2 style={{ marginTop: 0 }}>The creator&apos;s dua</h2>
          <p style={{ whiteSpace: 'pre-line', lineHeight: 2.1 }} dir="auto">{p.dua_text}</p>
          <p className="note">Shown as the creator wrote it; personal texts are not machine-translated.</p>
        </section>
      )}
      <Tasbeeh storeKey={`athar-${slug.slice(0, 12)}`} lang="en" />
      <p className="note">The texts on this page were written by its creator, not by Noor Li Ummi. <Link href={`/athar/${slug}`} lang="ar">العربية</Link></p>
    </article>
  );
}
