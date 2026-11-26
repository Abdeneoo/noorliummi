import type { Metadata } from 'next';
import { Hub } from '@/components/Tiles';
export const metadata: Metadata = { title: 'المعرفة' };
export default function Knowledge() {
  return (
    <Hub eyebrow="المعرفة" title="العلم النافع" intro="نصوص موثّقة المصدر والترخيص، تُعرض كما وردت دون تعديل."
      items={[
        { href: '/tafsir', icon: 'tafsir', title: 'التفسير', desc: 'تفسير الجلالين لكل آية، مرتبطًا بالمصحف.' },
        { href: '/hadith', icon: 'hadith', title: 'الحديث الشريف', desc: 'الكتب الستة والموطأ ومسند أحمد والدارمي، مع البحث.' },
        { href: '/lessons', icon: 'knowledge', title: 'الدروس', desc: 'دروس ومحاضرات وكتب مصنّفة حسب الموضوع، من دار الإسلام.' },
        { href: '/library', icon: 'hadith', title: 'المكتبة', desc: 'رياض الصالحين والأذكار للنووي، نصًا كاملًا بطبعته.' },
        { href: '/hadith/nawawi', icon: 'hadith', title: 'الأربعون النووية', desc: 'الأحاديث الأربعون للإمام النووي.' },
        { href: '/topics', icon: 'quran', title: 'مواضيع في القرآن', desc: 'آيات الوالدين والأم والصبر والرزق والسكينة والتوبة.' },
        { href: '/prophets', icon: 'quran', title: 'ذكر الأنبياء في القرآن', desc: 'الآيات التي ورد فيها اسم كل نبي، بترتيب المصحف.' },
        { href: '/names', icon: 'names', title: 'أسماء الله الحسنى', desc: 'الأسماء مع الآيات الدالة عليها.' },
        { href: '/mutashabihat', icon: 'similar', title: 'المتشابهات', desc: 'الآيات المتشابهة في اللفظ، عونًا على الحفظ.' },
        { href: '/quran/1/words', icon: 'words', title: 'الكلمات وجذورها', desc: 'نوع كل كلمة وجذرها (تحليل آلي). من أي سورة: زر «الكلمات وجذورها».' },
      ]} />
  );
}
