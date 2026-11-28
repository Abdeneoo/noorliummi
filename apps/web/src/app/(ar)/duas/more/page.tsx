import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import DuaNav from '@/components/DuaNav';
import PlayTrack from '@/components/PlayTrack';
import { listShared } from '@/lib/rights';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'من مكتبات أخرى', robots: { index: false } };

/** Only libraries whose owners allowed playback here; nothing on this page sends the reader to another site. */
export default async function MorePage() {
  const libs = (await listShared()).filter((l) => l.mode === 'stream').map((l) => ({ ...l, items: l.items.filter((it) => it.file) })).filter((l) => l.items.length);
  if (!libs.length) redirect('/duas/audio');
  return (
    <article style={{ maxWidth: 820, margin: '24px auto' }}>
      <h1>من مكتبات أخرى</h1>
      <DuaNav />
      {libs.map((l) => (
        <section key={l.key} className="card" style={{ marginBottom: 16 }}>
          <h2 style={{ marginTop: 0 }}>{l.title}</h2>
          <ul className="athar-items">{l.items.map((it, k) => (
            <li key={k}><PlayTrack tracks={[{ id: `${l.key}-${k}`, src: it.file!, title: it.title, by: l.owner, source: l.owner, page: '/duas/more' }]} /> {it.title}</li>
          ))}</ul>
        </section>
      ))}
    </article>
  );
}
