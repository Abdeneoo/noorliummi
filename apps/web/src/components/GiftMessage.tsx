'use client';
import { useState } from 'react';
const MSG = `السلام عليكم 🤍
أشاركك «نور لأمي»: منصة إسلامية مجانية بلا إعلانات ولا تتبع — القرآن والتفسير، مواقيت الصلاة والأذان، الأذكار والأدعية، الفقه، وصفحات أثر لمن نحب.
الموقع: https://noorliummi.io
إضافة المتصفح (أذان وتذكير): https://noorliummi.io/extension
وهي صدقة جارية عن روح أمل مجدي منير، فادعُ لها بالرحمة.`;
export default function GiftMessage() {
  const [t, setT] = useState(MSG); const [ok, setOk] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(t); setOk(true); setTimeout(() => setOk(false), 2500); } catch { /* ignore */ } };
  return (
    <section className="card">
      <label htmlFor="gift" className="sr-only">نص الرسالة</label>
      <textarea id="gift" value={t} onChange={(e) => setT(e.target.value)} rows={8} style={{ width: '100%', font: 'inherit', lineHeight: 1.9 }} />
      <div className="row">
        <a className="btn" href={`https://wa.me/?text=${encodeURIComponent(t)}`} target="_blank" rel="noopener">أرسل على واتساب</a>
        <button type="button" className="btn ghost" onClick={copy}>{ok ? 'نُسخت' : 'انسخ الرسالة'}</button>
      </div>
      <p className="note">تطبيق أندرويد قيد الإعداد؛ سنضيف رابطه هنا عند نشره.</p>
    </section>
  );
}
