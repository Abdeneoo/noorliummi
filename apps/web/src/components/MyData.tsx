'use client';
import { useState } from 'react';
const KEY_RE = /^noor\.[A-Za-z0-9._:-]{1,80}$/;
/** «تصدير / استيراد بياناتي»: a backup file of everything this site keeps on the device (no server copy). */
export default function MyData({ lang = 'ar' }: { lang?: 'ar' | 'en' }) {
  const ar = lang === 'ar'; const [msg, setMsg] = useState('');
  const exp = () => {
    const data: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i)!; if (KEY_RE.test(k)) data[k] = localStorage.getItem(k) ?? ''; }
    const blob = new Blob([JSON.stringify({ app: 'noor-li-ummi', v: 1, at: new Date().toISOString(), data }, null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `noor-li-ummi-${new Date().toISOString().slice(0, 10)}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    setMsg(ar ? `صُدّر ${Object.keys(data).length} عنصرًا. احفظ الملف في مكان آمن؛ فيه روابط تعديل صفحاتك.` : `Exported ${Object.keys(data).length} items. Keep the file private: it holds your page edit links.`);
  };
  const imp = async (f: File) => {
    try {
      if (f.size > 2_000_000) throw new Error('size');
      const j = JSON.parse(await f.text()); if (j?.app !== 'noor-li-ummi' || typeof j.data !== 'object') throw new Error('format');
      let n = 0;
      for (const [k, v] of Object.entries(j.data as Record<string, unknown>)) if (KEY_RE.test(k) && typeof v === 'string' && v.length < 300_000) { localStorage.setItem(k, v); n++; }
      setMsg(ar ? `استُعيد ${n} عنصرًا. أعد تحميل الصفحة.` : `Restored ${n} items. Reload the page.`);
    } catch { setMsg(ar ? 'الملف غير صالح.' : 'This file is not a valid backup.'); }
  };
  return (
    <section className="card" aria-labelledby="md-title">
      <h2 id="md-title" style={{ marginTop: 0 }}>{ar ? 'بياناتي على هذا الجهاز' : 'My data on this device'}</h2>
      <p className="note">{ar ? 'المفضلة، تقدّم الحفظ والختمة، موضع القراءة، التسبيح، وصفحات الأثر المحفوظة — كلها في متصفحك فقط. صدّرها قبل تغيير الهاتف أو مسح بيانات المتصفح.' : 'Favourites, memorisation and khatma progress, reading position, tasbeeh and saved athar pages live only in your browser. Export them before changing phone or clearing browser data.'}</p>
      <div className="row">
        <button type="button" className="btn" onClick={exp}>{ar ? 'تصدير بياناتي' : 'Export my data'}</button>
        <label className="btn ghost">{ar ? 'استيراد من ملف' : 'Import from file'}<input type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void imp(f); e.target.value = ''; }} /></label>
      </div>
      {msg && <p className="note" role="status">{msg}</p>}
    </section>
  );
}
