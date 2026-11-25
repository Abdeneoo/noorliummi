'use client';
import { useEffect, useState } from 'react';
export default function ReportForm() {
  const [path, setPath] = useState('/'); const [wrong, setWrong] = useState(''); const [correct, setCorrect] = useState(''); const [source, setSource] = useState('');
  const [msg, setMsg] = useState(''); const [ok, setOk] = useState(false); const [busy, setBusy] = useState(false);
  useEffect(() => { const p = new URLSearchParams(location.search).get('p'); if (p?.startsWith('/')) setPath(p.slice(0, 200)); }, []);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setBusy(true); setMsg('');
    const website = (e.currentTarget.elements.namedItem('website') as HTMLInputElement)?.value;
    const r = await fetch('/api/report', { method: 'POST', headers: { 'content-type': 'application/json', 'x-noor': '1' }, body: JSON.stringify({ path, wrong, correct, source, website }) });
    const j = await r.json().catch(() => ({})); setBusy(false);
    if (r.ok) setOk(true); else setMsg(j.error ?? 'تعذّر الإرسال.');
  };
  if (ok) return <section className="card"><h2 style={{ marginTop: 0 }}>وصل بلاغك، جزاك الله خيرًا</h2><p>سيُراجع ويُصحَّح الموضع إن ثبت الخطأ.</p></section>;
  return (
    <form className="card" onSubmit={submit}>
      <div className="field"><label htmlFor="rp">الصفحة</label><input id="rp" dir="ltr" value={path} onChange={(e) => setPath(e.target.value)} maxLength={200} required /></div>
      <div className="field"><label htmlFor="rw">ما الخطأ؟ (اذكر رقم الآية أو الحديث أو الذكر)</label><textarea id="rw" rows={3} value={wrong} onChange={(e) => setWrong(e.target.value)} maxLength={1000} required minLength={5} /></div>
      <div className="field"><label htmlFor="rc">ما الصواب؟</label><textarea id="rc" rows={3} value={correct} onChange={(e) => setCorrect(e.target.value)} maxLength={1000} /></div>
      <div className="field"><label htmlFor="rs">المصدر (كتاب وطبعة وصفحة، أو رابط)</label><input id="rs" value={source} onChange={(e) => setSource(e.target.value)} maxLength={300} /></div>
      <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {msg && <p className="note" role="alert">{msg}</p>}
      <button className="btn" disabled={busy}>{busy ? 'جارٍ الإرسال…' : 'أرسل البلاغ'}</button>
      <p className="note">لا نطلب اسمك ولا بريدك. لا تكتب بيانات شخصية في البلاغ.</p>
    </form>
  );
}
