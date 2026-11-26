'use client';
import { useState } from 'react';
import pages from '@/generated/pages.json';
/** Go to a mushaf page (1–604, Madinah mushaf numbering from Tanzil). */
export default function QuranPageJump() {
  const [p, setP] = useState('');
  const go = (e: React.FormEvent) => { e.preventDefault(); const n = Math.max(1, Math.min(604, Number(p) || 1)); const [s, a] = (pages as [number, number][])[n - 1]; location.href = `/quran/${s}#a${a}`; };
  return (
    <form onSubmit={go} className="row" style={{ alignItems: 'end' }}>
      <div className="field" style={{ flex: '0 1 160px' }}><label htmlFor="qp">الصفحة (١–٦٠٤)</label><input id="qp" type="number" min={1} max={604} inputMode="numeric" value={p} onChange={(e) => setP(e.target.value)} /></div>
      <button className="btn ghost">اذهب</button>
    </form>
  );
}
