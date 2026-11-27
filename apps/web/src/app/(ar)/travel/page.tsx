import type { Metadata } from 'next';
import Link from 'next/link';
import PrayerCard from '@/components/PrayerCard';
import TravelTools from '@/components/TravelTools';
import MosqueFinder from '@/components/MosqueFinder';
import PlayTrack from '@/components/PlayTrack';
import SaveOffline from '@/components/SaveOffline';
import { ADHKAR, loadAdhkar } from '@/lib/adhkar';
export const metadata: Metadata = { title: 'شنطة المسافر', description: 'مواقيت الصلاة والقبلة حيث أنت، أدعية السفر والركوب، أحكام القصر والجمع وصيام المسافر والتيمم، المساجد والمطاعم الحلال القريبة، وحزمة دون إنترنت.' };
export default async function Travel() {
  const ids = [96, 97, 103, 98, 105, 101, 102, 104, 100, 106, 10, 11];
  const g = await Promise.all(ids.map(async (id) => ({ id, title: ADHKAR.find((a) => a.id === id)?.title ?? '', c: await loadAdhkar(id) })));
  const tracks = g.flatMap((x) => x.c.items.filter((i) => i.a).map((i) => ({ id: `h${x.id}-${i.n}`, src: `/audio/adhkar/${i.a}`, title: x.title, by: 'محمد جمعة (OpenDua)', license: 'CC BY 4.0 — Recitation by Muhammad Jumah for OpenDua', text: i.t, page: '/travel' })));
  const hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  return (
    <article style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gap: 16 }}>
      <header className="page-head"><h1>شنطة المسافر</h1><p>كل ما يحتاجه المسافر في صفحة واحدة. التاريخ اليوم: {hijri} (أم القرى) — {new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
        <nav aria-label="أقسام الصفحة"><ul className="chips"><li><a href="#times">المواقيت</a></li><li><a href="#qibla">القبلة</a></li><li><a href="#duas">أدعية السفر</a></li><li><a href="#ahkam">الأحكام</a></li><li><a href="#near">المساجد والمطاعم</a></li><li><a href="#pack">دون إنترنت</a></li><li><a href="#checklist">الاستعداد</a></li></ul></nav></header>
      <p className="card"><strong>مسافر للعمرة؟</strong> <Link className="btn small" href="/umrah">العمرة خطوة بخطوة</Link></p>
      <div id="times"><PrayerCard /><p className="note">في بلد جديد اضغط «موقعي» في البطاقة لتُحسب المواقيت حيث أنت وبتوقيته. <Link href="/times">جدول الشهر</Link></p></div>
      <TravelTools />
      <section className="card" id="duas"><h2>أدعية السفر والركوب والخروج والعودة</h2><p className="note">من «حصن المسلم» بصوت محمد جمعة (OpenDua، CC BY 4.0).</p>
        <div className="row"><PlayTrack tracks={tracks} label={`▶ استمع إليها كلها (${tracks.length.toLocaleString('ar-EG')})`} className="btn" /><SaveOffline srcs={tracks.map((t) => t.src)} /></div>
        {g.map((x) => <details key={x.id}><summary>{x.title}</summary>{x.c.items.map((i) => <p key={i.n} lang="ar" style={{ lineHeight: 2.1 }}>{i.t} <small className="note">({i.r})</small></p>)}<Link href={`/adhkar/${x.id}`}>صفحة الذكر</Link></details>)}</section>
      <section className="card" id="ahkam"><h2>أحكام المسافر</h2>
        <ul className="athar-dir">{[['/fiqh/salah/19', 'قصر الصلاة والجمع بين الصلاتين: حكمه ومسافته ومتى يُتم'], ['/fiqh/siyam/33', 'الفطر في السفر وما يبيحه'], ['/fiqh/taharah/8', 'التيمم عند فقد الماء'], ['/fiqh/taharah/6', 'المسح على الخفين للمسافر'], ['/fiqh/salah/20', 'الجمعة للمسافر']].map(([h, t]) => <li key={h}><Link href={h}><strong>{t}</strong></Link></li>)}</ul>
        <p className="note">من «الفقه الميسر» (مجمع الملك فهد)، وفي كل باب قسم «أقوال الفقهاء وأسباب اختلافهم» من «بداية المجتهد» لابن رشد يبيّن الخلاف المعتبر في مسافة القصر ومدته وغيرها، دون ترجيح من الموقع.</p></section>
      <section className="card" id="near"><h2>المساجد القريبة</h2><MosqueFinder /><h2>مطاعم حلال قريبة</h2><MosqueFinder kind="halal" /><p className="note">البيانات من خريطة OpenStreetMap التطوعية (ODbL) وليست شهادة حلال؛ تأكد بنفسك.</p></section>
    </article>
  );
}
