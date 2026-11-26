import type { Metadata, Viewport } from 'next';
import '@fontsource/ibm-plex-sans-arabic/400.css';
import '@fontsource/ibm-plex-sans-arabic/600.css';
import '@fontsource/el-messiri/700.css';
import '@fontsource/amiri-quran';
import '../tokens.css';
import '../design-system.css';
import '../globals.css';
import './kids.css';
import KidShell from '@/components/KidShell';
import { kidHere } from '@/lib/kid-page';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'ركن الطفل | نور لأمي', robots: { index: false, follow: false } };
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };
/** The child area: its own simple layout, with none of the site's navigation. Every page here re-checks the child's permissions on the server. */
export default async function KidsLayout({ children }: { children: React.ReactNode }) {
  const k = await kidHere();
  return (
    <html lang="ar" dir="rtl"><body className="kids">
      {!k ? <main className="kid-main"><section className="card kid-center"><h1>ركن الطفل</h1><p>هذا الركن يفتحه وليّ الأمر من صفحة «الأسرة» بعد تسجيل الدخول.</p><p><a className="btn" href="/family">صفحة الأسرة</a></p><KidShell name="" stale /></section></main>
        : <><KidShell name={k.name} used={k.used} limit={k.daily_minutes} timeUp={k.timeUp} />
          <main className="kid-main">{k.timeUp ? <section className="card kid-center"><h1>انتهى وقت اليوم</h1><p>أحسنت يا {k.name}! نلتقي غدًا إن شاء الله.</p></section> : children}</main></>}
    </body></html>
  );
}
