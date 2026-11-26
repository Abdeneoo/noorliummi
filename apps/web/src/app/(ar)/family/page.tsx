import type { Metadata } from 'next';
import Family from '@/components/Family';
import { ADHKAR } from '@/lib/adhkar';
import { SURAHS } from '@/lib/quran';
export const metadata: Metadata = { title: 'الأسرة — محتوى الأطفال' };
export default function FamilyPage() {
  return (
    <article style={{ maxWidth: 860, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow">حسابي</p><h1>الأسرة — محتوى الأطفال</h1><p>أنشئ ملفًا لكل طفل، واختر ما يُسمح له بفتحه، وحدّد مهامه ووقته اليومي. ثم افتح «وضع الطفل» على جهازه.</p></header>
      <p className="review-banner">في وضع الطفل لا يفتح الجهاز إلا ركن الطفل، ويتحقق الخادم من القائمة في كل صفحة. الخروج يحتاج رقمك السري. تنبيه: من يمسح بيانات المتصفح يخرج من الوضع، فاستعمل معه قفل الجهاز أو المتصفح إن لزم. لا نطلب عن الطفل إلا اسمًا تختاره وفئة عمرية.</p>
      <Family surahs={SURAHS.map((s) => [s.index, s.name] as [number, string])} adhkar={ADHKAR.map((c) => [c.id, c.title] as [number, string])} />
    </article>
  );
}
