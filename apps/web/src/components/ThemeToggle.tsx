'use client';
import { useEffect, useState } from 'react';
type Mode = 'auto' | 'light' | 'dark';
const LABEL: Record<Mode, string> = { auto: 'تلقائي', light: 'فاتح', dark: 'داكن' };
export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>('auto');
  useEffect(() => { try { setMode((localStorage.getItem('noor.theme') as Mode) || 'auto'); } catch { /* ignore */ } }, []);
  const next = () => {
    const m: Mode = mode === 'auto' ? 'dark' : mode === 'dark' ? 'light' : 'auto';
    setMode(m);
    if (m === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', m);
    try { localStorage.setItem('noor.theme', m); } catch { /* ignore */ }
  };
  return <button type="button" className="theme-toggle" onClick={next} aria-label={`المظهر: ${LABEL[mode]}. اضغط للتغيير`}>{LABEL[mode]}</button>;
}
