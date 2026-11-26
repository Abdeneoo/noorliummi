'use client';
import { useState } from 'react';
const P = ['سبحان الله', 'الحمد لله', 'الله أكبر', 'لا إله إلا الله'];
export default function KidTasbeeh() {
  const [i, setI] = useState(0); const [n, setN] = useState(0);
  return <section className="kid-center"><h1>{P[i]}</h1><button type="button" className="kid-count" onClick={() => setN(n + 1)} aria-label={`${P[i]} — العدد ${n}`}>{n.toLocaleString('ar-EG')}</button><div className="row" style={{ justifyContent: 'center' }}>{P.map((p, k) => <button key={p} type="button" className={k === i ? 'btn small' : 'btn ghost small'} aria-pressed={k === i ? 'true' : 'false'} onClick={() => { setI(k); setN(0); }}>{p}</button>)}<button type="button" className="btn ghost small" onClick={() => setN(0)}>من جديد</button></div></section>;
}
