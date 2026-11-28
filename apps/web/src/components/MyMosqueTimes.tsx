'use client';
import { useEffect, useState } from 'react';
/** Friday and Eid prayer times as announced by the user's own mosque (set by hand, kept on this device only). */
type V = { name: string; jumua: string; fitr: string; adha: string };
const K = 'noor.mosque.times';
const fmt = (t: string) => { if (!t) return ''; const [h, m] = t.split(':').map(Number); const d = new Date(); d.setHours(h, m, 0, 0); return d.toLocaleTimeString('ar-EG', { hour: 'numeric', minute: '2-digit' }); };
export default function MyMosqueTimes() {
  const [v, setV] = useState<V>({ name: '', jumua: '', fitr: '', adha: '' }); const [edit, setEdit] = useState(false); const [saved, setSaved] = useState(false);
  useEffect(() => { try { const x = JSON.parse(localStorage.getItem(K) || 'null'); if (x) { setV(x); setSaved(true); } else setEdit(true); } catch { setEdit(true); } }, []);
  const save = () => { try { localStorage.setItem(K, JSON.stringify(v)); } catch { /* ignore */ } setSaved(true); setEdit(false); };
  const now = new Date(); const isFri = now.getDay() === 5;
  const daysToFri = (5 - now.getDay() + 7) % 7;
  return (
    <section className="card mm" aria-labelledby="mm-h">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}><h2 id="mm-h" style={{ margin: 0 }}>مواعيد مسجدي</h2>{saved && !edit && <button type="button" className="btn ghost small" onClick={() => setEdit(true)}>تعديل</button>}</div>
      <p className="note">اكتب موعد الجمعة والعيد كما يعلنه مسجدك؛ تُحفظ على جهازك فقط.</p>
      {edit ? (
        <div style={{ display: 'grid', gap: 8 }}>
          <label>اسم المسجد (اختياري)<input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value.slice(0, 60) })} placeholder="مثال: مسجد الحي" /></label>
          <label>إقامة صلاة الجمعة<input type="time" value={v.jumua} onChange={(e) => setV({ ...v, jumua: e.target.value })} /></label>
          <label>صلاة عيد الفطر<input type="time" value={v.fitr} onChange={(e) => setV({ ...v, fitr: e.target.value })} /></label>
          <label>صلاة عيد الأضحى<input type="time" value={v.adha} onChange={(e) => setV({ ...v, adha: e.target.value })} /></label>
          <div className="row"><button type="button" className="btn" onClick={save}>احفظ</button>{saved && <button type="button" className="btn ghost" onClick={() => setEdit(false)}>إلغاء</button>}</div>
        </div>
      ) : (
        <ul className="mm-list">
          {v.name && <li className="mm-name">{v.name}</li>}
          {v.jumua && <li className={isFri ? 'on' : ''}><span>الجمعة</span><strong>{fmt(v.jumua)}</strong><small>{isFri ? 'اليوم' : daysToFri === 1 ? 'غدًا' : `بعد ${daysToFri.toLocaleString('ar-EG')} أيام`}</small></li>}
          {v.fitr && <li><span>عيد الفطر</span><strong>{fmt(v.fitr)}</strong></li>}
          {v.adha && <li><span>عيد الأضحى</span><strong>{fmt(v.adha)}</strong></li>}
        </ul>
      )}
    </section>
  );
}
