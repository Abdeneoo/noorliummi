import type { Metadata } from 'next';
import MonthTimes from '@/components/MonthTimes';
import PrintButton from '@/components/PrintButton';
export const metadata: Metadata = { title: 'جدول المواقيت والقبلة' };
export default function Times() {
  return (
    <article style={{ maxWidth: 820, margin: '24px auto' }}>
      <h1>جدول المواقيت الشهري والقبلة</h1>
      <div className="row no-print"><PrintButton label="اطبع جدول الشهر / الإمساكية (A4)" /></div>
      <MonthTimes />
    </article>
  );
}
