'use client';
import { useEffect, useMemo, useState } from 'react';
import { METHODS, formatCountdown, formatTime, getPrayerStatus, getScheduleForInstant, qiblaDirection, type MethodId, type PrayerName, type PrayerSettings } from '@noor/prayer-engine';
import { loadPrefs } from '@/lib/adhan';
import { CITIES, cityForTimezone, methodForTimezone, nearestCity, nearestCityDist, type City } from '@/lib/cities';

type Lang = 'ar' | 'en';
const ORDER: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
const KEY = 'noor.prayer.v1';
const JUMUAH = 'noor.jumuah'; // optional HH:MM set by the user for their mosque
const ASKED = 'noor.geo.asked'; // set once the visitor has answered (or dismissed) the location prompt
/** label: Arabic label (kept for older saved data); cid/near: language-neutral place, rendered per language. */
interface Saved { label: string; s: PrayerSettings; src?: 'auto' | 'city' | 'gps'; acc?: number; cid?: string; near?: boolean }

const T = {
  ar: {
    names: { fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' } as Record<PrayerName, string>,
    adhanOff: 'صوت الأذان غير مفعّل على هذا الجهاز.', adhanOn: 'فعّل الأذان', jumuah: 'الجمعة', jumuahNote: 'يوم الجمعة: وقت الظهر المحسوب هو أول وقت الجمعة، وموعد الخطبة والصلاة يحدده مسجدك.', myJumuah: 'موعد الجمعة في مسجدي', clear: 'مسح',
    title: 'مواقيت الصلاة', next: 'الصلاة القادمة', current: 'الصلاة الحالية', city: 'المدينة', method: 'طريقة الحساب',
    here: 'موقعك الحالي', near: (c: string) => `قرب ${c}`,
    gpsOn: (l: string, isHere: boolean) => `المواقيت لموقعك الحالي${isHere ? '' : ` (${l})`}، وتُحدَّث تلقائيًا عند كل زيارة.`,
    refresh: 'تحديث الآن', locate: 'حدّد موقعي',
    auto: (c: string) => `المواقيت الآن لمدينة ${c} بحسب توقيت جهازك.`, chosen: (c: string) => `المواقيت لمدينة ${c}.`, exact: 'لمواقيت مكانك بالضبط:',
    noGeo: 'المتصفح لا يدعم تحديد الموقع. اختر مدينتك من القائمة.',
    asking: 'نطلب إذن موقعك مرة واحدة لنضبط المواقيت على مكانك بالضبط. الموقع لا يغادر جهازك.', locating: 'جارٍ تحديد الموقع…',
    denied: 'لم يُسمح بتحديد الموقع، فالمواقيت حسب المدينة المختارة. يمكنك السماح لاحقًا من إعدادات المتصفح ثم الضغط على «حدّد موقعي».',
    failed: 'تعذّر تحديد الموقع الآن. اختر مدينتك من القائمة أو أعد المحاولة.',
    qibla: (d: string) => `اتجاه القبلة: ${d}° من الشمال الحقيقي. `,
    note: 'المواقيت محسوبة فلكيًا على جهازك وقد تختلف دقائق عن الجدول الرسمي في بلدك؛ موقعك لا يُرسل إلى أي خادم.',
    hijri: 'ar-SA-u-ca-islamic-umalqura-nu-arab', greg: 'ar-EG-u-nu-arab', settings: 'المدينة وطريقة الحساب والجمعة', in: 'بعد',
  },
  en: {
    names: { fajr: 'Fajr', sunrise: 'Sunrise', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' } as Record<PrayerName, string>,
    adhanOff: 'The adhan sound is not enabled on this device.', adhanOn: 'Enable the adhan', jumuah: 'Jumuah', jumuahNote: 'Friday: the calculated Dhuhr time is the start of the Jumuah time; the khutbah and prayer time is set by your mosque.', myJumuah: 'Jumuah at my mosque', clear: 'Clear',
    title: 'Prayer times', next: 'Next prayer', current: 'Current prayer', city: 'City', method: 'Calculation method',
    here: 'Your location', near: (c: string) => `near ${c}`,
    gpsOn: (l: string, isHere: boolean) => `Times for your current location${isHere ? '' : ` (${l})`}, refreshed on each visit.`,
    refresh: 'Refresh now', locate: 'Use my location',
    auto: (c: string) => `Showing times for ${c}, based on your device's time zone.`, chosen: (c: string) => `Showing times for ${c}.`, exact: 'For your exact location:',
    noGeo: 'This browser does not support location. Please choose your city.',
    asking: 'We ask for your location once to match the times to where you are. It never leaves your device.', locating: 'Finding your location…',
    denied: 'Location was not allowed, so times follow the chosen city. You can allow it later in your browser settings, then tap “Use my location”.',
    failed: 'Could not get your location right now. Choose your city or try again.',
    qibla: (d: string) => `Qibla: ${d}° from true north. `,
    note: 'Times are calculated astronomically on your device and may differ by a few minutes from your local official timetable. Your location is never sent to any server.',
    hijri: 'en-u-ca-islamic-umalqura', greg: 'en-GB', settings: 'City, calculation & Jumuah', in: 'in',
  },
};

const cityName = (c: City, lang: Lang) => (lang === 'ar' ? c.ar : c.en);
const fromCity = (id: string): Saved => { const c = CITIES.find((x) => x.id === id) ?? CITIES[0]; return { label: c.ar, cid: c.id, src: 'city', s: { latitude: c.lat, longitude: c.lng, timezone: c.tz, method: c.method } }; };
/** Older saved data has only the Arabic label: recover the city id from it. */
const placeOf = (v: Saved) => {
  if (v.cid) return { city: CITIES.find((c) => c.id === v.cid), near: !!v.near };
  const city = CITIES.find((c) => v.label === c.ar || v.label === `قرب ${c.ar}` || v.label === `${c.ar} (موقعك)`);
  return { city, near: !!city && v.label.startsWith('قرب ') };
};

export default function PrayerCard({ lang = 'ar' }: { lang?: Lang }) {
  const t = T[lang];
  const [saved, setSaved] = useState<Saved | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [geoMsg, setGeoMsg] = useState('');
  const [jumuah, setJumuah] = useState('');
  const [adhanOn, setAdhanOn] = useState(true);
  useEffect(() => { setAdhanOn(loadPrefs().enabled); }, []);
  useEffect(() => { try { setJumuah(localStorage.getItem(JUMUAH) ?? ''); } catch { /* ignore */ } }, []);
  const saveJumuah = (v: string) => { setJumuah(v); try { if (v) localStorage.setItem(JUMUAH, v); else localStorage.removeItem(JUMUAH); } catch { /* ignore */ } };

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let init: Saved | null = null;
    try { const raw = localStorage.getItem(KEY); if (raw) init = JSON.parse(raw) as Saved; } catch { /* storage unavailable */ }
    if (!init) {
      // First visit: start from the device timezone (no permission needed), and remember it so the adhan can work.
      init = { ...fromCity(cityForTimezone(tz)?.id ?? 'makkah'), src: 'auto' };
      try { localStorage.setItem(KEY, JSON.stringify(init)); } catch { /* ignore */ }
    }
    setSaved(init); setNow(new Date());
    // Automatic: already allowed → refresh quietly; never asked → ask once on the first visit; refused → never nag. A manually chosen city is respected.
    if (init.src !== 'city' && 'geolocation' in navigator) {
      let asked = false; try { asked = localStorage.getItem(ASKED) === '1'; } catch { /* ignore */ }
      const auto = (state?: PermissionState) => {
        if (state === 'granted') locate(true);
        else if (state !== 'denied' && !asked) locate(false, true);
      };
      if ('permissions' in navigator) navigator.permissions.query({ name: 'geolocation' }).then((st) => auto(st.state)).catch(() => auto());
      else auto();
    }
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (v: Saved) => { setSaved(v); try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* ignore */ } };

  const view = useMemo(() => {
    if (!saved || !now) return null;
    try {
      return { day: getScheduleForInstant(saved.s, now), status: getPrayerStatus(saved.s, now), qibla: qiblaDirection(saved.s.latitude, saved.s.longitude) };
    } catch { return null; }
  }, [saved, now]);

  const locate = (quiet = false, first = false) => {
    if (!('geolocation' in navigator)) { if (!quiet) setGeoMsg(t.noGeo); return; }
    if (!quiet) setGeoMsg(first ? t.asking : t.locating);
    const mark = () => { try { localStorage.setItem(ASKED, '1'); } catch { /* ignore */ } };
    navigator.geolocation.getCurrentPosition(
      (p) => {
        mark();
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const lat = +p.coords.latitude.toFixed(3); const lng = +p.coords.longitude.toFixed(3);
        const { city, km } = nearestCityDist(lat, lng);
        const known = km <= 150;
        const label = km <= 20 ? city.ar : known ? `قرب ${city.ar}` : 'موقعك الحالي';
        const method = (nearestCity(lat, lng) ?? (known ? city : undefined))?.method ?? methodForTimezone(tz);
        update({ label, cid: known ? city.id : undefined, near: km > 20, src: 'gps', acc: Math.round(p.coords.accuracy), s: { latitude: lat, longitude: lng, timezone: tz, method } });
        setGeoMsg('');
      },
      (err) => {
        mark();
        if (quiet && !first) return;
        setGeoMsg(err.code === 1 ? t.denied : t.failed);
      },
      { maximumAge: 600000, timeout: 15000, enableHighAccuracy: false },
    );
  };

  if (!saved || !now || !view) {
    return <section className="prayer-panel" aria-busy="true" aria-label={t.title}><div className="pp-head"><div className="pp-next"><span className="label">{t.next}</span><span className="count">--:--:--</span></div></div></section>;
  }
  const { day, status, qibla } = view;
  const tz = saved.s.timezone;
  // Inside Makkah a single bearing is meaningless; hide it within ~10 km of the Kaaba.
  const nearKaaba = Math.hypot(saved.s.latitude - 21.4225, saved.s.longitude - 39.8262) < 0.09;
  const place = placeOf(saved);
  const placeLabel = place.city ? (place.near ? t.near(cityName(place.city, lang)) : cityName(place.city, lang)) : t.here;
  const cityId = saved.src === 'gps' ? '' : place.city?.id ?? '';
  const hijri = new Intl.DateTimeFormat(t.hijri, { day: 'numeric', month: 'long', year: 'numeric', timeZone: tz }).format(now);
  const isFriday = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: tz }).format(now) === 'Fri';
  const pname = (p: PrayerName) => (p === 'dhuhr' && isFriday ? t.jumuah : t.names[p]);
  const greg = new Intl.DateTimeFormat(t.greg, { weekday: 'long', day: 'numeric', month: 'long', timeZone: tz }).format(now);

  // Day arc: Fajr at one end, Isha at the other; the light sits at "now" (exact quadratic split, no approximation).
  const t0 = day.times.fajr.getTime(), t1 = day.times.isha.getTime();
  const fr = (ms: number) => Math.min(1, Math.max(0, (ms - t0) / (t1 - t0)));
  const P0 = [24, 132], P1 = [500, -64], P2 = [976, 132];
  const at = (u: number) => [0, 1].map((k) => (1 - u) ** 2 * P0[k] + 2 * (1 - u) * u * P1[k] + u ** 2 * P2[k]);
  const u = fr(now.getTime());
  const Q0 = [0, 1].map((k) => (1 - u) * P0[k] + u * P1[k]);
  const B = at(u);
  const done = `M${P0[0]} ${P0[1]}Q${Q0[0].toFixed(1)} ${Q0[1].toFixed(1)} ${B[0].toFixed(1)} ${B[1].toFixed(1)}`;
  const isNext = (p: PrayerName) => p === status.next.name;
  // RTL: the day runs right-to-left, so mirror the arc for Arabic.
  const flip = lang === 'ar' ? 'scale(-1 1) translate(-1000 0)' : undefined;

  return (
    <section className="prayer-panel" aria-label={t.title}>
      <div className="pp-head">
        <div className="pp-next" aria-live="off">
          <span className="label">{t.next}</span>
          <span className="name">{pname(status.next.name)} <span className="at">{formatTime(status.next.time, tz)}</span></span>
          <span className="count" role="timer">{formatCountdown(status.remainingMs)}</span>
        </div>
        <div className="pp-meta">
          <span className="place">{placeLabel}</span>
          <span>{greg}</span>
          <span>{hijri}</span>
          <button type="button" className="btn ghost small" onClick={() => locate()}>{saved.src === 'gps' ? t.refresh : t.locate}</button>
        </div>
      </div>
      <svg className="pp-arc" viewBox="0 0 1000 150" preserveAspectRatio="none" aria-hidden="true">
        <g transform={flip}>
          <path className="track" d={`M${P0[0]} ${P0[1]}Q${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`} />
          <path className="done" pathLength="1" d={done} />
          {ORDER.map((p) => { const [x, y] = at(fr(day.times[p].getTime())); return <circle key={p} className={isNext(p) ? 'tick next' : 'tick'} cx={x} cy={y} r={isNext(p) ? 6 : 4} />; })}
          <circle className="sun-halo" cx={B[0]} cy={B[1]} r="22" />
          <circle className="sun" cx={B[0]} cy={B[1]} r="9" />
        </g>
      </svg>
      <ul className="times">
        {ORDER.map((p) => (
          <li key={p} aria-current={isNext(p) ? 'true' : undefined}>
            <span className="n">{pname(p)}</span>
            <span className="t">{formatTime(day.times[p], tz)}{p === 'dhuhr' && isFriday && jumuah ? <small> · {jumuah}</small> : null}</span>
          </li>
        ))}
      </ul>
      {saved.src !== 'gps' && <p className="pp-hint">{saved.src === 'auto' ? t.auto(placeLabel) : t.chosen(placeLabel)}{' '}{t.exact}{' '}<button type="button" className="linkish" onClick={() => locate()}>{t.locate}</button></p>}
      {geoMsg && <p className="note" role="status">{geoMsg}</p>}
      {!adhanOn && <p className="pp-hint">{t.adhanOff} <a href={lang === 'en' ? '/en/adhan' : '/adhan'}>{t.adhanOn}</a></p>}
      {isFriday && <p className="note">{t.jumuahNote}</p>}
      <details className="pp-settings">
        <summary>{t.settings}</summary>
        <div className="row">
          <div className="field"><label htmlFor="city">{t.city}</label>
          <select id="city" value={cityId} onChange={(e) => e.target.value && update(fromCity(e.target.value))}>
            {!cityId && <option value="">{placeLabel}</option>}
            {CITIES.map((c) => <option key={c.id} value={c.id}>{cityName(c, lang)}</option>)}
          </select></div>
          <div className="field"><label htmlFor="method">{t.method}</label>
          <select id="method" value={saved.s.method} onChange={(e) => update({ ...saved, s: { ...saved.s, method: e.target.value as MethodId } })}>
            {Object.entries(METHODS).map(([id, m]) => <option key={id} value={id}>{m[lang]}</option>)}
          </select></div>
          <div className="field"><label htmlFor="jum">{t.myJumuah}</label>
          <div className="row" style={{ marginTop: 0 }}>
            <input id="jum" type="time" value={jumuah} onChange={(e) => saveJumuah(e.target.value)} />
            {jumuah && <button type="button" className="btn ghost small" onClick={() => saveJumuah('')}>{t.clear}</button>}
          </div></div>
        </div>
        <p className="note">{nearKaaba ? '' : t.qibla(qibla.toFixed(1))}{' '}{t.note}</p>
      </details>
    </section>
  );
}
