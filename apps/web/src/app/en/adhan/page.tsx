import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import AdhanSettings from '@/components/AdhanSettings';
export const metadata: Metadata = { title: 'Adhan', openGraph: og('/en/adhan', 'en', 'Adhan') };
export default function Adhan() {
  return <article style={{ maxWidth: 820, margin: '24px auto' }}><h1>Adhan</h1><p>Play the adhan on this device at each prayer time, with a sound of your choice for every prayer.</p><AdhanSettings lang="en" /></article>;
}
