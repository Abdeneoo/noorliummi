'use client';
import { useEffect, useRef, useState } from 'react';
import PlayTrack from './PlayTrack';

/** The Umrah journey: ordered steps, the dhikr of each step (texts passed in from «حصن المسلم» unchanged),
 *  and a lap counter for tawaf and sa'i. Progress is kept on this device only. */
export interface Dh { title: string; items: { n: number; t: string; r: string; en?: string; tl?: string; a?: string }[] }
export interface Step { id: string; title: string; hint: string; read?: string; dhikr: Dh[]; laps?: boolean }
type S = { done: Record<string, boolean>; laps: Record<string, number> };
const KEY = 'noor.umrah.v2';
type L = 'ar' | 'en';
const TX = {
  ar: { tap: 'اضغط بعد كل شوط', fin: 'تمّت', of: 'من', back: 'تراجع شوطًا', reset: (t: boolean) => `صفّر ${t ? 'الطواف' : 'السعي'}`, rec: (n: string) => `سجّل الشوط ${n}`, full: 'اكتملت الأشواط',
    h: 'رحلة عمرتك', done: 'تقبّل الله منك.', prog: (a: string, b: string) => `${a} من ${b} خطوات`, awakeOn: 'الشاشة ستبقى مضاءة', awake: 'أبقِ الشاشة مضاءة', newU: 'عمرة جديدة', confirm: 'تبدأ عمرة جديدة؟ ستُمسح العلامات.',
    unmark: (t: string) => `ألغِ إتمام: ${t}`, mark: (t: string) => `علّم: ${t} تمّت`, read: 'اقرأ الصفة', undo: 'ألغِ الإتمام', ok: 'تمّت هذه الخطوة', accepted: 'تقبّل الله عمرتك' },
  en: { tap: 'Tap after each lap', fin: 'Done', of: 'of', back: 'Undo a lap', reset: (t: boolean) => `Reset ${t ? 'tawaf' : "sa'i"}`, rec: (n: string) => `Record lap ${n}`, full: 'All laps done',
    h: 'Your Umrah journey', done: 'May Allah accept it from you.', prog: (a: string, b: string) => `${a} of ${b} steps`, awakeOn: 'Screen will stay on', awake: 'Keep screen on', newU: 'New Umrah', confirm: 'Start a new Umrah? Your ticks will be cleared.',
    unmark: (t: string) => `Unmark: ${t}`, mark: (t: string) => `Mark done: ${t}`, read: 'Read more', undo: 'Undo', ok: 'Step done', accepted: 'May Allah accept your Umrah' },
};
let LG: L = 'ar';
const N = (n: number) => n.toLocaleString(LG === 'ar' ? 'ar-EG' : 'en');

function Laps({ id, n, set }: { id: string; n: number; set: (n: number) => void }) {
  const r = 52; const c = 2 * Math.PI * r;
  return (
    <div className="um-laps">
      <button type="button" className="um-ring" onClick={() => set(Math.min(7, n + 1))} disabled={n >= 7} aria-label={n >= 7 ? TX[LG].full : TX[LG].rec(N(n + 1))}>
        <svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r={r} className="um-ring-bg" /><circle cx="60" cy="60" r={r} className="um-ring-fg" strokeDasharray={c} strokeDashoffset={c * (1 - n / 7)} /></svg>
        <span className="um-ring-n" aria-live="polite">{N(n)}</span><span className="um-ring-of">{TX[LG].of} {N(7)}</span>
        <span className="um-ring-tap">{n >= 7 ? TX[LG].fin : TX[LG].tap}</span>
      </button>
      <ol className="um-dots" aria-hidden="true">{Array.from({ length: 7 }, (_, i) => <li key={i} className={i < n ? 'on' : ''}>{N(i + 1)}</li>)}</ol>
      <div className="um-laps-actions"><button type="button" className="btn ghost small" onClick={() => set(Math.max(0, n - 1))} disabled={!n}>{TX[LG].back}</button>{n > 0 && <button type="button" className="btn ghost small" onClick={() => set(0)}>{TX[LG].reset(id === 'tawaf')}</button>}</div>
    </div>
  );
}

