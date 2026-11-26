'use client';
import { logDay } from '@/lib/daylog';
import { useEffect, useState } from 'react';
import { recordActivity } from './Lantern';
import { PHRASES } from '@/lib/dhikr-phrases';

/** Tasbeeh counter. Counts dhikr only (no reward figures); kept on this device. */
type Lang = 'ar' | 'en';
const TARGETS = [33, 70, 100];
const T = {
  ar: { title: 'عدّاد التسبيح', tap: 'اضغط للتسبيح', reset: 'تصفير', target: 'الهدف', open: 'عدد مفتوح بلا حد', done: 'اكتمل العدد', of: 'من', note: 'يُحفظ العدد على جهازك فقط.', full: 'شاشة كاملة', exit: 'خروج', anywhere: 'المس أي مكان في الشاشة للتسبيح', record: 'سجّل تسبيحك في صفحة أثر', none: 'لا تسجيل', recorded: 'يُسجَّل كل ٣٣ تسبيحة في قنديل الصفحة.' },
  en: { title: 'Tasbeeh counter', tap: 'Tap to count', reset: 'Reset', target: 'Target', open: 'Open count, no limit', done: 'Target reached', of: 'of', note: 'The count is kept on this device only.', full: 'Full screen', exit: 'Exit', anywhere: 'Tap anywhere on the screen to count', record: 'Record your tasbeeh on an athar page', none: 'Do not record', recorded: 'Every 33 is added to the page lantern.' },
};
/**
 * atharSlug: on an athar page, every 33 counts is added to that page's lantern. pickAthar: lets the user choose one of
 * the athar pages saved on this device (the /tasbeeh page).
 */
export default function Tasbeeh({ lang = 'ar', storeKey = 'home', compact = false, atharSlug, pickAthar = false }: { lang?: Lang; storeKey?: string; compact?: boolean; atharSlug?: string; pickAthar?: boolean }) {
  const t = T[lang];
  const KEY = `noor.tasbeeh.${storeKey}`;
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const [target, setTarget] = useState(33);
  const [pulse, setPulse] = useState(0);
  const [full, setFull] = useState(false);
  const [mine, setMine] = useState<{ slug: string; name: string }[]>([]);
  const [rec, setRec] = useState(atharSlug ?? '');
  useEffect(() => {
    if (!pickAthar) return;
    try { const names = { ...JSON.parse(localStorage.getItem('noor.athar.visited') || '{}'), ...JSON.parse(localStorage.getItem('noor.athar.names') || '{}') } as Record<string, string>; setMine(Object.entries(names).map(([slug, name]) => ({ slug, name }))); setRec(localStorage.getItem('noor.tasbeeh.athar') || ''); } catch { /* ignore */ }
  }, [pickAthar]);
  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFull(false); };
    document.addEventListener('keydown', onKey); document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [full]);
  useEffect(() => { try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); if (v) { setI(v.i ?? 0); setN(v.n ?? 0); setTarget(TARGETS.includes(v.t) ? v.t : 33); } } catch { /* ignore */ } }, [KEY]);
  const save = (ni: number, nn: number, nt: number) => { try { localStorage.setItem(KEY, JSON.stringify({ i: ni, n: nn, t: nt })); } catch { /* ignore */ } };
  // الصلاة على النبي ﷺ: عدد مفتوح بلا هدف.
  const openCount = PHRASES[i]?.ar.includes('صَلِّ');
  const goal = openCount ? 0 : target;
  const tap = () => {
    const nn = n + 1; setN(nn); setPulse((p) => p + 1); save(i, nn, target); logDay('t');
    try { if ((goal && nn % goal === 0) || nn % 100 === 0) navigator.vibrate?.([60, 40, 60]); else if (nn % 33 === 0) navigator.vibrate?.(40); else navigator.vibrate?.(8); } catch { /* ignore */ }
    if (rec && nn % 33 === 0) void recordActivity(rec, 'tasbeeh');
  };
  const num = (v: number) => (lang === 'ar' ? String(v).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]) : String(v));
  const reached = goal > 0 && n > 0 && n % goal === 0;
  const ring = goal ? ((n % goal) || (n > 0 ? goal : 0)) / goal : 0;
  const C = 2 * Math.PI * 52;
  return (
    <section className={`card tasbeeh${compact ? ' compact' : ''}`} aria-label={t.title}>
      <h2>{t.title}</h2>
      <ul className="chips tas-phrases" aria-label={t.title}>
        {PHRASES.map((p, k) => <li key={k}><button type="button" aria-pressed={i === k ? 'true' : 'false'} className={i === k ? 'on' : ''} lang="ar" onClick={() => { setI(k); setN(0); save(k, 0, target); }}>{p.ar}</button></li>)}
      </ul>
      <button type="button" className={`tas-tap${reached ? ' reached' : ''}`} onClick={tap}>
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="52" className="tas-track" />
          <circle cx="60" cy="60" r="52" className="tas-ring" style={{ strokeDasharray: C, strokeDashoffset: C * (1 - ring) }} />
        </svg>
        <span className="tas-phrase" lang="ar">{PHRASES[i].ar}</span>
        <span key={pulse} className="tas-count" aria-live="polite">{lang === 'ar' ? String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]) : n}</span>
        <span className="tas-hint">{reached ? t.done : goal ? `${t.of} ${num(goal)}` : t.tap}</span>
      </button>
      {full && (
        <div className="tas-full" role="button" tabIndex={0} aria-label={`${t.tap}: ${PHRASES[i].ar}`} onPointerDown={(e) => { if (!(e.target as HTMLElement).closest('.tas-exit')) { e.preventDefault(); tap(); } }} onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); tap(); } }}>
          <button type="button" className="btn outline-light tas-exit" onClick={() => setFull(false)}>{t.exit}</button>
          <span className="tas-phrase" lang="ar">{PHRASES[i].ar}</span>
          <span key={pulse} className="tas-count" aria-live="polite">{num(n)}</span>
          <span className="tas-hint">{reached ? t.done : goal ? `${t.of} ${num(goal)}` : t.open}</span>
          <span className="tas-hint">{t.anywhere}</span>
        </div>
      )}
      <div className="row tas-controls">
        {openCount ? <p className="note tas-open">{t.open}</p> : <div className="field tas-targets" role="group" aria-label={t.target}><span>{t.target}</span>
          {TARGETS.map((x) => <button key={x} type="button" className={`chip${target === x ? ' on' : ''}`} aria-pressed={target === x} onClick={() => { setTarget(x); save(i, n, x); }}>{num(x)}</button>)}
        </div>}
        <button type="button" className="btn ghost" onClick={() => { setN(0); save(i, 0, target); }}>{t.reset}</button>
        <button type="button" className="btn ghost" onClick={() => setFull(true)}>{t.full}</button>
      </div>
      {pickAthar && mine.length > 0 && (
        <div className="field" style={{ maxWidth: 360, margin: '12px auto 0' }}><label htmlFor={`ta-${storeKey}`}>{t.record}</label>
          <select id={`ta-${storeKey}`} value={rec} onChange={(e) => { setRec(e.target.value); try { localStorage.setItem('noor.tasbeeh.athar', e.target.value); } catch { /* ignore */ } }}>
            <option value="">{t.none}</option>
            {mine.map((m) => <option key={m.slug} value={m.slug}>{m.name}</option>)}
          </select></div>
      )}
      {rec && <p className="note">{t.recorded}</p>}
      <p className="note">{t.note}</p>
    </section>
  );
}
