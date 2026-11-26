import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PEOPLE, TV_DUA_CATS, TV_ITEMS, TVC, ihItem, person } from '@/lib/people';
import { RECITERS, surahUrl } from '@/lib/reciters';
import { EA, eaUrl } from '@/lib/everyayah';
import { QD, ayatOf } from '@/lib/duas';
import surahs from '@/generated/surahs.json';
import TvLibrary from '@/components/TvLibrary';
import PlayTrack from '@/components/PlayTrack';
import SaveOffline from '@/components/SaveOffline';
import ShareLink from '@/components/ShareLink';
import AddToPlaylist from '@/components/AddToPlaylist';
const S = surahs as { index: number; name: string; tname: string }[];
export function generateStaticParams() { return PEOPLE.map((p) => ({ slug: p.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const p = person((await params).slug); if (!p) return {}; const n = p.en || p.ar; return { title: `${n} — duas and recitations`, description: `Duas, adhkar, ruqyah and recitations by ${n} on Noor Li Ummi, with the source of every recording.`, alternates: { languages: { ar: `/reciters/${p.slug}` } } }; }
export default async function ReciterEn({ params }: { params: Promise<{ slug: string }> }) {
  const p = person((await params).slug); if (!p) notFound();
  const name = p.en || p.ar;
  const tv = TV_ITEMS.filter((x) => x.scholar_id != null && p.tv.includes(x.scholar_id)).map((x) => ({ id: x.id, title: x.title, by: p.ar, by_en: p.en, cat: x.cat, plays: x.plays }));
  const duaTv = tv.filter((x) => TV_DUA_CATS.includes(x.cat)); const clips = tv.filter((x) => !TV_DUA_CATS.includes(x.cat));
  const ih = p.ih.map(ihItem).filter((x) => !!x).map((it) => { const f = it.attachments.filter((a) => a.type === 'MP3'); const parts = f.length > 1 ? f.filter((a) => !/كامل/.test(a.desc ?? '')) : f;
    return { it, tracks: parts.map((a, k) => ({ id: `ih${it.id}-${k}`, src: a.url, title: a.desc || it.title, by: name, source: `IslamHouse: ${it.title}`, license: 'IslamHouse published policy: unmodified, source named', page: `/en/reciters/${p.slug}` })) }; });
  const allIh = ih.flatMap((x) => x.tracks);
  const duaAyat = p.ea.length ? (await Promise.all(QD.duas.filter((d) => d.kind === 'quran').map(ayatOf))).flat() : [];
  const eaTracks = p.ea.flatMap((f) => { const e = EA.find((x) => x.f === f)!; return duaAyat.map((x) => ({ id: `q${x.s}:${x.a}:ea-${f}`, src: eaUrl(e, x.s, x.a), title: `${S[x.s - 1].tname} ${x.s}:${x.a}`, by: e.en, source: 'Full ayah — EveryAyah.com (streamed)', text: x.t, page: `/en/quran/${x.s}` })); });
  const full = p.quran.map((i) => RECITERS[i]).filter((r) => r.mode === 'surah');
  const catsOf = (rows: { cat: number }[]) => TVC.categories.filter((c) => rows.some((r) => r.cat === c.id));
  return (
    <article style={{ maxWidth: 900, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/en/reciters">Reciters and scholars</Link></p><h1>{name}</h1>{p.en && <p lang="ar" dir="rtl" style={{ margin: 0 }}>{p.ar}</p>}
        <div className="row"><ShareLink title={`${name} — Noor Li Ummi`} /><Link className="btn ghost small" href={`/reciters/${p.slug}`}>العربية</Link></div></header>
      {allIh.length > 0 && <section className="section"><h2>Recordings that play in the background and save offline</h2><p className="note">From IslamHouse, streamed unmodified under its published policy (republishing and offline use allowed with the source named).</p>
        <div className="row"><PlayTrack tracks={allIh} label={`▶ Play all (${allIh.length})`} className="btn" lang="en" /><AddToPlaylist tracks={allIh} name={name} lang="en" /><SaveOffline srcs={ih.filter(({ it }) => !/رقية|الرقى|المصحف|تلاوة/.test(it.title)).flatMap((x) => x.tracks).map((t) => t.src)} lang="en" /></div>
        <ul className="athar-items">{ih.map(({ it, tracks }) => <li key={it.id}><PlayTrack tracks={tracks} lang="en" /> <span lang="ar">{it.title}</span> <a className="note" href={it.url} target="_blank" rel="noopener">source ↗</a></li>)}</ul></section>}
      {eaTracks.length > 0 && <section className="section"><h2>Quranic duas in this voice</h2><p className="note">{eaTracks.length} ayat of supplication, each recited in full (a recitation of the ayat, not a qunut recording). Streamed from EveryAyah.com.</p>
        <div className="row"><PlayTrack tracks={eaTracks} label="▶ Play the Quranic duas" className="btn" lang="en" /><AddToPlaylist tracks={eaTracks} name={`Quranic duas — ${name}`} lang="en" /></div></section>}
      {duaTv.length > 0 && <section className="section"><h2>Duas, adhkar and ruqyah</h2><p className="note">From TVQuran in its official player: one recording at a time, kept open at the bottom while you browse. Not available offline.</p><TvLibrary rows={duaTv} cats={catsOf(duaTv)} lang="en" /></section>}
      {full.length > 0 && <section className="section"><h2>The whole Quran</h2>{full.map((r) => { const t = S.map((s) => ({ id: `q-${r.id}-${s.index}`, src: surahUrl(r, s.index), title: `Surah ${s.tname}`, by: r.en, source: 'Islamic Network', page: `/en/quran/${s.index}` })); return <div key={r.id} className="row"><strong>{r.en}</strong><PlayTrack tracks={t} label="▶ Full khatma from al-Fatiha" lang="en" /></div>; })}</section>}
      {clips.length > 0 && <section className="section"><h2>Selected recitations</h2><TvLibrary rows={clips} cats={catsOf(clips)} lang="en" /></section>}
      <section className="section"><h2>Sources</h2><ul>{p.quran.length > 0 && <li>Quran: Islamic Network, streamed.</li>}{p.ea.length > 0 && <li>Ayat of dua: EveryAyah.com, streamed with attribution (no published redistribution terms; nothing stored on our servers).</li>}{tv.length > 0 && <li>TVQuran: official embed. Direct play and offline use await their permission.</li>}{allIh.length > 0 && <li>IslamHouse: published policy.</li>}<li>No photos or biographies until we find a documented source that permits them.</li></ul></section>
    </article>
  );
}
