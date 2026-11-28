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
      {s.slug === 'seerah' && <p className="note">للقراءة: <Link href="/library/fusul">«الفصول في سيرة الرسول ﷺ» للحافظ ابن كثير</Link> بنصه الكامل.</p>}
      <SeriesPlayer slug={s.slug} eps={s.eps.map((e) => ({ id: e.id, t: shortTitle(e.t), full: e.t, d: e.d, embed: e.embed, audio: e.audio?.u }))} lecturer={LECTURER} />
    </article>
  );
}
