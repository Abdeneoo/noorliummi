import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SeriesPlayer from '@/components/SeriesPlayer';
import { AUDIO, CHANNEL, CHECKED, LECTURER, SERIES, seriesBy, shortTitle } from '@/lib/series';
export const dynamicParams = false;
export const generateStaticParams = () => SERIES.map((s) => ({ slug: s.slug }));
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const s = seriesBy((await params).slug); return { title: s ? `${s.title} — ${LECTURER}` : 'سلسلة' }; }
export default async function SeriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const s = seriesBy((await params).slug); if (!s) notFound();
  return (
    <article style={{ maxWidth: 900, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/series">سلاسل مرئية</Link></p><h1>{s.title}</h1><p>الأستاذ {LECTURER} · {s.eps.length.toLocaleString('ar-EG')} حلقة{s.eps.every((e) => e.audio) ? ' · صوتية' : s.eps.some((e) => e.audio) ? ' · صوتية ومرئية' : ' · مرئية'}</p></header>
      <SeriesPlayer slug={s.slug} eps={s.eps.map((e) => ({ id: e.id, t: shortTitle(e.t), full: e.t, d: e.d, embed: e.embed, audio: e.audio?.u }))} lecturer={LECTURER} />
      <section className="card"><h2 style={{ marginTop: 0, fontSize: '1.05rem' }}>المصادر</h2><ul>
        {s.eps.some((e) => e.audio) && <li>الصوت: بودكاست «{AUDIO.name}» المنشور باسم الأستاذ {LECTURER} — <a href={AUDIO.spotify} target="_blank" rel="noopener">Spotify ↗</a> · <a href={AUDIO.feed} target="_blank" rel="noopener">ملف RSS ↗</a>. يُبث من خوادم البودكاست (Spreaker) ولا يُحفظ عندنا.</li>}
        <li>الفيديو: <a href={`https://www.youtube.com/playlist?list=${s.playlist}`} target="_blank" rel="noopener">قائمة التشغيل في يوتيوب ↗</a> · <a href={CHANNEL} target="_blank" rel="noopener">قناة الأستاذ {LECTURER} ↗</a>.</li></ul></section>
      <p className="note">المصدر: <a href={`https://www.youtube.com/playlist?list=${s.playlist}`} target="_blank" rel="noopener">قائمة التشغيل في قناة الأستاذ {LECTURER} ↗</a> · <a href={CHANNEL} target="_blank" rel="noopener">القناة ↗</a>. رُتّبت الحلقات برقم الدرس، وفُحص السماح بتضمين كل حلقة بتاريخ {CHECKED}. يوتيوب خدمة خارجية قد تعرض إعلانات، ولا شراكة رسمية بين المنصة والمحاضر.</p>
    </article>
  );
}
