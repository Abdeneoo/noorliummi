import type { Metadata } from 'next';
import Link from 'next/link';
import { Hub } from '@/components/Tiles';
export const metadata: Metadata = { title: 'الصدقة الجارية' };
export default function Sadaqah() {
  return (
    <Hub eyebrow="الصدقة الجارية" title="أثرٌ لا ينقطع" intro="هذا المشروع صدقة جارية، ويمكنك أن تصنع منه أثرًا لمن تحب."
      items={[
        { href: '/dedication', icon: 'heart', title: 'الإهداء', desc: 'إلى أمي الغالية.' },
        { href: '/athar', icon: 'sadaqah', title: 'صفحة أثر', desc: 'اصنع صفحة تُهديها لمن تحب: سور وأذكار ودعاء، برابط تشاركه.' },
      ]}>
      <section className="card dedication">
        <p>إلى أمي الغالية، التي رحلت عن عيني ولم ترحل عن قلبي.</p>
        <Link href="/dedication">اقرأ الإهداء كاملًا</Link>
      </section>
    </Hub>
  );
}
