import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { album, producers, readers } from '@/lib/ih-quran';
import { SURAHS } from '@/lib/quran';
import PlayTrack from '@/components/PlayTrack';
import AddToPlaylist from '@/components/AddToPlaylist';
import { PEOPLE, norm } from '@/lib/people';
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> { const a = album(Number((await params).id)); return a ? { title: a.title, description: a.description.slice(0, 160) } : {}; }
export default async function Mushaf({ params }: { params: Promise<{ id: string }> }) {
  const a = album(Number((await params).id)); if (!a) notFound();
  const who = readers(a).join('، ');
  const mb = a.files.reduce((t, f) => { const m = /([\d.]+)\s*(KB|MB|GB)/i.exec(f.size); return t + (m ? Number(m[1]) * (m[2].toUpperCase() === 'GB' ? 1024 : m[2].toUpperCase() === 'KB' ? 1 / 1024 : 1) : 0); }, 0);
  const tracks = a.files.map((f) => { const s = SURAHS[f.n - 1]; return { id: `ihq${a.id}-${f.n}`, src: f.url, title: s ? `سورة ${s.name}` : f.d, by: who || a.title, source: `IslamHouse: ${a.title}`, license: 'سياسة IslamHouse المنشورة', page: `/mushafs/${a.id}` }; });
  const ppl = readers(a).map((r) => PEOPLE.find((p) => norm(p.ar).split(' ').slice(-1)[0] === norm(r).split(' ').slice(-1)[0] && norm(p.ar).split(' ')[0] === norm(r).split(' ')[0])).filter((p) => !!p);
  return (
    <article style={{ maxWidth: 860, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/mushafs">مصاحف دار الإسلام</Link></p><h1>{a.title}</h1>
        {who && <p>القارئ: {ppl.length ? ppl.map((p) => <Link key={p!.slug} href={`/reciters/${p!.slug}`} style={{ marginInlineEnd: 8 }}>{p!.ar}</Link>) : who}</p>}
        {a.description && <p className="note">{a.description}</p>}
        <p className="note">دار الإسلام تستضيف هذه التلاوة ولا تملك حقوقها إن لم تكن من منشوراتها، فلا تمنح ترخيصًا بها؛ لذلك نبثها من خوادمهم فقط دون حفظ على الجهاز، مع ذكر المصدر.</p>
        <p className="note">المصدر: <a href={a.url} target="_blank" rel="noopener">IslamHouse ↗</a>{producers(a).length ? ` · الإنتاج: ${producers(a).join('، ')}` : ''}</p>
        <div className="row"><PlayTrack tracks={tracks} label="▶ ختمة كاملة" className="btn" /><AddToPlaylist tracks={tracks} name={a.title} /><small className="note">بث فقط ({mb > 1024 ? `${(mb / 1024).toFixed(1)} جيجابايت` : `${Math.round(mb)} ميجابايت`})</small></div></header>
      <ol className="athar-items">{a.files.map((f, k) => <li key={f.n}><PlayTrack tracks={tracks} start={k} /> {SURAHS[f.n - 1] ? `${f.n.toLocaleString('ar-EG')}. سورة ${SURAHS[f.n - 1].name}` : f.d} <small className="note">{f.size}</small></li>)}</ol>
    </article>
  );
}
