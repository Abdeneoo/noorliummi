'use client';
import { useEffect, useState } from 'react';
type Mode = 'auto' | 'light' | 'dark';
const LABELS = { ar: { auto: 'تلقائي', light: 'فاتح', dark: 'داكن' }, en: { auto: 'Auto', light: 'Light', dark: 'Dark' } } as const;
export default function ThemeToggle({ lang = 'ar' }: { lang?: 'ar' | 'en' }) {
  const LABEL: Record<Mode, string> = LABELS[lang];
  const [mode, setMode] = useState<Mode>('auto');
  useEffect(() => { try { setMode((localStorage.getItem('noor.theme') as Mode) || 'auto'); } catch { /* ignore */ } }, []);
  const next = () => {
    const m: Mode = mode === 'auto' ? 'dark' : mode === 'dark' ? 'light' : 'auto';
    setMode(m);
    if (m === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', m);
    try { localStorage.setItem('noor.theme', m); } catch { /* ignore */ }
  };
  return <button type="button" className="theme-toggle" onClick={next} aria-label={lang === 'ar' ? `المظهر: ${LABEL[mode]}. اضغط للتغيير` : `Theme: ${LABEL[mode]}. Tap to change`}>{LABEL[mode]}</button>;
}
