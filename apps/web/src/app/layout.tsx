import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import '@fontsource-variable/noto-kufi-arabic';
import '@fontsource/amiri-quran';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'نور لأمي', template: '%s | نور لأمي' },
  description: 'منصة إسلامية عالمية مجانية، صدقة جارية. نورٌ لا ينطفئ، وأثرٌ لا ينقطع.',
  robots: { index: false, follow: false }, // staging: not public until the owner approves launch
};
export const viewport: Viewport = { themeColor: '#103d32', width: 'device-width', initialScale: 1 };

function Mark() {
  // Provisional mark (identity not final): a rising light above an open book.
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 24c-3-2-7-2.5-11-2V11c4-.5 8 0 11 2 3-2 7-2.5 11-2v11c-4-.5-8 0-11 2Z" />
      <path d="M16 13v11" />
      <path d="M16 3v4M10.5 5l1.5 2.6M21.5 5 20 7.6" stroke="#c6a66b" />
    </svg>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <a className="skip" href="#main">تخطَّ إلى المحتوى</a>
        <header className="site">
          <div className="wrap">
            <Link href="/" className="brand"><Mark />نور لأمي</Link>
            <nav className="main" aria-label="التنقل الرئيسي">
              <Link href="/">الرئيسية</Link>
              <Link href="/quran">القرآن الكريم</Link>
              <Link href="/dedication">الإهداء</Link>
            </nav>
          </div>
        </header>
        <main id="main"><div className="wrap">{children}</div></main>
        <footer className="site">
          <div className="wrap">
            <p>نورٌ لا ينطفئ، وأثرٌ لا ينقطع. — صدقة جارية، نسألكم الدعاء لوالدة صاحب المشروع بالرحمة والمغفرة.</p>
            <p>نص القرآن الكريم من <a href="https://tanzil.net" rel="noopener">مشروع تنزيل (Tanzil)</a> دون أي تعديل. حساب المواقيت بمكتبة Adhan (Batoul Apps).</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
