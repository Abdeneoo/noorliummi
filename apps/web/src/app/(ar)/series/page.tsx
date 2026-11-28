import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import Link from 'next/link';
import { CHANNEL, LECTURER, SERIES, seconds } from '@/lib/series';
export const metadata: Metadata = { title: 'سلاسل صوتية ومرئية', openGraph: og('/series', 'ar', 'سلاسل صوتية ومرئية') };
const hours = (s: number) => { const h = Math.round(s / 360) / 10; return h >= 1 ? `${h.toLocaleString('ar-EG')} ساعة` : `${Math.round(s / 60).toLocaleString('ar-EG')} دقيقة`; };
export default function SeriesIndex() {
  return (
    <article style={{ maxWidth: 900, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/knowledge">المعرفة</Link></p><h1>سلاسل صوتية ومرئية</h1><p>سلاسل الأستاذ {LECTURER}: السيرة النبوية، وأصحاب رسول الله ﷺ، وقصص القرآن والسنة، وغيرها — بالترتيب، مع حفظ موضع المشاهدة.</p></header>
      <p className="review-banner">ما له نسخة صوتية في بودكاست الأستاذ يُسمع صوتًا (يعمل والشاشة مطفأة)، وما سواه يُعرض بمشغّل يوتيوب الرسمي من <a href={CHANNEL} target="_blank" rel="noopener">قناة الأستاذ {LECTURER} ↗</a>، ولا تُحفظ على خوادمنا. يوتيوب خدمة خارجية قد تعرض إعلانات. لا توجد شراكة رسمية بين المنصة والمحاضر.</p>
      <ul className="athar-dir">{SERIES.map((s) => <li key={s.slug}><Link href={`/series/${s.slug}`}><strong>{s.title}</strong><small>{s.eps.length.toLocaleString('ar-EG')} حلقة {s.eps.every((e) => e.audio) ? 'صوتية' : 'مرئية'} · {hours(s.eps.reduce((t, e) => t + seconds(e.d), 0))} · {s.about}</small></Link></li>)}</ul>
    </article>
  );
}
