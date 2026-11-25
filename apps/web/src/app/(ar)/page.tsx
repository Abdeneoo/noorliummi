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
          { href: '/mosques', icon: 'mosque', title: 'المساجد القريبة', desc: 'من OpenStreetMap.' },
        ]} />
      </section>

      <section className="section memorial-band reveal" aria-labelledby="ded-title">
        <div className="arch-frame" aria-hidden="true" />
        <div className="band-text">
          <p className="eyebrow" id="ded-title">إهداء</p>
          <p className="band-quote">إلى أمي الغالية، التي رحلت عن عيني ولم ترحل عن قلبي.</p>
          <p>أُنشئ هذا المشروع ابتغاء وجه الله، ورجاء أن يكون صدقة جارية عنها. نسألكم الدعاء لها بالرحمة والمغفرة.</p>
          <div className="row"><Link className="btn light" href="/dedication">اقرأ الإهداء</Link><Link className="btn outline-light" href="/athar">اصنع صفحة أثر</Link></div>
        </div>
      </section>
      <Reveal />
    </>
  );
}
