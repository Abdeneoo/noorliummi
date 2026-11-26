'use client';
import { logDay } from '@/lib/daylog';
import { useEffect, useRef, useState } from 'react';
import type { Dhikr } from '@/lib/adhkar';
import ShareImageButton from './ShareImageButton';

const L = {
  ar: { done: (f: number, n: number) => `أتممت ${f} من ${n}`, reset: 'إعادة العدّ', stop: 'إيقاف', listen: 'استمع (تسجيل)', count: (c: number, n: number) => `عدّ: ${c} من ${n}`, complete: 'تمّ', once: 'مرة واحدة — اضغط عند الانتهاء', credit: 'التسجيلات بصوت محمد جمعة لمشروع OpenDua، بترخيص', creditTail: '. تظهر فقط حيث يطابق نصُّ التسجيل نصَّ الذكر هنا.' },
  en: { done: (f: number, n: number) => `Completed ${f} of ${n}`, reset: 'Reset counts', stop: 'Stop', listen: 'Listen (recording)', count: (c: number, n: number) => `Count: ${c} of ${n}`, complete: 'Done', once: 'Once — tap when finished', credit: 'Recitation by Muhammad Jumah for OpenDua, licensed', creditTail: '. Shown only where the recording’s text matches this dhikr exactly.' },
};

/** Display-only: adds the missing space after a closing quotation mark in references (e.g. «أربعة"أبو داود»). */
function spaceQuotes(r: string) { let open = false; return r.replace(/"(?=(\S)?)/g, (q, next) => { open = !open; return !open && next && /[\p{L}(]/u.test(next) ? '" ' : q; }); }
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
    if (cur + 1 === d.c && items.every((x) => x.n === d.n || (done[x.n] ?? 0) >= x.c)) logDay('a');
    // When a dhikr is completed, move to the next unfinished one so the reader need not look for it.
    if (cur + 1 === d.c) {
      const next = items.find((x) => x.n !== d.n && (done[x.n] ?? 0) < x.c && x.n > d.n) ?? items.find((x) => x.n !== d.n && (done[x.n] ?? 0) < x.c);
      if (next) setTimeout(() => { const el = document.getElementById(`dh${next.n}`); el?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' }); el?.querySelector<HTMLButtonElement>('.counter')?.focus({ preventScroll: true }); }, 350);
    }
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
            <li key={d.n} id={`dh${d.n}`} className={`card dhikr${complete ? ' complete' : ''}`}>
              <p className="dhikr-text" lang="ar">{d.t}</p>
              {lang === 'en' && d.tl && <p className="dhikr-tl" lang="en">{d.tl}</p>}
              {lang === 'en' && (d.en ? <p className="dhikr-en" lang="en">{d.en}</p> : <p className="note" lang="en">No English translation from a licensed source is available for this entry yet.</p>)}
              {d.r && <p className="dhikr-ref" lang="ar" dir="rtl">{spaceQuotes(d.r)}</p>}
              <div className="row dhikr-tools">
                {d.a && <button type="button" className="btn ghost small" onClick={() => play(d)} aria-pressed={playing === d.n ? 'true' : 'false'}>{playing === d.n ? t.stop : t.listen}</button>}
                <ShareImageButton lang={lang} story={{ text: d.t, caption: d.r ? `${d.r} — حصن المسلم` : 'حصن المسلم', path: `/adhkar/${catId}` }} />
              </div>
              <button type="button" className="btn counter" onClick={() => tap(d)} disabled={complete} aria-label={t.count(cur, d.c)}>
                <span aria-hidden="true">{complete ? t.complete : d.c === 1 ? t.once : `${cur} / ${d.c}`}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </>
  );
}
