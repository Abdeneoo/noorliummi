'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { readMine, rememberPage } from './AtharForm';

type Page = { slug: string; display_name: string; listed: boolean; status: string };
type Data = { user: { email: string; password?: boolean } | null; pages?: Page[]; mail: boolean };
const H = { 'content-type': 'application/json', 'x-noor': '1' };
const post = async (url: string, body: unknown) => { const r = await fetch(url, { method: 'POST', headers: H, body: JSON.stringify(body) }); const j = await r.json().catch(() => ({})); return { ok: r.ok, error: (j as { error?: string }).error }; };

/** Password field with a show/hide toggle. */
export function Pw({ id, label, value, set, auto }: { id: string; label: string; value: string; set: (v: string) => void; auto: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="field"><label htmlFor={id}>{label}</label>
      <div className="row" style={{ flexWrap: 'nowrap' }}>
        <input id={id} type={show ? 'text' : 'password'} required minLength={8} maxLength={128} autoComplete={auto} dir="ltr" value={value} onChange={(e) => set(e.target.value)} style={{ flex: 1 }} />
        <button type="button" className="btn ghost" aria-pressed={show} onClick={() => setShow(!show)}>{show ? 'إخفاء' : 'إظهار'}</button>
      </div></div>
  );
}

/** Optional account: register or sign in with email + password; lists the pages this account can edit. */
export default function Account() {
  const [d, setD] = useState<Data | null>(null);
  const [mode, setMode] = useState<'in' | 'up' | 'forgot'>('in');
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [pw2, setPw2] = useState('');
  const [sent, setSent] = useState(false); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  const [cur, setCur] = useState(''); const [np, setNp] = useState(''); const [np2, setNp2] = useState(''); const [pmsg, setPmsg] = useState('');
  const load = async () => {
    const r = await fetch('/api/account', { cache: 'no-store' }); const j: Data = await r.json(); setD(j);
    if (j.user) {
      // Move pages created on this device into the account (each proved by its edit token).
      const mine = readMine(); const owned = new Set((j.pages ?? []).map((p) => p.slug));
      const pages = Object.entries(mine).filter(([s]) => !owned.has(s)).map(([slug, token]) => ({ slug, token }));
      if (pages.length) {
        const c = await fetch('/api/account/claim', { method: 'POST', headers: H, body: JSON.stringify({ pages }) }).then((x) => x.json()).catch(() => ({ claimed: 0 }));
        if (c.claimed) { setMsg(`أُضيفت ${c.claimed} من صفحات هذا الجهاز إلى حسابك.`); const r2 = await fetch('/api/account', { cache: 'no-store' }); setD(await r2.json()); }
      }
      for (const p of j.pages ?? []) rememberPage(p.slug, p.display_name);
    }
  };
  useEffect(() => { void load(); }, []);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg('');
    if (mode === 'up' && pw !== pw2) { setMsg('كلمتا المرور غير متطابقتين.'); return; }
    setBusy(true);
    const r = mode === 'forgot' ? await post('/api/account/forgot', { email }) : await post(mode === 'up' ? '/api/account/register' : '/api/account/signin', { email, password: pw });
    setBusy(false);
    if (!r.ok) { setMsg(r.error ?? 'تعذّر الطلب. حاول مرة أخرى.'); return; }
    if (mode === 'forgot') setSent(true); else { setPw(''); setPw2(''); await load(); }
  };
  const change = async (e: React.FormEvent) => {
    e.preventDefault(); setPmsg('');
    if (np !== np2) { setPmsg('كلمتا المرور غير متطابقتين.'); return; }
    const r = await post('/api/account/password', { current: cur, password: np });
    if (r.ok) { setCur(''); setNp(''); setNp2(''); setPmsg('تم حفظ كلمة المرور. خرجت أجهزتك الأخرى من الحساب.'); setD((x) => x && x.user ? { ...x, user: { ...x.user, password: true } } : x); } else setPmsg(r.error ?? 'تعذّر الحفظ.');
  };
  if (!d) return <p className="note" aria-busy="true">…</p>;
  if (!d.user) return (
    <section className="card account-card">
      <div className="row" role="tablist" aria-label="الحساب">
        <button type="button" role="tab" aria-selected={mode === 'in'} className={mode === 'in' ? 'btn' : 'btn ghost'} onClick={() => { setMode('in'); setMsg(''); setSent(false); }}>تسجيل الدخول</button>
        <button type="button" role="tab" aria-selected={mode === 'up'} className={mode === 'up' ? 'btn' : 'btn ghost'} onClick={() => { setMode('up'); setMsg(''); setSent(false); }}>إنشاء حساب</button>
      </div>
      <h2>{mode === 'up' ? 'إنشاء حساب جديد' : mode === 'forgot' ? 'نسيت كلمة المرور' : 'تسجيل الدخول'}</h2>
      {mode === 'forgot' && sent ? (
        <p role="status">إن كان للبريد <strong dir="ltr">{email}</strong> حساب، فستصله رسالة فيها رابط لتعيين كلمة مرور جديدة خلال 30 دقيقة. انظر أيضًا في الرسائل غير المرغوب فيها.</p>
      ) : (
        <form onSubmit={submit} className="grid" style={{ gap: 12 }}>
          <div className="field"><label htmlFor="acc-email">البريد الإلكتروني</label>
            <input id="acc-email" type="email" required autoComplete={mode === 'up' ? 'email' : 'username'} dir="ltr" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          {mode !== 'forgot' && <Pw id="acc-pw" label="كلمة المرور" value={pw} set={setPw} auto={mode === 'up' ? 'new-password' : 'current-password'} />}
          {mode === 'up' && <><Pw id="acc-pw2" label="تأكيد كلمة المرور" value={pw2} set={setPw2} auto="new-password" /><p className="note" style={{ margin: 0 }}>8 أحرف على الأقل. نحفظ بريدك وبصمة مشفّرة لكلمة المرور فقط، ولا نرسل إليك أي رسائل دعائية.</p></>}
          {mode === 'forgot' && !d.mail && <p className="note">الاستعادة بالبريد غير مفعّلة الآن.</p>}
          <div className="row">
            <button className="btn" disabled={busy || (mode === 'forgot' && !d.mail)}>{busy ? '…' : mode === 'up' ? 'أنشئ الحساب' : mode === 'forgot' ? 'أرسل رابط التعيين' : 'ادخل'}</button>
            {mode === 'in' && <button type="button" className="btn ghost" onClick={() => { setMode('forgot'); setMsg(''); }}>نسيت كلمة المرور؟</button>}
            {mode === 'forgot' && <button type="button" className="btn ghost" onClick={() => { setMode('in'); setMsg(''); }}>رجوع</button>}
          </div>
        </form>
      )}
      {msg && <p className="note" role="alert">{msg}</p>}
    </section>
  );
  return (
    <div className="grid">
      <section className="card account-card">
        <p className="eyebrow">حسابي</p>
        <h2 dir="ltr" style={{ textAlign: 'start' }}>{d.user.email}</h2>
        {msg && <p className="note" role="status">{msg}</p>}
        <div className="row">
          <Link className="btn" href="/athar#new">اصنع صفحة جديدة</Link>
          <button type="button" className="btn ghost" onClick={async () => { await fetch('/api/account/logout', { method: 'POST', headers: H }); location.reload(); }}>تسجيل الخروج</button>
        </div>
      </section>
      <section className="card">
        <h2>صفحاتي</h2>
        {(d.pages ?? []).length === 0 ? <p className="note">لا توجد صفحات في حسابك بعد.</p> : (
          <ul className="athar-dir">{d.pages!.map((p) => (
            <li key={p.slug}><Link href={`/athar/${p.slug}`}><strong>{p.display_name}</strong><small>{p.status === 'frozen' ? 'موقوفة للمراجعة' : p.listed ? 'ظاهرة في الدليل' : 'بالرابط فقط'}</small></Link></li>
          ))}</ul>
        )}
      </section>
      <details className="card" open={d.user.password === false}><summary>{d.user.password ? 'تغيير كلمة المرور' : 'عيّن كلمة مرور لحسابك'}</summary>
        <form onSubmit={change} className="grid" style={{ gap: 12, marginTop: 12 }}>
          <input type="email" autoComplete="username" value={d.user.email} readOnly hidden />
          {d.user.password && <Pw id="acc-cur" label="كلمة المرور الحالية" value={cur} set={setCur} auto="current-password" />}
          <Pw id="acc-np" label="كلمة المرور الجديدة" value={np} set={setNp} auto="new-password" />
          <Pw id="acc-np2" label="تأكيد كلمة المرور الجديدة" value={np2} set={setNp2} auto="new-password" />
          <div className="row"><button className="btn">احفظ كلمة المرور</button></div>
          {pmsg && <p className="note" role="status">{pmsg}</p>}
        </form>
      </details>
      <details className="card"><summary>حذف الحساب</summary>
        <p className="note">يُحذف بريدك وجلساتك. تبقى صفحاتك منشورة، ويمكن تعديلها برابط التعديل الخاص بكل صفحة.</p>
        <button type="button" className="btn ghost" onClick={async () => { if (!confirm('حذف الحساب نهائيًا؟')) return; await fetch('/api/account', { method: 'DELETE', headers: H }); location.reload(); }}>احذف حسابي</button>
      </details>
    </div>
  );
}
