import type { Metadata } from 'next';
import Link from 'next/link';
export const metadata: Metadata = { title: 'لا يوجد اتصال', robots: { index: false } };
export default function Offline() {
  return (
    <article className="card" style={{ maxWidth: 640, margin: '40px auto', textAlign: 'center' }}>
      <h1>لا يوجد اتصال بالإنترنت</h1>
      <p>هذه الصفحة لم تُحفظ على جهازك بعد. الصفحات التي فتحتها من قبل، وما نزّلته من «الأدوات ← تنزيل للأوفلاين»، تعمل دون اتصال.</p>
      <div className="row" style={{ justifyContent: 'center' }}><Link className="btn" href="/quran">المصحف</Link><Link className="btn ghost" href="/adhkar">الأذكار</Link><Link className="btn ghost" href="/tasbeeh">التسبيح</Link><Link className="btn ghost" href="/wird">وِردي</Link></div>
    </article>
  );
}
