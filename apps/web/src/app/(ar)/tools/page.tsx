import type { Metadata } from 'next';
import { Hub } from '@/components/Tiles';
import MyData from '@/components/MyData';
import OfflineKit from '@/components/OfflineKit';
import EmbedCode from '@/components/EmbedCode';
import MonthSummary from '@/components/MonthSummary';
import FridayReminder from '@/components/FridayReminder';
export const metadata: Metadata = { title: 'الأدوات' };
export default function Tools() {
  return (
    <Hub eyebrow="الأدوات" title="أدوات يومية" intro="كل الأدوات تعمل على جهازك، وبياناتك تبقى عندك."
      items={[
        { href: '/tasbeeh', icon: 'adhkar', title: 'عدّاد التسبيح', desc: 'سبّح واحسب بلمسة، مع هدف ٣٣ أو ٧٠ أو ١٠٠، والصلاة على النبي ﷺ بعدد مفتوح.' },
        { href: '/hifz', icon: 'hifz', title: 'الحفظ والمراجعة', desc: 'مراجعة متباعدة لما تحفظه من القرآن.' },
        { href: '/talqeen', icon: 'quran', title: 'التلقين آية بآية', desc: 'القارئ يقرأ وأنت تردّد، مع تكرار كل آية.' },
        { href: '/times', icon: 'compass', title: 'القبلة', desc: 'بوصلة القبلة واتجاهها من موقعك.' },
        { href: '/adhan', icon: 'bell', title: 'الأذان والتنبيه', desc: 'اختيار صوت الأذان وتنبيهات الصلاة.' },
        { href: '/mosques', icon: 'mosque', title: 'المساجد القريبة', desc: 'ابحث عن أقرب مسجد.' },
        { href: '/athar', icon: 'sadaqah', title: 'صفحة أثر', desc: 'صفحة مُهداة تشاركها.' },
        { href: '/wird', icon: 'quran', title: 'وِردي اليومي', desc: 'خطة ختمة مرنة وأذكار وقتك وحديث اليوم.' },
        { href: '/khatma', icon: 'quran', title: 'أهدِ ختمة أو ذكرًا أو دعاءً', desc: 'صفحة باسم من تحب يشارك فيها الأهل برابط واحد.' },
        { href: '/sakina', icon: 'quran', title: 'وضع السكينة', desc: 'آية واحدة بخط كبير وتلاوة هادئة ومؤقت نوم.' },
        { href: '/search', icon: 'hadith', title: 'البحث في المصادر', desc: 'بحث واحد في المصحف والأذكار والأحاديث.' },
        { href: '/zakat', icon: 'tools', title: 'حاسبة الزكاة', desc: 'استرشادية: نقود وذهب وفضة وعروض تجارة.' },
        { href: '/inheritance', icon: 'tools', title: 'حاسبة الميراث', desc: 'استرشادية للحالات البسيطة: الزوجان والأبوان والأولاد.' },
        { href: '/display', icon: 'mosque', title: 'وضع العرض', desc: 'لوحة مواقيت بشاشة كاملة للمسجد أو البيت.' },
        { href: '/umrah', icon: 'mosque', title: 'العمرة خطوة بخطوة', desc: 'الصفة والأذكار وعدّاد أشواط الطواف والسعي.' },
        { href: '/hajj', icon: 'mosque', title: 'موسم الحج', desc: 'العدّ إلى عرفة وأيام الحج ورابط نسك الرسمي.' },
        { href: '/calendar', icon: 'compass', title: 'التقويم والمواسم', desc: 'العدّ إلى رمضان والمناسبات والأيام البيض، مع تذكير في تقويمك.' },
        { href: '/situations', icon: 'adhkar', title: 'أذكار حسب الموقف', desc: 'النوم، البيت، المسجد، الطعام، السفر…' },
        { href: '/listen', icon: 'bell', title: 'وضع الاستماع', desc: 'أزرار كبيرة لأذكار الصباح والمساء والسور، للمشي والطريق.' },
        { href: '/duas', icon: 'adhkar', title: 'أدعية موثّقة', desc: 'للمتوفى والوالدين والمريض، جاهزة للإهداء.' },
        { href: '/mutashabihat', icon: 'similar', title: 'تحدّي المتشابهات', desc: 'ثلاثة أسئلة يومية لتثبيت الحفظ.' },
        { href: '/family', icon: 'heart', title: 'الأسرة وركن الأطفال', desc: 'حساب للأطفال بإشراف الوالدين: سور ومهام وأذكار وتسبيح.' },
        { href: '/live', icon: 'mosque', title: 'البث المباشر من الحرمين', desc: 'قناتا القرآن والسنة الرسميتان.' },
        { href: '/extension', icon: 'bell', title: 'إضافة المتصفح', desc: 'مواقيت وأذان وتذكير بالورد والأذكار والصيام في متصفح كروم.' },
        { href: '/account', icon: 'heart', title: 'حسابي', desc: 'تسجيل بالبريد وكلمة المرور لحفظ صفحاتك وتقدمك.' },
        { href: '/sources', icon: 'hadith', title: 'المصادر والتراخيص', desc: 'مصدر كل نص وتسجيل وترخيصه.' },
      ]}>
      <section className="card"><h2 style={{ marginTop: 0 }}>تذكير الجمعة</h2><p className="note">يضيف موعدًا أسبوعيًا إلى تقويم هاتفك: سورة الكهف والصلاة على النبي ﷺ.</p><FridayReminder /></section>
      <div className="section"><EmbedCode /></div><div className="section"><MonthSummary /></div><div className="section"><OfflineKit /></div><div className="section"><MyData /></div>
    </Hub>
  );
}
