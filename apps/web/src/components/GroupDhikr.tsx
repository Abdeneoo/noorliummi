'use client';
import { useEffect, useRef, useState } from 'react';
import { PHRASES } from '@/lib/dhikr-phrases';
import { arDigitsN as ar } from '@/lib/arnum';
import { logDay } from '@/lib/daylog';
type G = { slug: string; display_name: string; feminine: boolean; kind: 'dhikr' | 'dua'; phrase: number; target: number; count: number };
/**
 * A shared dhikr (with an optional target) or a shared dua, dedicated to a named person. Taps are counted on the
 * device and sent in small batches; the page shows the total said by everyone. Counts of acts only.
 */
export default function GroupDhikr({ g, dua, onShare, copied }: { g: G; dua: { masc: string; fem: string; ref: string }; onShare: () => void; copied: boolean }) {
  const [total, setTotal] = useState(g.count); const [mine, setMine] = useState(0); const pending = useRef(0); const [prayed, setPrayed] = useState(false);
  const KEY = `noor.group.${g.slug}`;
  const flush = async () => {
    const n = Math.min(100, pending.current); if (!n) return; pending.current -= n;
    try { const r = await fetch(`/api/khatma/${g.slug}`, { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json', 'x-noor': '1' }, body: JSON.stringify({ action: 'add', n }) }); if (r.ok) setTotal((await r.json()).count); else pending.current += n; } catch { pending.current += n; }
  };
  useEffect(() => {
    try { setMine(Number(localStorage.getItem(KEY)) || 0); setPrayed(sessionStorage.getItem(KEY) === '1'); } catch { /* ignore */ }
    const t = setInterval(() => void flush(), 4000); const bye = () => void flush();
    document.addEventListener('visibilitychange', bye); return () => { clearInterval(t); document.removeEventListener('visibilitychange', bye); void flush(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [KEY]);
  const tap = () => {
    pending.current += 1; setTotal((v) => v + 1); const m = mine + 1; setMine(m); logDay('t');
    try { localStorage.setItem(KEY, String(m)); navigator.vibrate?.(m % 33 === 0 ? 40 : 8); } catch { /* ignore */ }
    if (pending.current >= 33) void flush();
  };
  const pray = () => { setPrayed(true); pending.current += 1; setTotal((v) => v + 1); try { sessionStorage.setItem(KEY, '1'); } catch { /* ignore */ } void flush(); };
  const reached = g.target > 0 && total >= g.target; const pct = g.target ? Math.min(100, (total / g.target) * 100) : 0;
  return (
    <div className="khatma-group">
      <section className="card kg-head" style={{ textAlign: 'center' }}>
        <p className="eyebrow">{g.kind === 'dhikr' ? 'ذكر جماعي' : 'دعاء جماعي'}</p>
        <h1>مُهدى إلى {g.display_name}</h1>
        {g.kind === 'dhikr' ? <>
          <button type="button" className={`tas-tap${reached ? ' reached' : ''}`} onClick={tap} aria-label={`اضغط للذكر: ${PHRASES[g.phrase].ar}`}>
            <span className="tas-phrase" lang="ar">{PHRASES[g.phrase].ar}</span>
            <span className="tas-count" aria-live="polite">{ar(mine)}</span>
            <span className="tas-hint">عددك أنت · اضغط</span>
          </button>
          {g.target > 0 && <div className="khatma-bar" role="progressbar" aria-valuemin={0} aria-valuemax={g.target} aria-valuenow={Math.min(total, g.target)} aria-label="مجموع المشاركين" style={{ marginTop: 16 }}><span style={{ width: `${pct}%` }} /></div>}
          <p className="note" role="status">مجموع ما ذكره الجميع: {ar(total)}{g.target ? ` من ${ar(g.target)}` : ''}{reached ? ' — اكتمل العدد، وما زاد فخير.' : ''}</p>
        </> : <>
          <p lang="ar" className="kg-dua">{g.feminine ? dua.fem : dua.masc}</p>
          <p className="note">{dua.ref}</p>
          <button type="button" className="btn" disabled={prayed} onClick={pray}>{prayed ? 'تقبّل الله دعاءك ✓' : `دعوتُ لـ${g.display_name}`}</button>
          <p className="note" role="status">دعا من هذه الصفحة {ar(total)} مرة.</p>
        </>}
        <div className="row" style={{ justifyContent: 'center' }}><button type="button" className="btn ghost" onClick={onShare}>{copied ? 'نُسخ الرابط ✓' : 'شارك الرابط'}</button></div>
        <p className="note">يُعدّ عدد المرات فقط، بلا حساب ولا بيانات عن المشاركين.</p>
      </section>
    </div>
  );
}
