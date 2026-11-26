'use client';
import { useEffect, useState } from 'react';
import { RECITERS, ayahUrl } from '@/lib/reciters';
import { SURAHS } from '@/lib/quran';
import { play, type Track } from '@/lib/audio-store';
import { EA, eaUrl } from '@/lib/everyayah';
const AYAH_R = RECITERS.map((r, i) => ({ ...r, i })).filter((r) => r.mode === 'ayah');
const START = SURAHS.reduce<number[]>((a, s, i) => { a.push(i === 0 ? 1 : a[i - 1] + SURAHS[i - 1].ayas); return a; }, []);
const KEY = 'noor.duaReciter';
/** Reciter choice: a number = Islamic Network reciter index; "ea:<folder>" = EveryAyah. */
export type RecKey = number | string;
const valid = (v: RecKey) => (typeof v === 'number' ? AYAH_R.some((x) => x.i === v) : EA.some((e) => `ea:${e.f}` === v));
export function useReciter() {
  const [r, setR] = useState<RecKey>('ea:Alafasy_128kbps');
  useEffect(() => { try { const raw = localStorage.getItem(KEY); if (raw) { const v: RecKey = /^\d+$/.test(raw) ? Number(raw) : raw; if (valid(v)) setR(v); } } catch { /* ignore */ } }, []);
  return [r, (v: RecKey) => { setR(v); try { localStorage.setItem(KEY, String(v)); } catch { /* ignore */ } }] as const;
}
export const recName = (r: RecKey) => (typeof r === 'number' ? RECITERS[r].name : EA.find((e) => `ea:${e.f}` === r)?.name ?? '');
type A = { s: number; a: number; t: string; title: string };
const tracks = (list: A[], rec: RecKey): Track[] => list.map((x) => {
  if (typeof rec === 'number') return { id: `q${x.s}:${x.a}:${RECITERS[rec].id}`, src: ayahUrl(RECITERS[rec], START[x.s - 1] + x.a - 1), title: x.title, by: RECITERS[rec].name, source: 'تلاوة الآية كاملة — Islamic Network', text: x.t, page: `/quran/${x.s}#a${x.a}` };
  const e = EA.find((y) => `ea:${y.f}` === rec)!;
  return { id: `q${x.s}:${x.a}:ea-${e.f}`, src: eaUrl(e, x.s, x.a), title: x.title, by: e.name, source: 'تلاوة الآية كاملة — EveryAyah.com (بث من موقعهم)', text: x.t, page: `/quran/${x.s}#a${x.a}` };
});
/** Reciter picker + "play all" for a list of Quranic duas (each ayah recited in full, never cut). */
export function DuaReciterBar({ all }: { all: A[] }) {
  const [rec, setRec] = useReciter();
  return (
    <div className="row" style={{ alignItems: 'end' }}>
      <div className="field" style={{ flex: '0 1 260px' }}><label htmlFor="dua-rec">القارئ</label><select id="dua-rec" value={String(rec)} onChange={(e) => setRec(/^\d+$/.test(e.target.value) ? Number(e.target.value) : e.target.value)}><optgroup label="EveryAyah">{EA.map((r) => <option key={r.f} value={`ea:${r.f}`}>{r.name}</option>)}</optgroup><optgroup label="Islamic Network">{AYAH_R.map((r) => <option key={r.i} value={r.i}>{r.name}</option>)}</optgroup></select></div>
      <button type="button" className="btn" onClick={() => play(tracks(all, rec))}>▶ شغّل الكل ({all.length.toLocaleString('ar-EG')} آية)</button>
    </div>
  );
}
export function DuaAyahPlay({ list }: { list: A[] }) {
  const [rec] = useReciter();
  return <button type="button" className="btn ghost small" onClick={() => play(tracks(list, rec))}>▶ استمع{list.length > 1 ? ` (${list.length.toLocaleString('ar-EG')} آيات)` : ''}</button>;
}
