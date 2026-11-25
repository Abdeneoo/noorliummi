import type { Metadata } from 'next';
import { Hub } from '@/components/Tiles';
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
        { href: '/sources', icon: 'hadith', title: 'المصادر والتراخيص', desc: 'مصدر كل نص وتسجيل وترخيصه.' },
      ]} />
  );
}
