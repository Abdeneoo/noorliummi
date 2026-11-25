'use client';
import { useEffect, useState } from 'react';
type Row = { t: string; p: string; m: string; s: string; k?: string };
export default function AdminErrors() {
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => { fetch('/api/admin/errors', { cache: 'no-store' }).then((r) => r.json()).then((j) => setRows(j.rows ?? [])).catch(() => setRows([])); }, []);
  if (!rows) return <p className="note">جارٍ التحميل…</p>;
  if (!rows.length) return <section className="card"><p>لا أخطاء مسجّلة.</p></section>;
  return (
    <section className="card">
      <p className="note">آخر {rows.length} سجلًا (أخطاء الصفحات والروابط المفقودة). لا يُسجَّل أي بيان عن الزائر.</p>
      <ul className="tafsir-list" style={{ listStyle: 'none', padding: 0 }}>
        {rows.map((r, i) => <li key={i} dir="ltr" style={{ fontSize: '.82rem', borderBottom: '1px solid var(--line)', padding: '6px 0' }}><strong>{r.k === '404' ? '404' : 'JS'}</strong> {r.t.slice(0, 16).replace('T', ' ')} · <code>{r.p}</code> · {r.m}{r.s && <><br /><small>{r.s.slice(0, 300)}</small></>}</li>)}
      </ul>
    </section>
  );
}
