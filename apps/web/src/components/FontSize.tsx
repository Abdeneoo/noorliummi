'use client';
import { useEffect, useState } from 'react';
const STEPS = [0.9, 1, 1.1, 1.2, 1.3];
/** A−/A+: scales the whole site's text (rem-based), remembered on this device. Helps older readers. */
export default function FontSize({ lang = 'ar' }: { lang?: 'ar' | 'en' }) {
  const [v, setV] = useState(1);
  useEffect(() => { try { const f = Number(localStorage.getItem('noor.fs')); if (STEPS.includes(f)) setV(f); } catch { /* ignore */ } }, []);
  const set = (d: number) => {
    const i = Math.min(STEPS.length - 1, Math.max(0, STEPS.indexOf(v) + d)); const f = STEPS[i]; setV(f);
    document.documentElement.style.fontSize = `${f * 100}%`;
    try { localStorage.setItem('noor.fs', String(f)); } catch { /* ignore */ }
  };
  const ar = lang === 'ar';
  return (
    <div className="font-size" role="group" aria-label={ar ? 'حجم الخط' : 'Text size'}>
      <button type="button" onClick={() => set(-1)} disabled={v === STEPS[0]} aria-label={ar ? 'تصغير الخط' : 'Smaller text'}><span aria-hidden="true">{ar ? 'ا' : 'A'}<small>−</small></span></button>
      <button type="button" onClick={() => set(1)} disabled={v === STEPS[STEPS.length - 1]} aria-label={ar ? 'تكبير الخط' : 'Larger text'}><span aria-hidden="true">{ar ? 'ا' : 'A'}<small>+</small></span></button>
    </div>
  );
}
