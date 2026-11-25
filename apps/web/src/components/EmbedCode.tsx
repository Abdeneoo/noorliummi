'use client';
import { useEffect, useState } from 'react';
/** Shows the iframe code for the «آية اليوم» widget, with a copy button. */
export default function EmbedCode() {
  const [code, setCode] = useState(''); const [ok, setOk] = useState(false);
  useEffect(() => { setCode(`<iframe src="${location.origin}/embed/ayah" title="آية اليوم — نور لأمي" width="100%" height="280" style="border:0;max-width:560px" loading="lazy"></iframe>`); }, []);
  return (
    <section className="card">
      <h2 style={{ marginTop: 0 }}>ودجت «آية اليوم» لموقعك</h2>
      <p className="note">انسخ الكود وضعه في مدونتك أو موقعك: تظهر آية كاملة كل يوم، بالرسم العثماني ورابط إلى المصحف هنا.</p>
      <textarea readOnly value={code} rows={3} dir="ltr" style={{ width: '100%', fontFamily: 'monospace', fontSize: '.8rem' }} onFocus={(e) => e.currentTarget.select()} />
      <div className="row"><button type="button" className="btn ghost" onClick={() => { void navigator.clipboard?.writeText(code); setOk(true); setTimeout(() => setOk(false), 1500); }}>{ok ? 'نُسخ ✓' : 'نسخ الكود'}</button><a className="btn ghost" href="/embed/ayah" target="_blank" rel="noopener">معاينة ↗</a></div>
    </section>
  );
}
