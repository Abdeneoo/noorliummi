'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { formatTime, getDaySchedule, getPrayerStatus, type PrayerSettings } from '@noor/prayer-engine';
import { CITIES } from '@/lib/cities';
import { hijriAdj } from '@/lib/hijri-adj';

/**
 * Ramadan mode, all on this device: the start date follows the Umm al-Qura calendar shifted by the visitor's hijri adjustment,
 * and the visitor can set the first day exactly as announced locally. Nothing here is a ruling on the start of the month.
 */
const PKEY = 'noor.prayer.v1'; const SKEY = 'noor.ramadan.start'; const TKEY = 'noor.ramadan.log'; const NKEY = 'noor.ramadan.notify';
import { addDays, calcStart, hij } from '@/lib/ramadan';
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const ar = (n: number) => n.toLocaleString('ar-EG');
const dur = (ms: number) => { const s = Math.max(0, Math.floor(ms / 1000)); const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); const x = s % 60; return `${ar(h)}:${String(m).padStart(2, '0').replace(/\d/g, (c) => '٠١٢٣٤٥٦٧٨٩'[+c])}:${String(x).padStart(2, '0').replace(/\d/g, (c) => '٠١٢٣٤٥٦٧٨٩'[+c])}`; };


type Log = Record<string, { s?: boolean; q?: boolean; w?: boolean }>;
export default function RamadanPanel() {
  const [now, setNow] = useState<Date | null>(null);
  const [ps, setPs] = useState<{ s: PrayerSettings; label: string } | null>(null);
  const [manual, setManual] = useState(''); const [log, setLog] = useState<Log>({}); const [khatmas, setKhatmas] = useState(1); const [notify, setNotify] = useState(false); const [perm, setPerm] = useState('');
  useEffect(() => {
    setNow(new Date()); const t = setInterval(() => setNow(new Date()), 1000);
    try {
      const raw = localStorage.getItem(PKEY); const sv = raw ? JSON.parse(raw) : null;
      if (sv?.s) setPs({ s: sv.s, label: sv.label }); else { const c = CITIES.find((x) => x.tz === Intl.DateTimeFormat().resolvedOptions().timeZone) ?? CITIES[0]; setPs({ s: { latitude: c.lat, longitude: c.lng, timezone: c.tz, method: c.method }, label: c.ar }); }
      setManual(localStorage.getItem(SKEY) ?? ''); setLog(JSON.parse(localStorage.getItem(TKEY) ?? '{}')); setNotify(localStorage.getItem(NKEY) === '1');
    } catch { /* ignore */ }
    return () => clearInterval(t);
  }, []);

  const start = useMemo(() => { if (!now) return null; if (/^\d{4}-\d{2}-\d{2}$/.test(manual)) { const [y, m, d] = manual.split('-').map(Number); return new Date(y, m - 1, d); } return calcStart(now, hijriAdj()); }, [now?.toDateString(), manual]); // eslint-disable-line react-hooks/exhaustive-deps
  const days = useMemo(() => (start ? Array.from({ length: 30 }, (_, i) => addDays(start, i)) : []), [start]);
  const rows = useMemo(() => { if (!ps) return []; try { return days.map((d) => ({ d, sc: getDaySchedule(ps.s, iso(d)) })); } catch { return []; } }, [ps, days]);

  // Optional local reminders (this tab only, while it is open): suhoor 45 min before Fajr, iftar at Maghrib, qiyam at the last third.
  useEffect(() => {
    if (!notify || !ps || typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const timers: ReturnType<typeof setTimeout>[] = []; const t0 = Date.now();
    for (const r of rows.slice(0, 31)) {
      const items: [Date, string][] = [[new Date(r.sc.times.fajr.getTime() - 45 * 60000), 'السحور: بقي ٤٥ دقيقة على أذان الفجر'], [r.sc.times.maghrib, 'حان وقت الإفطار — أذان المغرب'], [r.sc.lastThirdOfTheNight, 'بدأ الثلث الأخير من الليل']];
      for (const [at, msg] of items) { const ms = at.getTime() - t0; if (ms > 0 && ms < 2 ** 31 - 1) timers.push(setTimeout(() => { try { new Notification('نور لأمي — رمضان', { body: msg, icon: '/icons/icon-192.png' }); } catch { /* ignore */ } }, ms)); }
    }
    return () => timers.forEach(clearTimeout);
  }, [notify, ps, rows]);

  if (!now || !start || !ps) return <p className="note">جارٍ التحميل…</p>;
  const end = addDays(start, 30); const inRamadan = now >= start && now < end;
  const dayNo = inRamadan ? Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - start.getTime()) / 86400000) + 1 : 0;
  const tz = ps.s.timezone; const tm = (d: Date) => formatTime(d, tz, 'ar-EG');
  const today = rows.find((r) => iso(r.d) === iso(now));
  let st: ReturnType<typeof getPrayerStatus> | null = null; try { st = getPrayerStatus(ps.s, now); } catch { /* ignore */ }
  const toMaghrib = today ? today.sc.times.maghrib.getTime() - now.getTime() : -1;
  let toFajr = today ? today.sc.times.fajr.getTime() - now.getTime() : -1;
  if (toFajr < 0) { const tm2 = rows.find((r) => iso(r.d) === iso(addDays(now, 1))); toFajr = tm2 ? tm2.sc.times.fajr.getTime() - now.getTime() : -1; }
  const set = (k: string, f: 's' | 'q' | 'w') => { const n = { ...log, [k]: { ...log[k], [f]: !log[k]?.[f] } }; setLog(n); try { localStorage.setItem(TKEY, JSON.stringify(n)); } catch { /* ignore */ } };
  const perDay = Math.ceil((604 * khatmas) / 30); const perPrayer = Math.ceil(perDay / 5);
  const hs = (d: Date) => new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', { day: 'numeric', month: 'long' }).format(new Date(d.getTime() + hijriAdj() * 86400000));

  return (
    <div className="ramadan">
      <section className="card ramadan-hero" aria-live="polite">
        {inRamadan ? <>
          <p className="eyebrow">اليوم {ar(dayNo)} من رمضان{dayNo > 20 ? ' — العشر الأواخر' : ''}</p>
          {today && now < today.sc.times.fajr ? <h2>الإمساك (أذان الفجر) بعد {dur(toFajr)}</h2> : toMaghrib > 0 ? <h2>الإفطار (أذان المغرب) بعد {dur(toMaghrib)}</h2> : <h2>السحور: أذان الفجر بعد {dur(toFajr)}</h2>}
          {today && <p>الفجر {tm(today.sc.times.fajr)} · المغرب {tm(today.sc.times.maghrib)} · {ps.label}</p>}
        </> : now < start ? <>
          <p className="eyebrow">العد التنازلي لشهر رمضان</p>
          <h2>{ar(Math.ceil((start.getTime() - now.getTime()) / 86400000))} يومًا تقريبًا</h2>
          <p>أوله المتوقَّع: {start.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </> : <p>انتهى رمضان. تقبّل الله منا ومنكم.</p>}
        {st && <p className="note">الصلاة القادمة: {({ fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' } as Record<string, string>)[st.next.name]} بعد {dur(st.remainingMs)}</p>}
        <p className="note">التاريخ حسب تقويم أم القرى بعد تعديلك ({hijriAdj() ? `${hijriAdj() > 0 ? '+' : ''}${ar(hijriAdj())} يوم` : 'بلا تعديل'}). العبرة بإعلان بلدك الرسمي برؤية الهلال.</p>
        <div className="row no-print">
          <label>أول يوم رمضان عندك (حسب الإعلان) <input type="date" value={manual} onChange={(e) => { setManual(e.target.value); try { if (e.target.value) localStorage.setItem(SKEY, e.target.value); else localStorage.removeItem(SKEY); } catch { /* ignore */ } }} /></label>
          {manual && <button type="button" className="btn ghost small" onClick={() => { setManual(''); try { localStorage.removeItem(SKEY); } catch { /* ignore */ } }}>رجوع للتقويم</button>}
          <Link className="btn ghost small" href="/prayer">تغيير المدينة وطريقة الحساب</Link>
        </div>
      </section>

      <section className="section" id="imsakiya"><h2>إمساكية رمضان — {ps.label}</h2>
        <p className="note">الإمساك هنا قبل الفجر بعشر دقائق احتياطًا عند من يأخذ به؛ والواجب الإمساك عند طلوع الفجر الصادق (أذان الفجر).</p>
        <div style={{ overflowX: "auto" }}><table className="month"><thead><tr><th>اليوم</th><th>الهجري</th><th>الميلادي</th><th>الإمساك</th><th>الفجر</th><th>الشروق</th><th>الظهر</th><th>العصر</th><th>المغرب (الإفطار)</th><th>العشاء</th></tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i} aria-current={iso(r.d) === iso(now) ? 'date' : undefined}><td>{ar(i + 1)}</td><td>{hs(r.d)}</td><td>{r.d.toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
            <td>{tm(new Date(r.sc.times.fajr.getTime() - 10 * 60000))}</td><td>{tm(r.sc.times.fajr)}</td><td>{tm(r.sc.times.sunrise)}</td><td>{tm(r.sc.times.dhuhr)}</td><td>{tm(r.sc.times.asr)}</td><td><strong>{tm(r.sc.times.maghrib)}</strong></td><td>{tm(r.sc.times.isha)}</td></tr>)}</tbody></table></div>
        <div className="row no-print"><button type="button" className="btn ghost" onClick={() => window.print()}>اطبع الإمساكية (A4)</button>
          <button type="button" className="btn ghost" onClick={() => { const url = location.href.split('#')[0] + '#imsakiya'; if (navigator.share) navigator.share({ title: 'إمساكية رمضان — نور لأمي', url }).catch(() => undefined); else navigator.clipboard?.writeText(url); }}>شارك الإمساكية</button></div>
      </section>

      <section className="section no-print" id="khatma"><h2>خطة ختم القرآن في رمضان</h2>
        <div className="row"><label>عدد الختمات <select value={khatmas} onChange={(e) => setKhatmas(Number(e.target.value))}>{[1, 2, 3, 4].map((k) => <option key={k} value={k}>{ar(k)}</option>)}</select></label></div>
        <p>نحو <strong>{ar(perDay)}</strong> صفحة يوميًا (من ٦٠٤ صفحة)، أي قرابة <strong>{ar(perPrayer)}</strong> صفحات بعد كل صلاة. {khatmas === 1 && 'ختمة واحدة = جزء كل يوم تقريبًا.'}</p>
        <div className="row"><Link className="btn" href="/wird">ابدأ ورد رمضان وتابعه</Link><Link className="btn ghost" href="/khatma">ختمة جماعية مع العائلة</Link></div>
      </section>

      <section className="section no-print" id="track"><h2>متابعتي في رمضان</h2>
        <p className="note">علامات لك وحدك على هذا الجهاز، بلا عدّ ولا نقاط. ضع علامة لما تيسّر.</p>
        <div style={{ overflowX: "auto" }}><table className="month"><thead><tr><th>اليوم</th><th>صيام</th><th>قيام</th><th>وتر</th></tr></thead>
          <tbody>{days.map((d, i) => { const k = iso(d); const future = d > now; return <tr key={k}><td>{ar(i + 1)}</td>{(['s', 'q', 'w'] as const).map((f) => <td key={f}><input type="checkbox" disabled={future} checked={!!log[k]?.[f]} onChange={() => set(k, f)} aria-label={`${({ s: 'صيام', q: 'قيام', w: 'وتر' })[f]} يوم ${i + 1}`} /></td>)}</tr>; })}</tbody></table></div>
      </section>

      <section className="section no-print" id="notify"><h2>تنبيهات اختيارية</h2>
        <p className="note">تنبيه قبل الفجر بـ٤٥ دقيقة للسحور، وعند المغرب للإفطار، وعند الثلث الأخير للقيام. تعمل والصفحة مفتوحة في المتصفح؛ لتنبيهات الأذان الدائمة استعمل <Link href="/adhan">إعدادات الأذان</Link> أو التطبيق.</p>
        <label><input type="checkbox" checked={notify} onChange={async (e) => { const on = e.target.checked; if (on && typeof Notification !== 'undefined' && Notification.permission !== 'granted') { const p = await Notification.requestPermission(); setPerm(p); if (p !== 'granted') return; } setNotify(on); try { localStorage.setItem(NKEY, on ? '1' : '0'); } catch { /* ignore */ } }} /> فعّل تنبيهات السحور والإفطار والقيام</label>
        {perm === 'denied' && <p className="note">رفض المتصفح الإذن بالتنبيهات؛ يمكنك تغييره من إعدادات الموقع في المتصفح.</p>}
      </section>
    </div>
  );
}
