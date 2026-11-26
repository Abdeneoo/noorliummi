import type { Metadata } from 'next';
import PrayerCard from '@/components/PrayerCard';
import { Hub } from '@/components/Tiles';
export const metadata: Metadata = { title: 'الصلاة والأذان' };
export default function Prayer() {
  return (
    <Hub eyebrow="الصلاة والأذان" title="مواقيت الصلاة والأذان" intro="تُحسب المواقيت على جهازك من موقعك أو مدينتك، ولا يُرسل موقعك إلى أي خادم."
      items={[
        { href: '/books/how-to-pray', icon: 'mosque', title: 'كيف تصلي؟', desc: 'صفة صلاة النبي ﷺ خطوة بخطوة — الشيخ ابن باز.' },
        { href: '/fiqh/salah', icon: 'hadith', title: 'فقه الصلاة', desc: 'شروطها وأركانها وسجود السهو والجماعة والجمعة وصلاة المسافر والمريض، بالدليل.' },
        { href: '/times', icon: 'calendar', title: 'جدول الشهر والقبلة', desc: 'مواقيت الشهر كاملًا، وبوصلة القبلة.' },
        { href: '/adhan', icon: 'bell', title: 'إعدادات الأذان', desc: 'اختر صوت الأذان أو ارفع أذانًا من جهازك، وفعّل التنبيه.' },
        { href: '/live', icon: 'mosque', title: 'بث الحرمين الشريفين', desc: 'البث المباشر الرسمي من مكة والمدينة.' },
        { href: '/display', icon: 'calendar', title: 'وضع العرض', desc: 'لوحة مواقيت بشاشة كاملة.' },
        { href: '/mosques', icon: 'mosque', title: 'المساجد القريبة', desc: 'أقرب المساجد إليك من خرائط OpenStreetMap.' },
        { href: '/adhkar/15', icon: 'adhkar', title: 'أذكار الأذان', desc: 'ما يُقال عند سماع الأذان وبعده.' },
        { href: '/adhkar/25', icon: 'adhkar', title: 'الأذكار بعد الصلاة', desc: 'الأذكار بعد السلام من الصلاة.' },
      ]}>
      <PrayerCard />
    </Hub>
  );
}
