import type { Metadata } from 'next';
import AdminPanel from '@/components/AdminPanel';
export const metadata: Metadata = { title: 'المراجعة', robots: { index: false, follow: false, nocache: true } };
export default function Admin() {
  return (
    <article style={{ maxWidth: 820, margin: '24px auto' }}>
      <h1>مراجعة صفحات الأثر</h1>
      <p className="note">الصفحات الموقوفة تلقائيًا بعد البلاغات، والصفحات التي عليها بلاغات مفتوحة.</p>
      <AdminPanel />
    </article>
  );
}
