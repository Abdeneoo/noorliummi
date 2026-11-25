import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'https://staging.noorliummi.io'),
  title: { default: 'نور لأمي', template: '%s | نور لأمي' },
  description: 'نور لأمي منصة إسلامية عالمية مجانية، تيسر الوصول إلى القرآن والأذكار والصلاة والعلم النافع، صدقة جارية عن روح والدتي رحمها الله.',
  openGraph: { type: 'website', locale: 'ar', siteName: 'نور لأمي | Noor Li Ummi', images: [{ url: '/brand/og-cover.jpg', width: 1200, height: 630, alt: 'شعار نور لأمي' }] },
  manifest: '/manifest.webmanifest',
  robots: { index: false, follow: false }, // staging: not public until the owner approves launch
};
export const viewport: Viewport = { themeColor: [{ media: '(prefers-color-scheme: light)', color: '#F8F6F0' }, { media: '(prefers-color-scheme: dark)', color: '#141C19' }], width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js');try{var t=localStorage.getItem('noor.theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}" }} />
        <AdhanController />
        <script dangerouslySetInnerHTML={{ __html: "if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})}" }} />
        <a className="skip" href="#main">تخطَّ إلى المحتوى</a>
        <SiteHeader lang="ar" />
        <main id="main"><div className="wrap">{children}</div></main>
        <TabBar lang="ar" />
        <footer className="site">
          <div className="wrap">
            <p className="tagline">نورٌ لا ينطفئ، وأثرٌ لا ينقطع</p>
            <p>صدقة جارية — نسألكم الدعاء لوالدة صاحب المشروع بالرحمة والمغفرة.</p>
            <p>نص القرآن الكريم من <a href="https://tanzil.net" rel="noopener">مشروع تنزيل (Tanzil)</a> دون أي تعديل. حساب المواقيت بمكتبة Adhan (Batoul Apps). <Link href="/sources">المصادر والتراخيص</Link> · <Link href="/privacy">الخصوصية والشروط</Link></p>
          </div>
        </footer>
      </body>
    </html>
  );
}
