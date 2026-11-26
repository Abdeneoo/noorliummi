import type { Metadata } from 'next';
import Link from 'next/link';
export const metadata: Metadata = { title: 'البداية — للمسلم الجديد', description: 'خطوات أولى بالترتيب: الطهارة والوضوء، صفة الصلاة، الفاتحة وقصار السور، والأذكار الأساسية — من مصادر موثقة.' };
const STEPS: { title: string; links: [string, string][] }[] = [
  { title: 'الطهارة والوضوء', links: [['/fiqh/taharah/5', 'باب الوضوء (الفقه الميسر)'], ['/fiqh/taharah/7', 'باب الغسل'], ['/adhkar/6', 'دعاء دخول الخلاء والخروج منه']] },
  { title: 'الصلاة خطوة بخطوة', links: [['/books/how-to-pray/1', 'كيفية صلاة النبي ﷺ — ابن باز (بالأردية والتركية والإندونيسية أيضًا)'], ['/fiqh/salah/14', 'شروط الصلاة وأركانها'], ['/prayer', 'مواقيت الصلاة في مدينتك'], ['/times', 'اتجاه القبلة']] },
  { title: 'الفاتحة وقصار السور', links: [['/quran/1', 'سورة الفاتحة'], ['/quran/112', 'الإخلاص'], ['/quran/113', 'الفلق'], ['/quran/114', 'الناس'], ['/quran/103', 'العصر'], ['/quran/108', 'الكوثر'], ['/talqeen', 'التلقين آية بآية']] },
  { title: 'الأذكار الأساسية', links: [['/adhkar/25', 'الأذكار بعد الصلاة'], ['/adhkar/27', 'أذكار الصباح'], ['/adhkar/28', 'أذكار المساء'], ['/adhkar/29', 'أذكار النوم']] },
  { title: 'تعلّم أكثر', links: [['/lessons/c/179666', 'دروس «ما يحتاجه المسلم الجديد» (دار الإسلام)'], ['/fiqh', 'فقه العبادات'], ['/library/fusul', 'السيرة النبوية']] },
];
export default function Start() {
  return (
    <article style={{ maxWidth: 820, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow">البداية</p><h1>البداية — للمسلم الجديد</h1><p>خطوات بالترتيب، كل خطوة تفتح نصًا موثّقًا من مصدره. ابدأ بالأولى، وخذ وقتك.</p></header>
      <ol className="fiqh-abwab">{STEPS.map((s, i) => (
        <li key={s.title} className="card"><strong>{i + 1}. {s.title}</strong>
          <ul>{s.links.map(([h, t]) => <li key={h}><Link href={h}>{t}</Link></li>)}</ul></li>))}</ol>
    </article>
  );
}
