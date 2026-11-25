import '@fontsource/amiri-quran';
import '@fontsource/ibm-plex-sans-arabic/400.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { robots: { index: false, follow: false } };
/** Minimal root layout for embeddable widgets (no site chrome, no scripts). */
export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ar" dir="rtl"><body style={{ margin: 0, background: 'transparent' }}>{children}</body></html>;
}
