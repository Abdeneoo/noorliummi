'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import Icon from './Icon';
import ThemeToggle from './ThemeToggle';

type Lang = 'ar' | 'en';
type Item = { href: string; label: string; icon: string; match?: string[] };

/** The seven top-level sections from the brand guide. */
export const NAV: Record<Lang, Item[]> = {
  ar: [
    { href: '/', label: 'الرئيسية', icon: 'home' },
    { href: '/quran', label: 'القرآن', icon: 'quran', match: ['/quran'] },
    { href: '/prayer', label: 'الصلاة والأذان', icon: 'prayer', match: ['/prayer', '/times', '/adhan', '/mosques'] },
    { href: '/adhkar', label: 'الأذكار', icon: 'adhkar', match: ['/adhkar'] },
    { href: '/knowledge', label: 'المعرفة', icon: 'knowledge', match: ['/knowledge', '/tafsir', '/hadith', '/names', '/mutashabihat'] },
    { href: '/sadaqah', label: 'الصدقة الجارية', icon: 'sadaqah', match: ['/sadaqah', '/dedication', '/athar'] },
    { href: '/tools', label: 'الأدوات', icon: 'tools', match: ['/tools', '/hifz', '/tasbeeh'] },
  ],
  en: [
    { href: '/en', label: 'Home', icon: 'home' },
    { href: '/en/quran', label: 'Quran', icon: 'quran', match: ['/en/quran'] },
    { href: '/en/prayer', label: 'Prayer & Adhan', icon: 'prayer', match: ['/en/prayer', '/en/times', '/en/adhan', '/en/mosques'] },
    { href: '/en/adhkar', label: 'Adhkar', icon: 'adhkar', match: ['/en/adhkar'] },
    { href: '/en/knowledge', label: 'Knowledge', icon: 'knowledge', match: ['/en/knowledge', '/en/names'] },
    { href: '/en/sadaqah', label: 'Sadaqah Jariyah', icon: 'sadaqah', match: ['/en/sadaqah', '/en/dedication'] },
    { href: '/en/tools', label: 'Tools', icon: 'tools', match: ['/en/tools', '/en/hifz', '/en/tasbeeh'] },
  ],
};
const SHORT: Record<Lang, Record<string, string>> = {
  ar: { '/prayer': 'الصلاة', more: 'المزيد' },
  en: { '/en/prayer': 'Prayer', more: 'More' },
};

function isActive(path: string, it: Item) {
  if (!it.match) return path === it.href;
  return it.match.some((m) => path === m || path.startsWith(m + '/'));
}

export function SiteHeader({ lang }: { lang: Lang }) {
  const path = usePathname() || '/';
  const ar = lang === 'ar';
  const more = useRef<HTMLDetailsElement>(null);
  useEffect(() => { if (more.current) more.current.open = false; }, [path]);
  return (
    <header className="site">
      <div className="wrap">
        <Link href={ar ? '/' : '/en'} className="brand" aria-label={ar ? 'نور لأمي — الرئيسية' : 'Noor Li Ummi — Home'}>
          <svg className="star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 14.6 6 19 5l-1 4.4L22 12l-4 2.6 1 4.4-4.4-1L12 22l-2.6-4L5 19l1-4.4L2 12l4-2.6L5 5l4.4 1Z" /></svg>
          <span className="wordmark">{ar ? 'نور لأمي' : 'Noor Li Ummi'}</span>
          <span className="latin" lang={ar ? 'en' : 'ar'}>{ar ? 'Noor Li Ummi' : 'نور لأمي'}</span>
        </Link>
        <nav className="main" aria-label={ar ? 'التنقل الرئيسي' : 'Main'}>
          {NAV[lang].slice(1, 5).map((it) => <Link key={it.href} href={it.href} aria-current={isActive(path, it) ? 'page' : undefined}>{it.label}</Link>)}
          <details className="nav-more" ref={more}>
            <summary aria-current={NAV[lang].slice(5).some((it) => isActive(path, it)) ? 'page' : undefined}>{SHORT[lang].more}</summary>
            <div className="nav-menu">
              {NAV[lang].slice(5).map((it) => <Link key={it.href} href={it.href} aria-current={isActive(path, it) ? 'page' : undefined}><Icon name={it.icon} />{it.label}</Link>)}
              <Link href={ar ? '/sources' : '/en/sources'}><Icon name="hadith" />{ar ? 'المصادر والتراخيص' : 'Sources & licences'}</Link>
            </div>
          </details>
        </nav>
        <Link className="lang-switch" href={ar ? '/en' : '/'} lang={ar ? 'en' : 'ar'} hrefLang={ar ? 'en' : 'ar'}>{ar ? 'English' : 'العربية'}</Link>
        <ThemeToggle lang={lang} />
      </div>
    </header>
  );
}

/** Mobile: four main sections + «المزيد» sheet with the rest. */
export function TabBar({ lang }: { lang: Lang }) {
  const path = usePathname() || '/';
  const more = useRef<HTMLDetailsElement>(null);
  useEffect(() => { if (more.current) more.current.open = false; }, [path]);
  const items = NAV[lang];
  const main = items.slice(0, 4), rest = items.slice(4);
  return (
    <nav className="tabbar" aria-label={lang === 'ar' ? 'التنقل السريع' : 'Quick navigation'}>
      {main.map((it) => (
        <Link key={it.href} href={it.href} aria-current={isActive(path, it) ? 'page' : undefined}>
          <Icon name={it.icon} /><span>{SHORT[lang][it.href] ?? it.label}</span>
        </Link>
      ))}
      <details ref={more}>
        <summary aria-label={SHORT[lang].more}><Icon name="more" /><span>{SHORT[lang].more}</span></summary>
        <div className="more-sheet">
          {rest.map((it) => <Link key={it.href} href={it.href} aria-current={isActive(path, it) ? 'page' : undefined}><Icon name={it.icon} />{it.label}</Link>)}
          <Link href={lang === 'ar' ? '/sources' : '/en/sources'}><Icon name="hadith" />{lang === 'ar' ? 'المصادر' : 'Sources'}</Link>
          <Link href={lang === 'ar' ? '/en' : '/'} lang={lang === 'ar' ? 'en' : 'ar'}><Icon name="globe" />{lang === 'ar' ? 'English' : 'العربية'}</Link>
        </div>
      </details>
    </nav>
  );
}
