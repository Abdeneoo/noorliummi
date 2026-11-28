import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import PlayTrack from '@/components/PlayTrack';
import { latestEnAudios } from '@/lib/islamhouse';
export const revalidate = 21600;
export const metadata: Metadata = { title: 'Audio lessons in English', description: 'Recent English audio lessons from IslamHouse, playing in the background.', openGraph: og('/en/lessons', 'en', 'Audio lessons in English') };
export default async function LessonsEn() {
  const items = await latestEnAudios(16);
  return (
    <article style={{ maxWidth: 860, margin: '0 auto' }} lang="en">
      <header className="page-head"><p className="eyebrow">Listen</p><h1>Audio lessons in English</h1><p>Recent lessons from IslamHouse. They keep playing with the screen off.</p></header>
      {!items?.length ? <p className="card">The lessons could not be loaded right now. Please try again later.</p> : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 10 }}>{items.map((x) => {
          const files = (x.attachments ?? []).filter((a) => /mp3/i.test(a.extension_type) || /\.mp3$/i.test(a.url)).sort((a, b) => a.order - b.order);
          const by = (x.prepared_by ?? []).filter((p) => p.kind !== 'translator').map((p) => p.title).join(', ');
          return <li key={x.id} className="card" style={{ padding: 16 }}><strong>{x.title}</strong>{by && <p className="note" style={{ margin: '4px 0 8px' }}>{by}</p>}
            <PlayTrack lang="en" label={files.length > 1 ? `▶ Play (${files.length} parts)` : '▶ Play'} className="btn small" tracks={files.map((a, k) => ({ id: `ihen${x.id}-${k}`, src: a.url, title: a.description || x.title, by, source: 'IslamHouse.com', page: '/en/lessons' }))} /></li>;
        })}</ul>)}
    </article>
  );
}
