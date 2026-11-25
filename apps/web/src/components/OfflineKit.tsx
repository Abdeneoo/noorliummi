'use client';
import { useEffect, useRef, useState } from 'react';
type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
const CACHE = 'noor-v5';
/** Install button + «تنزيل للأوفلاين»: saves the mushaf, adhkar and tools pages on the device (text only, no audio). */
export default function OfflineKit({ lang = 'ar' }: { lang?: 'ar' | 'en' }) {
  const ar = lang === 'ar';
  const bip = useRef<BIP | null>(null); const [canInstall, setCanInstall] = useState(false); const [standalone, setStandalone] = useState(false); const [ios, setIos] = useState(false);
  const [prog, setProg] = useState<number | null>(null); const [msg, setMsg] = useState('');
  useEffect(() => {
    setStandalone(matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    const on = (e: Event) => { e.preventDefault(); bip.current = e as BIP; setCanInstall(true); };
    window.addEventListener('beforeinstallprompt', on); return () => window.removeEventListener('beforeinstallprompt', on);
  }, []);
  const install = async () => { const p = bip.current; if (!p) return; await p.prompt(); await p.userChoice; setCanInstall(false); };
  const download = async () => {
    if (!('caches' in window)) { setMsg(ar ? 'المتصفح لا يدعم الحفظ دون إنترنت.' : 'This browser does not support offline storage.'); return; }
    const base = ar ? '' : '/en';
    const urls = [...Array.from({ length: 114 }, (_, i) => `${base}/quran/${i + 1}`), ...Array.from({ length: 133 }, (_, i) => `${base}/adhkar/${i + 1}`),
      `${base}/quran`, `${base}/adhkar`, `${base}/tasbeeh`, `${base}/times`, `${base}/hifz`, `${base}/names`, ...(ar ? ['/wird', '/sakina', '/duas', '/'] : ['/en'])];
    const c = await caches.open(CACHE); let done = 0, failed = 0; setProg(0); setMsg('');
    for (let i = 0; i < urls.length; i += 6) {
      await Promise.all(urls.slice(i, i + 6).map(async (u) => { try { const r = await fetch(u, { credentials: 'same-origin' }); if (r.ok) await c.put(u, r); else if (r.status !== 404) failed++; } catch { failed++; } done++; }));
      setProg(Math.round((done / urls.length) * 100));
    }
    setProg(null); try { localStorage.setItem('noor.offline.at', new Date().toISOString()); } catch { /* ignore */ }
    setMsg(failed ? (ar ? `اكتمل مع تعذّر ${failed} صفحة؛ أعد المحاولة لاحقًا.` : `Done, but ${failed} pages failed; try again later.`) : (ar ? 'تم. المصحف والأذكار والتسبيح والمواقيت تعمل الآن دون إنترنت على هذا الجهاز.' : 'Done. The mushaf, adhkar, tasbeeh and prayer times now work offline on this device.'));
  };
  return (
    <section className="card" aria-labelledby="ok-title">
      <h2 id="ok-title" style={{ marginTop: 0 }}>{ar ? 'التطبيق والعمل دون إنترنت' : 'App & offline use'}</h2>
      <p className="note">{ar ? 'ثبّت الموقع كتطبيق على شاشة هاتفك، ونزّل نصوص المصحف والأذكار لتعمل دون اتصال. التلاوات الصوتية تحتاج إنترنت.' : 'Install the site as an app on your home screen, and download the mushaf and adhkar texts for offline use. Recitation audio needs a connection.'}</p>
      <div className="row">
        {canInstall && <button type="button" className="btn" onClick={install}>{ar ? 'ثبّت التطبيق' : 'Install app'}</button>}
        <button type="button" className={canInstall ? 'btn ghost' : 'btn'} onClick={download} disabled={prog !== null}>{prog !== null ? `${prog}%` : (ar ? 'تنزيل للأوفلاين' : 'Download for offline')}</button>
      </div>
      {standalone ? <p className="note">{ar ? 'أنت تستخدم التطبيق المثبّت ✓' : 'You are using the installed app ✓'}</p>
        : !canInstall && <p className="note">{ios ? (ar ? 'على iPhone: افتح الموقع في Safari، ثم زر المشاركة ← «إضافة إلى الشاشة الرئيسية».' : 'On iPhone: open in Safari, then Share → “Add to Home Screen”.') : (ar ? 'للتثبيت: من قائمة المتصفح اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».' : 'To install: choose “Install app” or “Add to Home screen” from the browser menu.')}</p>}
      {prog !== null && <div className="khatma-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={prog}><span style={{ width: `${prog}%` }} /></div>}
      {msg && <p className="note" role="status">{msg}</p>}
    </section>
  );
}
