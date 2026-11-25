import type { Metadata } from 'next';
import AdhkarIndex from '@/components/AdhkarIndex';
import { ADHKAR } from '@/lib/adhkar';
export const metadata: Metadata = { title: 'الأذكار' };
export default function AdhkarPage() {
  return (
    <>
      <div className="hero" style={{ paddingBottom: 20 }}><h1>الأذكار</h1><p>من كتاب «حصن المسلم» للشيخ سعيد بن علي بن وهف القحطاني رحمه الله.</p></div>
      <p className="review-banner" role="note">نسخة تجريبية: نصوص هذا القسم مستوردة من مصدر مفتوح ولم تكتمل مراجعتها بعد.</p>
      <AdhkarIndex cats={ADHKAR} />
    </>
  );
}
