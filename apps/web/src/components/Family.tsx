'use client';
import { useEffect, useState } from 'react';
import { AGE_BANDS, KID_SECTIONS, PRESET_SURAHS, type Allowed, type KidSection } from '@/lib/family-rules';
type Task = { id: number; title: string; period: 'daily' | 'weekly'; done: boolean };
type Child = { id: number; name: string; age_band: string; allowed: Allowed; daily_minutes: number | null; used: number; devices: number; tasks: Task[] };
const H = { 'content-type': 'application/json', 'x-noor': '1' };
const BAND: Record<string, string> = { '4-6': '٤–٦ سنوات', '7-9': '٧–٩ سنوات', '10-12': '١٠–١٢ سنة', '13-15': '١٣–١٥ سنة' };
const empty = { name: '', age_band: '7-9', pin: '', daily_minutes: '', allowed: { sections: ['quran', 'adhkar', 'tasbeeh'] as KidSection[], surahs: PRESET_SURAHS['7-9'], adhkar: [] as number[], lessons: [] as number[], book: [] as number[] } };
type Draft = typeof empty;
function Editor({ d, set, surahs, adhkar, book, isNew }: { d: Draft; set: (d: Draft) => void; surahs: [number, string][]; adhkar: [number, string][]; book: [number, string][]; isNew: boolean }) {
  const a = { ...d.allowed, book: d.allowed.book ?? [] }; const flip = <K extends 'surahs' | 'adhkar' | 'book'>(k: K, id: number) => set({ ...d, allowed: { ...a, [k]: a[k].includes(id) ? a[k].filter((x) => x !== id) : [...a[k], id].sort((x, y) => x - y) } });
  return (
    <div className="kid-editor">
      <div className="row"><label>الاسم <input value={d.name} maxLength={40} onChange={(e) => set({ ...d, name: e.target.value })} /></label>
        <label>الفئة العمرية <select value={d.age_band} onChange={(e) => set({ ...d, age_band: e.target.value })}>{AGE_BANDS.map((b) => <option key={b} value={b}>{BAND[b]}</option>)}</select></label>
        <label>وقت يومي بالدقائق (اختياري) <input inputMode="numeric" style={{ width: 90 }} value={d.daily_minutes} onChange={(e) => set({ ...d, daily_minutes: e.target.value.replace(/\D/g, '').slice(0, 3) })} /></label>
        <label>{isNew ? 'رقم سري للخروج (٤–٨ أرقام)' : 'رقم سري جديد (اختياري)'} <input type="password" inputMode="numeric" autoComplete="new-password" style={{ width: 120 }} value={d.pin} onChange={(e) => set({ ...d, pin: e.target.value.replace(/\D/g, '').slice(0, 8) })} /></label></div>
      <fieldset><legend>الأقسام المسموحة</legend><div className="row">{(Object.keys(KID_SECTIONS) as KidSection[]).map((s) => <label key={s}><input type="checkbox" checked={a.sections.includes(s)} onChange={() => set({ ...d, allowed: { ...a, sections: a.sections.includes(s) ? a.sections.filter((x) => x !== s) : [...a.sections, s] } })} /> {KID_SECTIONS[s]}</label>)}</div></fieldset>
      <details><summary>السور المسموحة ({a.surahs.length.toLocaleString('ar-EG')})</summary>
        <div className="row"><button type="button" className="btn ghost small" onClick={() => set({ ...d, allowed: { ...a, surahs: PRESET_SURAHS[d.age_band as keyof typeof PRESET_SURAHS] } })}>اقتراح حسب العمر</button><button type="button" className="btn ghost small" onClick={() => set({ ...d, allowed: { ...a, surahs: surahs.map(([n]) => n) } })}>الكل</button><button type="button" className="btn ghost small" onClick={() => set({ ...d, allowed: { ...a, surahs: [] } })}>لا شيء</button></div>
        <div className="pick-grid">{surahs.map(([n, t]) => <label key={n}><input type="checkbox" checked={a.surahs.includes(n)} onChange={() => flip('surahs', n)} /> {t}</label>)}</div></details>
      <details><summary>أبواب الأذكار المسموحة ({a.adhkar.length.toLocaleString('ar-EG')})</summary><div className="pick-grid wide">{adhkar.map(([n, t]) => <label key={n}><input type="checkbox" checked={a.adhkar.includes(n)} onChange={() => flip('adhkar', n)} /> {t}</label>)}</div></details>
      <details><summary>أقسام كتاب «ما لا يسع أطفال المسلمين جهله» ({a.book.length.toLocaleString('ar-EG')})</summary><div className="pick-grid wide">{book.map(([n, t]) => <label key={n}><input type="checkbox" checked={a.book.includes(n)} onChange={() => flip('book', n)} /> {t}</label>)}</div></details>
      <label>أرقام الدروس المسموحة (من عنوان صفحة الدرس، مفصولة بفواصل) <input style={{ width: '100%' }} value={a.lessons.join(', ')} onChange={(e) => set({ ...d, allowed: { ...a, lessons: e.target.value.split(/[^\d]+/).map(Number).filter((n) => n > 0) } })} /></label>
    </div>
  );
}
/** Parent's page: child profiles, what each may open, tasks, and switching this device to child mode. */
export default function Family({ surahs, adhkar, book }: { surahs: [number, string][]; adhkar: [number, string][]; book: [number, string][] }) {
  const [list, setList] = useState<Child[] | null | 'anon'>(null); const [draft, setDraft] = useState<Draft>(empty); const [edit, setEdit] = useState<{ id: number; d: Draft } | null>(null); const [msg, setMsg] = useState(''); const [task, setTask] = useState<Record<number, { title: string; period: 'daily' | 'weekly' }>>({});
  const load = () => fetch('/api/family', { headers: H }).then(async (r) => { const j = r.ok ? await r.json() : { children: [] }; setList(j.anon ? 'anon' : j.children); }).catch(() => setList([]));
  useEffect(() => { load(); }, []);
  const post = async (body: object) => { const r = await fetch('/api/family', { method: 'POST', headers: H, body: JSON.stringify(body) }); const j = await r.json().catch(() => ({})); setMsg(r.ok ? 'تم الحفظ.' : j.error || 'تعذّر الحفظ.'); await load(); return r.ok; };
  const body = (d: Draft) => ({ name: d.name, age_band: d.age_band, pin: d.pin, daily_minutes: d.daily_minutes === '' ? null : Number(d.daily_minutes), allowed: d.allowed });
  const start = async (id: number) => { if (!confirm('سيتحول هذا الجهاز إلى وضع الطفل، ولن يخرج منه إلا برقمك السري. متابعة؟')) return; const r = await fetch('/api/kids/session', { method: 'POST', headers: H, body: JSON.stringify({ child: id }) }); if (r.ok) location.href = '/kids'; else setMsg('تعذّر بدء وضع الطفل.'); };
  if (list === null) return <p className="note">جارٍ التحميل…</p>;
  if (list === 'anon') return <section className="card"><p>هذه الصفحة لوليّ الأمر بعد تسجيل الدخول.</p><p><a className="btn" href="/account">تسجيل الدخول</a></p></section>;
  return (
    <>
      {msg && <p className="note" role="status">{msg}</p>}
      {list.map((c) => (
        <section key={c.id} className="card"><h2>{c.name} <small className="note">· {BAND[c.age_band]}</small></h2>
          <p className="note">اليوم: {c.used.toLocaleString('ar-EG')} دقيقة{c.daily_minutes != null ? ` من ${c.daily_minutes.toLocaleString('ar-EG')}` : ' (بلا حد)'} · أجهزة في وضع الطفل: {c.devices.toLocaleString('ar-EG')} · سور: {c.allowed.surahs.length.toLocaleString('ar-EG')} · أذكار: {c.allowed.adhkar.length.toLocaleString('ar-EG')} · دروس: {c.allowed.lessons.length.toLocaleString('ar-EG')}</p>
          <h3>المهام</h3>
          {c.tasks.length ? <ul className="kid-tasks">{c.tasks.map((t) => <li key={t.id}><label><span aria-hidden="true">{t.done ? '✓' : '○'}</span><span>{t.title}</span><small className="note">{t.period === 'daily' ? 'يومية' : 'أسبوعية'} — {t.done ? 'أُنجزت' : 'لم تُنجز بعد'}</small><button type="button" className="btn ghost small" style={{ marginInlineStart: 'auto' }} onClick={() => post({ action: 'task-del', child: c.id, task: t.id })}>حذف</button></label></li>)}</ul> : <p className="note">لا مهام بعد.</p>}
          <div className="row"><input aria-label="مهمة جديدة" placeholder="مثل: اقرأ سورة الإخلاص ثلاث مرات" value={task[c.id]?.title ?? ''} onChange={(e) => setTask({ ...task, [c.id]: { title: e.target.value, period: task[c.id]?.period ?? 'daily' } })} style={{ flex: 1, minWidth: 180 }} /><select aria-label="التكرار" value={task[c.id]?.period ?? 'daily'} onChange={(e) => setTask({ ...task, [c.id]: { title: task[c.id]?.title ?? '', period: e.target.value as 'daily' | 'weekly' } })}><option value="daily">يومية</option><option value="weekly">أسبوعية</option></select><button type="button" className="btn small" disabled={!task[c.id]?.title?.trim()} onClick={async () => { if (await post({ action: 'task-add', child: c.id, ...task[c.id] })) setTask({ ...task, [c.id]: { title: '', period: 'daily' } }); }}>أضف</button></div>
          {edit?.id === c.id ? <><Editor d={edit.d} set={(d) => setEdit({ id: c.id, d })} surahs={surahs} adhkar={adhkar} book={book} isNew={false} /><div className="row"><button type="button" className="btn small" onClick={async () => { if (await post({ action: 'update', child: c.id, ...body(edit.d) })) setEdit(null); }}>حفظ</button><button type="button" className="btn ghost small" onClick={() => setEdit(null)}>إلغاء</button></div></>
            : <div className="row"><button type="button" className="btn small" onClick={() => start(c.id)}>افتح وضع الطفل على هذا الجهاز</button><button type="button" className="btn ghost small" onClick={() => setEdit({ id: c.id, d: { name: c.name, age_band: c.age_band, pin: '', daily_minutes: c.daily_minutes == null ? '' : String(c.daily_minutes), allowed: { ...c.allowed, book: c.allowed.book ?? [] } } })}>تعديل المسموح</button>{c.devices > 0 && <button type="button" className="btn ghost small" onClick={() => post({ action: 'signout-devices', child: c.id })}>أخرج كل الأجهزة من وضع الطفل</button>}<button type="button" className="btn ghost small" onClick={() => confirm(`حذف ملف ${c.name} ومهامه؟`) && post({ action: 'delete', child: c.id })}>حذف الملف</button></div>}
        </section>))}
      <section className="card"><h2>طفل جديد</h2><Editor d={draft} set={setDraft} surahs={surahs} adhkar={adhkar} book={book} isNew /><div className="row"><button type="button" className="btn" disabled={!draft.name.trim() || draft.pin.length < 4} onClick={async () => { if (await post({ action: 'create', ...body(draft) })) setDraft(empty); }}>أنشئ الملف</button></div></section>
    </>
  );
}
