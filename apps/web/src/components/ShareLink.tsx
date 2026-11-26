'use client';
import { useState } from 'react';
/** Share or copy this page's link (no tracking). */
export default function ShareLink({ title }: { title: string }) {
  const [done, setDone] = useState(false);
  const go = async () => {
    const url = location.href.split('#')[0];
    try { if (navigator.share) { await navigator.share({ title, url }); return; } await navigator.clipboard.writeText(`${title}\n${url}`); setDone(true); setTimeout(() => setDone(false), 2500); } catch { /* cancelled */ }
  };
  return <button type="button" className="btn ghost" onClick={go}>{done ? 'نُسخ الرابط' : 'مشاركة / نسخ الرابط'}</button>;
}
