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
import { SiteHeader, TabBar } from '@/components/SiteChrome';
import Deferred from '@/components/Deferred';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'https://staging.noorliummi.io'),
  title: { default: 'Noor Li Ummi', template: '%s | Noor Li Ummi' },
  description: 'Noor Li Ummi is a free Islamic digital platform dedicated to the memory of my beloved mother, Amal Magdy Mounir, offering access to the Quran, daily worship tools and beneficial knowledge.',
  openGraph: { type: 'website', locale: 'en', siteName: 'Noor Li Ummi | نور لأمي', images: [{ url: '/brand/og-cover.jpg', width: 1200, height: 630, alt: 'Noor Li Ummi logo' }] },
  manifest: '/manifest.webmanifest', icons: { apple: '/apple-touch-icon.png', icon: [{ url: '/icon.svg', type: 'image/svg+xml' }, { url: '/icon-192.png', sizes: '192x192', type: 'image/png' }] },
  robots: process.env.NOOR_PUBLIC === '1' ? { index: true, follow: true } : { index: false, follow: false }, // public only on the production build (NOOR_PUBLIC=1)
};
export const viewport: Viewport = { themeColor: [{ media: '(prefers-color-scheme: light)', color: '#F8F6F0' }, { media: '(prefers-color-scheme: dark)', color: '#141C19' }], width: 'device-width', initialScale: 1 };

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js');try{var t=localStorage.getItem('noor.theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}try{var f=Number(localStorage.getItem('noor.fs'));if(f>=0.85&&f<=1.4)document.documentElement.style.fontSize=(f*100)+'%'}catch(e){}try{if(localStorage.getItem('noor.hc')==='1')document.documentElement.setAttribute('data-contrast','high')}catch(e){}(function(){var n=0;function s(m,st){if(n++>4||!navigator.sendBeacon)return;try{navigator.sendBeacon('/api/log',JSON.stringify({m:String(m).slice(0,300),s:String(st||'').slice(0,800),p:location.pathname}))}catch(e){}}addEventListener('error',function(e){s(e.message,e.error&&e.error.stack)});addEventListener('unhandledrejection',function(e){var r=e.reason;s(r&&r.message||r,r&&r.stack)})})();" }} />
        <script dangerouslySetInnerHTML={{ __html: "if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})}" }} />
        <a className="skip" href="#main">Skip to content</a>
        <SiteHeader lang="en" />
        <main id="main"><div className="wrap">{children}</div></main>
        <TabBar lang="en" />
        <SiteFooter lang="en" />
        <Deferred />
      </body>
    </html>
  );
}
