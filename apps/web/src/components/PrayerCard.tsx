'use client';
import { useEffect, useMemo, useState } from 'react';
import { METHODS, formatCountdown, formatTime, getPrayerStatus, getScheduleForInstant, qiblaDirection, type MethodId, type PrayerName, type PrayerSettings } from '@noor/prayer-engine';
import { CITIES, cityForTimezone, methodForTimezone, nearestCity } from '@/lib/cities';

const NAMES: Record<PrayerName, string> = { fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' };
const ORDER: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
const KEY = 'noor.prayer.v1';
interface Saved { label: string; s: PrayerSettings; src?: 'auto' | 'city' | 'gps' }
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
    if (init.src !== 'city' && 'permissions' in navigator && 'geolocation' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((st) => { if (st.state === 'granted') locate(true); }).catch(() => undefined);
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

  const locate = (quiet = false) => {
    if (!('geolocation' in navigator)) { if (!quiet) setGeoMsg('المتصفح لا يدعم تحديد الموقع. اختر مدينتك من القائمة.'); return; }
    if (!quiet) setGeoMsg('جارٍ تحديد الموقع…');
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const lat = +p.coords.latitude.toFixed(3); const lng = +p.coords.longitude.toFixed(3);
        const near = nearestCity(lat, lng);
        update({ label: near ? `${near.ar} (موقعك)` : 'موقعك الحالي', src: 'gps', s: { latitude: lat, longitude: lng, timezone: tz, method: near?.method ?? methodForTimezone(tz) } });
        setGeoMsg('');
      },
      (err) => { if (!quiet) setGeoMsg(err.code === 1 ? 'لم يُسمح بتحديد الموقع. يمكنك السماح به من إعدادات المتصفح، أو اختيار مدينتك من القائمة.' : 'تعذّر تحديد الموقع الآن. اختر مدينتك من القائمة.'); },
      { maximumAge: 600000, timeout: 10000 },
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
      {saved.src !== 'gps' && (
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
        {saved.src === 'gps' && <button type="button" className="btn ghost" onClick={() => locate()}>تحديث موقعي</button>}
      </div>
      {geoMsg && <p className="note" role="status">{geoMsg}</p>}
      <p className="note">{nearKaaba ? '' : `اتجاه القبلة: ${qibla.toFixed(1)}° من الشمال الحقيقي. `}المواقيت محسوبة فلكيًا على جهازك وقد تختلف دقائق عن الجدول الرسمي في بلدك؛ موقعك لا يُرسل إلى أي خادم.</p>
    </section>
  );
}
