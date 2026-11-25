import Link from 'next/link';
type Lang = 'ar' | 'en';
const C = {
  ar: { tag: 'نورٌ لا ينطفئ، وأثرٌ لا ينقطع', dua: 'صدقة جارية عن روح والدة صاحب المشروع — نسألكم لها الدعاء بالرحمة والمغفرة.', home: '/',
    cols: [['تصفّح', [['القرآن', '/quran'], ['الصلاة والأذان', '/prayer'], ['الأذكار', '/adhkar'], ['المعرفة', '/knowledge']]], ['المزيد', [['الأدوات', '/tools'], ['الصدقة الجارية', '/sadaqah'], ['الإهداء', '/dedication'], ['English', '/en']]], ['عن الموقع', [['المصادر والتراخيص', '/sources'], ['الخصوصية والشروط', '/privacy'], ['الكود المفتوح', 'https://github.com/Abdeneoo/noorliummi']]]] as [string, [string, string][]][],
    bottom: 'مجاني بلا إعلانات ولا حسابات · مفتوح المصدر' },
  en: { tag: 'A light that never fades, a legacy that never ends', dua: 'Sadaqah jariyah for the founder’s mother — please remember her in your prayers.', home: '/en',
    cols: [['Browse', [['Quran', '/en/quran'], ['Prayer & Adhan', '/en/prayer'], ['Adhkar', '/en/adhkar'], ['Knowledge', '/en/knowledge']]], ['More', [['Tools', '/en/tools'], ['Sadaqah Jariyah', '/en/sadaqah'], ['Dedication', '/en/dedication'], ['العربية', '/']]], ['About', [['Sources & licences', '/en/sources'], ['Privacy & terms', '/en/privacy'], ['Open source code', 'https://github.com/Abdeneoo/noorliummi']]]] as [string, [string, string][]][],
    bottom: 'Free, no ads, no accounts · Open source' },
};
export default function SiteFooter({ lang = 'ar' }: { lang?: Lang }) {
  const c = C[lang];
  return (
    <footer className="site">
      <div className="wrap foot">
        <div className="foot-brand">
          <Link href={c.home} className="brand">
            <svg className="mark" viewBox="0 0 28 34" aria-hidden="true"><path className="mark-arch" d="M3 33V15.5C3 8.8 7.8 4 14 1.5 20.2 4 25 8.8 25 15.5V33" /><path d="M14 11.5c2.6 3.2 3.9 5.6 3.9 7.7a3.9 3.9 0 0 1-7.8 0c0-2.1 1.3-4.5 3.9-7.7Z" fill="#C6A66B" /></svg>
            <span className="wordmark">{lang === 'ar' ? 'نور لأمي' : 'Noor Li Ummi'}</span>
          </Link>
          <p className="foot-tag">{c.tag}</p>
          <p className="foot-dua">{c.dua}</p>
        </div>
        <nav className="foot-cols" aria-label={lang === 'ar' ? 'روابط الموقع' : 'Site links'}>
          {c.cols.map(([h, links]) => (
            <div key={h}><p className="foot-h">{h}</p><ul>{links.map(([l, href]) => <li key={href}>{href.startsWith('http') ? <a href={href} rel="noopener">{l}</a> : <Link href={href} lang={l === 'English' ? 'en' : l === 'العربية' ? 'ar' : undefined}>{l}</Link>}</li>)}</ul></div>
          ))}
        </nav>
      </div>
      <div className="wrap foot-bottom"><span>{c.bottom}</span><span>© {new Date().getFullYear()} {lang === 'ar' ? 'نور لأمي' : 'Noor Li Ummi'}</span></div>
    </footer>
  );
}
