import type { Metadata } from 'next';
import KhatmaCreate from '@/components/KhatmaCreate';
import MyKhatmas from '@/components/MyKhatmas';
import { isSlug } from '@/lib/athar';
import { getPage } from '@/lib/athar-store';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'ختمة جماعية' };
export default async function Khatma({ searchParams }: { searchParams: Promise<{ athar?: string }> }) {
  const a = (await searchParams).athar;
  let athar: { slug: string; name: string } | undefined;
  if (a && isSlug(a)) { try { const p = await getPage(a); if (p && p.status === 'active') athar = { slug: a, name: p.display_name }; } catch { /* db unavailable */ } }
  return (
    <article style={{ maxWidth: 760, margin: '24px auto' }}>
      <header className="page-head"><p className="eyebrow">الصدقة الجارية</p><h1>ختمة جماعية لمن تحب</h1>
        <p>أنشئ رابطًا وشاركه في مجموعة العائلة: يحجز كل واحد جزءًا من الثلاثين، ويضغط «أتممت القراءة» عند الانتهاء، فيرى الجميع الختمة تقترب.</p></header>
      <KhatmaCreate athar={athar} />
      <MyKhatmas />
    </article>
  );
}
