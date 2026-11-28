import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import MonthTimes from '@/components/MonthTimes';
export const metadata: Metadata = { title: 'Monthly timetable and qibla', openGraph: og('/en/times', 'en', 'Monthly timetable and qibla') };
export default function Times() {
  return <article style={{ maxWidth: 820, margin: '24px auto' }}><h1>Monthly prayer timetable and qibla</h1><MonthTimes lang="en" /></article>;
}
