import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import MonthTimes from '@/components/MonthTimes';
import PrintButton from '@/components/PrintButton';
import MyMosqueTimes from '@/components/MyMosqueTimes';
export const metadata: Metadata = { title: 'جدول المواقيت والقبلة', openGraph: og('/times', 'ar', 'جدول المواقيت والقبلة') };
export default function Times() {
  return (
    <article style={{ maxWidth: 820, margin: '24px auto' }}>
      <h1>جدول المواقيت الشهري والقبلة</h1>
      <div className="row no-print"><PrintButton label="اطبع جدول الشهر / الإمساكية (A4)" /></div>
      <div className="no-print" style={{ marginBottom: 16 }}><MyMosqueTimes /></div>
      <MonthTimes />
    </article>
  );
}
