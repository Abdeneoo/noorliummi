import type { Metadata } from 'next';
import Tasbeeh from '@/components/Tasbeeh';
export const metadata: Metadata = { title: 'عدّاد التسبيح' };
export default function Page() {
  return (<><header className="page-head"><p className="eyebrow">الأدوات</p><h1>عدّاد التسبيح</h1><p>اختر الذكر واضغط الدائرة. يهتز الجهاز عند اكتمال العدد إن كان يدعم ذلك.</p></header><div style={{ maxWidth: 560, margin: '0 auto' }}><Tasbeeh storeKey="page" /></div></>);
}
