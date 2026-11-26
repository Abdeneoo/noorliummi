'use client';
import { useEffect, useState } from 'react';
const OK = 'noor.tv.ok';
/** TVQuran's official embed, loaded only after the visitor agrees (the embed page loads Google Analytics). No background play. */
export default function TvEmbed({ id, title }: { id: number; title: string }) {
  const [ok, setOk] = useState(false); const [open, setOpen] = useState(false);
  useEffect(() => { try { setOk(localStorage.getItem(OK) === '1'); } catch { /* ignore */ } }, []);
  if (!open) return <button type="button" className="btn ghost small" onClick={() => setOpen(true)}>▶ استمع</button>;
  if (!ok) return (
    <div className="note"><p style={{ margin: '0 0 6px' }}>المشغّل من موقع TVQuran (خدمة خارجية قد تستخدم أدوات إحصاء). لا يُحمّل شيء منه قبل موافقتك، ولا يعمل في الخلفية.</p>
      <button type="button" className="btn small" onClick={() => { try { localStorage.setItem(OK, '1'); } catch { /* ignore */ } setOk(true); }}>موافق، شغّل</button></div>
  );
  return <iframe src={`https://tvquran.com/ar/selection/${id}/embeddable`} title={title} loading="lazy" style={{ width: '100%', height: 120, border: 0, borderRadius: 12 }} allow="autoplay" referrerPolicy="no-referrer" sandbox="allow-scripts allow-same-origin" />;
}
