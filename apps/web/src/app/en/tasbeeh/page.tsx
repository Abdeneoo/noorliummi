import type { Metadata } from 'next';
import Tasbeeh from '@/components/Tasbeeh';
export const metadata: Metadata = { title: 'Tasbeeh counter' };
export default function Page() {
  return (<><header className="page-head"><p className="eyebrow">Tools</p><h1>Tasbeeh counter</h1><p>Choose the dhikr and tap the circle. The device vibrates when the target is reached, where supported.</p></header><div style={{ maxWidth: 560, margin: '0 auto' }}><Tasbeeh lang="en" storeKey="page" /></div></>);
}
