import type { Metadata, Viewport } from 'next';
import '@fontsource/ibm-plex-sans-arabic/300.css';
import '@fontsource/ibm-plex-sans-arabic/400.css';
import '@fontsource/ibm-plex-sans-arabic/500.css';
import '@fontsource/ibm-plex-sans-arabic/600.css';
import '@fontsource/amiri/400.css';
import '@fontsource/amiri/700.css';
import '@fontsource/el-messiri/500.css';
import '@fontsource/el-messiri/600.css';
import '@fontsource/el-messiri/700.css';
import '@fontsource-variable/noto-naskh-arabic';
import '@fontsource-variable/inter';
import '@fontsource/amiri-quran';
import '../tokens.css';
import '../design-system.css';
import '../globals.css';
import AdhanController from '@/components/AdhanController';
import { SiteHeader, TabBar } from '@/components/SiteChrome';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'https://staging.noorliummi.io'),
  title: { default: 'Noor Li Ummi', template: '%s | Noor Li Ummi' },
  description: 'Noor Li Ummi is a free Islamic digital platform dedicated to the memory of my beloved mother, offering access to the Quran, daily worship tools and beneficial knowledge.',
  openGraph: { type: 'website', locale: 'en', siteName: 'Noor Li Ummi | نور لأمي', images: [{ url: '/brand/og-cover.jpg', width: 1200, height: 630, alt: 'Noor Li Ummi logo' }] },
  manifest: '/manifest.webmanifest',
  robots: { index: false, follow: false }, // staging: not public until the owner approves launch
};
export const viewport: Viewport = { themeColor: [{ media: '(prefers-color-scheme: light)', color: '#F8F6F0' }, { media: '(prefers-color-scheme: dark)', color: '#141C19' }], width: 'device-width', initialScale: 1 };

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js');try{var t=localStorage.getItem('noor.theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}" }} />
        <AdhanController />
        <script dangerouslySetInnerHTML={{ __html: "if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})}" }} />
        <a className="skip" href="#main">Skip to content</a>
        <SiteHeader lang="en" />
        <main id="main"><div className="wrap">{children}</div></main>
        <TabBar lang="en" />
        <SiteFooter lang="en" />
      </body>
    </html>
  );
}
