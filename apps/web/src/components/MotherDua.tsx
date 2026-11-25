'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Dua for the deceased (Hisn al-Muslim, from Sahih Muslim) with its OpenDua recording (CC BY 4.0).
 * Plays when the home page opens; browsers block sound until the first touch, so it then starts on the first tap.
 * Text shown exactly as in the source.
 */
const KEY = 'noor.duaAuto';
export default function MotherDua({ text, reference, audio }: { text: string; reference: string; audio: string }) {
  const el = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    let on = true; try { on = localStorage.getItem(KEY) !== '0'; } catch { /* ignore */ }
    setAuto(on);
    const a = (el.current = new Audio(audio)); a.preload = 'auto';
    a.onplay = () => setPlaying(true); a.onpause = () => setPlaying(false); a.onended = () => setPlaying(false);
    let done = false;
    try { done = sessionStorage.getItem('noor.duaPlayed') === '1'; } catch { /* ignore */ }
    if (!on || done) return () => a.pause();
    const mark = () => { done = true; try { sessionStorage.setItem('noor.duaPlayed', '1'); } catch { /* ignore */ } };
    const onTap = () => { if (done) return; a.play().then(mark).catch(() => undefined); off(); };
    const off = () => { window.removeEventListener('pointerdown', onTap); window.removeEventListener('keydown', onTap); };
    a.play().then(mark).catch(() => { window.addEventListener('pointerdown', onTap, { once: true }); window.addEventListener('keydown', onTap, { once: true }); });
    return () => { off(); a.pause(); };
  }, [audio]);
  const toggle = () => { const a = el.current; if (!a) return; if (playing) a.pause(); else { a.currentTime = a.ended ? 0 : a.currentTime; void a.play(); } };
  const setAutoPref = (v: boolean) => { setAuto(v); try { localStorage.setItem(KEY, v ? '1' : '0'); } catch { /* ignore */ } };
  return (
    <div className="mother-dua">
      <p className="eyebrow">دعاء للميت</p>
      <p className="dua-text" lang="ar">{text}</p>
      <p className="dua-ref">{reference} — حصن المسلم. التسجيل الصوتي: OpenDua (CC BY 4.0).</p>
      <div className="dua-controls">
        <button type="button" className="btn light small" onClick={toggle} aria-pressed={playing}>
          <svg viewBox="0 0 24 24" aria-hidden="true" className="ico" style={{ fill: 'currentColor', stroke: 'none' }}>{playing ? <path d="M8 6h3v12H8zM13 6h3v12h-3z" /> : <path d="M8 5.5v13l10-6.5Z" />}</svg>
          {playing ? 'إيقاف الدعاء' : 'استمع للدعاء'}
        </button>
        <label className="dua-auto"><input type="checkbox" checked={auto} onChange={(e) => setAutoPref(e.target.checked)} /> تشغيل عند فتح الموقع</label>
      </div>
    </div>
  );
}
