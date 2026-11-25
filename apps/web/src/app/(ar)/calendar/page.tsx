import type { Metadata } from 'next';
import Occasions from '@/components/Occasions';
export const metadata: Metadata = { title: 'التقويم والمواسم' };
export default function Calendar() {
  return (<article style={{ maxWidth: 760, margin: '0 auto' }}><header className="page-head"><p className="eyebrow">المواسم</p><h1>التقويم والمواسم</h1><p>العدّ إلى رمضان، والمناسبات القادمة، وتذكير اختياري في تقويم هاتفك.</p></header><Occasions /></article>);
}
