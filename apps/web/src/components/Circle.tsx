'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import surahs from '@/generated/surahs.json';
type M = { id: number; display_name: string; total: number | null; learned: number | null; due: number | null; surahs: number[] | null; updated_at: string | null };
type V = { name: string; kind: string; owner: boolean; member: boolean; signedIn: boolean; members: M[]; notes: { note: string; created_at: string }[] };
const H = { 'content-type': 'application/json', 'x-noor': '1' }; const S = surahs as { name: string }[];
const d = (s: string | null) => (s ? new Date(s).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' }) : 'لم يزامن بعد');
const n = (v: number | null) => (v ?? 0).toLocaleString('ar-EG');
export default function Circle({ slug }: { slug: string }) {
  const [v, setV] = useState<V | null | undefined>(undefined); const [name, setName] = useState(''); const [msg, setMsg] = useState(''); const [copied, setCopied] = useState(false);
  const load = useCallback(async () => { const r = await fetch(`/api/circles/${slug}`, { cache: 'no-store' }); setV(r.ok ? await r.json() : null); }, [slug]);
  useEffect(() => { void load(); }, [load]);
  const act = async (body: Record<string, unknown>, ask?: string) => { if (ask && !confirm(ask)) return; const r = await fetch(`/api/circles/${slug}`, { method: 'POST', headers: H, body: JSON.stringify(body) }); if (!r.ok) setMsg((await r.json().catch(() => ({}))).error ?? 'تعذّر.'); else setMsg(''); void load(); };
  if (v === undefined) return <p className="note">جارٍ التحميل…</p>;
  if (v === null) return <section className="card"><h1>الحلقة غير موجودة</h1></section>;
  const fam = v.kind === 'family';
  return (
    <>
      <header className="page-head"><p className="eyebrow">{fam ? 'أسرة' : 'حلقة تحفيظ'}</p><h1>{v.name}</h1></header>
      {msg && <p className="note" role="alert">{msg}</p>}
      {!v.signedIn && <section className="card"><p>للانضمام سجّل الدخول ببريدك أولًا (بلا كلمة مرور)، ثم ارجع إلى هذا الرابط.</p><Link className="btn" href="/account">تسجيل الدخول</Link></section>}
      {v.signedIn && !v.owner && !v.member && (
        <section className="card"><h2 style={{ marginTop: 0 }}>الانضمام</h2>
          <p className="note">بانضمامك يرى {fam ? 'وليّ الأمر' : 'المعلّم'} المشرف على هذه المجموعة: الاسم الذي تكتبه هنا، وملخص تقدّمك في الحفظ فقط (عدد الآيات في خطتك، ما ثبت منها، المستحق للمراجعة، أسماء السور، وتاريخ آخر مزامنة). لا يرى بريدك ولا أي شيء آخر، ويمكنك المغادرة في أي وقت.</p>
          <form className="row" onSubmit={(e) => { e.preventDefault(); void act({ action: 'join', display_name: name }); }}><input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required placeholder="اسمك كما يظهر للمشرف" aria-label="اسمك" style={{ flex: '1 1 220px' }} /><button className="btn">موافق، انضم</button></form></section>)}
      {v.member && (
        <section className="card"><p>أنت عضو في هذه المجموعة. فعّل «مزامنة الحفظ مع حسابي» من <Link href="/hifz">صفحة الحفظ</Link> ليظهر تقدمك للمشرف.</p>
          {v.notes.length > 0 && <><h2>ملاحظات المشرف</h2><ul>{v.notes.map((x, i) => <li key={i}>{x.note} <small className="note">— {d(x.created_at)}</small></li>)}</ul></>}
          <button type="button" className="btn ghost" onClick={() => act({ action: 'leave' }, 'مغادرة المجموعة؟')}>غادر المجموعة</button></section>)}
      {v.owner && (
        <>
          <section className="card"><h2 style={{ marginTop: 0 }}>رابط الدعوة</h2><p className="note">أرسله لمن تريد انضمامه. من يملك الرابط يستطيع طلب الانضمام باسمه.</p>
            <div className="row"><button type="button" className="btn" onClick={() => { void navigator.clipboard?.writeText(`${location.origin}/circle/${slug}`); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? 'نُسخ ✓' : 'انسخ رابط الدعوة'}</button>
              <button type="button" className="btn ghost" onClick={async () => { await act({ action: 'delete' }, 'حذف المجموعة نهائيًا؟'); location.href = '/account'; }}>احذف المجموعة</button></div></section>
          <section className="card"><h2 style={{ marginTop: 0 }}>الأعضاء ({n(v.members.length)})</h2>
            {v.members.length === 0 ? <p className="note">لا أعضاء بعد.</p> : <div style={{ overflowX: 'auto' }}><table className="admin-table"><thead><tr><th>الاسم</th><th>في الخطة</th><th>ثبت</th><th>مستحق</th><th>السور</th><th>آخر مزامنة</th><th /></tr></thead>
              <tbody>{v.members.map((m) => <tr key={m.id}><td>{m.display_name}</td><td>{n(m.total)}</td><td>{n(m.learned)}</td><td>{n(m.due)}</td><td>{(m.surahs ?? []).map((s) => S[s - 1]?.name).join('، ') || '—'}</td><td>{d(m.updated_at)}</td>
                <td><div className="row" style={{ margin: 0, gap: 6 }}><button type="button" className="btn ghost small" onClick={() => { const t = prompt(`ملاحظة إلى ${m.display_name} (تظهر له بتاريخها):`); if (t?.trim()) void act({ action: 'note', user: m.id, note: t }); }}>ملاحظة</button><button type="button" className="btn ghost small" onClick={() => act({ action: 'remove', user: m.id }, 'إزالة العضو؟')}>إزالة</button></div></td></tr>)}</tbody></table></div>}
            <p className="note">ترى ملخص الحفظ فقط لمن فعّل المزامنة. لا يُعرض بريد الأعضاء ولا موقعهم ولا أي بيانات أخرى.</p></section>
        </>)}
    </>
  );
}
