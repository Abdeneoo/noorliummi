'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RECITERS, ayahUrl } from '@/lib/reciters';
import { SURAHS, arDigits } from '@/lib/quran';
import { arCount, MARRA } from '@/lib/arnum';

/**
 * «وضع السكينة»: one ayah (or one dhikr) at a time, large type on a warm dark background, a calm recitation that
 * moves to the next ayah by itself, and a sleep timer that stops the sound and dims the screen.
 */
type Item = { t: string; label: string; src?: string };
const START = SURAHS.reduce<number[]>((a, s, i) => { a.push(i === 0 ? 1 : a[i - 1] + SURAHS[i - 1].ayas); return a; }, []);
const AYAH_RECITERS = RECITERS.map((r, i) => ({ ...r, i })).filter((r) => r.mode === 'ayah');

export default function Sakina({ surah, adhkar, back }: { surah?: number; adhkar?: { t: string; c: number; a?: string }[]; back?: string }) {
  const [items, setItems] = useState<Item[]>([]); const [i, setI] = useState(0); const [playing, setPlaying] = useState(false);
  const [rec, setRec] = useState(AYAH_RECITERS.find((r) => r.id === 'ar.minshawi')?.i ?? AYAH_RECITERS[0].i);
  const [left, setLeft] = useState<number | null>(null); const [asleep, setAsleep] = useState(false); const [size, setSize] = useState(1);
  const audio = useRef<HTMLAudioElement | null>(null); const playingRef = useRef(false);
  useEffect(() => {
    if (adhkar) { setItems(adhkar.map((d, k) => ({ t: d.t, label: d.c > 1 ? `الذكر ${arDigits(k + 1)}، يُقال ${arCount(d.c, MARRA, 'واحدة')}` : `الذكر ${arDigits(k + 1)}`, src: d.a ? `/audio/adhkar/${d.a}` : undefined }))); return; }
    const s = surah ?? 67;
    import(`@/generated/surah/${s}.json`).then((m) => setItems((m.default.ayat as { n: number; t: string }[]).map((a) => ({ t: a.t, label: `سورة ${SURAHS[s - 1].name}، الآية ${arDigits(a.n)}` }))));
    try { const v = Number(localStorage.getItem('noor.sakina.rec')); if (AYAH_RECITERS.some((r) => r.i === v)) setRec(v); setSize(Number(localStorage.getItem('noor.sakina.size')) || 1); } catch { /* ignore */ }
  }, [surah, adhkar]);
  const srcOf = useCallback((k: number) => adhkar ? items[k]?.src : ayahUrl(RECITERS[rec], START[(surah ?? 67) - 1] + k), [adhkar, items, rec, surah]);
  const play = useCallback((k: number) => {
    const src = srcOf(k); setI(k);
    const el = (audio.current ??= new Audio());
    if (!src) { el.pause(); if (playingRef.current && k + 1 < items.length) setTimeout(() => playingRef.current && play(k + 1), 6000); return; }
    el.src = src; el.onended = () => { if (playingRef.current && k + 1 < items.length) setTimeout(() => playingRef.current && play(k + 1), 900); else { setPlaying(false); playingRef.current = false; } };
    void el.play().then(() => { setPlaying(true); playingRef.current = true; }).catch(() => { setPlaying(false); playingRef.current = false; });
  }, [srcOf, items.length]);
  const stop = () => { audio.current?.pause(); setPlaying(false); playingRef.current = false; };
  useEffect(() => () => audio.current?.pause(), []);
  // Sleep timer: counts down in minutes, then stops and dims.
  useEffect(() => {
    if (left == null) return;
    if (left <= 0) { stop(); setAsleep(true); setLeft(null); return; }
    const t = setTimeout(() => setLeft((v) => (v == null ? null : v - 1)), 60_000); return () => clearTimeout(t);
  }, [left]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft') setI((v) => Math.min(items.length - 1, v + 1)); if (e.key === 'ArrowRight') setI((v) => Math.max(0, v - 1)); };
    document.addEventListener('keydown', onKey); return () => document.removeEventListener('keydown', onKey);
  }, [items.length]);
  const cur = items[i];
  const zoom = (d: number) => { const v = Math.min(1.6, Math.max(.8, +(size + d).toFixed(2))); setSize(v); try { localStorage.setItem('noor.sakina.size', String(v)); } catch { /* ignore */ } };
  return (
    <div className={`sakina${asleep ? ' asleep' : ''}`} style={{ ['--sk' as string]: size }} onClick={() => asleep && setAsleep(false)}>
      <div className="sk-top">
        <Link href={back ?? (adhkar ? '/adhkar/29' : `/quran/${surah ?? 67}`)} className="sk-x" aria-label="خروج من وضع السكينة">✕</Link>
        <div className="sk-zoom"><button type="button" onClick={() => zoom(-.1)} aria-label="تصغير الخط">ا-</button><button type="button" onClick={() => zoom(.1)} aria-label="تكبير الخط">ا+</button></div>
      </div>
      {cur ? <>
        <p className={adhkar ? 'sk-text dhikr' : 'sk-text'} lang="ar">{cur.t}</p>
        <p className="sk-label">{cur.label}</p>
      </> : <p className="sk-label">…</p>}
      <div className="sk-controls">
        <button type="button" onClick={() => (playing ? play(Math.max(0, i - 1)) : setI(Math.max(0, i - 1)))} disabled={i === 0} aria-label="السابق">›</button>
        <button type="button" className="sk-play" onClick={() => (playing ? stop() : play(i))}>{playing ? 'إيقاف' : 'استمع'}</button>
        <button type="button" onClick={() => (playing ? play(Math.min(items.length - 1, i + 1)) : setI(Math.min(items.length - 1, i + 1)))} disabled={i >= items.length - 1} aria-label="التالي">‹</button>
      </div>
      <div className="sk-opts">
        <label>مؤقت النوم
          <select value={left ?? 0} onChange={(e) => { const v = Number(e.target.value); setLeft(v || null); }}>
            <option value={0}>بلا مؤقت</option><option value={10}>١٠ دقائق</option><option value={15}>١٥ دقيقة</option><option value={30}>٣٠ دقيقة</option>
          </select></label>
        {left != null && <span>يتوقف بعد {arDigits(left)} د</span>}
        {!adhkar && <label>القارئ
          <select value={rec} onChange={(e) => { const v = Number(e.target.value); setRec(v); try { localStorage.setItem('noor.sakina.rec', String(v)); } catch { /* ignore */ } if (playing) stop(); }}>
            {AYAH_RECITERS.map((r) => <option key={r.i} value={r.i}>{r.name}</option>)}
          </select></label>}
      </div>
      {asleep && <p className="sk-sleep">تصبح على خير · المس الشاشة للعودة</p>}
    </div>
  );
}
