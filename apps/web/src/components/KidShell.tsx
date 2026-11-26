'use client';
import { useEffect, useState } from 'react';
const H = { 'content-type': 'application/json', 'x-noor': '1' };
/** Top bar of the child area: counts minutes on the server, and leaves child mode only with the parent's PIN. */
export default function KidShell({ name, used = 0, limit = null, timeUp = false, stale = false }: { name: string; used?: number; limit?: number | null; timeUp?: boolean; stale?: boolean }) {
  const [u, setU] = useState(used); const [open, setOpen] = useState(false); const [pin, setPin] = useState(''); const [msg, setMsg] = useState('');
  useEffect(() => {
    if (stale) { fetch('/api/kids/exit', { method: 'POST', headers: H, body: '{}' }).catch(() => {}); return; } // clears a cookie whose session no longer exists
    if (timeUp) return;
    const beat = () => { if (document.visibilityState !== 'visible') return; fetch('/api/kids/tick', { method: 'POST', headers: H }).then((r) => (r.ok ? r.json() : null)).then((d) => { if (!d) return; setU(d.used); if (d.timeUp) location.reload(); }).catch(() => {}); };
    const t = setInterval(beat, 60_000); return () => clearInterval(t);
  }, [stale, timeUp]);
  if (stale) return null;
  const exit = async (e: React.FormEvent) => { e.preventDefault(); const r = await fetch('/api/kids/exit', { method: 'POST', headers: H, body: JSON.stringify({ pin }) }); if (r.ok) location.href = '/family'; else setMsg((await r.json().catch(() => ({}))).error || 'تعذّر الخروج.'); setPin(''); };
  return (
    <header className="kid-bar"><a className="home" href="/kids">نور {name}</a>
      {limit != null && <span className="sp" aria-live="polite">باقي {Math.max(0, limit - u).toLocaleString('ar-EG')} دقيقة</span>}
      <button type="button" className="btn ghost small" style={limit == null ? { marginInlineStart: 'auto' } : undefined} onClick={() => setOpen(!open)}>وليّ الأمر</button>
      {open && <form className="kid-exit card" onSubmit={exit} style={{ position: 'absolute', insetInlineEnd: 12, top: 60 }}><label htmlFor="kp">الرقم السري لوليّ الأمر</label><input id="kp" type="password" inputMode="numeric" autoComplete="off" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 8))} /><button className="btn small" disabled={pin.length < 4}>خروج من وضع الطفل</button>{msg && <p className="note" role="alert">{msg}</p>}</form>}
    </header>
  );
}
