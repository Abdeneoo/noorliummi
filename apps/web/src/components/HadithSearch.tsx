'use client';
import Link from 'next/link';
import { useState } from 'react';
type Hit = { book: string; ar: string; s: number; n: number; t: string };
export default function HadithSearch({ book }: { book?: string }) {
  const [q, setQ] = useState(''); const [hits, setHits] = useState<Hit[] | null>(null); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const go = async (e: React.FormEvent) => {
    e.preventDefault(); if (q.trim().length < 3) { setErr('اكتب ثلاثة أحرف على الأقل.'); return; }
    setBusy(true); setErr('');
    try {
      const r = await fetch(`/api/hadith/search?q=${encodeURIComponent(q.trim())}${book ? `&book=${book}` : ''}`);
      const j = await r.json(); if (!r.ok) setErr(j.error ?? 'تعذّر البحث.'); else setHits(j.hits);
    } catch { setErr('تعذّر الاتصال.'); } finally { setBusy(false); }
  };
  return (
    <section className="card">
      <form onSubmit={go} className="row" role="search">
        <label htmlFor="hq" className="skip">ابحث في نص الحديث</label>
        <input id="hq" className="search" style={{ flex: 1, margin: 0 }} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث في نص الحديث (دون تشكيل)" />
        <button className="btn" disabled={busy}>{busy ? 'جارٍ البحث…' : 'بحث'}</button>
      </form>
      {err && <p className="note" role="alert">{err}</p>}
      {hits && <p className="note" role="status">{hits.length === 0 ? 'لا نتائج.' : `${hits.length}${hits.length === 50 ? '+' : ''} نتيجة${hits.length === 50 ? ' (أول 50)' : ''}`}</p>}
      {hits && hits.length > 0 && (
        <ol className="tafsir-list" style={{ listStyle: 'none', padding: 0 }}>
          {hits.map((h) => (
            <li key={`${h.book}${h.n}`} className="card">
              <p className="meta"><span><Link href={`/hadith/${h.book}/${h.s}#h${h.n}`}>{h.ar} — {h.n}</Link></span></p>
              <p lang="ar" style={{ lineHeight: 2 }}>{h.t.length > 600 ? `${h.t.slice(0, 600)}…` : h.t}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
