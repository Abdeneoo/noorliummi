'use client';
import { useEffect, useMemo, useState } from 'react';
import { METHODS, formatCountdown, formatTime, getPrayerStatus, getScheduleForInstant, qiblaDirection, type MethodId, type PrayerName, type PrayerSettings } from '@noor/prayer-engine';
import { CITIES, cityForTimezone, methodForTimezone, nearestCity, nearestCityDist } from '@/lib/cities';

const NAMES: Record<PrayerName, string> = { fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' };
const ORDER: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
const KEY = 'noor.prayer.v1';
const ASKED = 'noor.geo.asked'; // set once the visitor has answered (or dismissed) the location prompt
interface Saved { label: string; s: PrayerSettings; src?: 'auto' | 'city' | 'gps'; acc?: number }
const fromCity = (id: string): Saved => { const c = CITIES.find((x) => x.id === id) ?? CITIES[0]; return { label: c.ar, src: 'city', s: { latitude: c.lat, longitude: c.lng, timezone: c.tz, method: c.method } }; };

export default function PrayerCard() {
  const [saved, setSaved] = useState<Saved | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [geoMsg, setGeoMsg] = useState('');

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
    // If the visitor already allowed location, refresh it quietly on each visit (e.g. when travelling). A manually chosen city is respected.
    // Automatic: already allowed → refresh quietly; never asked → ask once on the first visit; refused → never nag.
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
    if (!('geolocation' in navigator)) { if (!quiet) setGeoMsg('المتصفح لا يدعم تحديد الموقع. اختر مدينتك من القائمة.'); return; }
    if (!quiet) setGeoMsg(first ? 'نطلب إذن موقعك مرة واحدة لنضبط المواقيت على مكانك بالضبط. الموقع لا يغادر جهازك.' : 'جارٍ تحديد الموقع…');
    const mark = () => { try { localStorage.setItem(ASKED, '1'); } catch { /* ignore */ } };
    navigator.geolocation.getCurrentPosition(
      (p) => {
        mark();
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const lat = +p.coords.latitude.toFixed(3); const lng = +p.coords.longitude.toFixed(3);
        const { city, km } = nearestCityDist(lat, lng);
        const label = km <= 20 ? city.ar : km <= 150 ? `قرب ${city.ar}` : 'موقعك الحالي';
        const method = (nearestCity(lat, lng) ?? (km <= 150 ? city : undefined))?.method ?? methodForTimezone(tz);
        update({ label, src: 'gps', acc: Math.round(p.coords.accuracy), s: { latitude: lat, longitude: lng, timezone: tz, method } });
        setGeoMsg('');
      },
      (err) => {
        mark();
        if (quiet && !first) return;
        setGeoMsg(err.code === 1 ? 'لم يُسمح بتحديد الموقع، فالمواقيت حسب المدينة المختارة. يمكنك السماح لاحقًا من إعدادات المتصفح ثم الضغط على «حدّد موقعي».' : 'تعذّر تحديد الموقع الآن. اختر مدينتك من القائمة أو أعد المحاولة.');
      },
      { maximumAge: 600000, timeout: 15000, enableHighAccuracy: false },
    );
  };

  if (!saved || !now || !view) {
    return <section className="card" aria-busy="true" aria-label="مواقيت الصلاة"><div className="next"><span className="label">مواقيت الصلاة</span><span className="count">--:--:--</span></div></section>;
  }
  const { day, status, qibla } = view;
  const tz = saved.s.timezone;
  // Inside Makkah a single bearing is meaningless; hide it within ~10 km of the Kaaba.
  const nearKaaba = Math.hypot(saved.s.latitude - 21.4225, saved.s.longitude - 39.8262) < 0.09;
  const cityId = saved.src === 'gps' ? '' : CITIES.find((c) => c.ar === saved.label)?.id ?? '';
  const hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-arab', { day: 'numeric', month: 'long', year: 'numeric', timeZone: tz }).format(now);
  const greg = new Intl.DateTimeFormat('ar-EG-u-nu-arab', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: tz }).format(now);

  return (
    <section className="card" aria-label="مواقيت الصلاة">
      <div className="meta"><span>{greg}</span><span>{hijri}</span><span>{saved.label}</span></div>
      {saved.src === 'gps' ? (
        <div className="locate-banner ok">
          <span>📍 المواقيت لموقعك الحالي{saved.label !== 'موقعك الحالي' ? ` (${saved.label})` : ''}، وتُحدَّث تلقائيًا عند كل زيارة.</span>
          <button type="button" className="btn ghost" onClick={() => locate()}>تحديث الآن</button>
        </div>
      ) : (
        <div className="locate-banner">
          <span>{saved.src === 'auto' ? `المواقيت الآن لمدينة ${saved.label} بحسب توقيت جهازك.` : `المواقيت لمدينة ${saved.label}.`} لمواقيت مكانك بالضبط:</span>
          <button type="button" className="btn" onClick={() => locate()}>حدّد موقعي</button>
        </div>
      )}
      <div className="next" aria-live="off">
        <span className="label">الصلاة القادمة</span>
        <span className="name">{NAMES[status.next.name]}</span>
        <span className="count" role="timer">{formatCountdown(status.remainingMs)}</span>
        {!(status.current.name === 'fajr' && now.getTime() >= day.times.sunrise.getTime() && status.next.name === 'dhuhr') && (
          <span className="label">الصلاة الحالية: {NAMES[status.current.name]}</span>
        )}
      </div>
      <ul className="times">
        {ORDER.map((p) => (
          <li key={p} aria-current={p === status.next.name && status.next.time.getTime() === day.times[p].getTime() ? 'true' : undefined}>
            <span className="n">{NAMES[p]}</span>
            <span className="t">{formatTime(day.times[p], tz)}</span>
          </li>
        ))}
      </ul>
      <div className="row">
        <div className="field"><label htmlFor="city">المدينة</label>
        <select id="city" value={cityId} onChange={(e) => e.target.value && update(fromCity(e.target.value))}>
          {!cityId && <option value="">{saved.label}</option>}
          {CITIES.map((c) => <option key={c.id} value={c.id}>{c.ar}</option>)}
        </select></div>
        <div className="field"><label htmlFor="method">طريقة الحساب</label>
        <select id="method" value={saved.s.method} onChange={(e) => update({ ...saved, s: { ...saved.s, method: e.target.value as MethodId } })}>
          {Object.entries(METHODS).map(([id, m]) => <option key={id} value={id}>{m.ar}</option>)}
        </select></div>
      </div>
      {geoMsg && <p className="note" role="status">{geoMsg}</p>}
      <p className="note">{nearKaaba ? '' : `اتجاه القبلة: ${qibla.toFixed(1)}° من الشمال الحقيقي. `}المواقيت محسوبة فلكيًا على جهازك وقد تختلف دقائق عن الجدول الرسمي في بلدك؛ موقعك لا يُرسل إلى أي خادم.</p>
    </section>
  );
}
