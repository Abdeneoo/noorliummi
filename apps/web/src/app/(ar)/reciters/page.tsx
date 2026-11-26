import type { Metadata } from 'next';
import ReciterIndex from '@/components/ReciterIndex';
import { PEOPLE, TV_DUA_CATS, TV_ITEMS, isPriority } from '@/lib/people';
export const metadata: Metadata = { title: 'القرّاء والمشايخ', description: 'صفحة لكل قارئ: الأدعية والأذكار والرقية والتلاوات المتاحة بصوته، مع مصدر كل تسجيل.' };
export default function RecitersPage() {
  const rows = PEOPLE.map((p) => {
    const tv = TV_ITEMS.filter((x) => x.scholar_id != null && p.tv.includes(x.scholar_id));
    return { slug: p.slug, ar: p.ar, en: p.en, dua: tv.filter((x) => TV_DUA_CATS.includes(x.cat)).length, clips: tv.filter((x) => !TV_DUA_CATS.includes(x.cat)).length, ih: p.ih.length, quran: p.quran.length > 0 || p.ea.length > 0, star: isPriority(p) };
  }).sort((a, b) => Number(b.star) - Number(a.star));
  return (
    <article style={{ maxWidth: 960, margin: '0 auto' }}>
      <header className="page-head"><h1>القرّاء والمشايخ</h1>
        <p>كل قارئ في صفحة واحدة تجمع ما بصوته من مصادر الموقع: المصحف كاملًا (Islamic Network)، والأدعية والأذكار والرقية ومقاطع التلاوة (TVQuran بمشغّله الرسمي)، والمواد الصوتية من IslamHouse.</p></header>
      <ReciterIndex rows={rows} />
    </article>
  );
}
