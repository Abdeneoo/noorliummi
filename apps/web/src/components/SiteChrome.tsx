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
          <svg className="mark" viewBox="0 0 28 34" aria-hidden="true">
            <defs><radialGradient id="noorGlow" cx="50%" cy="55%" r="50%"><stop offset="0" stopColor="#F6E3B4" /><stop offset=".6" stopColor="#C6A66B" /><stop offset="1" stopColor="#A9853F" /></radialGradient></defs>
            <path className="mark-arch" d="M3 33V15.5C3 8.8 7.8 4 14 1.5 20.2 4 25 8.8 25 15.5V33" />
            <path className="mark-light" d="M14 11.5c2.6 3.2 3.9 5.6 3.9 7.7a3.9 3.9 0 0 1-7.8 0c0-2.1 1.3-4.5 3.9-7.7Z" fill="url(#noorGlow)" />
          </svg>
          <span className="wordmark">{ar ? 'نور لأمي' : 'Noor Li Ummi'}</span>
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
