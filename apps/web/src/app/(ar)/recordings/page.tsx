import type { Metadata } from 'next';
import Link from 'next/link';
import PlayTrack from '@/components/PlayTrack';
import AddToPlaylist from '@/components/AddToPlaylist';
import { listOwn } from '@/lib/own-rec';
export const metadata: Metadata = { title: 'تسجيلات نور لأمي', description: 'أدعية وأذكار سجّلها قرّاء ومشايخ خصيصًا لنور لأمي، بموافقتهم الكتابية.' };
export const dynamic = 'force-dynamic';
export default async function Recordings() {
  const all = await listOwn(true); const by = [...new Set(all.map((x) => x.reciter_ar))];
  return (
    <article style={{ maxWidth: 860, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/duas">الأدعية</Link></p><h1>تسجيلات نور لأمي</h1>
        <p>أدعية وأذكار يسجّلها قرّاء ومشايخ خصيصًا للموقع، بموافقة كتابية محفوظة، وتُراجع قبل نشرها. لا أصوات مولّدة آليًا.</p></header>
      {!all.length && <p className="card">لا توجد تسجيلات منشورة بعد. نرحّب بتعاون القرّاء والمشايخ: <Link href="/contribute">ساهم معنا</Link>.</p>}
      {by.map((r) => { const items = all.filter((x) => x.reciter_ar === r); const tr = items.map((x) => ({ id: `own${x.id}`, src: `/api/rec/${x.id}`, title: x.title, by: r, source: x.dua_source ? `نص الدعاء: ${x.dua_source}` : 'تسجيل خاص بنور لأمي', license: 'بموافقة القارئ', text: x.dua_text, page: '/recordings' }));
        return <section key={r} className="section"><h2>{r}</h2><div className="row"><PlayTrack tracks={tr} label="▶ شغّل الكل" className="btn" /><AddToPlaylist tracks={tr} name={r} /></div>
          <ul className="athar-items">{items.map((x, k) => <li key={x.id}><PlayTrack tracks={tr} start={k} /> {x.title}{x.dua_source && <small className="note"> · {x.dua_source}</small>}</li>)}</ul></section>; })}
    </article>
  );
}
