'use client';
import { useEffect, useState } from 'react';
import { RECITERS, ayahUrl } from '@/lib/reciters';
import { SURAHS } from '@/lib/quran';
import { play, type Track } from '@/lib/audio-store';
const AYAH_R = RECITERS.map((r, i) => ({ ...r, i })).filter((r) => r.mode === 'ayah');
const START = SURAHS.reduce<number[]>((a, s, i) => { a.push(i === 0 ? 1 : a[i - 1] + SURAHS[i - 1].ayas); return a; }, []);
const KEY = 'noor.duaReciter';
export function useReciter() {
  const [r, setR] = useState(AYAH_R.find((x) => x.id === 'ar.alafasy')?.i ?? AYAH_R[0].i);
  useEffect(() => { try { const v = Number(localStorage.getItem(KEY)); if (AYAH_R.some((x) => x.i === v)) setR(v); } catch { /* ignore */ } }, []);
  return [r, (v: number) => { setR(v); try { localStorage.setItem(KEY, String(v)); } catch { /* ignore */ } }] as const;
}
type A = { s: number; a: number; t: string; title: string };
const tracks = (list: A[], rec: number): Track[] => list.map((x) => ({ id: `q${x.s}:${x.a}:${RECITERS[rec].id}`, src: ayahUrl(RECITERS[rec], START[x.s - 1] + x.a - 1), title: x.title, by: RECITERS[rec].name, source: 'تلاوة الآية كاملة — Islamic Network', text: x.t, page: `/quran/${x.s}#a${x.a}` }));
/** Reciter picker + "play all" for a list of Quranic duas (each ayah recited in full, never cut). */
export function DuaReciterBar({ all }: { all: A[] }) {
  const [rec, setRec] = useReciter();
  return (
    <div className="row" style={{ alignItems: 'end' }}>
      <div className="field" style={{ flex: '0 1 260px' }}><label htmlFor="dua-rec">القارئ</label><select id="dua-rec" value={rec} onChange={(e) => setRec(Number(e.target.value))}>{AYAH_R.map((r) => <option key={r.i} value={r.i}>{r.name}</option>)}</select></div>
      <button type="button" className="btn" onClick={() => play(tracks(all, rec))}>▶ شغّل الكل ({all.length.toLocaleString('ar-EG')} آية)</button>
    </div>
  );
}
export function DuaAyahPlay({ list }: { list: A[] }) {
  const [rec] = useReciter();
  return <button type="button" className="btn ghost small" onClick={() => play(tracks(list, rec))}>▶ استمع{list.length > 1 ? ` (${list.length.toLocaleString('ar-EG')} آيات)` : ''}</button>;
}
