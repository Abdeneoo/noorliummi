import type { Metadata } from 'next';
import AdhkarIndex from '@/components/AdhkarIndex';
import { ADHKAR } from '@/lib/adhkar';
export const metadata: Metadata = { title: 'الأذكار' };
export default function AdhkarPage() {
  return (
    <>
      <div className="hero" style={{ paddingBottom: 20 }}><h1>الأذكار</h1><p>من كتاب «حصن المسلم» للشيخ سعيد بن علي بن وهف القحطاني رحمه الله.</p></div>
      <AdhkarIndex cats={ADHKAR} />
    </>
  );
}
