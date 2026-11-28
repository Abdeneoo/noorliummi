'use client';
import { useState } from 'react';

/** Schematic map of the five mawaqit around Makkah (approximate coordinates of the miqat mosques), with straight-line
 *  distances. «Where am I?» uses the device location only after a tap, and nothing leaves the device. */
type Lang = 'ar' | 'en';
type P = { id: string; ar: string; en: string; alt?: { ar: string; en: string }; lat: number; lng: number };
const MAKKAH = { lat: 21.4225, lng: 39.8262 };
const MIQAT: P[] = [
  { id: 'dhul', ar: 'ذو الحليفة', en: 'Dhul-Hulayfah', alt: { ar: 'أبيار علي', en: 'Abyar Ali' }, lat: 24.4136, lng: 39.5433 },
  { id: 'juhfa', ar: 'الجحفة', en: 'Al-Juhfah', alt: { ar: 'قرب رابغ', en: 'near Rabigh' }, lat: 22.6966, lng: 39.1440 },
  { id: 'irq', ar: 'ذات عرق', en: 'Dhat Irq', lat: 21.9330, lng: 40.4330 },
  { id: 'qarn', ar: 'قرن المنازل', en: 'Qarn al-Manazil', alt: { ar: 'السيل الكبير', en: 'As-Sayl al-Kabir' }, lat: 21.6300, lng: 40.4250 },
  { id: 'yalam', ar: 'يلملم', en: 'Yalamlam', alt: { ar: 'السعدية', en: "As-Sa'diyyah" }, lat: 20.5180, lng: 39.8700 },
];
const REF: P[] = [{ id: 'mad', ar: 'المدينة', en: 'Madinah', lat: 24.4672, lng: 39.6111 }, { id: 'jed', ar: 'جدة', en: 'Jeddah', lat: 21.4858, lng: 39.1925 }];
const km = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371, r = Math.PI / 180, dLa = (b.lat - a.lat) * r, dLo = (b.lng - a.lng) * r;
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h));
};
// Equirectangular projection fitted to the region; x grows east. The SVG is forced LTR so east stays on the right.
const B = { n: 24.9, s: 20.1, w: 38.7, e: 41.1 }; const W = 520, H = 560;
const X = (lng: number) => ((lng - B.w) / (B.e - B.w)) * W; const Y = (lat: number) => ((B.n - lat) / (B.n - B.s)) * H;
const pxPerKm = H / ((B.n - B.s) * 111.2);
const T = {
  ar: { cap: 'المواقيت المكانية حول مكة', note: 'مواقع تقريبية لمساجد المواقيت، والمسافات بخط مستقيم إلى المسجد الحرام.', me: 'كم أبعد عن كل ميقات؟', meWait: 'جارٍ تحديد موقعك…', meErr: 'تعذّر تحديد موقعك.', fromMe: 'عنك', km: 'كم', open: 'افتح في الخرائط', makkah: 'مكة', n: 'ش' },
  en: { cap: 'The mawaqit around Makkah', note: 'Approximate positions of the miqat mosques; straight-line distances to al-Masjid al-Haram.', me: 'How far am I from each miqat?', meWait: 'Finding your location…', meErr: 'Could not get your location.', fromMe: 'from you', km: 'km', open: 'Open in maps', makkah: 'Makkah', n: 'N' },
};

