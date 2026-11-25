'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { readMine, rememberPage } from './AtharForm';

type Page = { slug: string; display_name: string; listed: boolean; status: string };
type Data = { user: { email: string } | null; pages?: Page[]; mail: boolean };
const H = { 'content-type': 'application/json', 'x-noor': '1' };

/** Passwordless account: email link sign-in; lists the pages this account can edit. */
export default function Account() {
  const [d, setD] = useState<Data | null>(null);
  const [email, setEmail] = useState(''); const [sent, setSent] = useState(false); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
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
  const send = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg('');
    const r = await fetch('/api/account/login', { method: 'POST', headers: H, body: JSON.stringify({ email }) });
    const j = await r.json().catch(() => ({})); setBusy(false);
    if (r.ok) setSent(true); else setMsg(j.error ?? 'تعذّر الإرسال.');
  };
  if (!d) return <p className="note" aria-busy="true">…</p>;
  if (!d.user) return (
    <section className="card account-card">
      <h2>الدخول بالبريد الإلكتروني</h2>
      {!d.mail ? <p className="note">الدخول بالبريد سيُفعَّل قريبًا. حتى ذلك الحين يمكنك تعديل صفحاتك برابط التعديل الخاص بكل صفحة.</p> : sent ? (
        <p role="status">أرسلنا رابط الدخول إلى <strong dir="ltr">{email}</strong>. افتحه من بريدك خلال 20 دقيقة. إن لم تجده فانظر في الرسائل غير المرغوب فيها.</p>
      ) : (
        <form onSubmit={send}>
          <p className="note" style={{ marginTop: 0 }}>بلا كلمة مرور: نرسل إليك رابطًا تدخل به. نحفظ بريدك فقط، ولا نرسل إليك أي شيء آخر.</p>
          <div className="row"><input type="email" required autoComplete="email" dir="ltr" placeholder="you@example.com" aria-label="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} style={{ flex: '1 1 240px' }} /><button className="btn" disabled={busy}>{busy ? 'جارٍ الإرسال…' : 'أرسل رابط الدخول'}</button></div>
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
      <details className="card"><summary>حذف الحساب</summary>
        <p className="note">يُحذف بريدك وجلساتك. تبقى صفحاتك منشورة، ويمكن تعديلها برابط التعديل الخاص بكل صفحة.</p>
        <button type="button" className="btn ghost" onClick={async () => { if (!confirm('حذف الحساب نهائيًا؟')) return; await fetch('/api/account', { method: 'DELETE', headers: H }); location.reload(); }}>احذف حسابي</button>
      </details>
    </div>
  );
}
