'use client';
import { useEffect, useState } from 'react';
/** On-device step tracker for one Umrah, with lap counters for tawaf and sa'i. Nothing leaves the device. */
type S = { done: Record<string, boolean>; tawaf: number; sai: number };
const K = 'noor.umrah';
const STEPS: { id: string; t: string; href: string; laps?: 'tawaf' | 'sai' }[] = [
  { id: 'safar', t: 'أذكار السفر', href: '#safar' },
  { id: 'ihram', t: 'الإحرام من الميقات والتلبية', href: '#sifa' },
  { id: 'masjid', t: 'دخول المسجد الحرام', href: '#masjid' },
  { id: 'tawaf', t: 'الطواف', href: '#tawaf-dhikr', laps: 'tawaf' },
  { id: 'rak', t: 'ركعتا الطواف', href: '#sifa' },
  { id: 'sai', t: 'السعي بين الصفا والمروة', href: '#sai-dhikr', laps: 'sai' },
  { id: 'halq', t: 'الحلق أو التقصير', href: '#sifa' },
];
const N = (n: number) => n.toLocaleString('ar-EG');
export default function UmrahSteps() {
  const [s, set] = useState<S>({ done: {}, tawaf: 0, sai: 0 });
  useEffect(() => { try { const v = JSON.parse(localStorage.getItem(K) || 'null'); if (v) set(v); } catch { /* ignore */ } }, []);
  const save = (v: S) => { set(v); try { localStorage.setItem(K, JSON.stringify(v)); } catch { /* ignore */ } };
  const lap = (k: 'tawaf' | 'sai', d: number) => { const n = Math.max(0, Math.min(7, s[k] + d)); save({ ...s, [k]: n, done: { ...s.done, [k]: n === 7 ? true : s.done[k] } }); if (d > 0 && navigator.vibrate) navigator.vibrate(n === 7 ? [80, 60, 80] : 40); };
  const done = STEPS.filter((x) => s.done[x.id]).length;
  return (
    <section className="card" id="steps"><h2 style={{ marginTop: 0 }}>خطوات عمرتي</h2>
      <p className="note">علّم على كل خطوة عند إتمامها، واستعمل عدّاد الأشواط في الطواف والسعي. يُحفظ على جهازك فقط. ({N(done)} من {N(STEPS.length)})</p>
      <ol className="check-list" style={{ paddingInlineStart: 20 }}>{STEPS.map((x) => (
        <li key={x.id} style={{ marginBottom: 10 }}>
          <label><input type="checkbox" checked={!!s.done[x.id]} onChange={() => save({ ...s, done: { ...s.done, [x.id]: !s.done[x.id] } })} /> <span className={s.done[x.id] ? 'done' : ''}><strong>{x.t}</strong></span></label> <a href={x.href} className="note">اقرأ</a>
          {x.laps && <div className="row" style={{ alignItems: 'center', gap: 8, marginTop: 6 }}>
            <button type="button" className="btn" style={{ minWidth: 150, fontSize: '1.1rem' }} onClick={() => lap(x.laps!, 1)} disabled={s[x.laps] >= 7} aria-label="سجّل شوطًا">الشوط {N(Math.min(7, s[x.laps] + 1))} ✓</button>
            <span aria-live="polite" style={{ fontSize: '1.3rem' }}>{N(s[x.laps])} / {N(7)}</span>
            <button type="button" className="btn ghost small" onClick={() => lap(x.laps!, -1)} disabled={!s[x.laps]}>تراجع</button>
          </div>}
        </li>))}</ol>
      {(done > 0 || s.tawaf || s.sai) ? <button type="button" className="btn ghost small" onClick={() => { if (confirm('تبدأ عمرة جديدة؟')) save({ done: {}, tawaf: 0, sai: 0 }); }}>عمرة جديدة</button> : null}
    </section>
  );
}
