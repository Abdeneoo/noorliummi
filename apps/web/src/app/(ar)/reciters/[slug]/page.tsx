import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PEOPLE, TV_DUA_CATS, TV_ITEMS, TVC, ihItem, person, tvCat } from '@/lib/people';
import { RECITERS, surahUrl } from '@/lib/reciters';
import surahs from '@/generated/surahs.json';
import TvLibrary from '@/components/TvLibrary';
import PlayTrack from '@/components/PlayTrack';
import SaveOffline from '@/components/SaveOffline';
import ShareLink from '@/components/ShareLink';
import DuaFav from '@/components/DuaFav';
import AddToPlaylist from '@/components/AddToPlaylist';
import { EA, eaUrl } from '@/lib/everyayah';
import { albums, readers } from '@/lib/ih-quran';
import { norm } from '@/lib/people';
import { QD, ayatOf, surahName } from '@/lib/duas';

const S = surahs as { index: number; name: string }[];
export function generateStaticParams() { return PEOPLE.map((p) => ({ slug: p.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = person((await params).slug); if (!p) return {};
  return { title: `${p.ar} — الأدعية والتلاوات`, description: `ما بصوت ${p.ar} في نور لأمي: الأدعية والأذكار والرقية والتلاوات، مع مصدر كل تسجيل.`, alternates: { languages: { en: `/en/reciters/${p.slug}` } } };
}

export default async function ReciterPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = person((await params).slug); if (!p) notFound();
  const tv = TV_ITEMS.filter((x) => x.scholar_id != null && p.tv.includes(x.scholar_id)).map((x) => ({ id: x.id, title: x.title, by: p.ar, cat: x.cat, plays: x.plays }));
  const duaTv = tv.filter((x) => TV_DUA_CATS.includes(x.cat)); const clips = tv.filter((x) => !TV_DUA_CATS.includes(x.cat));
  const ih = p.ih.map(ihItem).filter((x) => !!x).map((it) => {
    const f = it.attachments.filter((a) => a.type === 'MP3'); const parts = f.length > 1 ? f.filter((a) => !/كامل/.test(a.desc ?? '')) : f;
    return { it, tracks: parts.map((a, k) => ({ id: `ih${it.id}-${k}`, src: a.url, title: a.desc || it.title, by: p.ar, source: `IslamHouse: ${it.title}`, license: 'سياسة IslamHouse المنشورة: النشر دون تعديل مع ذكر المصدر', page: `/reciters/${p.slug}` })) };
  });
  const allIh = ih.flatMap((x) => x.tracks);
  const full = p.quran.map((i) => ({ i, r: RECITERS[i] })).filter((x) => x.r.mode === 'surah');
  const ayahOnly = p.quran.map((i) => RECITERS[i]).filter((r) => r.mode === 'ayah');
  const duaAyat = p.ea.length ? (await Promise.all(QD.duas.filter((d) => d.kind === 'quran').map(ayatOf))).flat() : [];
  const eaTracks = p.ea.flatMap((f) => { const e = EA.find((x) => x.f === f)!; return duaAyat.map((x) => ({ id: `q${x.s}:${x.a}:ea-${f}`, src: eaUrl(e, x.s, x.a), title: `${surahName(x.s)}: ${x.a}`, by: e.name, source: 'تلاوة الآية كاملة — EveryAyah.com (بث من موقعهم)', text: x.t, page: `/quran/${x.s}#a${x.a}` })); });
  const fl = (x: string) => { const t = norm(x).split(' ').filter((w) => w !== 'بن'); return `${t[0]} ${t[t.length - 1]}`; };
  const myAlbums = albums().filter((a) => readers(a).some((r) => fl(r) === fl(p.ar)));
  const catsOf = (rows: { cat: number }[]) => TVC.categories.filter((c) => rows.some((r) => r.cat === c.id));
  return (
    <article style={{ maxWidth: 900, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/reciters">القرّاء والمشايخ</Link></p>
        <h1>{p.ar}</h1>{p.en && <p dir="ltr" lang="en" style={{ margin: 0 }}>{p.en}</p>}
        <p className="note">{[p.quran.length && 'المصحف كاملًا', duaTv.length && `${duaTv.length.toLocaleString('ar-EG')} دعاء وذكر ورقية`, clips.length && `${clips.length.toLocaleString('ar-EG')} مقطع تلاوة`, allIh.length && `${allIh.length.toLocaleString('ar-EG')} تسجيلًا مباشرًا`].filter(Boolean).join(' · ')}</p>
        <div className="row"><DuaFav id={`reciter:${p.slug}`} /><ShareLink title={`${p.ar} — نور لأمي`} /></div></header>

      {allIh.length > 0 && <section className="section"><h2>تسجيلات تعمل في الخلفية وتُحفظ دون إنترنت</h2>
        <div className="row"><PlayTrack tracks={allIh} label={`▶ شغّل الكل (${allIh.length.toLocaleString('ar-EG')})`} className="btn" /><AddToPlaylist tracks={allIh} name={p.ar} /><SaveOffline srcs={allIh.map((t) => t.src)} /></div>
        <ul className="athar-items">{ih.map(({ it, tracks }) => <li key={it.id}><PlayTrack tracks={tracks} /> {it.title} {tracks.length > 1 && <small className="note">({tracks.length.toLocaleString('ar-EG')} مقطعًا)</small>}</li>)}</ul></section>}

      {eaTracks.length > 0 && <section className="section"><h2>أدعية القرآن بصوته</h2>
        <p className="note">{eaTracks.length.toLocaleString('ar-EG')} آية من آيات الدعاء، تُتلى كل آية كاملة (تلاوة لآيات الدعاء، لا تسجيل دعاء قنوت). من EveryAyah.com، بث من موقعهم.</p>
        <div className="row"><PlayTrack tracks={eaTracks} label="▶ شغّل أدعية القرآن" className="btn" /><AddToPlaylist tracks={eaTracks} name={`أدعية القرآن — ${p.ar}`} /></div></section>}

      {duaTv.length > 0 && <section className="section"><h2>الأدعية والأذكار والرقية</h2>
        <p className="note">من TVQuran بمشغّله الرسمي: يُشغَّل تسجيل واحد في كل مرة، ويبقى أسفل الشاشة وأنت تتنقل. لا يُحفظ دون إنترنت.</p>
        <TvLibrary rows={duaTv} cats={catsOf(duaTv)} /></section>}

      {(full.length > 0 || ayahOnly.length > 0) && <section className="section"><h2>المصحف كاملًا</h2>
        {full.map(({ i, r }) => { const t = S.map((s) => ({ id: `q-${r.id}-${s.index}`, src: surahUrl(r, s.index), title: `سورة ${s.name}`, by: r.name, source: 'Islamic Network (cdn.islamic.network)', page: `/quran/${s.index}` }));
          return <div key={i} className="row"><strong>{r.name}</strong><PlayTrack tracks={t} label="▶ ختمة كاملة من الفاتحة" /><AddToPlaylist tracks={t.slice(0, 1)} name={r.name} /></div>; })}
        {ayahOnly.map((r) => <p key={r.id}>{r.name}: <Link href="/quran/1">اختره من قائمة القارئ في المصحف</Link> (تلاوة آية بآية تتبع النص).</p>)}</section>}

      {myAlbums.length > 0 && <section className="section"><h2>مصاحف كاملة من دار الإسلام</h2><ul className="athar-items">{myAlbums.map((a) => <li key={a.id}><Link href={`/mushafs/${a.id}`}>{a.title}</Link> <small className="note">({a.files.length.toLocaleString('ar-EG')} سورة)</small></li>)}</ul></section>}

      {clips.length > 0 && <section className="section"><h2>مقاطع تلاوة مختارة</h2><TvLibrary rows={clips} cats={catsOf(clips)} /></section>}

    </article>
  );
}
