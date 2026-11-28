import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import AdhanSettings from '@/components/AdhanSettings';
export const metadata: Metadata = { title: 'الأذان', openGraph: og('/adhan', 'ar', 'الأذان') };
export default function AdhanPage() {
  return (<><div className="hero" style={{ paddingBottom: 20 }}><h1>الأذان</h1><p>تنبيه عند دخول وقت كل صلاة، بالصوت الذي تختاره.</p></div><div style={{ maxWidth: 720, margin: '0 auto' }}><AdhanSettings /></div></>);
}
