'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
type Hit = { book: string; ar: string; s: number; n: number; t: string };
type Res = { hits: Hit[]; total: number; from: number; per: number; books: { key: string; ar: string; n: number }[] };
const ar = (n: number) => n.toLocaleString('ar-EG');
export default function HadithSearch({ book, initial = '' }: { book?: string; initial?: string }) {
  const [q, setQ] = useState(initial); const [res, setRes] = useState<Res | null>(null); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const [filter, setFilter] = useState(book ?? ''); const [all, setAll] = useState<Hit[]>([]);
  const run = async (from: number, f = filter) => {
    if (q.trim().length < 3) { setErr('اكتب ثلاثة أحرف على الأقل.'); return; }
    setBusy(true); setErr('');
    try {
      const r = await fetch(`/api/hadith/search?q=${encodeURIComponent(q.trim())}${f ? `&book=${f}` : ''}&from=${from}`);
      const j = await r.json(); if (!r.ok) { setErr(j.error ?? 'تعذّر البحث.'); return; }
      setRes(j); setAll(from === 0 ? j.hits : [...all, ...j.hits]);
    } catch { setErr('تعذّر الاتصال.'); } finally { setBusy(false); }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (initial.trim().length >= 3) void run(0); }, [initial]);
  const total = res?.total ?? 0;
  return (
    <section className="card hadith-search">
      <form onSubmit={(e) => { e.preventDefault(); void run(0); }} className="row" role="search" style={{ marginTop: 0 }}>
        <label htmlFor="hq" className="skip">ابحث في نص الحديث</label>
        <input id="hq" className="search" style={{ flex: 1, margin: 0 }} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث في نص الحديث (دون تشكيل)" />
        <button className="btn" disabled={busy}>{busy ? <><span className="spin" aria-hidden="true" />جارٍ البحث…</> : 'بحث'}</button>
      </form>
      {err && <p className="note" role="alert">{err}</p>}
      {res && (
        <>
          <p className="note" role="status">{total === 0 ? 'لا نتائج.' : `${ar(total)} نتيجة${filter ? ` في ${res.books.find((b) => b.key === filter)?.ar ?? ''}` : ''} — يُعرض ${ar(all.length)}`}</p>
          {!book && res.books.length > 1 && (
            <ul className="chips" style={{ marginTop: 8 }}>
              <li><button type="button" className={!filter ? 'on' : ''} onClick={() => { setFilter(''); void run(0, ''); }}>كل الكتب</button></li>
              {res.books.map((b) => <li key={b.key}><button type="button" className={filter === b.key ? 'on' : ''} onClick={() => { setFilter(b.key); void run(0, b.key); }}>{b.ar} ({ar(b.n)})</button></li>)}
            </ul>
          )}
          {all.length > 0 && (
            <ol className="tafsir-list" style={{ listStyle: 'none', padding: 0, marginTop: 12 }}>
              {all.map((h) => (
                <li key={`${h.book}${h.n}`} className="card">
                  <p className="meta" style={{ justifyContent: 'flex-start' }}><span><Link href={`/hadith/${h.book}/${h.s}#h${h.n}`}>{h.ar} — {ar(h.n)}</Link></span></p>
                  <p lang="ar" style={{ lineHeight: 2, margin: 0 }}>{h.t.length > 600 ? `${h.t.slice(0, 600)}…` : h.t}</p>
                </li>
              ))}
            </ol>
          )}
          {all.length < total && <div className="row" style={{ justifyContent: 'center' }}><button type="button" className="btn ghost" disabled={busy} onClick={() => void run(all.length)}>{busy ? 'جارٍ التحميل…' : `عرض المزيد (${ar(total - all.length)})`}</button></div>}
        </>
      )}
    </section>
  );
}
