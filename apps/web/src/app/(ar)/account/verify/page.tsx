'use client';
import { useState } from 'react';
/** The sign-in link lands here; the tap is required so that mail scanners opening links cannot use it. */
export default function Verify() {
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  const go = async () => {
    const t = (location.hash.match(/^#t=([a-f0-9]{64})$/) ?? [])[1] ?? ''; setBusy(true);
    const r = await fetch('/api/account/verify', { method: 'POST', headers: { 'content-type': 'application/json', 'x-noor': '1' }, body: JSON.stringify({ t }) });
    const j = await r.json().catch(() => ({})); setBusy(false);
    if (r.ok) { history.replaceState(null, '', '/account'); location.href = '/account'; } else setMsg(j.error ?? 'تعذّر الدخول.');
  };
  return (
    <article className="card" style={{ maxWidth: 520, margin: '40px auto', textAlign: 'center' }}>
      <h1>الدخول إلى نور لأمي</h1>
      <p>اضغط الزر لإكمال الدخول إلى حسابك.</p>
      <button type="button" className="btn" onClick={go} disabled={busy}>{busy ? 'جارٍ الدخول…' : 'ادخل إلى حسابي'}</button>
      {msg && <p className="note" role="alert">{msg}</p>}
    </article>
  );
}
