'use client';
import { useState } from 'react';
import surahs from '@/generated/surahs.json';
import adhkar from '@/generated/adhkar/index.json';

type Item = { kind: 'surah' | 'dhikr'; ref: number };
export interface AtharInitial { display_name: string; dedication: string; dua_text: string; items: Item[] }
const S = surahs as { index: number; name: string }[];
const A = adhkar as { id: number; title: string }[];
export const MINE = 'noor.athar.mine'; // { [slug]: token } kept on this device only
export function readMine(): Record<string, string> { try { return JSON.parse(localStorage.getItem(MINE) ?? '{}'); } catch { return {}; } }
const label = (it: Item) => (it.kind === 'surah' ? `سورة ${S[it.ref - 1]?.name}` : A.find((a) => a.id === it.ref)?.title ?? '');

export default function AtharForm({ initial, slug, onDone }: { initial?: AtharInitial; slug?: string; onDone?: () => void }) {
  const [f, setF] = useState<AtharInitial>(initial ?? { display_name: '', dedication: '', dua_text: '', items: [{ kind: 'surah', ref: 1 }, { kind: 'surah', ref: 36 }] });
  const [pickS, setPickS] = useState(112); const [pickA, setPickA] = useState(A[0]?.id ?? 1);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [made, setMade] = useState<string | null>(null);
  const add = (it: Item) => setF((p) => (p.items.length >= 10 || p.items.some((x) => x.kind === it.kind && x.ref === it.ref) ? p : { ...p, items: [...p.items, it] }));

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setBusy(true); setErr('');
    const website = (e.currentTarget.elements.namedItem('website') as HTMLInputElement | null)?.value ?? '';
    try {
      const mine = readMine();
      const res = await fetch(slug ? `/api/athar/${slug}` : '/api/athar', {
        method: slug ? 'PUT' : 'POST', headers: { 'content-type': 'application/json', ...(slug ? { 'x-edit-token': mine[slug] ?? '' } : {}) },
        body: JSON.stringify({ ...f, website }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(j.error ?? 'تعذّر الحفظ.'); return; }
      if (slug) { onDone?.(); return; }
      try { localStorage.setItem(MINE, JSON.stringify({ ...mine, [j.slug]: j.token })); } catch { /* ignore */ }
      setMade(j.slug);
    } catch { setErr('تعذّر الاتصال. تحقق من الإنترنت وحاول مرة أخرى.'); } finally { setBusy(false); }
  };

  if (made) {
    const url = `${location.origin}/athar/${made}`;
    return (
      <section className="card" role="status">
        <h2 style={{ marginTop: 0 }}>أُنشئت الصفحة</h2>
        <p>هذا رابطها. لا تظهر في أي قائمة ولا في محركات البحث؛ يصل إليها من تشاركه الرابط فقط.</p>
        <p dir="ltr" style={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>{url}</p>
        <div className="row">
          <a className="btn" href={`/athar/${made}`}>افتح الصفحة</a>
          <button type="button" className="btn ghost" onClick={() => navigator.clipboard?.writeText(url)}>نسخ الرابط</button>
          {'share' in navigator && <button type="button" className="btn ghost" onClick={() => navigator.share({ url }).catch(() => undefined)}>مشاركة</button>}
        </div>
        <p className="note">التعديل والحذف متاحان من هذا الجهاز وهذا المتصفح فقط. إن مسحت بيانات المتصفح فلن تستطيع تعديلها.</p>
      </section>
    );
  }

  return (
    <form className="card athar-form" onSubmit={submit}>
      <div className="field"><label htmlFor="an">الاسم الذي تُهدى إليه الصفحة <small>(إلزامي، حتى {80} حرفًا)</small></label>
        <input id="an" required maxLength={80} value={f.display_name} onChange={(e) => setF({ ...f, display_name: e.target.value })} placeholder="مثال: والدي رحمه الله" /></div>
      <div className="field"><label htmlFor="ad">كلمة إهداء <small>(اختياري، حتى 300 حرف)</small></label>
        <textarea id="ad" rows={2} maxLength={300} value={f.dedication} onChange={(e) => setF({ ...f, dedication: e.target.value })} /></div>
      <div className="field"><label htmlFor="du">دعاء تكتبه أنت <small>(اختياري، حتى 1000 حرف)</small></label>
        <textarea id="du" rows={4} maxLength={1000} value={f.dua_text} onChange={(e) => setF({ ...f, dua_text: e.target.value })} /></div>
      <fieldset className="field"><legend>ما يُقرأ في الصفحة <small>(حتى 10)</small></legend>
        <ul className="athar-items">{f.items.map((it, i) => (
          <li key={`${it.kind}${it.ref}`}>{label(it)} <button type="button" className="btn ghost" aria-label={`إزالة ${label(it)}`} onClick={() => setF({ ...f, items: f.items.filter((_, j) => j !== i) })}>إزالة</button></li>
        ))}</ul>
        <div className="row">
          <select aria-label="سورة" value={pickS} onChange={(e) => setPickS(+e.target.value)}>{S.map((s) => <option key={s.index} value={s.index}>{s.index}. {s.name}</option>)}</select>
          <button type="button" className="btn ghost" onClick={() => add({ kind: 'surah', ref: pickS })}>أضف السورة</button>
        </div>
        <div className="row">
          <select aria-label="ذكر" value={pickA} onChange={(e) => setPickA(+e.target.value)} style={{ maxWidth: '100%' }}>{A.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}</select>
          <button type="button" className="btn ghost" onClick={() => add({ kind: 'dhikr', ref: pickA })}>أضف الذكر</button>
        </div>
      </fieldset>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />
      <p className="note">لا تُقبل الروابط ولا أرقام الهواتف. لا تكتب بيانات شخصية لا تريد أن يراها من يصله الرابط.</p>
      {err && <p className="note" role="alert" style={{ color: '#b23b3b' }}>{err}</p>}
      <button className="btn" disabled={busy}>{busy ? 'جارٍ الحفظ…' : slug ? 'حفظ التعديل' : 'أنشئ الصفحة'}</button>
    </form>
  );
}
