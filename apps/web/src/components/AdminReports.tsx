'use client';
import { useCallback, useEffect, useState } from 'react';
type R = { id: number; path: string; wrong: string; correct: string; source: string; status: string; created_at: string };
const H = { 'content-type': 'application/json', 'x-noor-admin': '1' };
export default function AdminReports() {
  const [rows, setRows] = useState<R[] | null>(null);
  const load = useCallback(async () => { const r = await fetch('/api/admin/reports', { cache: 'no-store' }); setRows(r.ok ? (await r.json()).rows : []); }, []);
  useEffect(() => { void load(); }, [load]);
  const set = async (id: number, status: string) => { await fetch('/api/admin/reports', { method: 'POST', headers: H, body: JSON.stringify({ id, status }) }); void load(); };
  if (!rows) return <p className="note">جارٍ التحميل…</p>;
  if (!rows.length) return <section className="card"><p>لا بلاغات.</p></section>;
  return <>{rows.map((r) => (
    <section key={r.id} className="card" style={{ opacity: r.status === 'open' ? 1 : .6 }}>
      <p className="meta"><span><a href={r.path} target="_blank" rel="noopener" dir="ltr">{r.path}</a></span><span>{new Date(r.created_at).toLocaleDateString('ar-EG')}</span><span>{r.status === 'open' ? 'مفتوح' : r.status === 'fixed' ? 'صُحّح' : 'مُهمل'}</span></p>
      <p style={{ whiteSpace: 'pre-line' }}><strong>الخطأ:</strong> {r.wrong}</p>{r.correct && <p style={{ whiteSpace: 'pre-line' }}><strong>الصواب:</strong> {r.correct}</p>}{r.source && <p><strong>المصدر:</strong> {r.source}</p>}
      {r.status === 'open' && <div className="row"><button type="button" className="btn small" onClick={() => set(r.id, 'fixed')}>صُحّح</button><button type="button" className="btn ghost small" onClick={() => set(r.id, 'dismissed')}>إهمال</button></div>}
    </section>))}</>;
}
