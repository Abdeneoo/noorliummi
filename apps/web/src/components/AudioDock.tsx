'use client';
import Link from 'next/link';
import { useEffect, useSyncExternalStore } from 'react';
import { close, cycleRepeat, expand, getState, restore, seek, seekTo, setRate, skip, sleepIn, subscribe, toggle, hasLast } from '@/lib/audio-store';
const fmt = (s: number) => (Number.isFinite(s) && s > 0 ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00');
const SERVER = getState();
/** The site-wide mini player (and its expanded view). Rendered once in the root layout. */
export default function AudioDock() {
  const s = useSyncExternalStore(subscribe, getState, () => SERVER);
  useEffect(() => { restore(); }, []);
  const tr = s.queue[s.i];
  if (!tr || !s.open) return hasLastResume(s.queue.length > 0);
  return (
    <div className={`audio-dock${s.expanded ? ' big' : ''}`} role="region" aria-label="المشغّل">
      <div className="ad-row">
        <button type="button" className="ad-btn ad-main" onClick={() => toggle()} aria-label={s.playing ? 'إيقاف مؤقت' : 'تشغيل'}>{s.playing ? '❚❚' : '▶'}</button>
        <button type="button" className="ad-info" onClick={() => expand(!s.expanded)} aria-expanded={s.expanded}>
          <strong>{tr.title}</strong><small>{tr.by}{s.queue.length > 1 ? ` · ${s.i + 1}/${s.queue.length}` : ''}</small></button>
        <button type="button" className="ad-btn" onClick={() => close()} aria-label="إغلاق المشغّل">✕</button>
      </div>
      <div className="ad-bar"><span>{fmt(s.t)}</span><input type="range" min={0} max={Math.max(1, Math.floor(s.d))} value={Math.floor(s.t)} onChange={(e) => seekTo(Number(e.target.value))} aria-label="موضع التشغيل" /><span>{fmt(s.d)}</span></div>
      {s.expanded && (
        <div className="ad-more">
          <div className="ad-row ad-ctl">
            <button type="button" className="ad-btn" onClick={() => skip(-1)} disabled={s.i === 0} aria-label="السابق">⏮</button>
            <button type="button" className="ad-btn" onClick={() => seek(-10)} aria-label="رجوع ١٠ ثوانٍ">−١٠</button>
            <button type="button" className="ad-btn" onClick={() => seek(10)} aria-label="تقديم ١٠ ثوانٍ">+١٠</button>
            <button type="button" className="ad-btn" onClick={() => skip(1)} disabled={s.i >= s.queue.length - 1} aria-label="التالي">⏭</button>
            <button type="button" className="ad-btn" onClick={() => cycleRepeat()} aria-label="التكرار">{s.repeat === 'one' ? 'تكرار: هذا' : s.repeat === 'all' ? 'تكرار: الكل' : 'بلا تكرار'}</button>
          </div>
          <div className="ad-row ad-ctl">
            <label>السرعة <select value={s.rate} onChange={(e) => setRate(Number(e.target.value))}>{[0.75, 0.9, 1, 1.15, 1.25].map((r) => <option key={r} value={r}>{r === 1 ? 'عادية' : `${r}×`}</option>)}</select></label>
            <label>مؤقت النوم <select value={s.sleepAt ? 'on' : 0} onChange={(e) => sleepIn(Number(e.target.value) || 0)}><option value={0}>إيقاف</option>{s.sleepAt ? <option value="on">يعمل</option> : null}{[10, 15, 30, 45, 60].map((m) => <option key={m} value={m}>{m} دقيقة</option>)}</select></label>
            {tr.page && <Link href={tr.page} className="ad-link">الصفحة</Link>}
          </div>
          {tr.text && <p className="ad-text" lang="ar">{tr.text}</p>}
          {s.queue.length > 1 && <ol className="ad-queue">{s.queue.map((q, k) => <li key={q.id} aria-current={k === s.i ? 'true' : undefined}>{q.title}</li>)}</ol>}
          {(tr.source || tr.license) && <p className="ad-src">{tr.source}{tr.license ? ` — ${tr.license}` : ''}</p>}
        </div>
      )}
    </div>
  );
}
/** After a reload: a small "resume" pill (never autoplays). */
function hasLastResume(show: boolean) {
  if (!show || !hasLast()) return null;
  return <button type="button" className="audio-resume" onClick={() => toggle(true)}>▶ تابع الاستماع</button>;
}
