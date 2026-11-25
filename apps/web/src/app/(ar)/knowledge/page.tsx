import type { Metadata } from 'next';
import { Hub } from '@/components/Tiles';
export const metadata: Metadata = { title: 'المعرفة' };
export default function Knowledge() {
  return (
    <Hub eyebrow="المعرفة" title="العلم النافع" intro="نصوص موثّقة المصدر والترخيص، تُعرض كما وردت دون تعديل."
      items={[
        { href: '/tafsir', icon: 'tafsir', title: 'التفسير', desc: 'تفسير الجلالين لكل آية، مرتبطًا بالمصحف.' },
        { href: '/hadith', icon: 'hadith', title: 'الحديث الشريف', desc: 'الكتب الستة والموطأ ومسند أحمد والدارمي، مع البحث.' },
        { href: '/hadith/nawawi', icon: 'hadith', title: 'الأربعون النووية', desc: 'الأحاديث الأربعون للإمام النووي.' },
        { href: '/names', icon: 'names', title: 'أسماء الله الحسنى', desc: 'الأسماء مع الآيات الدالة عليها.' },
        { href: '/mutashabihat', icon: 'similar', title: 'المتشابهات', desc: 'الآيات المتشابهة في اللفظ، عونًا على الحفظ.' },
        { href: '/quran', icon: 'words', title: 'إعراب الكلمات', desc: 'من صفحة أي سورة: تحليل صرفي لكل كلمة.' },
      ]} />
  );
}
