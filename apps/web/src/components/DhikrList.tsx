'use client';
import { useEffect, useState } from 'react';
import type { Dhikr } from '@/lib/adhkar';

export default function DhikrList({ catId, items }: { catId: number; items: Dhikr[] }) {
  const key = `noor.adhkar.${catId}`;
  const [done, setDone] = useState<Record<number, number>>({});
  useEffect(() => {
    try { const raw = sessionStorage.getItem(key); if (raw) setDone(JSON.parse(raw)); } catch { /* ignore */ }
  }, [key]);
  const save = (v: Record<number, number>) => { setDone(v); try { sessionStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ } };
  const tap = (d: Dhikr) => {
    const cur = done[d.n] ?? 0;
    if (cur >= d.c) return;
    if (cur + 1 === d.c && 'vibrate' in navigator) navigator.vibrate?.(30);
    save({ ...done, [d.n]: cur + 1 });
  };
  const finished = items.filter((d) => (done[d.n] ?? 0) >= d.c).length;
  return (
    <>
      <div className="row" style={{ justifyContent: 'space-between', margin: '0 0 14px' }}>
        <span className="note" style={{ margin: 0 }} role="status">أتممت {finished} من {items.length}</span>
        <button type="button" className="btn ghost" onClick={() => save({})} disabled={Object.keys(done).length === 0}>إعادة العدّ</button>
      </div>
      <ol className="dhikr-list">
        {items.map((d) => {
          const cur = done[d.n] ?? 0; const complete = cur >= d.c;
          return (
            <li key={d.n} className={`card dhikr${complete ? ' complete' : ''}`}>
              <p className="dhikr-text" lang="ar">{d.t}</p>
              {d.r && <p className="dhikr-ref">{d.r}</p>}
              <button type="button" className="btn counter" onClick={() => tap(d)} disabled={complete} aria-label={`عدّ: ${cur} من ${d.c}`}>
                {complete ? 'تمّ' : d.c === 1 ? 'مرة واحدة — اضغط عند الانتهاء' : `${cur} / ${d.c}`}
              </button>
            </li>
          );
        })}
      </ol>
    </>
  );
}
