import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import Link from 'next/link';
import LiveHaramain from '@/components/LiveHaramain';
export const metadata: Metadata = { title: 'بث الحرمين الشريفين', openGraph: og('/live', 'ar', 'بث الحرمين الشريفين') };
export default function Live() { return (<article style={{ maxWidth: 1100, margin: '0 auto' }}><header className="page-head"><p className="eyebrow">الصلاة</p><h1>بث الحرمين الشريفين</h1><p>البث المباشر الرسمي من المسجد الحرام والمسجد النبوي.</p></header><LiveHaramain /><p className="note"><Link href="/times">مواقيت الصلاة في مدينتك</Link> · <Link href="/display">وضع العرض</Link></p></article>); }
