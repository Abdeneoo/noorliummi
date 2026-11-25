import type { Metadata } from 'next';
import Wird from '@/components/Wird';
import MonthSummary from '@/components/MonthSummary';
export const metadata: Metadata = { title: 'وِردي اليومي' };
export default function WirdPage() {
  return (
    <article style={{ maxWidth: 860, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow">كل يوم</p><h1>وِردي اليومي</h1><p>ورد القرآن حسب خطتك، وأذكار وقتك، وحديث اليوم — في صفحة واحدة، بلا حساب.</p></header>
      <Wird />
      <div className="section"><MonthSummary /></div>
    </article>
  );
}
