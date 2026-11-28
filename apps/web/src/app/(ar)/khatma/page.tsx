import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import KhatmaCreate from '@/components/KhatmaCreate';
import MyKhatmas from '@/components/MyKhatmas';
import { isSlug } from '@/lib/athar';
import { getPage } from '@/lib/athar-store';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'ختمة جماعية', openGraph: og('/khatma', 'ar', 'ختمة جماعية') };
export default async function Khatma({ searchParams }: { searchParams: Promise<{ athar?: string }> }) {
  const a = (await searchParams).athar;
  let athar: { slug: string; name: string } | undefined;
  if (a && isSlug(a)) { try { const p = await getPage(a); if (p && p.status === 'active') athar = { slug: a, name: p.display_name }; } catch { /* db unavailable */ } }
  return (
    <article style={{ maxWidth: 760, margin: '24px auto' }}>
      <header className="page-head"><p className="eyebrow">الصدقة الجارية</p><h1>أهدِ ختمة أو ذكرًا أو دعاءً</h1>
        <p>أنشئ صفحة باسم من تحب وشارك رابطها مع العائلة والأصدقاء: ختمة قرآن تتوزع أجزاؤها الثلاثون، أو ذكر جماعي بعدد مستهدف، أو دعاء له. بلا تسجيل دخول.</p></header>
      <KhatmaCreate athar={athar} />
      <MyKhatmas />
      <p className="note">إهداء ثواب القراءة والذكر للميت من مسائل الخلاف بين أهل العلم، والدعاء له مشروع بالاتفاق. الموقع يعدّ الأفعال فقط ولا يذكر مقدار ثواب.</p>
    </article>
  );
}
