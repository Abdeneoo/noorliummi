import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import Hifz from '@/components/Hifz';
export const metadata: Metadata = { title: 'الحفظ والمراجعة', openGraph: og('/hifz', 'ar', 'الحفظ والمراجعة') };
export default function HifzPage() {
  return (
    <article style={{ maxWidth: 760, margin: '24px auto' }}>
      <h1>الحفظ والمراجعة</h1>
      <p>اختر الآيات التي تحفظها، وسيعرض عليك الموقع كل آية في وقت مراجعتها: تقرؤها من حفظك، ثم تُظهرها وتقيّم حفظك، فيُقرّب موعدها إن نسيتها ويُبعده إن ثبتت.</p>
      <Hifz />
    </article>
  );
}
