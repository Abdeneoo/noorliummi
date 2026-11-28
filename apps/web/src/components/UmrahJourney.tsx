'use client';
import { useEffect, useRef, useState } from 'react';

/** The Umrah journey: ordered steps, the dhikr of each step (texts passed in from «حصن المسلم» unchanged),
 *  and a lap counter for tawaf and sa'i. Progress is kept on this device only. */
export interface Dh { title: string; items: { n: number; t: string; r: string }[] }
export interface Step { id: string; title: string; hint: string; read?: string; dhikr: Dh[]; laps?: boolean }
type S = { done: Record<string, boolean>; laps: Record<string, number> };
const KEY = 'noor.umrah.v2';
const N = (n: number) => n.toLocaleString('ar-EG');

function Laps({ id, n, set }: { id: string; n: number; set: (n: number) => void }) {
  const r = 52; const c = 2 * Math.PI * r;
  return (
    <div className="um-laps">
      <button type="button" className="um-ring" onClick={() => set(Math.min(7, n + 1))} disabled={n >= 7} aria-label={n >= 7 ? 'اكتملت الأشواط' : `سجّل الشوط ${N(n + 1)}`}>
        <svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r={r} className="um-ring-bg" /><circle cx="60" cy="60" r={r} className="um-ring-fg" strokeDasharray={c} strokeDashoffset={c * (1 - n / 7)} /></svg>
        <span className="um-ring-n" aria-live="polite">{N(n)}</span><span className="um-ring-of">من {N(7)}</span>
        <span className="um-ring-tap">{n >= 7 ? 'تمّت' : 'اضغط بعد كل شوط'}</span>
      </button>
      <ol className="um-dots" aria-hidden="true">{Array.from({ length: 7 }, (_, i) => <li key={i} className={i < n ? 'on' : ''}>{N(i + 1)}</li>)}</ol>
      <div className="um-laps-actions"><button type="button" className="btn ghost small" onClick={() => set(Math.max(0, n - 1))} disabled={!n}>تراجع شوطًا</button>{n > 0 && <button type="button" className="btn ghost small" onClick={() => set(0)}>صفّر {id === 'tawaf' ? 'الطواف' : 'السعي'}</button>}</div>
    </div>
  );
}

export default function UmrahJourney({ steps, after }: { steps: Step[]; after: Dh[] }) {
  const [s, setS] = useState<S>({ done: {}, laps: {} });
  const [open, setOpen] = useState<string>('');
  const [awake, setAwake] = useState(false);
  const lock = useRef<{ release: () => Promise<void> } | null>(null);
  useEffect(() => { try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); if (v) setS(v); } catch { /* ignore */ } }, []);
  const first = steps.find((x) => !s.done[x.id])?.id ?? '';
  useEffect(() => { setOpen((o) => o || first); }, [first]);
  const save = (v: S) => { setS(v); try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* ignore */ } };
  const toggle = (id: string) => { const done = { ...s.done, [id]: !s.done[id] }; save({ ...s, done }); if (done[id]) { const nx = steps.find((x) => !done[x.id]); if (nx) setOpen(nx.id); } };
  const setLaps = (id: string, n: number) => {
    const prev = s.laps[id] ?? 0; const done = { ...s.done, [id]: n === 7 ? true : s.done[id] && n === 7 };
    save({ done, laps: { ...s.laps, [id]: n } });
    if (n > prev && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(n === 7 ? [90, 60, 90] : 35);
  };
  const wake = async () => {
    try {
      if (lock.current) { await lock.current.release(); lock.current = null; setAwake(false); return; }
      const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } };
      if (nav.wakeLock) { lock.current = await nav.wakeLock.request('screen'); setAwake(true); }
    } catch { setAwake(false); }
  };
  const count = steps.filter((x) => s.done[x.id]).length; const all = count === steps.length;
  return (
    <section className="um-journey" id="steps" aria-labelledby="um-steps-h">
      <div className="um-progress">
        <div><h2 id="um-steps-h">رحلة عمرتك</h2><p>{all ? 'تقبّل الله منك.' : `${N(count)} من ${N(steps.length)} خطوات`}</p></div>
        <div className="um-progress-tools">
          <button type="button" className={`btn small ${awake ? '' : 'ghost'}`} onClick={wake} aria-pressed={awake}>{awake ? 'الشاشة ستبقى مضاءة' : 'أبقِ الشاشة مضاءة'}</button>
          {(count > 0 || Object.values(s.laps).some(Boolean)) && <button type="button" className="btn ghost small" onClick={() => { if (confirm('تبدأ عمرة جديدة؟ ستُمسح العلامات.')) { save({ done: {}, laps: {} }); setOpen(steps[0].id); } }}>عمرة جديدة</button>}
        </div>
        <div className="um-bar" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={count}><span style={{ width: `${(count / steps.length) * 100}%` }} /></div>
      </div>
      <ol className="um-steps">
        {steps.map((x, i) => {
          const d = !!s.done[x.id]; const o = open === x.id; const cur = x.id === first;
          return (
            <li key={x.id} className={`um-step${d ? ' is-done' : ''}${cur ? ' is-current' : ''}`}>
              <div className="um-step-head">
                <button type="button" className="um-num" onClick={() => toggle(x.id)} aria-pressed={d} aria-label={d ? `ألغِ إتمام: ${x.title}` : `علّم: ${x.title} تمّت`}>{d ? '✓' : N(i + 1)}</button>
                <button type="button" className="um-step-title" onClick={() => setOpen(o ? '' : x.id)} aria-expanded={o}>
                  <strong>{x.title}</strong><small>{x.hint}{x.laps && (s.laps[x.id] ?? 0) > 0 ? ` · ${N(s.laps[x.id])} من ${N(7)}` : ''}</small>
                </button>
                <span className="um-chev" aria-hidden="true">{o ? '−' : '+'}</span>
              </div>
              {o && <div className="um-step-body">
                {x.laps && <Laps id={x.id} n={s.laps[x.id] ?? 0} set={(n) => setLaps(x.id, n)} />}
                {x.dhikr.map((g) => <div key={g.title} className="um-dhikr"><p className="um-dhikr-t">{g.title}</p>
                  {g.items.map((it) => <div key={it.n}><p className="dhikr-text" lang="ar">{it.t}</p>{it.r && <p className="dhikr-ref">{it.r}</p>}</div>)}</div>)}
                <div className="um-step-foot">
                  {x.read && <a className="btn ghost small" href={x.read}>اقرأ الصفة</a>}
                  <button type="button" className={`btn small${d ? ' ghost' : ''}`} onClick={() => toggle(x.id)}>{d ? 'ألغِ الإتمام' : 'تمّت هذه الخطوة'}</button>
                </div>
              </div>}
            </li>
          );
        })}
      </ol>
      {all && <div className="um-done card"><h3>تقبّل الله عمرتك</h3>
        {after.map((g) => <div key={g.title} className="um-dhikr"><p className="um-dhikr-t">{g.title}</p>{g.items.map((it) => <div key={it.n}><p className="dhikr-text" lang="ar">{it.t}</p>{it.r && <p className="dhikr-ref">{it.r}</p>}</div>)}</div>)}</div>}
    </section>
  );
}
