'use client';
import { useEffect, useState } from 'react';

/** Animated wudu illustrations for children: original line drawings (hands, water, a faceless head, feet), in the order of
 *  'Uthman's narration (Sahih al-Bukhari 159) shown on the same page. Labels name the step only; the text is in the hadith. */
type Step = { k: string; t: string; n: number };
const STEPS: Step[] = [
  { k: 'hands', t: 'غسل الكفّين', n: 3 },
  { k: 'mouth', t: 'المضمضة والاستنشاق', n: 3 },
  { k: 'face', t: 'غسل الوجه', n: 3 },
  { k: 'arms', t: 'غسل اليدين إلى المرفقين', n: 3 },
  { k: 'head', t: 'مسح الرأس', n: 1 },
  { k: 'feet', t: 'غسل الرجلين إلى الكعبين', n: 3 },
];
const N = (n: number) => n.toLocaleString('ar-EG');

function Drops({ x, y }: { x: number; y: number }) {
  return <g className="wd-drops">{[0, 1, 2].map((i) => <path key={i} d={`M${x + i * 14 - 14} ${y} q4 7 0 11 q-4 -4 0 -11Z`} style={{ animationDelay: `${i * 0.35}s` }} />)}</g>;
}
function Art({ k }: { k: string }) {
  return (
    <svg viewBox="0 0 200 160" className={`wd-art wd-${k}`} aria-hidden="true">
      <path className="wd-tap" d="M70 18h48v10H96v10h-8V28H70Z" />
      {k === 'hands' && <><Drops x={92} y={44} /><g className="wd-rub"><path className="wd-skin" d="M58 118c0-18 10-30 26-32l18-2c6 0 8 6 3 9l-14 6 30-2c6 0 6 8 0 8l-26 3c-8 8-22 14-37 10Z" /><path className="wd-skin wd-r" d="M142 118c0-18-10-30-26-32l-18-2c-6 0-8 6-3 9l14 6-30-2c-6 0-6 8 0 8l26 3c8 8 22 14 37 10Z" /></g></>}
      {k === 'mouth' && <><path className="wd-skin" d="M120 150c0-34-6-62-28-74-14-7-30 0-34 14-3 9 2 16 2 24 0 6-6 9-5 14 2 5 8 4 10 8 2 6 0 12 6 14Z" /><g className="wd-cup"><path className="wd-skin" d="M40 120c6-10 16-14 26-12l4 10c-8 2-16 6-22 10Z" /><Drops x={66} y={100} /></g></>}
      {k === 'face' && <><circle className="wd-skin" cx="100" cy="92" r="38" /><path className="wd-hair" d="M62 88c0-24 18-40 38-40s38 16 38 40c-8-12-22-18-38-18s-30 6-38 18Z" /><g className="wd-wipe"><path className="wd-skin" d="M58 140c4-24 14-38 30-44l6 8c-12 8-18 20-20 36Z" /><path className="wd-skin" d="M142 140c-4-24-14-38-30-44l-6 8c12 8 18 20 20 36Z" /></g><Drops x={100} y={44} /></>}
      {k === 'arms' && <><Drops x={100} y={44} /><path className="wd-skin wd-arm" d="M30 108c30-6 70-10 104-10l20-8c8-2 12 6 6 10l-10 6c10 0 14 8 6 10l-26 4c-34 4-70 6-100 4Z" /><path className="wd-line" d="M58 104v16" /><g className="wd-rub2"><path className="wd-skin" d="M96 92c8-6 20-6 26 0l-4 10c-6-4-14-4-20 0Z" /></g></>}
      {k === 'head' && <><path className="wd-skin" d="M60 150c0-30 16-56 40-56s40 26 40 56Z" /><circle className="wd-skin" cx="100" cy="74" r="32" /><path className="wd-hair" d="M68 70c0-20 14-34 32-34s32 14 32 34c-8-8-20-12-32-12s-24 4-32 12Z" /><g className="wd-swipe"><path className="wd-skin" d="M74 44c10-10 22-14 34-12l10 6-4 8c-12-2-24 0-34 6Z" /></g></>}
      {k === 'feet' && <><Drops x={100} y={44} /><path className="wd-skin" d="M60 70h22v50c12 4 34 10 48 16 8 4 4 14-6 14H58c-6 0-8-6-6-12l8-18Z" /><path className="wd-line" d="M60 112h22" /><g className="wd-rub2"><path className="wd-skin" d="M110 120c8-8 22-8 30 0l-6 10c-6-6-14-6-20 0Z" /></g></>}
      <path className="wd-basin" d="M24 150h152" />
    </svg>
  );
}

export default function WuduSteps() {
  const [i, setI] = useState(0); const [play, setPlay] = useState(true);
  useEffect(() => { if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) setPlay(false); }, []);
  useEffect(() => { if (!play) return; const id = setTimeout(() => setI((x) => (x + 1) % STEPS.length), 4200); return () => clearTimeout(id); }, [i, play]);
  const s = STEPS[i];
  return (
    <section className="card wd" aria-label="خطوات الوضوء بالرسوم">
      <div className="wd-stage"><Art key={s.k} k={s.k} /><span className="wd-count">{s.n > 1 ? `${N(s.n)} مرات` : 'مرة واحدة'}</span></div>
      <p className="wd-title"><span>{N(i + 1)}</span>{s.t}</p>
      <ol className="wd-dots">{STEPS.map((x, k) => <li key={x.k}><button type="button" className={k === i ? 'on' : ''} onClick={() => { setI(k); setPlay(false); }} aria-label={x.t} aria-current={k === i ? 'step' : undefined}>{N(k + 1)}</button></li>)}</ol>
      <div className="row" style={{ justifyContent: 'center' }}>
        <button type="button" className="btn ghost small" onClick={() => { setI((i + STEPS.length - 1) % STEPS.length); setPlay(false); }}>السابق</button>
        <button type="button" className="btn small" onClick={() => setPlay((p) => !p)}>{play ? '❚❚ إيقاف' : '▶ تشغيل'}</button>
        <button type="button" className="btn ghost small" onClick={() => { setI((i + 1) % STEPS.length); setPlay(false); }}>التالي</button>
      </div>
      <p className="note" style={{ textAlign: 'center' }}>الترتيب كما في حديث عثمان رضي الله عنه في صحيح البخاري (أسفل الصفحة).</p>
    </section>
  );
}
