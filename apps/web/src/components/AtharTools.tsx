'use client';
import { useEffect, useState } from 'react';
import AtharForm, { MINE, NAMES, readMine, rememberPage, editLink, type AtharInitial } from './AtharForm';

/** Owner tools (only on the device that created the page) + report button for everyone. */
export default function AtharTools({ slug, initial }: { slug: string; initial: AtharInitial }) {
  const [owner, setOwner] = useState(false); const [edit, setEdit] = useState(false);
  const [rep, setRep] = useState(false); const [reason, setReason] = useState(''); const [msg, setMsg] = useState('');
  useEffect(() => {
    // Opening the private edit link (#k=token) on any device makes that device an owner of the page.
    const m = location.hash.match(/^#k=([a-f0-9]{64})$/);
    if (m) { rememberPage(slug, initial.display_name, m[1]); history.replaceState(null, '', location.pathname); }
    const mine = !!readMine()[slug]; setOwner(mine); if (mine) rememberPage(slug, initial.display_name);
  }, [slug, initial.display_name]);

  const del = async () => {
    if (!confirm('حذف الصفحة نهائيًا؟ يُمسح نصها فورًا ولا يمكن استرجاعها.')) return;
    const res = await fetch(`/api/athar/${slug}`, { method: 'DELETE', headers: { 'x-edit-token': readMine()[slug] ?? '' } });
    if (res.ok) { const m = readMine(); delete m[slug]; try { localStorage.setItem(MINE, JSON.stringify(m)); const n = JSON.parse(localStorage.getItem(NAMES) ?? '{}'); delete n[slug]; localStorage.setItem(NAMES, JSON.stringify(n)); } catch { /* ignore */ } location.href = '/athar'; }
    else setMsg('تعذّر الحذف.');
  };
  const report = async () => {
    const res = await fetch(`/api/athar/${slug}/report`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ reason }) });
    const j = await res.json().catch(() => ({}));
    setMsg(res.ok ? 'شكرًا، وصل البلاغ وسيُراجَع.' : j.error ?? 'تعذّر الإرسال.'); if (res.ok) setRep(false);
  };

  return (
    <div className="athar-tools">
      {owner && !edit && <div className="row"><button type="button" className="btn ghost" onClick={() => setEdit(true)}>تعديل</button><button type="button" className="btn ghost" onClick={() => { navigator.clipboard?.writeText(editLink(slug, readMine()[slug])); setMsg('نُسخ رابط التعديل. احفظه في مكان آمن ولا تشاركه.'); }}>نسخ رابط التعديل</button><button type="button" className="btn ghost" onClick={del}>حذف الصفحة</button></div>}
      {owner && edit && <AtharForm slug={slug} initial={initial} onDone={() => location.reload()} />}
      {!owner && !rep && <button type="button" className="btn ghost small" onClick={() => setRep(true)}>الإبلاغ عن محتوى غير لائق</button>}
      {rep && (
        <div className="card">
          <label htmlFor="rr">سبب البلاغ</label>
          <textarea id="rr" rows={2} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} />
          <div className="row"><button type="button" className="btn" onClick={report}>إرسال</button><button type="button" className="btn ghost" onClick={() => setRep(false)}>إلغاء</button></div>
        </div>
      )}
      {msg && <p className="note" role="status">{msg}</p>}
    </div>
  );
}
