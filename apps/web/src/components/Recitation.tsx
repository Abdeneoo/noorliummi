'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { RECITERS } from '@/lib/reciters';
import { AUDIO_CACHE, ayahUrl, buildPersons, fileUrl, hasSurah, type ExtReciter, type Version } from '@/lib/reciter-list';
const KEY = 'noor.reciter.v2'; // { p: person key, v: version id }
const arNum = (n: number) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);
const fold = (v: string) => v.toLowerCase().replace(/[أإآ]/g, 'ا').replace(/[\u064B-\u0652]/g, '').replace(/\s+/g, '');

const L = {
  ar: { aria: 'الاستماع إلى السورة', reciter: 'القارئ', full: 'السورة كاملة', follows: 'السورة كاملة مع إبراز الآية المتلوّة', more: 'كل القرّاء — السورة كاملة', search: 'ابحث عن قارئ', searchPh: 'اكتب الاسم', byAyah: 'آية بآية (مع تتبّع الآية)', prev: 'السابقة', next: 'التالية', pause: 'إيقاف مؤقت', resume: 'متابعة', play: 'تشغيل', pos: (c: number, n: number) => `الآية ${arNum(c)} من ${arNum(n)}`, follow: 'تتبّع الآية', err: 'تعذّر تحميل التلاوة من المصدر الآن. جرّب قارئًا آخر أو أعد المحاولة لاحقًا.', note: (r: string) => `التلاوة بصوت ${r}، تُبث مباشرة من Islamic Network (alquran.cloud). حقوق التلاوة لأصحابها.`, album: 'القرآن الكريم — نور لأمي', title: (s: string) => `سورة ${s}` },
  en: { aria: 'Listen to the surah', reciter: 'Reciter', full: 'Full surah', follows: 'Full surah, highlighting the ayah being recited', more: 'All reciters — full surah', search: 'Find a reciter', searchPh: 'Type a name', byAyah: 'Ayah by ayah (follows the text)', prev: 'Previous', next: 'Next', pause: 'Pause', resume: 'Resume', play: 'Play', pos: (c: number, n: number) => `Ayah ${c} of ${n}`, follow: 'Follow ayah', err: 'Could not load the recitation from its source. Try another reciter or try again later.', note: (r: string) => `Recited by ${r}, streamed directly from Islamic Network (alquran.cloud). Recitation rights belong to their owners.`, album: 'The Holy Quran — Noor Li Ummi', title: (s: string) => `Surah ${s}` },
};

const X = {
  ar: { version: 'الصورة (الرواية ونوع التلاوة)', search: 'ابحث عن قارئ', searchPh: 'اكتب الاسم', count: (n: number) => `${arNum(n)} قارئًا`, none: 'هذه السورة غير موجودة في هذه الصورة؛ اختر صورة أخرى.', notHafs: 'تنبيه: هذه رواية غير حفص، والنص المعروض في الصفحة برواية حفص، فقد تختلف بعض الكلمات عمّا تسمع.', save: 'احفظ السورة على جهازي', saving: 'جارٍ الحفظ…', saved: 'محفوظة على جهازك ✓ — احذفها', saveFail: 'تعذّر الحفظ (المساحة أو الاتصال).', saveNote: 'نسخة شخصية على جهازك للاستماع دون إنترنت، لا تُرفع إلى أي مكان.', talqeen: 'للحفظ والتلقين آية بآية مع التكرار:', talqeenLink: 'صفحة التلقين' },
  en: { version: 'Recording (riwaya and style)', search: 'Find a reciter', searchPh: 'Type a name', count: (n: number) => `${n} reciters`, none: 'This surah is not in this recording; choose another.', notHafs: 'Note: this is not the Hafs riwaya; the text on the page is Hafs, so some words may differ from what you hear.', save: 'Save this surah on my device', saving: 'Saving…', saved: 'Saved on your device ✓ — remove', saveFail: 'Could not save (storage or connection).', saveNote: 'A personal copy on your device for offline listening; it is not uploaded anywhere.', talqeen: '', talqeenLink: '' },
};

