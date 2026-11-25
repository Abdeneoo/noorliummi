import Link from 'next/link';
import PrayerCard from '@/components/PrayerCard';
import BrandLogo from '@/components/BrandLogo';
import Tiles from '@/components/Tiles';
import Icon from '@/components/Icon';
import { ContinueReading, TodayAdhkar } from '@/components/HomeWidgets';

export default function Home() {
  return (
    <>
      <section className="cover" aria-labelledby="cover-title">
        <BrandLogo alt="شعار نور لأمي" priority />
        <div className="cover-text">
          <h1 id="cover-title">نور لأمي</h1>
          <p className="tagline">نورٌ لا ينطفئ، وأثرٌ لا ينقطع</p>
          <p className="lead">منصة إسلامية عالمية مجانية، تيسّر الوصول إلى القرآن والأذكار والصلاة والعلم النافع، صدقة جارية.</p>
          <div className="actions" style={{ marginTop: 20 }}>
            <Link className="btn" href="/quran"><Icon name="quran" />افتح المصحف</Link>
            <Link className="btn ghost" href="/prayer"><Icon name="prayer" />مواقيت الصلاة</Link>
          </div>
        </div>
      </section>

      <div className="grid two section">
        <PrayerCard />
        <div className="grid">
          <ContinueReading />
          <TodayAdhkar />
        </div>
      </div>

      <section className="section" aria-labelledby="sections-title">
        <h2 id="sections-title">الأقسام</h2>
        <Tiles items={[
          { href: '/quran', icon: 'quran', title: 'القرآن الكريم', desc: 'المصحف والتلاوة والتجويد.' },
          { href: '/tafsir', icon: 'tafsir', title: 'التفسير', desc: 'تفسير الجلالين.' },
          { href: '/hadith', icon: 'hadith', title: 'الحديث', desc: 'أحد عشر كتابًا مع البحث.' },
          { href: '/adhkar', icon: 'adhkar', title: 'الأذكار', desc: 'حصن المسلم مع العدّاد.' },
          { href: '/names', icon: 'names', title: 'أسماء الله الحسنى', desc: 'مع الآيات الدالة عليها.' },
          { href: '/hifz', icon: 'hifz', title: 'الحفظ', desc: 'مراجعة متباعدة على جهازك.' },
          { href: '/adhan', icon: 'bell', title: 'الأذان', desc: 'اختر صوت الأذان والتنبيه.' },
          { href: '/mosques', icon: 'mosque', title: 'المساجد القريبة', desc: 'من OpenStreetMap.' },
        ]} />
      </section>

      <section className="section card dedication">
        <p className="eyebrow">إهداء</p>
        <p>إلى أمي الغالية، التي رحلت عن عيني ولم ترحل عن قلبي. أُنشئ هذا المشروع ابتغاء وجه الله، ورجاء أن يكون صدقة جارية عنها.</p>
        <p>نسألكم الدعاء لها بالرحمة والمغفرة.</p>
        <div className="row" style={{ justifyContent: 'center' }}><Link className="btn ghost" href="/dedication">اقرأ الإهداء</Link><Link className="btn ghost" href="/athar">اصنع صفحة أثر</Link></div>
      </section>
    </>
  );
}