export default function UmrahJourney({ steps, after, lang = 'ar' }: { steps: Step[]; after: Dh[]; lang?: L }) {
  LG = lang; const t = TX[lang];
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
        <div><h2 id="um-steps-h">{t.h}</h2><p>{all ? t.done : t.prog(N(count), N(steps.length))}</p></div>
        <div className="um-progress-tools">
          <button type="button" className={`btn small ${awake ? '' : 'ghost'}`} onClick={wake} aria-pressed={awake}>{awake ? t.awakeOn : t.awake}</button>
          {(count > 0 || Object.values(s.laps).some(Boolean)) && <button type="button" className="btn ghost small" onClick={() => { if (confirm(t.confirm)) { save({ done: {}, laps: {} }); setOpen(steps[0].id); } }}>{t.newU}</button>}
        </div>
        <div className="um-bar" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={count}><span style={{ width: `${(count / steps.length) * 100}%` }} /></div>
      </div>
      <ol className="um-steps">
        {steps.map((x, i) => {
          const d = !!s.done[x.id]; const o = open === x.id; const cur = x.id === first;
          return (
            <li key={x.id} className={`um-step${d ? ' is-done' : ''}${cur ? ' is-current' : ''}`}>
              <div className="um-step-head">
                <button type="button" className="um-num" onClick={() => toggle(x.id)} aria-pressed={d} aria-label={d ? t.unmark(x.title) : t.mark(x.title)}>{d ? '✓' : N(i + 1)}</button>
                <button type="button" className="um-step-title" onClick={() => setOpen(o ? '' : x.id)} aria-expanded={o}>
                  <strong>{x.title}</strong><small>{x.hint}{x.laps && (s.laps[x.id] ?? 0) > 0 ? ` · ${N(s.laps[x.id])} ${t.of} ${N(7)}` : ''}</small>
                </button>
                <span className="um-chev" aria-hidden="true">{o ? '−' : '+'}</span>
              </div>
              {o && <div className="um-step-body">
                {x.laps && <Laps id={x.id} n={s.laps[x.id] ?? 0} set={(n) => setLaps(x.id, n)} />}
                {x.dhikr.map((g) => <div key={g.title} className="um-dhikr"><p className="um-dhikr-t">{g.title}</p>
                  {g.items.map((it) => <div key={it.n}>{it.a && <PlayTrack lang={lang} tracks={[{ id: `um-${g.title}-${it.n}`, src: `/audio/adhkar/${it.a}`, title: g.title, by: 'محمد جمعة (OpenDua)', license: 'CC BY 4.0 — Recitation by Muhammad Jumah for OpenDua', text: it.t, page: lang === 'en' ? '/en/umrah' : '/umrah' }]} />}<p className="dhikr-text" lang="ar" dir="rtl">{it.t}</p>{lang === 'en' && it.tl && <p className="um-tl" lang="en">{it.tl}</p>}{lang === 'en' && it.en && <p className="um-en" lang="en">{it.en}</p>}{it.r && <p className="dhikr-ref">{it.r}</p>}</div>)}</div>)}
                <div className="um-step-foot">
                  {x.read && <a className="btn ghost small" href={x.read}>{t.read}</a>}
                  <button type="button" className={`btn small${d ? ' ghost' : ''}`} onClick={() => toggle(x.id)}>{d ? t.undo : t.ok}</button>
                </div>
              </div>}
            </li>
          );
        })}
      </ol>
      {all && <div className="um-done card"><h3>{t.accepted}</h3>
        {after.map((g) => <div key={g.title} className="um-dhikr"><p className="um-dhikr-t">{g.title}</p>{g.items.map((it) => <div key={it.n}>{it.a && <PlayTrack lang={lang} tracks={[{ id: `um-${g.title}-${it.n}`, src: `/audio/adhkar/${it.a}`, title: g.title, by: 'محمد جمعة (OpenDua)', license: 'CC BY 4.0 — Recitation by Muhammad Jumah for OpenDua', text: it.t, page: lang === 'en' ? '/en/umrah' : '/umrah' }]} />}<p className="dhikr-text" lang="ar" dir="rtl">{it.t}</p>{lang === 'en' && it.tl && <p className="um-tl" lang="en">{it.tl}</p>}{lang === 'en' && it.en && <p className="um-en" lang="en">{it.en}</p>}{it.r && <p className="dhikr-ref">{it.r}</p>}</div>)}</div>)}</div>}
    </section>
  );
}
