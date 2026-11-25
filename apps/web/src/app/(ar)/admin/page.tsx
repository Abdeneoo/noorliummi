import type { Metadata } from 'next';
import AdminPanel from '@/components/AdminPanel';
export const metadata: Metadata = { title: 'المراجعة', robots: { index: false, follow: false, nocache: true } };
export default function Admin() {
  return (
    <article style={{ maxWidth: 1040, margin: '24px auto' }}>
      <h1>لوحة المراجعة</h1>
      <p className="note">صفحات الأثر الموقوفة أو المبلّغ عنها، وتقرير حقوق أصوات الأذان.</p>
      <AdminPanel />
    </article>
  );
}
