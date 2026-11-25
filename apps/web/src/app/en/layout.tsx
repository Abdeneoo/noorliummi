import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import '@fontsource-variable/noto-kufi-arabic';
import '@fontsource/amiri-quran';
import '../globals.css';
import ThemeToggle from '@/components/ThemeToggle';
import AdhanController from '@/components/AdhanController';
import Mark from '@/components/Mark';

export const metadata: Metadata = {
  title: { default: 'Noor Li Ummi', template: '%s | Noor Li Ummi' },
  description: 'A free, non-commercial Islamic platform, built as sadaqah jariyah. A light that never fades, a legacy that never ends.',
  manifest: '/manifest.webmanifest',
  robots: { index: false, follow: false }, // staging: not public until the owner approves launch
};
export const viewport: Viewport = { themeColor: '#103d32', width: 'device-width', initialScale: 1 };

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('noor.theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}" }} />
        <AdhanController />
        <script dangerouslySetInnerHTML={{ __html: "if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})}" }} />
        <a className="skip" href="#main">Skip to content</a>
        <header className="site">
          <div className="wrap">
            <Link href="/en" className="brand"><Mark />Noor Li Ummi</Link>
            <nav className="main" aria-label="Main">
              <Link href="/en">Home</Link>
              <Link href="/en/quran">Quran</Link>
              <Link href="/en/adhkar">Adhkar</Link>
              <Link href="/en/sources">Sources</Link>
              <Link href="/" lang="ar" hrefLang="ar">العربية</Link>
            </nav>
            <ThemeToggle lang="en" />
          </div>
        </header>
        <main id="main"><div className="wrap">{children}</div></main>
        <footer className="site">
          <div className="wrap">
            <p>A light that never fades, a legacy that never ends. — Sadaqah jariyah; please remember the mother of the project&apos;s founder in your prayers, asking Allah for her mercy and forgiveness.</p>
            <p>Quran text from the <a href="https://tanzil.net" rel="noopener">Tanzil project</a>, unmodified. English translation of the meanings from <a href="https://quranenc.com" rel="noopener">QuranEnc.com</a>. <Link href="/en/sources">Sources and licences</Link></p>
          </div>
        </footer>
      </body>
    </html>
  );
}
