'use client';
import { useEffect, useState } from 'react';
/** Larger text and high contrast for this page and the rest of the site (same settings as the site menu; kept on this device). */
export default function EasyMode({ lang = 'ar' }: { lang?: 'ar' | 'en' }) {
  const en = lang === 'en'; const L = (a: string, e: string) => (en ? e : a);
  const [on, setOn] = useState(false);
  useEffect(() => { setOn(document.documentElement.getAttribute('data-contrast') === 'high'); }, []);
  const set = (v: boolean) => {
    setOn(v); const d = document.documentElement;
    if (v) { d.setAttribute('data-contrast', 'high'); d.style.fontSize = '125%'; } else { d.removeAttribute('data-contrast'); d.style.fontSize = ''; }
    try { localStorage.setItem('noor.hc', v ? '1' : '0'); localStorage.setItem('noor.fs', v ? '1.25' : '1'); } catch { /* ignore */ }
  };
  return <button type="button" className="btn big-btn" aria-pressed={on} onClick={() => set(!on)}>{on ? L('إلغاء التكبير والتباين', 'Normal text and contrast') : L('كبّر الخط وارفع التباين', 'Larger text, high contrast')}</button>;
}
