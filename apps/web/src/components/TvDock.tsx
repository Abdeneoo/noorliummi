'use client';
import Link from 'next/link';
import { useEffect, useSyncExternalStore } from 'react';
import { tvAgree, tvClose, tvInit, tvSmall, tvState, tvSubscribe } from '@/lib/tv-store';
const SERVER = tvState();
/** The persistent TVQuran player (official embed). Rendered once in the root layout. */
export default function TvDock({ lang = 'ar' }: { lang?: 'ar' | 'en' }) {
  const en = lang === 'en';
  const s = useSyncExternalStore(tvSubscribe, tvState, () => SERVER);
  useEffect(() => { tvInit(); }, []);
  if (!s.now) return null;
  return (
    <div className={`audio-dock tv-dock${s.small ? ' small' : ''}`} role="region" aria-label={en ? 'TVQuran player' : 'مشغّل TVQuran'}>
      <div className="ad-row">
        <div className="ad-info" style={{ cursor: 'default' }}><strong>{s.now.title}</strong><small>{s.now.by} · {en ? 'TVQuran official player' : 'المشغّل الرسمي لموقع TVQuran'}</small></div>
        <button type="button" className="ad-btn" onClick={() => tvSmall(!s.small)} aria-label={s.small ? (en ? 'Enlarge player' : 'تكبير المشغّل') : (en ? 'Shrink player' : 'تصغير المشغّل')}>{s.small ? '▢' : '▁'}</button>
        <button type="button" className="ad-btn" onClick={() => tvClose()} aria-label={en ? 'Close the player' : 'إغلاق المشغّل'}>✕</button>
      </div>
      {!s.consent ? (
        <div className="note" style={{ padding: '6px 0' }}><p style={{ margin: '0 0 6px' }}>{en ? 'This player is from TVQuran (an outside service that may use analytics). Nothing loads before you agree.' : 'المشغّل من موقع TVQuran (خدمة خارجية قد تستخدم أدوات إحصاء). لا يُحمّل شيء منه قبل موافقتك.'}</p>
          <button type="button" className="btn small" onClick={tvAgree}>{en ? 'Agree and play' : 'موافق، شغّل'}</button></div>
      ) : (
        <div className="tv-wrap"><iframe key={s.now.id} src={`https://www.tvquran.com/ar/selection/${s.now.id}/embeddable`} title={s.now.title} className="tv-frame"
          allow="autoplay" referrerPolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-popups" /></div>
      )}
      <p className="ad-src" style={{ margin: '4px 0 0' }}>{en ? 'Keeps playing while you move between pages. Stops if you close the tab; some phones stop it when the screen locks (a browser limit).' : <>يستمر أثناء التنقل داخل الموقع. لا يعمل بعد إغلاق الصفحة، وقد يتوقف عند قفل الشاشة أو تصغير المتصفح على بعض الهواتف (قيد من المتصفح). <Link href="/duas/audio#tv-help">التفاصيل</Link></>}</p>
    </div>
  );
}
