import type { Metadata } from 'next';
import MonthTimes from '@/components/MonthTimes';
export const metadata: Metadata = { title: 'جدول المواقيت والقبلة' };
export default function Times() {
  return (
    <article style={{ maxWidth: 820, margin: '24px auto' }}>
      <h1>جدول المواقيت الشهري والقبلة</h1>
      <MonthTimes />
    </article>
  );
}
