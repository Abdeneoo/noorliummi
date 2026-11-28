import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import Link from 'next/link';
import GiftMessage from '@/components/GiftMessage';
export const metadata: Metadata = { title: 'أهدِ المنصة', description: 'رسالة جاهزة لمشاركة نور لأمي على واتساب: الموقع وإضافة المتصفح.', openGraph: og('/gift', 'ar', 'أهدِ المنصة', 'رسالة جاهزة لمشاركة نور لأمي على واتساب: الموقع وإضافة المتصفح.') };
export default function Gift() {
  return (
    <article style={{ maxWidth: 720, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/sadaqah">الصدقة الجارية</Link></p><h1>أهدِ المنصة</h1><p>شارك «نور لأمي» مع أهلك وأصدقائك. الرسالة جاهزة؛ عدّلها كما تحب.</p></header>
      <GiftMessage />
    </article>
  );
}
