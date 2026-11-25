'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Streamed directly from Islamic Network (cdn.islamic.network); nothing is copied to our server.
 * 'surah' = one file per surah; 'ayah' = one file per ayah, played in sequence (availability checked 2026-11-25).
 */
type Rec = { id: string; name: string; mode: 'surah' | 'ayah'; br: number };
const RECITERS: Rec[] = [
  { id: 'ar.alafasy', name: 'مشاري راشد العفاسي', mode: 'surah', br: 128 },
  { id: 'ar.abdulbasitmurattal', name: 'عبد الباسط عبد الصمد (مرتّل)', mode: 'surah', br: 128 },
  { id: 'ar.abdulbasitmujawwad', name: 'عبد الباسط عبد الصمد (مجوّد)', mode: 'surah', br: 128 },
  { id: 'ar.abdullahbasfar', name: 'عبد الله بصفر', mode: 'surah', br: 128 },
  { id: 'ar.husary', name: 'محمود خليل الحصري', mode: 'ayah', br: 128 },
  { id: 'ar.husarymujawwad', name: 'محمود خليل الحصري (مجوّد)', mode: 'ayah', br: 128 },
  { id: 'ar.minshawi', name: 'محمد صديق المنشاوي', mode: 'ayah', br: 128 },
  { id: 'ar.minshawimujawwad', name: 'محمد صديق المنشاوي (مجوّد)', mode: 'ayah', br: 64 },
  { id: 'ar.abdurrahmaansudais', name: 'عبد الرحمن السديس', mode: 'ayah', br: 192 },
  { id: 'ar.saoodshuraym', name: 'سعود الشريم', mode: 'ayah', br: 64 },
  { id: 'ar.mahermuaiqly', name: 'ماهر المعيقلي', mode: 'ayah', br: 128 },
  { id: 'ar.hudhaify', name: 'علي الحذيفي', mode: 'ayah', br: 128 },
  { id: 'ar.muhammadayyoub', name: 'محمد أيوب', mode: 'ayah', br: 128 },
  { id: 'ar.muhammadjibreel', name: 'محمد جبريل', mode: 'ayah', br: 128 },
  { id: 'ar.shaatree', name: 'أبو بكر الشاطري', mode: 'ayah', br: 128 },
  { id: 'ar.ahmedajamy', name: 'أحمد بن علي العجمي', mode: 'ayah', br: 128 },
  { id: 'ar.hanirifai', name: 'هاني الرفاعي', mode: 'ayah', br: 192 },
  { id: 'ar.abdulsamad', name: 'عبد الباسط عبد الصمد (آية بآية)', mode: 'ayah', br: 64 },
  { id: 'ar.aymanswoaid', name: 'أيمن سويد', mode: 'ayah', br: 64 },
  { id: 'ar.ibrahimakhbar', name: 'إبراهيم الأخضر', mode: 'ayah', br: 32 },
];
const KEY = 'noor.reciter';
const ayahUrl = (r: Rec, global: number) => `https://cdn.islamic.network/quran/audio/${r.br}/${r.id}/${global}.mp3`;
const arNum = (n: number) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

export default function Recitation({ surah, surahName, start, count }: { surah: number; surahName: string; start: number; count: number }) {
  const [rid, setRid] = useState(RECITERS[0].id);
  const [error, setError] = useState(false);
  const [cur, setCur] = useState(1); // ayah-mode position
  const [playing, setPlaying] = useState(false);
  const [follow, setFollow] = useState(true);
  const player = useRef<HTMLAudioElement | null>(null);
  const preload = useRef<HTMLAudioElement | null>(null);
  const r = RECITERS.find((x) => x.id === rid) ?? RECITERS[0];

  useEffect(() => { try { const v = localStorage.getItem(KEY); if (v && RECITERS.some((x) => x.id === v)) setRid(v); } catch { /* ignore */ } }, []);
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: `سورة ${surahName}`, artist: r.name, album: 'القرآن الكريم — نور لأمي' });
  }, [surahName, r.name]);

  // Highlight (and optionally follow) the ayah being recited in ayah mode.
  useEffect(() => {
    document.querySelectorAll('.ayat .reciting').forEach((e) => e.classList.remove('reciting'));
    if (r.mode !== 'ayah' || !playing) return;
    const el = document.getElementById(`a${cur}`);
    el?.classList.add('reciting');
    if (follow) el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [cur, playing, follow, r.mode]);
  useEffect(() => () => { player.current?.pause(); document.querySelectorAll('.ayat .reciting').forEach((e) => e.classList.remove('reciting')); }, []);

  const playAyah = (n: number) => {
    if (!player.current) player.current = new Audio();
    const a = player.current;
    a.onended = () => { if (n < count) playAyah(n + 1); else { setPlaying(false); setCur(1); } };
    a.onerror = () => { setError(true); setPlaying(false); };
    a.src = ayahUrl(r, start + n - 1);
    setCur(n); setError(false);
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    if (n < count) { preload.current ??= new Audio(); preload.current.preload = 'auto'; preload.current.src = ayahUrl(r, start + n); }
  };
  const toggle = () => {
    const a = player.current;
    if (playing && a) { a.pause(); setPlaying(false); return; }
    if (a && a.src && !a.ended && a.currentTime > 0) { a.play().then(() => setPlaying(true)).catch(() => undefined); return; }
    playAyah(cur);
  };
  const choose = (id: string) => {
    player.current?.pause(); player.current = null; setPlaying(false); setError(false); setCur(1); setRid(id);
    try { localStorage.setItem(KEY, id); } catch { /* ignore */ }
  };

  return (
    <section className="card recitation" aria-label="الاستماع إلى السورة">
      <div className="row" style={{ marginTop: 0 }}>
        <div className="field"><label htmlFor="reciter">القارئ</label>
          <select id="reciter" value={rid} onChange={(e) => choose(e.target.value)}>
            <optgroup label="السورة كاملة">{RECITERS.filter((x) => x.mode === 'surah').map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</optgroup>
            <optgroup label="آية بآية (مع تتبّع الآية)">{RECITERS.filter((x) => x.mode === 'ayah').map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</optgroup>
          </select></div>
      </div>
      {r.mode === 'surah' ? (
        <audio key={rid} controls preload="none" style={{ width: '100%', marginTop: 12 }} onError={() => setError(true)}
          src={`https://cdn.islamic.network/quran/audio-surah/${r.br}/${r.id}/${surah}.mp3`} />
      ) : (
        <div className="row" style={{ marginTop: 12, alignItems: 'center' }}>
          <button type="button" className="btn ghost" onClick={() => cur > 1 && playAyah(cur - 1)} disabled={cur <= 1} aria-label="الآية السابقة">السابقة</button>
          <button type="button" className="btn" onClick={toggle}>{playing ? 'إيقاف مؤقت' : cur > 1 ? 'متابعة' : 'تشغيل'}</button>
          <button type="button" className="btn ghost" onClick={() => cur < count && playAyah(cur + 1)} disabled={cur >= count} aria-label="الآية التالية">التالية</button>
          <span role="status">الآية {arNum(cur)} من {arNum(count)}</span>
          <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" checked={follow} onChange={(e) => setFollow(e.target.checked)} /> تتبّع الآية</label>
        </div>
      )}
      {error && <p className="note" role="alert">تعذّر تحميل التلاوة من المصدر الآن. جرّب قارئًا آخر أو أعد المحاولة لاحقًا.</p>}
      <p className="note">التلاوة بصوت {r.name}، تُبث مباشرة من Islamic Network (alquran.cloud). حقوق التلاوة لأصحابها.</p>
    </section>
  );
}
