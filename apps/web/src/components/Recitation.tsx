'use client';
import { useEffect, useRef, useState } from 'react';

/** Streamed directly from Islamic Network (Al Quran Cloud); nothing is copied to our server. */
const RECITERS = [
  { id: 'ar.alafasy', name: 'مشاري راشد العفاسي' },
  { id: 'ar.abdulbasitmurattal', name: 'عبد الباسط عبد الصمد (مرتّل)' },
  { id: 'ar.abdulbasitmujawwad', name: 'عبد الباسط عبد الصمد (مجوّد)' },
];
const KEY = 'noor.reciter';

export default function Recitation({ surah, surahName }: { surah: number; surahName: string }) {
  const [reciter, setReciter] = useState(RECITERS[0].id);
  const [error, setError] = useState(false);
  const ref = useRef<HTMLAudioElement>(null);
  useEffect(() => { try { const r = localStorage.getItem(KEY); if (r && RECITERS.some((x) => x.id === r)) setReciter(r); } catch { /* ignore */ } }, []);
  const name = RECITERS.find((r) => r.id === reciter)!.name;
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: `سورة ${surahName}`, artist: name, album: 'القرآن الكريم — نور لأمي' });
  }, [surahName, name]);
  return (
    <section className="card recitation" aria-label="الاستماع إلى السورة">
      <div className="row" style={{ marginTop: 0 }}>
        <div className="field"><label htmlFor="reciter">القارئ</label>
          <select id="reciter" value={reciter} onChange={(e) => { setError(false); setReciter(e.target.value); try { localStorage.setItem(KEY, e.target.value); } catch { /* ignore */ } }}>
            {RECITERS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select></div>
      </div>
      <audio ref={ref} key={reciter} controls preload="none" style={{ width: '100%', marginTop: 12 }} onError={() => setError(true)}
        src={`https://cdn.islamic.network/quran/audio-surah/128/${reciter}/${surah}.mp3`} />
      {error && <p className="note" role="alert">تعذّر تحميل التلاوة من المصدر الآن. جرّب قارئًا آخر أو أعد المحاولة لاحقًا.</p>}
      <p className="note">التلاوة بصوت {name}، تُبث مباشرة من Islamic Network (alquran.cloud). حقوق التلاوة لأصحابها.</p>
    </section>
  );
}
