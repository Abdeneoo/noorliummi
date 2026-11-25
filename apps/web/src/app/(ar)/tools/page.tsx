import type { Metadata } from 'next';
import { Hub } from '@/components/Tiles';
import MyData from '@/components/MyData';
import EmbedCode from '@/components/EmbedCode';
import MonthSummary from '@/components/MonthSummary';
import FridayReminder from '@/components/FridayReminder';
export const metadata: Metadata = { title: 'الأدوات' };
export default function Tools() {
  return (
    <Hub eyebrow="الأدوات" title="أدوات يومية" intro="كل الأدوات تعمل على جهازك، وبياناتك تبقى عندك."
      items={[
        { href: '/tasbeeh', icon: 'adhkar', title: 'عدّاد التسبيح', desc: 'سبّح واحسب بلمسة، مع هدف ٣٣ أو ١٠٠.' },
        { href: '/hifz', icon: 'hifz', title: 'الحفظ والمراجعة', desc: 'مراجعة متباعدة لما تحفظه من القرآن.' },
        { href: '/times', icon: 'compass', title: 'القبلة', desc: 'بوصلة القبلة واتجاهها من موقعك.' },
        { href: '/adhan', icon: 'bell', title: 'الأذان والتنبيه', desc: 'اختيار صوت الأذان وتنبيهات الصلاة.' },
        { href: '/mosques', icon: 'mosque', title: 'المساجد القريبة', desc: 'ابحث عن أقرب مسجد.' },
        { href: '/athar', icon: 'sadaqah', title: 'صفحة أثر', desc: 'صفحة مُهداة تشاركها.' },
        { href: '/khatma', icon: 'quran', title: 'ختمة جماعية', desc: 'وزّع الأجزاء الثلاثين على العائلة برابط واحد.' },
        { href: '/sakina', icon: 'quran', title: 'وضع السكينة', desc: 'آية واحدة بخط كبير وتلاوة هادئة ومؤقت نوم.' },
        { href: '/listen', icon: 'bell', title: 'وضع الاستماع', desc: 'أزرار كبيرة لأذكار الصباح والمساء والسور، للمشي والطريق.' },
        { href: '/duas', icon: 'adhkar', title: 'أدعية موثّقة', desc: 'للمتوفى والوالدين والمريض، جاهزة للإهداء.' },
        { href: '/mutashabihat', icon: 'similar', title: 'تحدّي المتشابهات', desc: 'ثلاثة أسئلة يومية لتثبيت الحفظ.' },
        { href: '/sources', icon: 'hadith', title: 'المصادر والتراخيص', desc: 'مصدر كل نص وتسجيل وترخيصه.' },
      ]}>
      <section className="card"><h2 style={{ marginTop: 0 }}>تذكير الجمعة</h2><p className="note">يضيف موعدًا أسبوعيًا إلى تقويم هاتفك: سورة الكهف والصلاة على النبي ﷺ.</p><FridayReminder /></section>
      <div className="section"><EmbedCode /></div><div className="section"><MonthSummary /></div><div className="section"><MyData /></div>
    </Hub>
  );
}
