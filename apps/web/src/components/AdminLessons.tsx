'use client';
import { useEffect, useState } from 'react';
const H = { 'content-type': 'application/json', 'x-noor-admin': '1' };
/** Moderator's switch for the lessons section: close it, or hide an item / category / author by its number in the page address. */
export default function AdminLessons() {
  const [d, setD] = useState<{ off: boolean; hidden: number[] } | null>(null); const [id, setId] = useState(''); const [msg, setMsg] = useState('');
  const load = () => fetch('/api/admin/lessons', { headers: H }).then((r) => (r.ok ? r.json() : null)).then(setD).catch(() => setD(null));
  useEffect(() => { load(); }, []);
  const post = async (body: object) => { const r = await fetch('/api/admin/lessons', { method: 'POST', headers: H, body: JSON.stringify(body) }); setMsg(r.ok ? 'تم.' : (await r.json().catch(() => ({}))).error || 'تعذّر الحفظ.'); load(); };
  if (!d) return null;
  return (
    <section className="card"><h2>قسم الدروس</h2>
      <p className="note">المواد من IslamHouse كما هي. أخفِ أي مادة أو تصنيف أو مؤلف بالرقم الظاهر في عنوان صفحته (مثل ‎/lessons/2844667).</p>
      <div className="row"><button type="button" className={d.off ? 'btn small' : 'btn ghost small'} onClick={() => post({ off: !d.off })}>{d.off ? 'القسم مغلق — افتحه' : 'أغلق القسم كله'}</button></div>
      <div className="row"><label htmlFor="lh">رقم للإخفاء</label><input id="lh" inputMode="numeric" value={id} onChange={(e) => setId(e.target.value.replace(/\D/g, ''))} style={{ width: 140 }} /><button type="button" className="btn small" disabled={!id} onClick={() => { post({ action: 'hide', id: Number(id) }); setId(''); }}>إخفاء</button></div>
      {d.hidden.length > 0 && <ul className="chips">{d.hidden.map((x) => <li key={x}><button type="button" className="btn ghost small" onClick={() => post({ action: 'show', id: x })}>{x} — إظهار</button></li>)}</ul>}
      {msg && <p className="note" role="status">{msg}</p>}
    </section>
  );
}
