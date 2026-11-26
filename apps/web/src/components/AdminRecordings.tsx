'use client';
import { useEffect, useState } from 'react';
type R = { id: number; reciter_ar: string; title: string; dua_source: string; bytes: number; consent: string; consent_date: string | null; rights: string[]; status: string; review_notes: string };
const ST: Record<string, string> = { review: 'قيد المراجعة', approved: 'معتمد', published: 'منشور', rejected: 'مرفوض' };
const RT: Record<string, string> = { stream: 'البث', host: 'الاستضافة', download: 'التنزيل' };
/** «تسجيلات نور لأمي»: upload with written consent, review, approve, publish. */
export default function AdminRecordings() {
  const [list, setList] = useState<R[]>([]); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  const load = async () => { const j = await (await fetch('/api/admin/recordings', { cache: 'no-store' })).json().catch(() => ({})); setList(j.items ?? []); };
  useEffect(() => { void load(); }, []);
  const upload = async (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); setBusy(true); setMsg('');
    const r = await fetch('/api/admin/recordings', { method: 'POST', headers: { 'x-noor-admin': '1' }, body: new FormData(e.currentTarget) }); const j = await r.json().catch(() => ({}));
    setBusy(false); if (!r.ok) { setMsg(j.error ?? 'تعذّر الرفع.'); return; } setMsg('رُفع التسجيل، وهو الآن قيد المراجعة.'); e.currentTarget.reset(); void load(); };
  const patch = async (id: number, p: Record<string, unknown>) => { const r = await fetch('/api/admin/recordings', { method: 'PATCH', headers: { 'content-type': 'application/json', 'x-noor-admin': '1' }, body: JSON.stringify({ id, ...p }) }); const j = await r.json().catch(() => ({})); setMsg(r.ok ? 'حُفظ.' : j.error ?? 'تعذّر الحفظ.'); void load(); };
  return (
    <section className="card" style={{ marginTop: 16 }}><h2 style={{ marginTop: 0 }}>تسجيلات نور لأمي الأصلية</h2>
      <p className="note">ارفع التسجيل فقط بعد موافقة القارئ الكتابية. لا أصوات مولّدة آليًا. يمر كل تسجيل بالمراجعة ثم الاعتماد ثم النشر.</p>
      <form onSubmit={upload} className="field" style={{ display: 'grid', gap: 6 }}>
        <input name="reciter_ar" required placeholder="اسم القارئ بالعربية" /><input name="reciter_en" placeholder="الاسم بالإنجليزية (اختياري)" />
        <input name="title" required placeholder="عنوان التسجيل (مثال: دعاء الوالدين)" /><textarea name="dua_text" rows={3} placeholder="نص الدعاء كما قُرئ" />
        <input name="dua_source" placeholder="مصدر النص (مثال: الإسراء 24 / صحيح مسلم 2732)" />
        <textarea name="consent" rows={2} required placeholder="نص الموافقة الكتابية أو رابطها ونطاقها" /><label>تاريخ الموافقة <input type="date" name="consent_date" /></label>
        <div className="row">{Object.entries(RT).map(([k, v]) => <label key={k}><input type="checkbox" name="rights" value={k} /> {v}</label>)}</div>
        <input type="file" name="file" accept="audio/*" required /><button className="btn" disabled={busy}>{busy ? 'جارٍ الرفع…' : 'ارفع للمراجعة'}</button></form>
      {msg && <p className="note" role="status">{msg}</p>}
      <ul className="athar-items">{list.map((x) => <li key={x.id}><strong>{x.title}</strong> — {x.reciter_ar} · {ST[x.status]} · {(x.bytes / 1048576).toFixed(1)} م.ب · الحقوق: {x.rights.map((r) => RT[r]).join('، ') || '—'}
        <div className="row"><audio controls preload="none" src={`/api/admin/recordings/file?id=${x.id}`} style={{ maxWidth: 260 }} />
          {x.status === 'review' && <><button type="button" className="btn small" onClick={() => patch(x.id, { status: 'approved' })}>اعتمد</button><button type="button" className="btn ghost small" onClick={() => patch(x.id, { status: 'rejected' })}>ارفض</button></>}
          {x.status === 'approved' && <button type="button" className="btn small" onClick={() => patch(x.id, { status: 'published' })}>انشر</button>}
          {x.status === 'published' && <button type="button" className="btn ghost small" onClick={() => patch(x.id, { status: 'approved' })}>أوقف النشر</button>}</div></li>)}</ul>
    </section>
  );
}
