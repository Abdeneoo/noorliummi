import Link from 'next/link';
import PrayerCard from '@/components/PrayerCard';
import HomeCover from '@/components/HomeCover';
import Tiles from '@/components/Tiles';
import Reveal from '@/components/Reveal';
import Tasbeeh from '@/components/Tasbeeh';
import SeasonCard from '@/components/SeasonCard';
import { ContinueReading, TodayAdhkar } from '@/components/HomeWidgets';

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'نور لأمي', alternateName: 'Noor Li Ummi', inLanguage: ['ar', 'en'], url: (process.env.SITE_URL || 'https://staging.noorliummi.io'), potentialAction: { '@type': 'SearchAction', target: `${process.env.SITE_URL || 'https://staging.noorliummi.io'}/search?q={q}`, 'query-input': 'required name=q' } }) }} />
      <HomeCover />
      <div className="lift reveal"><PrayerCard /></div>
      <SeasonCard />

      <div className="duo section reveal">
        <ContinueReading />
        <TodayAdhkar />
      </div>
      <div className="section reveal tas-home"><Tasbeeh /></div>

      <section className="section reveal" aria-labelledby="sections-title">
        <div className="section-head"><h2 id="sections-title">استكشف</h2><Link href="/knowledge">كل الأقسام</Link></div>
        <Tiles items={[
          { href: '/tafsir', icon: 'tafsir', title: 'التفسير', desc: 'تفسير الجلالين لكل آية.' },
          { href: '/hadith', icon: 'hadith', title: 'الحديث', desc: 'كتب الحديث مع البحث في نصوصها.' },
          { href: '/names', icon: 'names', title: 'أسماء الله الحسنى', desc: 'مع الآيات الدالة عليها.' },
          { href: '/hifz', icon: 'hifz', title: 'الحفظ', desc: 'مراجعة متباعدة على جهازك.' },
          { href: '/adhan', icon: 'bell', title: 'الأذان', desc: 'اختر الصوت والتنبيه.' },
          { href: '/wird', icon: 'quran', title: 'وِردي اليومي', desc: 'خطة ختمة، وأذكار وقتك، وحديث اليوم.' },
          { href: '/khatma', icon: 'heart', title: 'أهدِ ختمة أو ذكرًا', desc: 'صفحة باسم من تحب، يشارك فيها الأهل.' },
          { href: '/athar', icon: 'sadaqah', title: 'صفحة أثر', desc: 'صفحة مُهداة لمن تحب.' },
        ]} />
      </section>

      <Reveal />
    </>
  );
}
