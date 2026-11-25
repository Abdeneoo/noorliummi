'use client';
import { useEffect, useRef, useState } from 'react';
import type { Dhikr } from '@/lib/adhkar';

const L = {
  ar: { done: (f: number, n: number) => `أتممت ${f} من ${n}`, reset: 'إعادة العدّ', stop: 'إيقاف', listen: 'استمع', count: (c: number, n: number) => `عدّ: ${c} من ${n}`, complete: 'تمّ', once: 'مرة واحدة — اضغط عند الانتهاء', credit: 'التسجيلات بصوت محمد جمعة لمشروع OpenDua، بترخيص', creditTail: '. تظهر فقط حيث يطابق نصُّ التسجيل نصَّ الذكر هنا.' },
  en: { done: (f: number, n: number) => `Completed ${f} of ${n}`, reset: 'Reset counts', stop: 'Stop', listen: 'Listen', count: (c: number, n: number) => `Count: ${c} of ${n}`, complete: 'Done', once: 'Once — tap when finished', credit: 'Recitation by Muhammad Jumah for OpenDua, licensed', creditTail: '. Shown only where the recording’s text matches this dhikr exactly.' },
};

export default function DhikrList({ catId, items, lang = 'ar' }: { catId: number; items: Dhikr[]; lang?: 'ar' | 'en' }) {
  const t = L[lang];
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
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<number | null>(null);
  useEffect(() => () => audio.current?.pause(), []);
  const play = (d: Dhikr) => {
    if (!audio.current) { audio.current = new Audio(); audio.current.onended = () => setPlaying(null); audio.current.onerror = () => setPlaying(null); }
    if (playing === d.n) { audio.current.pause(); setPlaying(null); return; }
    audio.current.src = `/audio/adhkar/${d.a}`; audio.current.play().then(() => setPlaying(d.n)).catch(() => setPlaying(null));
  };
  const hasAudio = items.some((d) => d.a);
  const finished = items.filter((d) => (done[d.n] ?? 0) >= d.c).length;
  return (
    <>
      <div className="row" style={{ justifyContent: 'space-between', margin: '0 0 14px' }}>
        <span className="note" style={{ margin: 0 }} role="status">{t.done(finished, items.length)}</span>
        <button type="button" className="btn ghost" onClick={() => save({})} disabled={Object.keys(done).length === 0}>{t.reset}</button>
      </div>
      <ol className="dhikr-list">
        {items.map((d) => {
          const cur = done[d.n] ?? 0; const complete = cur >= d.c;
          return (
            <li key={d.n} className={`card dhikr${complete ? ' complete' : ''}`}>
              <p className="dhikr-text" lang="ar">{d.t}</p>
              {lang === 'en' && d.tl && <p className="dhikr-tl" lang="en">{d.tl}</p>}
              {lang === 'en' && (d.en ? <p className="dhikr-en" lang="en">{d.en}</p> : <p className="note" lang="en">No English translation from a licensed source is available for this entry yet.</p>)}
              {d.r && <p className="dhikr-ref" lang="ar" dir="rtl">{d.r}</p>}
              {d.a && <button type="button" className="btn ghost small" onClick={() => play(d)} aria-pressed={playing === d.n}>{playing === d.n ? t.stop : t.listen}</button>}
              <button type="button" className="btn counter" onClick={() => tap(d)} disabled={complete} aria-label={t.count(cur, d.c)}>
                {complete ? t.complete : d.c === 1 ? t.once : `${cur} / ${d.c}`}
              </button>
            </li>
          );
        })}
      </ol>
      {hasAudio && <p className="note">{t.credit} <a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener">CC BY 4.0</a>{t.creditTail}</p>}
    </>
  );
}
