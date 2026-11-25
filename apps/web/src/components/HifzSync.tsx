'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
const KEY = 'noor.hifz.v1'; const FLAG = 'noor.hifz.sync'; const H = { 'content-type': 'application/json', 'x-noor': '1' };
let timer: ReturnType<typeof setTimeout> | null = null;
/** Called by the hifz page after each change: uploads the state a few seconds later, only if the user turned sync on. */
export function queueHifzSync() {
  try { if (localStorage.getItem(FLAG) !== '1') return; } catch { return; }
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => { const body = localStorage.getItem(KEY); if (body) void fetch('/api/account/hifz', { method: 'PUT', headers: H, body, keepalive: body.length < 60000 }).catch(() => undefined); }, 3000);
}
export default function HifzSync({ lang = 'ar' }: { lang?: 'ar' | 'en' }) {
  const ar = lang === 'ar';
  const [user, setUser] = useState<boolean | null>(null); const [on, setOn] = useState(false); const [server, setServer] = useState<string | null>(null); const [msg, setMsg] = useState('');
  useEffect(() => {
    try { setOn(localStorage.getItem(FLAG) === '1'); } catch { /* ignore */ }
    fetch('/api/account/hifz', { cache: 'no-store' }).then(async (r) => { setUser(r.ok); if (r.ok) setServer((await r.json()).updated_at ?? null); }).catch(() => setUser(false));
  }, []);
  const toggle = async (v: boolean) => {
    setOn(v); try { localStorage.setItem(FLAG, v ? '1' : '0'); } catch { /* ignore */ }
    if (v) { const body = localStorage.getItem(KEY); if (body) { const r = await fetch('/api/account/hifz', { method: 'PUT', headers: H, body }); setMsg(r.ok ? (ar ? 'تمت المزامنة.' : 'Synced.') : (ar ? 'تعذّرت المزامنة.' : 'Sync failed.')); if (r.ok) setServer(new Date().toISOString()); } }
    else { await fetch('/api/account/hifz', { method: 'DELETE', headers: H }); setServer(null); setMsg(ar ? 'أُوقفت المزامنة وحُذفت النسخة من الخادم.' : 'Sync turned off and the server copy deleted.'); }
  };
  const restore = async () => {
    if (!confirm(ar ? 'استبدال تقدّم الحفظ على هذا الجهاز بالنسخة المحفوظة في حسابك؟' : 'Replace the progress on this device with the copy in your account?')) return;
    const r = await fetch('/api/account/hifz', { cache: 'no-store' }); const j = await r.json(); if (!j.data) return;
    localStorage.setItem(KEY, JSON.stringify(j.data)); localStorage.setItem(FLAG, '1'); location.reload();
  };
  if (user === null) return null;
  return (
    <section className="card" aria-labelledby="hs-title">
      <h2 id="hs-title" style={{ marginTop: 0 }}>{ar ? 'مزامنة الحفظ مع حسابي (اختياري)' : 'Sync with my account (optional)'}</h2>
      {!user ? <p className="note">{ar ? <>الحفظ يعمل كاملًا على جهازك دون حساب. للمزامنة بين أجهزتك أو لمتابعة معلّمك في حلقة: <Link href="/account">سجّل الدخول</Link>.</> : <>Memorisation works fully on your device without an account. To sync across devices: <Link href="/account">sign in</Link>.</>}</p> : <>
        <label className="listed-opt"><input type="checkbox" checked={on} onChange={(e) => void toggle(e.target.checked)} /> <span>{ar ? 'احفظ نسخة من تقدّم حفظي في حسابي على الخادم' : 'Keep a copy of my progress in my account on the server'}</span></label>
        <p className="note">{ar ? 'عند التفعيل تُرفع خطة الحفظ ومواعيد المراجعة إلى خادمنا لتسترجعها من جهاز آخر، ويراها ملخصةً مشرف الحلقة التي انضممت إليها فقط. إيقافها يحذف النسخة من الخادم.' : 'When on, your plan and review schedule are uploaded so you can restore them on another device; only the supervisor of a circle you joined sees a summary. Turning it off deletes the server copy.'}</p>
        {server && <div className="row"><span className="note" style={{ margin: 0 }}>{ar ? 'آخر نسخة في الحساب:' : 'Last copy:'} {new Date(server).toLocaleString(ar ? 'ar-EG' : 'en-GB')}</span><button type="button" className="btn ghost small" onClick={restore}>{ar ? 'استرجعها على هذا الجهاز' : 'Restore on this device'}</button></div>}
        {msg && <p className="note" role="status">{msg}</p>}</>}
    </section>
  );
}
