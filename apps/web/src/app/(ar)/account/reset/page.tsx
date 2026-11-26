'use client';
import { useState } from 'react';
import { Pw } from '@/components/Account';
/** The "forgot password" email link lands here (token in the URL fragment, never sent to the server until submit). */
export default function Reset() {
  const [pw, setPw] = useState(''); const [pw2, setPw2] = useState(''); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  const go = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg('');
    if (pw !== pw2) { setMsg('كلمتا المرور غير متطابقتين.'); return; }
    const t = (location.hash.match(/^#t=([a-f0-9]{64})$/) ?? [])[1] ?? ''; setBusy(true);
    const r = await fetch('/api/account/reset', { method: 'POST', headers: { 'content-type': 'application/json', 'x-noor': '1' }, body: JSON.stringify({ t, password: pw }) });
    const j = await r.json().catch(() => ({})); setBusy(false);
    if (r.ok) { history.replaceState(null, '', '/account'); location.href = '/account'; } else setMsg(j.error ?? 'تعذّر الحفظ.');
  };
  return (
    <article className="card" style={{ maxWidth: 520, margin: '40px auto' }}>
      <h1>كلمة مرور جديدة</h1>
      <form onSubmit={go} className="grid" style={{ gap: 12 }}>
        <Pw id="r-pw" label="كلمة المرور الجديدة" value={pw} set={setPw} auto="new-password" />
        <Pw id="r-pw2" label="تأكيدها" value={pw2} set={setPw2} auto="new-password" />
        <p className="note" style={{ margin: 0 }}>8 أحرف على الأقل. بعد الحفظ تخرج أجهزتك الأخرى من الحساب.</p>
        <button className="btn" disabled={busy}>{busy ? '…' : 'احفظ وادخل'}</button>
      </form>
      {msg && <p className="note" role="alert">{msg}</p>}
    </article>
  );
}
