import Link from 'next/link';
import { arDigits } from '@/lib/quran';
import { note, surahName, TAG, type Dua } from '@/lib/duas';
import { DuaAyahPlay } from './DuaAyahPlayer';
import PlayTrack from './PlayTrack';
import DuaFav from './DuaFav';
import ShareImageButton from './ShareImageButton';
/** One dua from al-Qahtani's book: text as in the book, the author's reference/takhrij, and for Quranic duas the full ayah(s). */
export default function DuaCard({ d, ayat }: { d: Dua; ayat: { s: number; a: number; t: string }[] }) {
  const ref = d.notes.map(note).join(' — ');
  return (
    <li id={`d${d.n}`} className="card dhikr">
      <p className="eyebrow">{d.kind === 'quran' ? 'من القرآن الكريم' : 'من السنة'} · {arDigits(d.n)}</p>
      <p className="dhikr-text" lang="ar">{d.text}</p>
      {ayat.length > 0 && <details><summary>الآية كاملة {d.refs.map(([s, a1, a2]) => `(${surahName(s)}: ${arDigits(a1)}${a2 > a1 ? `–${arDigits(a2)}` : ''})`).join(' ')}</summary>
        <p className="ayat" lang="ar" style={{ fontFamily: 'var(--font-quran)' }}>{ayat.map((x) => `${x.t} ﴿${arDigits(x.a)}﴾`).join(' ')}</p></details>}
      <p className="dhikr-ref">{ref}</p>
      {d.tags.filter((t) => !['allahumma'].includes(t)).length > 0 && <p className="note" style={{ margin: 0 }}>{d.tags.map((t) => <Link key={t} href={`/duas/c/${t}`} className="chip-link">{TAG[t]}</Link>)}</p>}
      <div className="row dhikr-tools">
        {ayat.length > 0 && <DuaAyahPlay list={ayat.map((x) => ({ ...x, title: `${surahName(x.s)}: ${x.a}` }))} />}
        {d.audio && <PlayTrack tracks={[{ id: `qd${d.n}`, src: `/audio/adhkar/${d.audio}`, title: d.text.replace(/[()]/g, '').slice(0, 60), by: 'محمد جمعة (OpenDua)', license: 'CC BY 4.0', source: 'OpenDua — حصن المسلم', text: d.text, page: `/duas/${d.kind}#d${d.n}` }]} label="▶ استمع (محمد جمعة)" />}
        {d.refs[0] && <Link className="btn ghost small" href={`/quran/${d.refs[0][0]}#a${d.refs[0][1]}`}>في المصحف</Link>}
        {d.refs[0] && <Link className="btn ghost small" href={`/tafsir/${d.refs[0][0]}#a${d.refs[0][1]}`}>التفسير</Link>}
        <DuaFav id={`q${d.n}`} />
        <ShareImageButton story={{ text: d.text.replace(/[()]/g, ''), caption: `${ref.slice(0, 90)} — الدعاء من الكتاب والسنة`, path: `/duas/${d.kind}#d${d.n}` }} />
      </div>
    </li>
  );
}
