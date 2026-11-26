'use client';
import { useEffect, useRef, useState } from 'react';

import { RECITERS, type Rec } from '@/lib/reciters';
const KEY = 'noor.reciter';
const ayahUrl = (r: Rec, global: number) => `https://cdn.islamic.network/quran/audio/${r.br}/${r.id}/${global}.mp3`;
type Ext = { id: string; name: string; en: string; kind: string; server: string };
const arNum = (n: number) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

const L = {
  ar: { aria: 'الاستماع إلى السورة', reciter: 'القارئ', full: 'السورة كاملة', follows: 'السورة كاملة مع إبراز الآية المتلوّة', more: 'كل القرّاء — السورة كاملة', search: 'ابحث عن قارئ', searchPh: 'اكتب الاسم', byAyah: 'آية بآية (مع تتبّع الآية)', prev: 'السابقة', next: 'التالية', pause: 'إيقاف مؤقت', resume: 'متابعة', play: 'تشغيل', pos: (c: number, n: number) => `الآية ${arNum(c)} من ${arNum(n)}`, follow: 'تتبّع الآية', err: 'تعذّر تحميل التلاوة من المصدر الآن. جرّب قارئًا آخر أو أعد المحاولة لاحقًا.', note: (r: string) => `التلاوة بصوت ${r}، تُبث مباشرة من Islamic Network (alquran.cloud). حقوق التلاوة لأصحابها.`, album: 'القرآن الكريم — نور لأمي', title: (s: string) => `سورة ${s}` },
  en: { aria: 'Listen to the surah', reciter: 'Reciter', full: 'Full surah', follows: 'Full surah, highlighting the ayah being recited', more: 'All reciters — full surah', search: 'Find a reciter', searchPh: 'Type a name', byAyah: 'Ayah by ayah (follows the text)', prev: 'Previous', next: 'Next', pause: 'Pause', resume: 'Resume', play: 'Play', pos: (c: number, n: number) => `Ayah ${c} of ${n}`, follow: 'Follow ayah', err: 'Could not load the recitation from its source. Try another reciter or try again later.', note: (r: string) => `Recited by ${r}, streamed directly from Islamic Network (alquran.cloud). Recitation rights belong to their owners.`, album: 'The Holy Quran — Noor Li Ummi', title: (s: string) => `Surah ${s}` },
};

export default function Recitation({ surah, surahName, start, count, lang = 'ar' }: { surah: number; surahName: string; start: number; count: number; lang?: 'ar' | 'en' }) {
  const t = L[lang];
  const [rid, setRid] = useState(RECITERS[0].id);
  const [ext, setExt] = useState<Ext[]>([]); const [q, setQ] = useState('');
  const [error, setError] = useState(false);
  const [cur, setCur] = useState(1); // ayah-mode position
  const [playing, setPlaying] = useState(false);
  const [follow, setFollow] = useState(true);
  const player = useRef<HTMLAudioElement | null>(null);
  const preload = useRef<HTMLAudioElement | null>(null);
  const x = rid.startsWith('mq:') ? ext.find((e) => e.id === rid) : undefined;
  // An MP3Quran reciter plays as one file per surah; until the list has loaded, fall back to the first reciter.
  const r: Rec = x ? { id: x.id, name: x.name, en: x.en, mode: 'surah', br: 0 } : (RECITERS.find((y) => y.id === rid) ?? RECITERS[0]);
  const rname = (y: { name: string; en: string }) => (lang === 'en' ? y.en : y.name);
  const fold = (v: string) => v.toLowerCase().replace(/[أإآ]/g, 'ا').replace(/[\u064B-\u0652]/g, '');
  const shown = q.trim() ? ext.filter((e) => fold(`${e.name} ${e.en}`).includes(fold(q.trim()))) : ext;

  useEffect(() => {
    let saved = ''; try { saved = localStorage.getItem(KEY) ?? ''; } catch { /* ignore */ }
    if (saved && RECITERS.some((y) => y.id === saved)) setRid(saved);
    fetch('/api/reciters').then((res) => res.json()).then((j: { reciters: Ext[] }) => { setExt(j.reciters ?? []); if (saved.startsWith('mq:') && j.reciters?.some((e) => e.id === saved)) setRid(saved); }).catch(() => undefined);
  }, []);
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: t.title(surahName), artist: rname(r), album: t.album });
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
    <section className={`card recitation${playing ? ' is-playing' : ''}`} aria-label={t.aria}>
      <div className="row" style={{ marginTop: 0 }}>
        <div className="field"><label htmlFor="reciter">{t.reciter}</label>
          <select id="reciter" value={rid} onChange={(e) => choose(e.target.value)}>
            <optgroup label={t.follows}>{RECITERS.filter((y) => y.mode === 'ayah').map((y) => <option key={y.id} value={y.id}>{rname(y)}</option>)}</optgroup>
            <optgroup label={t.full}>{RECITERS.filter((y) => y.mode === 'surah').map((y) => <option key={y.id} value={y.id}>{rname(y)}</option>)}</optgroup>
            {ext.length > 0 && <optgroup label={`${t.more} (${lang === 'ar' ? arNum(shown.length) : shown.length})`}>{shown.map((e) => <option key={e.id} value={e.id}>{rname(e)}{e.kind && e.kind !== 'مرتل' ? ` — ${e.kind}` : ''}</option>)}{x && !shown.includes(x) && <option value={x.id}>{rname(x)}</option>}</optgroup>}
          </select></div>
        {ext.length > 0 && <div className="field" style={{ flex: '0 1 200px' }}><label htmlFor="reciter-q">{t.search}</label><input id="reciter-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.searchPh} /></div>}
      </div>
      {r.mode === 'surah' ? (
        <audio key={rid} controls preload="metadata" style={{ width: '100%', marginTop: 12 }} onError={() => setError(true)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
          src={x ? `${x.server}${String(surah).padStart(3, '0')}.mp3` : `https://cdn.islamic.network/quran/audio-surah/${r.br}/${r.id}/${surah}.mp3`} />
      ) : (
        <div className="row" style={{ marginTop: 12, alignItems: 'center' }}>
          <button type="button" className="btn ghost" onClick={() => cur > 1 && playAyah(cur - 1)} disabled={cur <= 1} aria-label={t.prev}>{t.prev}</button>
          <button type="button" className="btn" onClick={toggle}>{playing ? t.pause : cur > 1 ? t.resume : t.play}</button>
          <button type="button" className="btn ghost" onClick={() => cur < count && playAyah(cur + 1)} disabled={cur >= count} aria-label={t.next}>{t.next}</button>
          <span role="status">{t.pos(cur, count)}</span>
          <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" checked={follow} onChange={(e) => setFollow(e.target.checked)} /> {t.follow}</label>
        </div>
      )}
      {error && <p className="note" role="alert">{t.err}</p>}
      {lang === 'ar' && <p className="note" style={{ marginBottom: 0 }}>للحفظ والتلقين آية بآية مع التكرار: <a href={`/talqeen?s=${surah}`}>صفحة التلقين</a>.</p>}
    </section>
  );
}
