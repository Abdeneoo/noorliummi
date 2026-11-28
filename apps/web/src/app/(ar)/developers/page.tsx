import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import Link from 'next/link';
export const metadata: Metadata = { title: 'للمطوّرين: واجهة القراءة والودجت', openGraph: og('/developers', 'ar', 'للمطوّرين: واجهة القراءة والودجت') };
const E: [string, string][] = [['/api/v1/ayah-of-day', 'آية اليوم (نص عثماني، السورة والرقم والرابط)'], ['/api/v1/hadith-of-day', 'حديث اليوم من الأربعين النووية بالترتيب'], ['/api/v1/adhkar?chapter=27', 'باب من حصن المسلم (٢٧ الصباح، ٢٨ المساء، ٢٩ النوم)'], ['/api/v1/times?city=makkah', 'مواقيت اليوم لمدينة من قائمة الموقع (أضف date=YYYY-MM-DD ليوم آخر)']];
export default function Developers() {
  return (
    <article className="reader" style={{ maxWidth: 780 }}>
      <header><p className="eyebrow">مفتوح للجميع</p><h1>للمطوّرين</h1></header>
      <p>واجهة قراءة عامة مجانية بلا مفتاح، بالبيانات نفسها المعروضة في الموقع ومصادرها. الحد: ١٢٠ طلبًا في الساعة لكل عنوان. تدعم CORS.</p>
      <ul>{E.map(([u, d]) => <li key={u}><a href={u} target="_blank" rel="noopener"><code dir="ltr">{u}</code></a> — {d}</li>)}</ul>
      <h2>ودجت «آية اليوم»</h2>
      <p>كود التضمين في <Link href="/tools">صفحة الأدوات</Link>.</p>
      <h2>الشروط</h2>
      <ul><li>اذكر المصدر الأصلي لكل نص كما يرد في الحقل <code>source</code> وفي <Link href="/sources">صفحة المصادر</Link>، والتزم بترخيصه.</li><li>لا تعدّل نص القرآن ولا الأحاديث.</li><li>الكود كله مفتوح على <a href="https://github.com/Abdeneoo/noorliummi" target="_blank" rel="noopener">GitHub ↗</a> بترخيص AGPL.</li></ul>
    </article>
  );
}
