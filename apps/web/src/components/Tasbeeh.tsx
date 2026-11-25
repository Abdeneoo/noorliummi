'use client';
import { useEffect, useState } from 'react';

/** Tasbeeh counter. Counts dhikr only (no reward figures); kept on this device. */
type Lang = 'ar' | 'en';
const PHRASES = [
  { ar: 'سُبْحَانَ اللَّهِ', en: 'SubhanAllah' },
  { ar: 'الْحَمْدُ لِلَّهِ', en: 'Alhamdulillah' },
  { ar: 'اللَّهُ أَكْبَرُ', en: 'Allahu akbar' },
  { ar: 'لَا إِلَهَ إِلَّا اللَّهُ', en: 'La ilaha illallah' },
  { ar: 'أَسْتَغْفِرُ اللَّهَ', en: 'Astaghfirullah' },
  { ar: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', en: 'Allahumma salli ʿala Muhammad' },
];
const TARGETS = [33, 100, 0];
const T = {
  ar: { title: 'عدّاد التسبيح', tap: 'اضغط للتسبيح', reset: 'تصفير', target: 'الهدف', open: 'بلا حد', done: 'اكتمل العدد', of: 'من', note: 'يُحفظ العدد على جهازك فقط.' },
  en: { title: 'Tasbeeh counter', tap: 'Tap to count', reset: 'Reset', target: 'Target', open: 'No limit', done: 'Target reached', of: 'of', note: 'The count is kept on this device only.' },
};
export default function Tasbeeh({ lang = 'ar', storeKey = 'home', compact = false }: { lang?: Lang; storeKey?: string; compact?: boolean }) {
  const t = T[lang];
  const KEY = `noor.tasbeeh.${storeKey}`;
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const [target, setTarget] = useState(33);
  const [pulse, setPulse] = useState(0);
  useEffect(() => { try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); if (v) { setI(v.i ?? 0); setN(v.n ?? 0); setTarget(v.t ?? 33); } } catch { /* ignore */ } }, [KEY]);
  const save = (ni: number, nn: number, nt: number) => { try { localStorage.setItem(KEY, JSON.stringify({ i: ni, n: nn, t: nt })); } catch { /* ignore */ } };
  const tap = () => {
    const nn = n + 1; setN(nn); setPulse((p) => p + 1); save(i, nn, target);
    try { if (target && nn % target === 0) navigator.vibrate?.([60, 40, 60]); else navigator.vibrate?.(8); } catch { /* ignore */ }
  };
  const reached = target > 0 && n > 0 && n % target === 0;
  const ring = target ? ((n % target) || (n > 0 ? target : 0)) / target : 0;
  const C = 2 * Math.PI * 52;
  return (
    <section className={`card tasbeeh${compact ? ' compact' : ''}`} aria-label={t.title}>
      <h2>{t.title}</h2>
      <ul className="chips tas-phrases" role="radiogroup" aria-label={t.title}>
        {PHRASES.map((p, k) => <li key={k}><button type="button" role="radio" aria-checked={i === k} className={i === k ? 'on' : ''} lang="ar" onClick={() => { setI(k); setN(0); save(k, 0, target); }}>{p.ar}</button></li>)}
      </ul>
      <button type="button" className={`tas-tap${reached ? ' reached' : ''}`} onClick={tap} aria-label={`${t.tap}: ${PHRASES[i].ar}`}>
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="52" className="tas-track" />
          <circle cx="60" cy="60" r="52" className="tas-ring" style={{ strokeDasharray: C, strokeDashoffset: C * (1 - ring) }} />
        </svg>
        <span className="tas-phrase" lang="ar">{PHRASES[i].ar}</span>
        <span key={pulse} className="tas-count" aria-live="polite">{lang === 'ar' ? String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]) : n}</span>
        <span className="tas-hint">{reached ? t.done : target ? `${t.of} ${lang === 'ar' ? String(target).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]) : target}` : t.tap}</span>
      </button>
      <div className="row tas-controls">
        <div className="field"><label htmlFor={`tt-${storeKey}`}>{t.target}</label>
          <select id={`tt-${storeKey}`} value={target} onChange={(e) => { const v = Number(e.target.value); setTarget(v); save(i, n, v); }}>
            {TARGETS.map((x) => <option key={x} value={x}>{x || t.open}</option>)}
          </select></div>
        <button type="button" className="btn ghost" onClick={() => { setN(0); save(i, 0, target); }}>{t.reset}</button>
      </div>
      <p className="note">{t.note}</p>
    </section>
  );
}
