'use client';
import { useEffect, useState } from 'react';
const STEPS = [0.9, 1, 1.1, 1.2, 1.3];
/** A−/A+: scales the whole site's text (rem-based), remembered on this device. Helps older readers. */
export default function FontSize({ lang = 'ar' }: { lang?: 'ar' | 'en' }) {
  const [v, setV] = useState(1); const [hc, setHc] = useState(false);
  useEffect(() => { setHc(document.documentElement.getAttribute('data-contrast') === 'high'); }, []);
  const toggleHc = () => { const on = !hc; setHc(on); if (on) document.documentElement.setAttribute('data-contrast', 'high'); else document.documentElement.removeAttribute('data-contrast'); try { localStorage.setItem('noor.hc', on ? '1' : '0'); } catch { /* ignore */ } };
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
      <button type="button" onClick={toggleHc} aria-pressed={hc} aria-label={ar ? 'وضع التباين العالي لضعف البصر' : 'High contrast mode'} title={ar ? 'تباين عالٍ' : 'High contrast'}><span aria-hidden="true">◐</span></button>
      <button type="button" onClick={() => set(1)} disabled={v === STEPS[STEPS.length - 1]} aria-label={ar ? 'تكبير الخط' : 'Larger text'}><span aria-hidden="true">{ar ? 'ا' : 'A'}<small>+</small></span></button>
    </div>
  );
}
