import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AtharTools from '@/components/AtharTools';
import KhatmaPlayer from '@/components/KhatmaPlayer';
import Tasbeeh from '@/components/Tasbeeh';
import Lantern from '@/components/Lantern';
import PlayTrack from '@/components/PlayTrack';
import { IHA } from '@/lib/duas';
import { readyPlaylists } from '@/lib/playlists-ready';
import { RECITERS, ayahUrl } from '@/lib/reciters';
import { SURAHS } from '@/lib/quran';
const START = SURAHS.reduce<number[]>((a, s, i) => { a.push(i === 0 ? 1 : a[i - 1] + SURAHS[i - 1].ayas); return a; }, []);
import { feminine, FEMININE_BASIS } from '@/lib/dua';
import { ADHKAR, loadAdhkar } from '@/lib/adhkar';
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
  // The page's recorded duas (chosen by its owner from licensed sources), played in the site-wide player so they continue while browsing.
  const set = p.audio_set || 'od-dead';
  type T = { id: string; src: string; title: string; by?: string; license?: string; source?: string; text?: string; page: string };
  let duaTracks: T[] = []; let duaNote = '';
  if (set === 'od-dead') {
    duaTracks = (await Promise.all([56, 57, 59, 60, 61].map(async (id) => ({ id, c: await loadAdhkar(id) }))))
      .flatMap(({ id, c }) => c.items.filter((x) => x.a).map((x) => ({ id: `athar-${slug}-${id}-${x.n}`, src: `/audio/adhkar/${x.a}`, title: `${ADHKAR.find((a) => a.id === id)?.title ?? ''} — لـ${p.display_name}`, by: 'محمد جمعة (OpenDua)', license: 'CC BY 4.0', source: `حصن المسلم: ${x.r}`, text: x.t, page: `/athar/${slug}` })));
    duaNote = 'أدعية من «حصن المسلم» بصوت محمد جمعة (OpenDua، CC BY 4.0)';
  } else if (set.startsWith('ih-')) {
    const it = IHA.find((x) => `ih-${x.id}` === set);
    if (it) { const f = it.attachments.filter((a) => a.type === 'MP3'); const all = f.length > 1 ? f.filter((a) => !/كامل/.test(a.desc ?? '')) : f; const dead = all.filter((a) => /الميت|للميت|المحتضر|مصيبة|التعزية|القبر|القبور|الفرط|للفرط|المريض|للمريض/.test(a.desc ?? '')); const parts = dead.length ? dead : all; const reader = it.by.filter((x) => x.kind === 'author').map((x) => x.title).join('، ');
      duaTracks = parts.map((a, k) => ({ id: `ih${it.id}-${k}`, src: a.url, title: a.desc || it.title, by: reader, source: `IslamHouse: ${it.title}`, page: `/athar/${slug}` })); duaNote = `${it.title} — ${reader} (IslamHouse)`; }
  }
  if (set.startsWith('pl-')) {
    const l = (await readyPlaylists()).find((x) => `pl-${x.id}` === set);
    if (l) {
      const husary = RECITERS.findIndex((r) => r.id === 'ar.husary');
      const ay = l.ayat.map((x) => ({ id: `q${x.s}:${x.a}:ar.husary`, src: ayahUrl(RECITERS[husary], START[x.s - 1] + x.a - 1), title: x.title, by: RECITERS[husary].name, source: 'تلاوة الآية كاملة — Islamic Network', text: x.t, page: `/athar/${slug}` }));
      duaTracks = [...l.tracks.map((t) => ({ ...t, page: `/athar/${slug}` })), ...ay]; duaNote = `قائمة «${l.title}» من مكتبة الموقع`;
    }
  }
  const dead = (await loadAdhkar(56)).items[0];
  const duaText = p.gender === 'f' ? feminine(dead.t) : dead.t;
  return (
    <article style={{ maxWidth: 720, margin: '24px auto', display: 'grid', gap: 20 }}>
      <section className="card dedication" style={{ textAlign: 'center' }}>
        <p className="meta"><span>صفحة أثر</span></p>
        <h1 style={{ margin: '8px 0' }}>{p.display_name}</h1>
        {(p.relation || p.died_on) && <p className="note" style={{ margin: 0 }}>{[p.relation, p.died_on && `توفي${p.gender === 'f' ? 'ت' : ''} ${new Date(p.died_on).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}`].filter(Boolean).join(' · ')}</p>}
        {p.dedication && <p style={{ whiteSpace: 'pre-line' }}>{p.dedication}</p>}
        <p lang="ar" style={{ fontFamily: 'var(--font-quran)', lineHeight: 2.2, marginBottom: 0 }}>{duaText}</p>
        <p className="note" style={{ margin: 0 }}>رواه مسلم ({dead.r}) — حصن المسلم{p.gender === 'f' ? <>، <a href={FEMININE_BASIS.url} rel="noopener">{FEMININE_BASIS.label}</a></> : p.gender === 'pl' ? '، بلفظ الحديث كما ورد' : ''}.</p>
      </section>
      <Lantern slug={slug} name={p.display_name} />
      {set === 'quran-duas' && <section className="card"><h2 style={{ marginTop: 0 }}>أدعية القرآن الكريم</h2><p className="note">اختر القارئ واستمع إلى أدعية القرآن، تُتلى كل آية كاملة.</p><Link className="btn" href="/duas/quran">افتح أدعية القرآن</Link></section>}
      {duaTracks.length > 0 && <section className="card"><h2 style={{ marginTop: 0 }}>استمع إلى الدعاء</h2>
        <p className="note">{duaTracks.length.toLocaleString('ar-EG')} تسجيلًا: {duaNote}، بلفظه كما ورد. يستمر التشغيل وأنت تتصفح الموقع.</p>
        <PlayTrack tracks={duaTracks} label="▶ شغّل الأدعية" className="btn" /></section>}
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
      <AtharTools slug={slug} initial={{ display_name: p.display_name, dedication: p.dedication, dua_text: p.dua_text, items: p.items, listed: p.listed, gender: p.gender, relation: p.relation, died_on: p.died_on ?? '', audio_set: p.audio_set }} />
    </article>
  );
}
