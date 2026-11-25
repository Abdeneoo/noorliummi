'use client';
import { useCallback, useEffect, useState } from 'react';
import { REVIEW_SECTIONS, REVIEW_STATES, type ReviewRow, type ReviewState } from '@/lib/review';
const H = { 'content-type': 'application/json', 'x-noor-admin': '1' };
export default function AdminReview() {
  const [rows, setRows] = useState<Record<string, ReviewRow> | null>(null); const [msg, setMsg] = useState('');
  const [live, setLive] = useState<Record<string, string>>({});
  const load = useCallback(async () => {
    const r = await fetch('/api/admin/review', { cache: 'no-store' }); const j = r.ok ? await r.json() : { rows: [] }; setRows(Object.fromEntries((j.rows as ReviewRow[]).map((x) => [x.section, x])));
    const s = await fetch('/api/admin/settings', { cache: 'no-store' }); if (s.ok) setLive((await s.json()).values);
  }, []);
  useEffect(() => { void load(); }, [load]);
  const save = async (section: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    const r = await fetch('/api/admin/review', { method: 'POST', headers: H, body: JSON.stringify({ section, status: f.get('status'), reviewer: f.get('reviewer'), note: f.get('note'), reviewed_at: f.get('date') }) });
    setMsg(r.ok ? 'حُفظ.' : (await r.json().catch(() => ({}))).error ?? 'تعذّر الحفظ.'); void load();
  };
  const saveLive = async (key: string) => { const r = await fetch('/api/admin/settings', { method: 'POST', headers: H, body: JSON.stringify({ key, value: live[key] ?? '' }) }); setMsg(r.ok ? 'حُفظ معرّف البث.' : (await r.json().catch(() => ({}))).error ?? 'تعذّر.'); void load(); };
  if (!rows) return <p className="note">جارٍ التحميل…</p>;
  return (
    <>
      {msg && <p className="note" role="status">{msg}</p>}
      <section className="card"><h2 style={{ marginTop: 0 }}>المراجعة الشرعية</h2>
        <p className="note">الحالة تظهر للزوار في «تقرير الشفافية». «راجعه متخصص» لا تُقبل إلا باسم المراجع وتاريخ المراجعة. فحوص الذكاء الاصطناعي والاختبارات الآلية ليست مراجعة شرعية. ملفات المراجعة الجاهزة للإرسال في مجلد <code>docs/review</code> بالمستودع.</p>
        {REVIEW_SECTIONS.map((s) => { const r = rows[s.id]; return (
          <form key={`${s.id}-${r?.status ?? ''}-${r?.reviewer ?? ''}`} className="row" style={{ borderTop: '1px solid var(--line)', paddingTop: 10, alignItems: 'end' }} onSubmit={(e) => save(s.id, e)}>
            <strong style={{ flex: '1 1 220px' }}>{s.ar}{s.sensitive ? ' ⚠' : ''}</strong>
            <select name="status" defaultValue={r?.status ?? 'sourced'} aria-label="الحالة">{(Object.keys(REVIEW_STATES) as ReviewState[]).map((k) => <option key={k} value={k}>{REVIEW_STATES[k]}</option>)}</select>
            <input name="reviewer" defaultValue={r?.reviewer ?? ''} placeholder="اسم المراجع" aria-label="اسم المراجع" style={{ flex: '0 1 160px' }} />
            <input name="date" type="date" defaultValue={r?.reviewed_at ?? ''} aria-label="تاريخ المراجعة" />
            <input name="note" defaultValue={r?.note ?? ''} placeholder="ملاحظة" aria-label="ملاحظة" style={{ flex: '1 1 160px' }} />
            <button className="btn ghost small">حفظ</button>
          </form>); })}
      </section>
      <section className="card"><h2 style={{ marginTop: 0 }}>بث الحرمين</h2>
        <p className="note">معرّف القناة (يبدأ بـ UC، يلتقط البث الحالي تلقائيًا) أو معرّف فيديو بث محدد (١١ حرفًا). اتركه فارغًا للعودة إلى القناة الرسمية الافتراضية.</p>
        {([['live.makkah', 'المسجد الحرام'], ['live.madinah', 'المسجد النبوي']] as const).map(([k, l]) => <div key={k} className="row"><label style={{ flex: '0 0 120px' }} htmlFor={k}>{l}</label><input id={k} dir="ltr" value={live[k] ?? ''} onChange={(e) => setLive({ ...live, [k]: e.target.value })} style={{ flex: '1 1 240px' }} /><button type="button" className="btn ghost small" onClick={() => saveLive(k)}>حفظ</button></div>)}
      </section>
    </>
  );
}
