'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { RECITERS, ayahUrl } from '@/lib/reciters';
import { SURAHS, arDigits } from '@/lib/quran';
const AYAH_R = RECITERS.map((r, i) => ({ ...r, i })).filter((r) => r.mode === 'ayah');
const START = SURAHS.reduce<number[]>((a, s, i) => { a.push(i === 0 ? 1 : a[i - 1] + SURAHS[i - 1].ayas); return a; }, []);
/**
 * «التلقين»: ayah by ayah for memorising — the reciter reads an ayah, a silent gap lets you repeat it, each ayah is
 * repeated as many times as you choose, then the whole range can loop.
 */
export default function Talqeen({ initial = 1 }: { initial?: number }) {
  const [s, setS] = useState(initial); const [from, setFrom] = useState(1); const [to, setTo] = useState(Math.min(5, SURAHS[initial - 1].ayas));
  const [rec, setRec] = useState(AYAH_R.find((r) => r.id === 'ar.husary')?.i ?? AYAH_R[0].i); const [times, setTimes] = useState(3); const [gap, setGap] = useState(1); const [loop, setLoop] = useState(false); const [rate, setRate] = useState(1);
  const [text, setText] = useState<string[]>([]); const [cur, setCur] = useState(0); const [rep, setRep] = useState(0); const [state, setState] = useState<'idle' | 'play' | 'wait'>('idle');
  const audio = useRef<HTMLAudioElement | null>(null); const run = useRef(0); const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { import(`@/generated/surah/${s}.json`).then((m) => setText((m.default.ayat as { t: string }[]).map((a) => a.t))); }, [s]);
  useEffect(() => { try { const v = JSON.parse(localStorage.getItem('noor.talqeen') || 'null'); if (v) { if (AYAH_R.some((r) => r.i === v.rec)) setRec(v.rec); setTimes(v.times ?? 3); setGap(v.gap ?? 1); if ([0.75, 0.85, 1, 1.25].includes(v.rate)) setRate(v.rate); } } catch { /* ignore */ } return () => stop(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  const remember = (o: object) => { try { localStorage.setItem('noor.talqeen', JSON.stringify({ rec, times, gap, rate, ...o })); } catch { /* ignore */ } };
  const stop = () => { run.current++; audio.current?.pause(); if (timer.current) clearTimeout(timer.current); setState('idle'); };
  const step = (a: number, k: number, id: number) => {
    if (id !== run.current) return;
    const el = (audio.current ??= new Audio()); setCur(a); setRep(k); setState('play');
    el.src = ayahUrl(RECITERS[rec], START[s - 1] + a - 1);
    el.playbackRate = rate;
    el.onended = () => {
      if (id !== run.current) return;
      const next = () => { if (k < times) step(a, k + 1, id); else if (a < to) step(a + 1, 1, id); else if (loop) step(from, 1, id); else { setState('idle'); setCur(0); } };
      if (gap > 0) { setState('wait'); timer.current = setTimeout(next, Math.min(60000, Math.max(1500, (el.duration || 3) * 1000 * gap))); } else next();
    };
    el.onerror = () => { if (id === run.current) setState('idle'); };
    void el.play().catch(() => setState('idle'));
  };
  const start = () => { stop(); const id = ++run.current; step(from, 1, id); };
  const max = SURAHS[s - 1].ayas;
  return (
    <div className="talqeen">
      <section className="card">
        <div className="row" style={{ marginTop: 0 }}>
          <div className="field"><label htmlFor="tq-s">السورة</label><select id="tq-s" value={s} onChange={(e) => { stop(); const v = Number(e.target.value); setS(v); setFrom(1); setTo(Math.min(5, SURAHS[v - 1].ayas)); setCur(0); }}>{SURAHS.map((x) => <option key={x.index} value={x.index}>{arDigits(x.index)}. {x.name}</option>)}</select></div>
          <div className="field" style={{ flex: '0 1 90px' }}><label htmlFor="tq-f">من الآية</label><input id="tq-f" type="number" min={1} max={max} value={from} onChange={(e) => { const v = Math.max(1, Math.min(max, Number(e.target.value) || 1)); setFrom(v); if (to < v) setTo(v); }} /></div>
          <div className="field" style={{ flex: '0 1 90px' }}><label htmlFor="tq-t">إلى الآية</label><input id="tq-t" type="number" min={from} max={max} value={to} onChange={(e) => setTo(Math.max(from, Math.min(max, Number(e.target.value) || from)))} /></div>
        </div>
        <div className="row">
          <div className="field"><label htmlFor="tq-r">القارئ</label><select id="tq-r" value={rec} onChange={(e) => { stop(); const v = Number(e.target.value); setRec(v); remember({ rec: v }); }}>{AYAH_R.map((r) => <option key={r.i} value={r.i}>{r.name}</option>)}</select></div>
          <div className="field" style={{ flex: '0 1 130px' }}><label htmlFor="tq-n">تكرار كل آية</label><select id="tq-n" value={times} onChange={(e) => { const v = Number(e.target.value); setTimes(v); remember({ times: v }); }}>{[1, 2, 3, 5, 7, 10, 20].map((n) => <option key={n} value={n}>{arDigits(n)}</option>)}</select></div>
          <div className="field" style={{ flex: '0 1 200px' }}><label htmlFor="tq-g">مهلة لتردّد بعد القارئ</label><select id="tq-g" value={gap} onChange={(e) => { const v = Number(e.target.value); setGap(v); remember({ gap: v }); }}><option value={0}>بلا مهلة</option><option value={1}>بقدر طول الآية</option><option value={1.5}>مرة ونصف</option><option value={2}>ضعف طول الآية</option></select></div>
        </div>
        <div className="row"><div className="field" style={{ flex: '0 1 160px' }}><label htmlFor="tq-sp">سرعة التلاوة</label><select id="tq-sp" value={rate} onChange={(e) => { const v = Number(e.target.value); setRate(v); if (audio.current) audio.current.playbackRate = v; remember({ rate: v }); }}>{[0.75, 0.85, 1, 1.25].map((r) => <option key={r} value={r}>{r === 1 ? 'عادية' : `${r}×`}</option>)}</select></div></div>
        <label className="listed-opt"><input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} /> <span>أعد المقطع كله بعد انتهائه</span></label>
        <div className="row">{state === 'idle' ? <button type="button" className="btn" onClick={start}>ابدأ التلقين</button> : <button type="button" className="btn" onClick={stop}>أوقف</button>}
          <Link className="btn ghost" href="/hifz">جدول الحفظ والمراجعة</Link><Link className="btn ghost" href={`/quran/${s}`}>السورة في المصحف</Link></div>
      </section>
      <section className="card talqeen-now" aria-live="polite">
        {cur > 0 ? <>
          <p className="eyebrow">{state === 'wait' ? 'ردّد الآن' : 'استمع'} · الآية {arDigits(cur)} · المرة {arDigits(rep)} من {arDigits(times)}</p>
          <p className="ayat" lang="ar" dir="rtl" style={{ textAlign: 'center' }}>{text[cur - 1]} <span className="ayah-end">﴿{arDigits(cur)}﴾</span></p></>
          : <ol className="talqeen-list" start={from}>{text.slice(from - 1, to).map((t, i) => <li key={i} lang="ar">{t}</li>)}</ol>}
      </section>
      <p className="note">التلاوة تُبث من Islamic Network. التلقين عون على الحفظ، والأصل التلقي من معلم متقن.</p>
    </div>
  );
}
