import type { Metadata } from 'next';
import Link from 'next/link';
import { Hub } from '@/components/Tiles';
import { listPages } from '@/lib/athar-store';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'الصدقة الجارية' };
export default async function Sadaqah() {
  let latest: Awaited<ReturnType<typeof listPages>>['rows'] = [];
  try { latest = (await listPages('', 0)).rows.slice(0, 6); } catch { /* database unavailable */ }
  return (
    <Hub eyebrow="الصدقة الجارية" title="أثرٌ لا ينقطع" intro="هذا المشروع صدقة جارية، ويمكنك أن تصنع منه أثرًا لمن تحب."
      items={[
        { href: '/dedication', icon: 'heart', title: 'الإهداء', desc: 'إلى أمي الغالية.' },
        { href: '/athar', icon: 'sadaqah', title: 'صفحات الأثر', desc: 'الدليل، واصنع صفحة لمن تحب: سور وأذكار ودعاء.' },
        { href: '/adhkar/56', icon: 'adhkar', title: 'الدعاء للميت', desc: 'من حصن المسلم.' },
        { href: '/adhkar/61', icon: 'adhkar', title: 'دعاء زيارة القبور', desc: 'من حصن المسلم.' },
        { href: '/quran/36', icon: 'quran', title: 'سورة يس', desc: 'اقرأ واستمع.' },
        { href: '/khatma', icon: 'quran', title: 'ختمة جماعية', desc: 'ختمة لمن تحب، تتوزع أجزاؤها على العائلة.' },
        { href: '/tasbeeh', icon: 'adhkar', title: 'عدّاد التسبيح', desc: 'سبّح بلمسة، وسجّل تسبيحك في صفحة أثر.' },
      ]}>
      <section className="card dedication">
        <p>إلى أمي الغالية، التي رحلت عن عيني ولم ترحل عن قلبي.</p>
        <Link href="/dedication">اقرأ الإهداء كاملًا</Link>
      </section>
      {latest.length > 0 && (
        <section className="section" aria-labelledby="latest-title">
          <div className="section-head"><h2 id="latest-title">أحدث صفحات الأثر</h2><Link href="/athar">الدليل كاملًا</Link></div>
          <ul className="athar-dir">{latest.map((r) => <li key={r.slug}><Link href={`/athar/${r.slug}`}><strong>{r.display_name}</strong>{r.dedication && <small>{r.dedication}</small>}</Link></li>)}</ul>
        </section>
      )}
    </Hub>
  );
}