export default function MiqatMap({ lang = 'ar' }: { lang?: Lang }) {
  const t = T[lang]; const N = (n: number) => Math.round(n).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en');
  const [sel, setSel] = useState('dhul'); const [me, setMe] = useState<{ lat: number; lng: number } | null>(null); const [st, setSt] = useState('');
  const locate = () => {
    if (!navigator.geolocation) { setSt(t.meErr); return; }
    setSt(t.meWait);
    navigator.geolocation.getCurrentPosition((p) => { setMe({ lat: p.coords.latitude, lng: p.coords.longitude }); setSt(''); }, () => setSt(t.meErr), { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 });
  };
  const mk = { x: X(MAKKAH.lng), y: Y(MAKKAH.lat) };
  const s = MIQAT.find((m) => m.id === sel)!;
  const meIn = me && me.lat < B.n && me.lat > B.s && me.lng > B.w && me.lng < B.e;
  return (
    <figure className="mq">
      <div className="mq-map">
        <svg viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t.cap}>
          <defs><radialGradient id="mq-g"><stop offset="0" stopColor="var(--gold)" stopOpacity=".35" /><stop offset="1" stopColor="var(--gold)" stopOpacity="0" /></radialGradient></defs>
          {[100, 200, 300, 400].map((r) => <g key={r}><circle cx={mk.x} cy={mk.y} r={r * pxPerKm} className="mq-ring" /><text x={mk.x + 4} y={mk.y - r * pxPerKm - 4} className="mq-ring-t">{N(r)} {t.km}</text></g>)}
          <circle cx={mk.x} cy={mk.y} r={70} fill="url(#mq-g)" className="mq-glow" />
          {MIQAT.map((m, i) => <line key={m.id} x1={mk.x} y1={mk.y} x2={X(m.lng)} y2={Y(m.lat)} className={`mq-line${m.id === sel ? ' on' : ''}`} style={{ animationDelay: `${i * 120}ms` }} />)}
          {REF.map((r) => <g key={r.id} className="mq-ref"><circle cx={X(r.lng)} cy={Y(r.lat)} r={3.5} /><text x={X(r.lng) + 8} y={Y(r.lat) + 4}>{r[lang]}</text></g>)}
          {MIQAT.map((m, i) => {
            const x = X(m.lng), y = Y(m.lat), left = x > W * 0.62;
            return (
              <g key={m.id} className={`mq-pt${m.id === sel ? ' on' : ''}`} style={{ animationDelay: `${300 + i * 120}ms` }} onClick={() => setSel(m.id)} role="button" tabIndex={0} aria-label={m[lang]} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSel(m.id); }}>
                <circle cx={x} cy={y} r={16} className="mq-hit" /><circle cx={x} cy={y} r={7} className="mq-dot" /><circle cx={x} cy={y} r={7} className="mq-pulse" />
                <text x={left ? x - 12 : x + 12} y={y - 2} textAnchor={left ? 'end' : 'start'} className="mq-name">{m[lang]}</text>
                <text x={left ? x - 12 : x + 12} y={y + 22} textAnchor={left ? 'end' : 'start'} className="mq-km">{N(km(m, MAKKAH))} {t.km}</text>
              </g>
            );
          })}
          <g className="mq-makkah"><rect x={mk.x - 10} y={mk.y - 10} width={20} height={20} rx={3} /><text x={mk.x} y={mk.y + 34} textAnchor="middle">{t.makkah}</text></g>
          {meIn && <g className="mq-me"><circle cx={X(me!.lng)} cy={Y(me!.lat)} r={6} /></g>}
          <g className="mq-north" transform={`translate(${W - 34} 34)`}><path d="M0 -16 L7 6 L0 1 L-7 6 Z" /><text y={22} textAnchor="middle">{t.n}</text></g>
        </svg>
      </div>
      <div className="mq-side">
        <ul className="mq-list">{MIQAT.map((m) => (
          <li key={m.id}><button type="button" className={m.id === sel ? 'on' : ''} onClick={() => setSel(m.id)} aria-pressed={m.id === sel}>
            <strong>{m[lang]}</strong>{m.alt && <small>{m.alt[lang]}</small>}
            <span className="mq-d">{N(km(m, MAKKAH))} {t.km}{me ? ` · ${N(km(m, me))} ${t.km} ${t.fromMe}` : ''}</span>
          </button></li>))}</ul>
        <div className="mq-actions">
          <a className="btn small" href={`https://www.openstreetmap.org/?mlat=${s.lat}&mlon=${s.lng}#map=13/${s.lat}/${s.lng}`} target="_blank" rel="noopener">{t.open}: {s[lang]}</a>
          <button type="button" className="btn ghost small" onClick={locate}>{t.me}</button>
        </div>
        {st && <p className="note" role="status">{st}</p>}
        <figcaption className="note">{t.note}</figcaption>
      </div>
    </figure>
  );
}
