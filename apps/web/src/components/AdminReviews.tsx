'use client';
import { useEffect, useState } from 'react';
type D = { reviewers: { id: number; name: string; active: boolean; created_at: string }[]; marks: { reviewer_id: number; item_key: string; verdict: string; note: string; updated_at: string }[] };
/** Owner's view: add reviewers (each gets a private link once), see every mark and note. */
export default function AdminReviews({ titles }: { titles: Record<string, string> }) {
  const [d, setD] = useState<D>({ reviewers: [], marks: [] }); const [name, setName] = useState(''); const [link, setLink] = useState(''); const [msg, setMsg] = useState('');
  const load = async () => { const r = await fetch('/api/admin/reviewers', { cache: 'no-store' }); if (r.ok) setD(await r.json()); };
  useEffect(() => { void load(); }, []);
  const add = async () => { setMsg(''); setLink(''); const r = await fetch('/api/admin/reviewers', { method: 'POST', headers: { 'content-type': 'application/json', 'x-noor-admin': '1' }, body: JSON.stringify({ name }) }); const j = await r.json().catch(() => ({}));
    if (!r.ok) { setMsg(j.error ?? 'تعذّر الإضافة.'); return; } setLink(`${location.origin}/review/${j.token}`); setName(''); void load(); };
  const toggle = async (id: number, active: boolean) => { await fetch('/api/admin/reviewers', { method: 'POST', headers: { 'content-type': 'application/json', 'x-noor-admin': '1' }, body: JSON.stringify({ id, active }) }); void load(); };
  const total = Object.keys(titles).length;
  return (
    <section className="card" style={{ marginTop: 16 }}><h2 style={{ marginTop: 0 }}>المراجعة الشرعية</h2>
      <div className="row"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم المراجع" /><button type="button" className="btn" onClick={add}>أضف مراجعًا وأنشئ رابطه</button></div>
      {msg && <p className="note">{msg}</p>}
      {link && <p className="card" style={{ padding: 12 }}>رابط المراجع (يظهر مرة واحدة فقط، انسخه الآن): <br /><code style={{ wordBreak: 'break-all' }}>{link}</code> <button type="button" className="btn small" onClick={() => navigator.clipboard?.writeText(link)}>انسخ</button></p>}
      {d.reviewers.map((r) => { const mk = d.marks.filter((m) => m.reviewer_id === r.id); return (
        <details key={r.id} style={{ marginTop: 10 }}><summary><strong>{r.name}</strong> — راجع {mk.length} من {total}، ملاحظات: {mk.filter((m) => m.verdict === 'note').length}{r.active ? '' : ' (موقوف)'}</summary>
          <button type="button" className="btn ghost small" onClick={() => toggle(r.id, !r.active)}>{r.active ? 'أوقف الرابط' : 'أعد تفعيل الرابط'}</button>
          <ul>{mk.map((m) => <li key={m.item_key}><strong>{titles[m.item_key] ?? m.item_key}</strong>: {m.verdict === 'ok' ? '✓ سليم' : <span style={{ whiteSpace: 'pre-line' }}>✎ {m.note}</span>}</li>)}</ul>
        </details>); })}
    </section>
  );
}
