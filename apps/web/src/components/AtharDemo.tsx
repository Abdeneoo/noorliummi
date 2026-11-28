'use client';
import { useEffect, useRef, useState } from 'react';

/** A short animated walkthrough (motion graphic, not a video file) of making a «صفحة أثر», shown inside an iPhone frame.
 *  The name in it is a placeholder; nothing here is real user data. Pauses on hover/tap and respects reduced motion. */
const SCENES = [
  { t: 'اكتب اسم من تحب', d: 'الاسم وصلة القرابة وتاريخ الوفاة إن شئت.' },
  { t: 'اختر ما يُقرأ ويُسمع', d: 'سور وأذكار، ودعاء مسموع، وكلمة إهداء.' },
  { t: 'انشر الصفحة', d: 'تُنشأ صفحة باسمه برابط خاص.' },
  { t: 'هكذا تظهر', d: 'يقرأ كل من يفتحها ويستمع ويدعو له.' },
  { t: 'أرسلها لأهلك', d: 'على واتساب أو أي تطبيق، وتظهر بصورتها.' },
];
const NAME = 'محمد عبد الله';
const DUR = 3600;

export default function AtharDemo({ compact = false }: { compact?: boolean }) {
  const [i, setI] = useState(0); const [play, setPlay] = useState(true); const [typed, setTyped] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) setPlay(false); }, []);
  useEffect(() => { if (!play) return; const id = window.setTimeout(() => setI((x) => (x + 1) % SCENES.length), DUR); return () => clearTimeout(id); }, [i, play]);
  useEffect(() => {
    if (i !== 0) { setTyped(NAME.length); return; }
    setTyped(0); if (!play) { setTyped(NAME.length); return; }
    let n = 0; const id = window.setInterval(() => { n++; setTyped(n); if (n >= NAME.length) clearInterval(id); }, 120); return () => clearInterval(id);
  }, [i, play]);
  return (
    <div className={`ad${compact ? ' ad-compact' : ''}`} ref={box}>
      <div className="ad-stage" onMouseEnter={() => setPlay(false)} onMouseLeave={() => setPlay(true)}>
        <div className="ad-phone" aria-hidden="true">
          <span className="ad-island" /><span className="ad-status"><b>9:41</b><i /></span>
          <div className="ad-screen">
            {/* 1 — name */}
            <section className={`ad-sc${i === 0 ? ' on' : ''}`}>
              <p className="ad-h">صفحة أثر جديدة</p>
              <label className="ad-l">الاسم</label><div className="ad-in">{NAME.slice(0, typed)}<span className="ad-caret" /></div>
              <label className="ad-l">صلة القرابة</label><div className="ad-in ad-muted">والدي</div>
              <label className="ad-l">تاريخ الوفاة</label><div className="ad-in ad-muted">١٤٤٨/٥/١٢</div>
            </section>
            {/* 2 — content */}
            <section className={`ad-sc${i === 1 ? ' on' : ''}`}>
              <p className="ad-h">ما يُقرأ في الصفحة</p>
              {['سورة يس', 'سورة الملك', 'الدعاء للميت', 'أذكار الصباح'].map((x, k) => <div key={x} className="ad-row" style={{ animationDelay: `${k * 220}ms` }}><span className="ad-check" />{x}</div>)}
              <div className="ad-voice"><span className="ad-play" />الدعاء المسموع<span className="ad-eq"><i /><i /><i /><i /></span></div>
            </section>
            {/* 3 — publish */}
            <section className={`ad-sc${i === 2 ? ' on' : ''}`}>
              <p className="ad-h">جاهزة</p>
              <div className="ad-preview"><span className="ad-arch" /><b>{NAME}</b><small>رحمه الله</small></div>
              <div className="ad-btn">انشر الصفحة<span className="ad-ripple" /></div>
              <div className="ad-ok">✓ نُشرت</div>
            </section>
            {/* 4 — the page */}
            <section className={`ad-sc ad-page${i === 3 ? ' on' : ''}`}>
              <div className="ad-hero"><span className="ad-arch" /><b>{NAME}</b><small>صدقة جارية عن روحه</small></div>
              <p className="ad-dua">اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ</p>
              <div className="ad-voice"><span className="ad-play" />سورة يس<span className="ad-eq"><i /><i /><i /><i /></span></div>
              <div className="ad-row">سورة الملك</div><div className="ad-row">الدعاء للميت</div>
            </section>
            {/* 5 — share */}
            <section className={`ad-sc ad-chat${i === 4 ? ' on' : ''}`}>
              <p className="ad-h">العائلة</p>
              <div className="ad-bubble"><div className="ad-card"><span className="ad-arch" /><b>{NAME}</b><small>noorliummi.io</small></div>ادعوا له 🤍</div>
              <div className="ad-bubble ad-them">اللهم ارحمه واغفر له</div>
            </section>
          </div>
          <span className="ad-home" />
        </div>
        <span className="ad-tap" style={{ ['--tx' as string]: ['62%', '30%', '50%', '28%', '60%'][i], ['--ty' as string]: ['26%', '40%', '62%', '54%', '42%'][i] }} />
      </div>
      <div className="ad-side">
        <ol className="ad-steps">{SCENES.map((s, k) => (
          <li key={k} className={k === i ? 'on' : k < i ? 'done' : ''}>
            <button type="button" onClick={() => { setI(k); setPlay(false); }} aria-current={k === i ? 'step' : undefined}>
              <span className="ad-n">{(k + 1).toLocaleString('ar-EG')}</span><span><strong>{s.t}</strong><small>{s.d}</small></span>
            </button>
            {k === i && play && <span className="ad-prog" style={{ animationDuration: `${DUR}ms` }} />}
          </li>))}</ol>
        <button type="button" className="btn ghost small ad-toggle" onClick={() => setPlay((p) => !p)} aria-pressed={!play}>{play ? '❚❚ إيقاف' : '▶ تشغيل الشرح'}</button>
      </div>
    </div>
  );
}
