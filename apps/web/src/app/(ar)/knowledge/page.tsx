import type { Metadata } from 'next';
import { Hub } from '@/components/Tiles';
export const metadata: Metadata = { title: 'المعرفة' };
export default function Knowledge() {
  return (
    <Hub eyebrow="المعرفة" title="العلم النافع" intro="نصوص موثّقة المصدر والترخيص، تُعرض كما وردت دون تعديل."
      items={[
        { href: '/tafsir', icon: 'tafsir', title: 'التفسير', desc: 'تفسير الجلالين لكل آية، مرتبطًا بالمصحف.' },
        { href: '/hadith', icon: 'hadith', title: 'الحديث الشريف', desc: 'الكتب الستة والموطأ ومسند أحمد والدارمي، مع البحث.' },
        { href: '/fiqh', icon: 'hadith', title: 'فقه العبادات', desc: 'الطهارة والصلاة والزكاة والصيام والحج بالدليل، من «الفقه الميسر» كاملًا، مع البحث.' },
        { href: '/duas', icon: 'adhkar', title: 'الأدعية', desc: 'أدعية القرآن و«حصن المسلم» مرتبة حسب الحاجة.' },
        { href: '/hadeeth', icon: 'hadith', title: 'موسوعة الأحاديث المترجمة', desc: 'أحاديث مشروحة مع درجتها وترجماتها، مصنّفة حسب الموضوع (HadeethEnc).' },
        { href: '/library/qisas', icon: 'quran', title: 'قصص الأنبياء', desc: 'كتاب الحافظ ابن كثير بنصه الكامل، من آدم إلى عيسى عليهم السلام.' },
        { href: '/library/fusul', icon: 'hadith', title: 'السيرة النبوية', desc: '«الفصول في سيرة الرسول ﷺ» لابن كثير بنصه الكامل.' },
        { href: '/series', icon: 'knowledge', title: 'سلاسل مرئية', desc: 'السيرة النبوية وأصحاب رسول الله وقصص القرآن والسنة وغيرها — الأستاذ أحمد عامر.' },
        { href: '/books', icon: 'hadith', title: 'كتب مختارة', desc: 'كتب الحج لابن باز وابن عثيمين، وفتاوى صيام التطوع، وفضل عشر ذي الحجة، وما لا يسع أطفال المسلمين جهله — بنصها الكامل.' },
        { href: '/lessons', icon: 'knowledge', title: 'الدروس', desc: 'دروس ومحاضرات وكتب مصنّفة حسب الموضوع، من دار الإسلام.' },
        { href: '/library', icon: 'hadith', title: 'المكتبة', desc: 'رياض الصالحين والأذكار للنووي، وقصص الأنبياء والفصول في السيرة لابن كثير — نصًا كاملًا بطبعته.' },
        { href: '/hadith/nawawi', icon: 'hadith', title: 'الأربعون النووية', desc: 'الأحاديث الأربعون للإمام النووي.' },
        { href: '/topics', icon: 'quran', title: 'مواضيع في القرآن', desc: 'آيات الوالدين والأم والصبر والرزق والسكينة والتوبة.' },
        { href: '/prophets', icon: 'quran', title: 'ذكر الأنبياء في القرآن', desc: 'الآيات التي ورد فيها اسم كل نبي، بترتيب المصحف.' },
        { href: '/names', icon: 'names', title: 'أسماء الله الحسنى', desc: 'الأسماء مع الآيات الدالة عليها.' },
        { href: '/mutashabihat', icon: 'similar', title: 'المتشابهات', desc: 'الآيات المتشابهة في اللفظ، عونًا على الحفظ.' },
        { href: '/quran/1/words', icon: 'words', title: 'الكلمات وجذورها', desc: 'نوع كل كلمة وجذرها (تحليل آلي). من أي سورة: زر «الكلمات وجذورها».' },
      ]} />
  );
}
