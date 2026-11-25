import type { Metadata } from 'next';
import Account from '@/components/Account';
export const metadata: Metadata = { title: 'حسابي', robots: { index: false, follow: false } };
import MyData from '@/components/MyData';
import MonthSummary from '@/components/MonthSummary';
export default function Page() {
  return (<article style={{ maxWidth: 760, margin: '0 auto' }}><header className="page-head"><p className="eyebrow">الصدقة الجارية</p><h1>حسابي</h1><p>حساب اختياري لتعديل صفحات الأثر من أي جهاز.</p></header><Account /><div className="section"><MonthSummary /></div><div className="section"><MyData /></div></article>);
}
