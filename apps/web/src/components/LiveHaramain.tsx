'use client';
import { useEffect, useRef, useState } from 'react';
const CH = { makkah: { title: 'المسجد الحرام — مكة المكرمة', by: 'قناة القرآن الكريم', url: 'https://www.youtube.com/@SaudiQuranTv/live' }, madinah: { title: 'المسجد النبوي — المدينة المنورة', by: 'قناة السنة النبوية', url: 'https://www.youtube.com/@SaudiSunnahTv/live' } } as const;
const src = (id: string) => (id.startsWith('UC') ? `https://www.youtube-nocookie.com/embed/live_stream?channel=${id}&autoplay=1&rel=0` : `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`);
/** Official Haramain live streams. The YouTube player is loaded only after the visitor agrees (privacy-enhanced domain). */
export default function LiveHaramain() {
  const [ids, setIds] = useState<Record<string, string> | null>(null); const [ok, setOk] = useState(false); const [on, setOn] = useState<Record<string, boolean>>({}); const [big, setBig] = useState<string | null>(null);
  const frames = useRef<Record<string, HTMLDivElement | null>>({});
  // Full screen through the browser when it allows it (desktop, Android); otherwise the player fills the page (iPhone).
  const enlarge = (k: string) => { const el = frames.current[k] as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null; if (!el) return; if (document.fullscreenElement) { void document.exitFullscreen(); return; } if (el.requestFullscreen) el.requestFullscreen().catch(() => setBig(k)); else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen(); else setBig(big === k ? null : k); };
  useEffect(() => { const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setBig(null); }; document.addEventListener('keydown', esc); return () => document.removeEventListener('keydown', esc); }, []);
  useEffect(() => { fetch('/api/live').then((r) => r.json()).then(setIds).catch(() => setIds({})); try { setOk(localStorage.getItem('noor.yt.ok') === '1'); } catch { /* ignore */ } }, []);
  const agree = (k: string) => { try { localStorage.setItem('noor.yt.ok', '1'); } catch { /* ignore */ } setOk(true); setOn((v) => ({ ...v, [k]: true })); };
  return (
    <>
      <p className="review-banner">البث من القناتين الرسميتين على يوتيوب. تشغيله يحمّل مشغّل يوتيوب (خدمة خارجية من Google قد تجمع بيانات عن المشاهدة) بوضع الخصوصية المحسّن، ولا يُحمَّل شيء منه قبل أن تضغط «شغّل البث».</p>
      <div className="live-grid">
        {(['makkah', 'madinah'] as const).map((k) => (
          <section key={k} className="card live">
            <h2 style={{ marginTop: 0 }}>{CH[k].title}</h2>
            <div className={`live-frame${big === k ? ' big' : ''}`} ref={(el) => { frames.current[k] = el; }}>
              {big === k && <button type="button" className="live-close" onClick={() => setBig(null)}>تصغير ✕</button>}
              {on[k] && ids?.[k] ? <iframe src={src(ids[k])} title={CH[k].title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
                : <button type="button" className="live-play" onClick={() => (ok ? setOn((v) => ({ ...v, [k]: true })) : agree(k))} disabled={!ids}><span aria-hidden="true">▶</span>{ok ? 'شغّل البث' : 'أوافق وشغّل البث'}</button>}
            </div>
            <div className="row"><a className="btn ghost small" href={CH[k].url} target="_blank" rel="noopener">افتحه على يوتيوب ({CH[k].by}) ↗</a>{on[k] && <button type="button" className="btn small" onClick={() => enlarge(k)}>⛶ ملء الشاشة</button>}{on[k] && <button type="button" className="btn ghost small" onClick={() => { setBig(null); setOn((v) => ({ ...v, [k]: false })); }}>أوقف</button>}</div>
            <p className="note">إن ظهر أن البث غير متاح داخل الصفحة فافتحه من القناة الرسمية بالزر أعلاه. الحقوق للقناة.</p>
          </section>))}
      </div>
    </>
  );
}
