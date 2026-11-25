'use client';
import { useEffect, useRef, useState } from 'react';

type Evt = DeviceOrientationEvent & { webkitCompassHeading?: number; webkitCompassAccuracy?: number };

/**
 * Qibla dial. Always shows the bearing from north (works with any compass).
 * With a phone sensor the dial turns live; heading is magnetic (iOS) or the browser's absolute heading (Android).
 */
const M = {
  ar: { calib: 'حرّك الهاتف على شكل رقم 8 مرة أو مرتين لمعايرة البوصلة…', none: 'لم يصل من المتصفح أي اتجاه. على آيفون: افتح الموقع في Safari (كروم وغيره على آيفون لا يتيحون البوصلة للمواقع غالبًا)، ثم اسمح بالوصول إلى «الحركة والاتجاه». ويمكنك دائمًا استخدام الزاوية المكتوبة مع أي بوصلة.', unsupported: 'هذا المتصفح لا يدعم حسّاس الاتجاه. استخدم الزاوية المكتوبة مع أي بوصلة.', denied: 'لم يُسمح بالوصول إلى الحركة والاتجاه. يمكنك السماح من إعدادات المتصفح ثم المحاولة مرة أخرى.', failed: 'تعذّر طلب إذن الاتجاه في هذا المتصفح. على آيفون جرّب Safari.', aria: (d: string) => `اتجاه القبلة ${d} درجة من الشمال`, north: 'ش', deg: 'من الشمال الحقيقي، مع عقارب الساعة.', start: 'تشغيل البوصلة', facing: 'أنت تواجه القبلة تقريبًا.', turn: (right: boolean, d: number) => `استدر نحو ${right ? 'اليمين' : 'اليسار'} ${d}° حتى يصل السهم إلى أعلى الدائرة.`, note: 'بوصلة الهاتف تقريبية وتتأثر بالمعادن والمغناطيس القريب؛ أبعده عن الحديد، وتحقق باتجاه المحراب عند الإمكان.' },
  en: { calib: 'Move your phone in a figure 8 once or twice to calibrate the compass…', none: 'No heading came from the browser. On iPhone, open the site in Safari (Chrome and other iPhone browsers usually do not give websites the compass), then allow “Motion & Orientation”. You can always use the bearing shown with any compass.', unsupported: 'This browser has no orientation sensor. Use the bearing shown with any compass.', denied: 'Motion & orientation access was not allowed. You can allow it in your browser settings and try again.', failed: 'Could not request orientation access in this browser. On iPhone, try Safari.', aria: (d: string) => `Qibla direction ${d} degrees from north`, north: 'N', deg: 'from true north, clockwise.', start: 'Start compass', facing: 'You are facing the qibla.', turn: (right: boolean, d: number) => `Turn ${right ? 'right' : 'left'} ${d}° until the arrow points to the top.`, note: 'Phone compasses are approximate and affected by metal and nearby magnets; keep it away from iron, and check against the mihrab where you can.' },
};

export default function QiblaCompass({ qibla, lang = 'ar' }: { qibla: number; lang?: 'ar' | 'en' }) {
  const t = M[lang];
  const [heading, setHeading] = useState<number | null>(null);
  const [msg, setMsg] = useState('');
  const got = useRef(false);
  const off = useRef<() => void>(() => undefined);
  useEffect(() => () => off.current(), []);

  const start = () => {
    const onEvt = (e: Evt) => {
      let h: number | null = null;
      if (typeof e.webkitCompassHeading === 'number' && e.webkitCompassHeading >= 0) h = e.webkitCompassHeading; // iOS
      else if (e.absolute && e.alpha != null) h = (360 - e.alpha) % 360; // Android (absolute only; relative alpha is not north)
      if (h != null) { got.current = true; setHeading(h); setMsg(''); }
    };
    const listen = () => {
      window.addEventListener('deviceorientationabsolute', onEvt as EventListener, true);
      window.addEventListener('deviceorientation', onEvt as EventListener, true);
      off.current = () => { window.removeEventListener('deviceorientationabsolute', onEvt as EventListener, true); window.removeEventListener('deviceorientation', onEvt as EventListener, true); };
      setMsg(t.calib);
      setTimeout(() => {
        if (!got.current) setMsg(t.none);
      }, 3500);
    };
    const DOE = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<'granted' | 'denied'> } }).DeviceOrientationEvent;
    if (!DOE) { setMsg(t.unsupported); return; }
    if (typeof DOE.requestPermission === 'function') {
      // iOS: must be called directly inside the tap.
      DOE.requestPermission().then((r) => { if (r === 'granted') listen(); else setMsg(t.denied); })
        .catch(() => setMsg(t.failed));
    } else listen();
  };

  const rot = heading == null ? 0 : -heading; // turn the dial so north on screen matches real north
  const rel = heading == null ? null : ((qibla - heading + 540) % 360) - 180;
  const facing = rel != null && Math.abs(rel) < 6;
  return (
    <div className="qibla">
      <svg viewBox="-110 -110 220 220" width="220" height="220" role="img" aria-label={t.aria(qibla.toFixed(1))}>
        <circle r="100" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="2" />
        <circle r="6" fill="currentColor" />
        <g style={{ transform: `rotate(${rot}deg)`, transition: 'transform .25s linear' }}>
          {Array.from({ length: 36 }, (_, i) => <line key={i} x1="0" y1="-100" x2="0" y2={i % 9 === 0 ? -86 : -93} stroke="currentColor" strokeOpacity=".45" strokeWidth={i % 9 === 0 ? 3 : 1.5} transform={`rotate(${i * 10})`} />)}
          <text y="-70" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--danger)">{t.north}</text>
          <g transform={`rotate(${qibla})`}>
            <line x1="0" y1="0" x2="0" y2="-78" stroke={facing ? 'var(--success)' : 'var(--accent-strong, #103d32)'} strokeWidth="6" strokeLinecap="round" />
            <rect x="-9" y="-98" width="18" height="18" rx="2" fill="#111" stroke="#c6a66b" strokeWidth="2" />
          </g>
        </g>
        {heading != null && <polygon points="0,-108 -7,-96 7,-96" fill="currentColor" />}
      </svg>
      <p><strong>{qibla.toFixed(1)}°</strong> {t.deg}</p>
      {heading == null
        ? <button type="button" className="btn ghost" onClick={start}>{t.start}</button>
        : <p role="status">{facing ? t.facing : t.turn(rel! > 0, Math.abs(Math.round(rel!)))}</p>}
      {msg && <p className="note" role="status">{msg}</p>}
      <p className="note">{t.note}</p>
    </div>
  );
}
