import type { Metadata } from 'next';
import Link from 'next/link';
export const metadata: Metadata = { title: 'ساهم في الصدقة الجارية', description: 'كيف يساهم المطورون والمترجمون والمراجعون الشرعيون في نور لأمي عبر GitHub (AGPL-3.0).' };
const ROLES: [string, string][] = [
  ['المطورون', 'الكود مفتوح بترخيص AGPL-3.0. افتح Issue أو Pull Request، والتعديلات تُختبر على بيئة الاختبار قبل الموقع الرسمي.'],
  ['المترجمون', 'نضيف الترجمات من مصادرها الموثقة فقط ولا نستخدم الترجمة الآلية للنصوص الدينية. ساعدنا بترجمة واجهة الموقع (الأزرار والقوائم) أو بالدلالة على ترجمة منشورة بترخيص يسمح.'],
  ['المراجعون الشرعيون', 'كل نص ديني يحمل حالة مراجعة. إن كنت طالب علم أو مختصًا وتريد المراجعة، تواصل معنا.'],
  ['المبلّغون', 'رأيت خطأً في نص أو رابطًا لا يعمل؟ استخدم صفحة الإبلاغ.'],
];
export default function Contribute() {
  return (
    <article style={{ maxWidth: 820, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/sadaqah">الصدقة الجارية</Link></p><h1>ساهم في الصدقة الجارية</h1><p>«نور لأمي» مشروع مفتوح، وكل مساهمة فيه عمل صالح نرجو أجره لك وللمرحومة أمل مجدي منير.</p></header>
      <ul className="athar-dir">{ROLES.map(([t, d]) => <li key={t}><div className="card"><strong>{t}</strong><p className="note" style={{ margin: '6px 0 0' }}>{d}</p></div></li>)}</ul>
      <div className="row section">
        <a className="btn" href="https://github.com/Abdeneoo/noorliummi" target="_blank" rel="noopener">المستودع على GitHub</a>
        <Link className="btn ghost" href="/report">الإبلاغ عن خطأ</Link>
        <a className="btn ghost" href="https://www.facebook.com/3abdeneo" target="_blank" rel="noopener">تواصل مع صاحب المشروع</a>
        <Link className="btn ghost" href="/transparency">الشفافية</Link>
      </div>
    </article>
  );
}
