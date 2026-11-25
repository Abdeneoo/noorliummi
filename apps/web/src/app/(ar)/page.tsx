import Link from 'next/link';
import PrayerCard from '@/components/PrayerCard';
import HomeCover from '@/components/HomeCover';
import Tiles from '@/components/Tiles';
import Reveal from '@/components/Reveal';
import { ContinueReading, TodayAdhkar } from '@/components/HomeWidgets';

export default function Home() {
  return (
    <>
      <HomeCover />
      <div className="lift reveal"><PrayerCard /></div>

      <div className="duo section reveal">
        <ContinueReading />
        <TodayAdhkar />
      </div>

      <section className="section reveal" aria-labelledby="sections-title">
        <div className="section-head"><h2 id="sections-title">استكشف</h2><Link href="/knowledge">كل الأقسام</Link></div>
        <Tiles items={[
          { href: '/tafsir', icon: 'tafsir', title: 'التفسير', desc: 'تفسير الجلالين لكل آية.' },
          { href: '/hadith', icon: 'hadith', title: 'الحديث', desc: 'أحد عشر كتابًا مع البحث.' },
          { href: '/names', icon: 'names', title: 'أسماء الله الحسنى', desc: 'مع الآيات الدالة عليها.' },
          { href: '/hifz', icon: 'hifz', title: 'الحفظ', desc: 'مراجعة متباعدة على جهازك.' },
          { href: '/adhan', icon: 'bell', title: 'الأذان', desc: 'اختر الصوت والتنبيه.' },
          { href: '/athar', icon: 'sadaqah', title: 'صفحة أثر', desc: 'صفحة مُهداة لمن تحب.' },
        ]} />
      </section>

      <Reveal />
    </>
  );
}
