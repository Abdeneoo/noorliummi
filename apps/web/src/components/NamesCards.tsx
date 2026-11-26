'use client';
import { useState } from 'react';
type Card = { id: number; name: string; ayah?: string; ref?: string; url?: string | null };
/** Flashcards: the name on the front; the ayah that mentions it and the link to its explanation on the back. */
export default function NamesCards({ cards }: { cards: Card[] }) {
  const [i, setI] = useState(0); const [back, setBack] = useState(false); const [order, setOrder] = useState<number[] | null>(null);
  const list = order ? order.map((k) => cards[k]) : cards; const c = list[i];
  const go = (d: number) => { setBack(false); setI((i + d + list.length) % list.length); };
  const shuffle = () => { const o = cards.map((_, k) => k); for (let k = o.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [o[k], o[j]] = [o[j], o[k]]; } setOrder(o); setI(0); setBack(false); };
  return (
    <section className="card names-cards" aria-label="بطاقات أسماء الله الحسنى">
      <button type="button" className={`flash${back ? ' back' : ''}`} onClick={() => setBack(!back)} aria-live="polite">
        {!back ? <span className="flash-name" lang="ar">{c.name}</span> : <span className="flash-back">{c.ayah ? <><span lang="ar" className="ayat">{c.ayah}</span><small>{c.ref}</small></> : <small>لا آية معروضة لهذا الاسم (انظر الشرح)</small>}</span>}
        <small className="flash-hint">{back ? 'اضغط للرجوع' : 'اضغط لترى الدليل'}</small>
      </button>
      <div className="row" style={{ justifyContent: 'center' }}>
        <button type="button" className="btn ghost" onClick={() => go(-1)}>السابق</button>
        <span className="note" style={{ margin: 0 }}>{(i + 1).toLocaleString('ar-EG')} / {list.length.toLocaleString('ar-EG')}</span>
        <button type="button" className="btn ghost" onClick={() => go(1)}>التالي</button>
        <button type="button" className="btn ghost" onClick={shuffle}>رتّب عشوائيًا</button>
        {c.url && <a className="btn ghost" href={c.url} target="_blank" rel="noopener">الشرح ↗</a>}
      </div>
    </section>
  );
}
