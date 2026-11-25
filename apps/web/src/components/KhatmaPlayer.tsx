'use client';
import { useEffect, useRef, useState } from 'react';
import { RECITERS, ayahUrl, surahUrl } from '@/lib/reciters';
import { SURAHS, arDigits } from '@/lib/quran';

/**
 * The whole mushaf by one reciter, surah after surah, from where the listener stopped (saved on the device).
 * Streams from Islamic Network; nothing is stored on our server.
 */
const START = SURAHS.reduce<number[]>((a, s, i) => { a.push(i === 0 ? 1 : a[i - 1] + SURAHS[i - 1].ayas); return a; }, []);
const TXT = {
  ar: { aria: 'ختمة كاملة', title: (n: string) => `القرآن كاملًا بصوت ${n}`, now: (n: string, a: number | null) => `سورة ${n}${a ? ` · الآية ${arDigits(a)}` : ''}`, prog: 'التقدم في الختمة', prev: 'السورة السابقة', pause: 'إيقاف مؤقت', resume: 'أكمل الاستماع', start: 'ابدأ الختمة', next: 'السورة التالية', from: 'ابدأ من سورة', err: 'تعذّر تشغيل التلاوة الآن؛ تأكد من الاتصال بالإنترنت ثم أعد المحاولة.', saved: 'يُحفظ موضع استماعك على جهازك.' },
  en: { aria: 'Whole-Quran recitation', title: (n: string) => `The whole Quran recited by ${n}`, now: (n: string, a: number | null) => `Surah ${n}${a ? ` · ayah ${a}` : ''}`, prog: 'Progress', prev: 'Previous surah', pause: 'Pause', resume: 'Continue listening', start: 'Start', next: 'Next surah', from: 'Start from surah', err: 'Could not play the recitation; check your connection and try again.', saved: 'Your listening position is saved on your device.' },
};
export default function KhatmaPlayer({ reciter, pageKey, lang = 'ar' }: { reciter: number; pageKey: string; lang?: 'ar' | 'en' }) {
  const t = TXT[lang];
  const r = RECITERS[reciter] ?? RECITERS[0];
  const KEY = `noor.khatma.${pageKey}.${r.id}`;
  const [surah, setSurah] = useState(1);
  const [ayah, setAyah] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [err, setErr] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  useEffect(() => { try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); if (v?.s >= 1 && v.s <= 114) { setSurah(v.s); setAyah(v.a || 1); } } catch { /* ignore */ } return () => { audio.current?.pause(); }; }, [KEY]);
  const save = (s: number, a: number) => { try { localStorage.setItem(KEY, JSON.stringify({ s, a })); } catch { /* ignore */ } };
  const play = (s: number, a: number) => {
    const el = (audio.current ??= new Audio());
    setErr(false); setSurah(s); setAyah(a); save(s, a);
    el.src = r.mode === 'surah' ? surahUrl(r, s) : ayahUrl(r, START[s - 1] + a - 1);
    el.onended = () => {
      if (r.mode === 'ayah' && a < SURAHS[s - 1].ayas) play(s, a + 1);
      else if (s < 114) play(s + 1, 1);
      else { setPlaying(false); save(1, 1); }
    };
    el.onerror = () => { setErr(true); setPlaying(false); };
    el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };
  const toggle = () => {
    const el = audio.current;
    if (playing && el) { el.pause(); setPlaying(false); return; }
    if (el && el.src && el.currentTime > 0 && !el.ended) { void el.play().then(() => setPlaying(true)); return; }
    play(surah, ayah);
  };
  const m = SURAHS[surah - 1];
  const done = Math.round(((START[surah - 1] - 1 + (r.mode === 'ayah' ? ayah - 1 : 0)) / 6236) * 100);
  return (
    <section className={`card khatma${playing ? ' is-playing' : ''}`} aria-label={t.aria}>
      <p className="eyebrow">{t.aria}</p>
      <h2>{t.title(lang === 'en' && r.en ? r.en : r.name)}</h2>
      <p className="khatma-now">{t.now(lang === 'en' ? m.tname : m.name, r.mode === 'ayah' ? ayah : null)}</p>
      <div className="khatma-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={done} aria-label={t.prog}><span style={{ width: `${done}%` }} /></div>
      <div className="row">
        <button type="button" className="btn ghost" onClick={() => surah > 1 && play(surah - 1, 1)} disabled={surah <= 1}>{t.prev}</button>
        <button type="button" className="btn" onClick={toggle}>{playing ? t.pause : surah > 1 || ayah > 1 ? t.resume : t.start}</button>
        <button type="button" className="btn ghost" onClick={() => surah < 114 && play(surah + 1, 1)} disabled={surah >= 114}>{t.next}</button>
      </div>
      <div className="row">
        <div className="field"><label htmlFor="ks">{t.from}</label>
          <select id="ks" value={surah} onChange={(e) => { const s = Number(e.target.value); if (playing) play(s, 1); else { setSurah(s); setAyah(1); save(s, 1); } }}>
            {SURAHS.map((s) => <option key={s.index} value={s.index}>{lang === 'en' ? `${s.index}. ${s.tname}` : `${arDigits(s.index)}. ${s.name}`}</option>)}
          </select></div>
      </div>
      {err && <p className="note" role="alert">{t.err}</p>}
      <p className="note">{t.saved}</p>
    </section>
  );
}