export default function Recitation({ surah, surahName, start, count, lang = 'ar' }: { surah: number; surahName: string; start: number; count: number; lang?: 'ar' | 'en' }) {
  const t = L[lang]; const x = X[lang];
  const [ext, setExt] = useState<ExtReciter[]>([]); const persons = useMemo(() => buildPersons(ext), [ext]);
  const [pk, setPk] = useState(''); const [vid, setVid] = useState(RECITERS[0].id); const [q, setQ] = useState('');
  const [error, setError] = useState(false); const [cur, setCur] = useState(1); const [playing, setPlaying] = useState(false); const [follow, setFollow] = useState(true);
  const [saved, setSaved] = useState(false); const [saving, setSaving] = useState(false); const [saveErr, setSaveErr] = useState(false);
  const player = useRef<HTMLAudioElement | null>(null); const preload = useRef<HTMLAudioElement | null>(null);

  const person = persons.find((p) => p.key === pk) ?? persons.find((p) => p.versions.some((v) => v.id === vid)) ?? persons[0];
  const v: Version | undefined = person?.versions.find((y) => y.id === vid) ?? person?.versions[0];
  const name = (y: { name: string; en: string }) => (lang === 'en' ? y.en : y.name);
  const shown = q.trim() ? persons.filter((p) => fold(`${p.name}${p.en}`).includes(fold(q))) : persons;
  const url = v && v.kind === 'surah' && hasSurah(v, surah) ? fileUrl(v, surah) : '';

  useEffect(() => {
    try { const sv = JSON.parse(localStorage.getItem(KEY) || 'null'); if (sv?.v) { setVid(sv.v); setPk(sv.p ?? ''); } else { const old = localStorage.getItem('noor.reciter'); if (old && RECITERS.some((r) => r.id === old)) setVid(old); } } catch { /* ignore */ }
    fetch('/api/reciters').then((res) => res.json()).then((j: { reciters: ExtReciter[] }) => setExt(j.reciters ?? [])).catch(() => undefined);
  }, []);
  useEffect(() => {
    if (!('mediaSession' in navigator) || !person) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: t.title(surahName), artist: name(person), album: t.album });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surahName, person?.key]);
  useEffect(() => { setSaved(false); setSaveErr(false); if (!url || !('caches' in window)) return; caches.open(AUDIO_CACHE).then((c) => c.match(url)).then((m) => setSaved(!!m)).catch(() => undefined); }, [url]);

  // Highlight (and optionally follow) the ayah being recited in ayah mode.
  useEffect(() => {
    document.querySelectorAll('.ayat .reciting').forEach((e) => e.classList.remove('reciting'));
    if (v?.kind !== 'ayah' || !playing) return;
    const el = document.getElementById(`a${cur}`); el?.classList.add('reciting');
    if (follow) el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [cur, playing, follow, v?.kind]);
  useEffect(() => () => { player.current?.pause(); document.querySelectorAll('.ayat .reciting').forEach((e) => e.classList.remove('reciting')); }, []);

  const [rate, setRate] = useState(1);
  useEffect(() => { try { const r = Number(localStorage.getItem('noor.rate')); if ([0.75, 0.85, 1, 1.25].includes(r)) setRate(r); } catch { /* ignore */ } }, []);
  const surahAudio = useRef<HTMLAudioElement | null>(null);
  const changeRate = (r: number) => { setRate(r); if (player.current) player.current.playbackRate = r; if (surahAudio.current) surahAudio.current.playbackRate = r; try { localStorage.setItem('noor.rate', String(r)); } catch { /* ignore */ } };
  // Keyboard on a computer: Space plays/pauses, arrows move between ayat (ayah mode), F opens Sakina mode. Ignored while typing.
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement; if (e.ctrlKey || e.metaKey || e.altKey || el.closest('input,textarea,select,[contenteditable=true]')) return;
      if (e.key === ' ') { e.preventDefault(); if (v?.kind === 'surah') { const a = surahAudio.current; if (a) { if (a.paused) void a.play(); else a.pause(); } } else toggleRef.current(); }
      else if (v?.kind !== 'surah' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { const fwd = (e.key === 'ArrowLeft') === (document.dir !== 'ltr'); const n = fwd ? cur + 1 : cur - 1; if (n >= 1 && n <= count) { e.preventDefault(); playAyah(n); } }
      else if (e.key === 'f' || e.key === 'F') { location.href = `/sakina?s=${surah}`; }
    };
    document.addEventListener('keydown', on); return () => document.removeEventListener('keydown', on);
  });
  const toggleRef = useRef<() => void>(() => undefined);
  const playAyah = (n: number) => {
    if (!v?.rec) return; if (!player.current) player.current = new Audio(); const a = player.current;
    a.onended = () => { if (n < count) playAyah(n + 1); else { setPlaying(false); setCur(1); } };
    a.onerror = () => { setError(true); setPlaying(false); };
    a.src = ayahUrl(v.rec, start + n - 1); setCur(n); setError(false); a.playbackRate = rate;
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    if (n < count) { preload.current ??= new Audio(); preload.current.preload = 'auto'; preload.current.src = ayahUrl(v.rec, start + n); }
  };
  const toggle = () => {
    const a = player.current;
    if (playing && a) { a.pause(); setPlaying(false); return; }
    if (a && a.src && !a.ended && a.currentTime > 0) { a.play().then(() => setPlaying(true)).catch(() => undefined); return; }
    playAyah(cur);
  };
  toggleRef.current = toggle;
  const choose = (p: string, id: string) => {
    player.current?.pause(); player.current = null; setPlaying(false); setError(false); setCur(1); setPk(p); setVid(id);
    try { localStorage.setItem(KEY, JSON.stringify({ p, v: id })); } catch { /* ignore */ }
  };
  const pickPerson = (k: string) => { const p = persons.find((y) => y.key === k); if (!p) return; const best = p.versions.find((y) => y.hafs && y.kind === 'surah' && hasSurah(y, surah)) ?? p.versions.find((y) => hasSurah(y, surah)) ?? p.versions[0]; choose(k, best.id); };
  const save = async () => {
    if (!url || !('caches' in window)) return; const c = await caches.open(AUDIO_CACHE);
    if (saved) { await c.delete(url); setSaved(false); return; }
    setSaving(true); setSaveErr(false);
    try {
      // MP3Quran allows cross-origin reads; Islamic Network does not, so its file is kept as an opaque copy.
      let res = await fetch(url, { mode: 'cors' }).catch(() => null); if (!res || !res.ok) res = await fetch(url, { mode: 'no-cors' });
      if (!res.ok && res.type !== 'opaque') throw new Error('fetch'); await c.put(url, res); setSaved(true); await navigator.storage?.persist?.();
    } catch { setSaveErr(true); } finally { setSaving(false); }
  };

  return (
    <section className={`card recitation${playing ? ' is-playing' : ''}`} aria-label={t.aria}>
      <div className="row" style={{ marginTop: 0 }}>
        <div className="field" style={{ flex: '0 1 180px' }}><label htmlFor="reciter-q">{x.search}</label><input id="reciter-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={x.searchPh} /></div>
        <div className="field"><label htmlFor="reciter">{t.reciter} <small className="note">({x.count(shown.length)})</small></label>
          <select id="reciter" value={person?.key ?? ''} onChange={(e) => pickPerson(e.target.value)}>
            {person && !shown.includes(person) && <option value={person.key}>{name(person)}</option>}
            {shown.map((p) => <option key={p.key} value={p.key}>{name(p)}</option>)}
          </select></div>
        <div className="field"><label htmlFor="reciter-v">{x.version}</label>
          <select id="reciter-v" value={v?.id ?? ''} onChange={(e) => person && choose(person.key, e.target.value)}>
            {person?.versions.map((y) => <option key={y.id} value={y.id} disabled={!hasSurah(y, surah)}>{lang === 'en' ? y.en : y.label}{y.list ? (lang === 'en' ? ' (partial)' : ' (غير كامل)') : ''}</option>)}
          </select></div>
      </div>
      {v && !v.hafs && <p className="note" role="note">{x.notHafs}</p>}
      {v?.kind === 'surah' ? (url ? (<>
        <audio key={url} ref={surahAudio} controls preload="metadata" style={{ width: '100%', marginTop: 12 }} onError={() => setError(true)} onLoadedMetadata={(e) => { e.currentTarget.playbackRate = rate; }} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} src={url} />
        <div className="row"><button type="button" className={saved ? 'btn ghost small' : 'btn small'} onClick={save} disabled={saving}>{saving ? x.saving : saved ? x.saved : x.save}</button><span className="note" style={{ margin: 0 }}>{saveErr ? x.saveFail : x.saveNote}</span></div>
      </>) : <p className="note" role="alert">{x.none}</p>) : (
        <div className="row" style={{ marginTop: 12, alignItems: 'center' }}>
          <button type="button" className="btn ghost" onClick={() => cur > 1 && playAyah(cur - 1)} disabled={cur <= 1} aria-label={t.prev}>{t.prev}</button>
          <button type="button" className="btn" onClick={toggle}>{playing ? t.pause : cur > 1 ? t.resume : t.play}</button>
          <button type="button" className="btn ghost" onClick={() => cur < count && playAyah(cur + 1)} disabled={cur >= count} aria-label={t.next}>{t.next}</button>
          <span role="status">{t.pos(cur, count)}</span>
          <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" checked={follow} onChange={(e) => setFollow(e.target.checked)} /> {t.follow}</label>
        </div>
      )}
      <div className="row" style={{ alignItems: 'center' }}><label htmlFor="rec-rate" className="note" style={{ margin: 0 }}>{lang === 'en' ? 'Speed' : 'سرعة التلاوة'}</label>
        <select id="rec-rate" value={rate} onChange={(e) => changeRate(Number(e.target.value))} style={{ width: 'auto' }}>{[0.75, 0.85, 1, 1.25].map((r) => <option key={r} value={r}>{r === 1 ? (lang === 'en' ? 'Normal' : 'عادية') : `${r}×`}</option>)}</select>
        <span className="note kbd-hint" style={{ margin: 0 }}>{lang === 'en' ? 'Keyboard: Space play/pause · arrows next/previous ayah · F Sakina mode' : 'لوحة المفاتيح: المسافة تشغيل/إيقاف · الأسهم الآية التالية/السابقة · F وضع السكينة'}</span></div>
      {error && <p className="note" role="alert">{t.err}</p>}
      {lang === 'ar' && <p className="note" style={{ marginBottom: 0 }}>{x.talqeen} <a href={`/talqeen?s=${surah}`}>{x.talqeenLink}</a>.</p>}
    </section>
  );
}
