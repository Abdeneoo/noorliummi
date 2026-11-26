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
export default function RamadanPanel({ lang = 'ar' }: { lang?: 'ar' | 'en' }) {
  const en = lang === 'en'; const L = (a: string, e: string) => (en ? e : a); const loc = en ? 'en-GB' : 'ar-EG'; const nf = (n: number) => (en ? String(n) : ar(n)); const fd = (ms: number) => (en ? dur(ms).replace(/[٠-٩]/g, (c) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))) : dur(ms));
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
      const items: [Date, string][] = [[new Date(r.sc.times.fajr.getTime() - 45 * 60000), L('السحور: بقي ٤٥ دقيقة على أذان الفجر', 'Suhoor: 45 minutes left before the Fajr adhan')], [r.sc.times.maghrib, L('حان وقت الإفطار — أذان المغرب', 'Time for iftar — Maghrib adhan')], [r.sc.lastThirdOfTheNight, L('بدأ الثلث الأخير من الليل', 'The last third of the night has begun')]];
      for (const [at, msg] of items) { const ms = at.getTime() - t0; if (ms > 0 && ms < 2 ** 31 - 1) timers.push(setTimeout(() => { try { new Notification(L('نور لأمي — رمضان', 'Noor Li Ummi — Ramadan'), { body: msg, icon: '/icons/icon-192.png' }); } catch { /* ignore */ } }, ms)); }
    }
    return () => timers.forEach(clearTimeout);
  }, [notify, ps, rows]);

  if (!now || !start || !ps) return <p className="note">{L('جارٍ التحميل…', 'Loading…')}</p>;
  const end = addDays(start, 30); const inRamadan = now >= start && now < end;
  const dayNo = inRamadan ? Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - start.getTime()) / 86400000) + 1 : 0;
  const tz = ps.s.timezone; const tm = (d: Date) => formatTime(d, tz, loc);
  const today = rows.find((r) => iso(r.d) === iso(now));
  let st: ReturnType<typeof getPrayerStatus> | null = null; try { st = getPrayerStatus(ps.s, now); } catch { /* ignore */ }
  const toMaghrib = today ? today.sc.times.maghrib.getTime() - now.getTime() : -1;
  let toFajr = today ? today.sc.times.fajr.getTime() - now.getTime() : -1;
  if (toFajr < 0) { const tm2 = rows.find((r) => iso(r.d) === iso(addDays(now, 1))); toFajr = tm2 ? tm2.sc.times.fajr.getTime() - now.getTime() : -1; }
  const set = (k: string, f: 's' | 'q' | 'w') => { const n = { ...log, [k]: { ...log[k], [f]: !log[k]?.[f] } }; setLog(n); try { localStorage.setItem(TKEY, JSON.stringify(n)); } catch { /* ignore */ } };
  const perDay = Math.ceil((604 * khatmas) / 30); const perPrayer = Math.ceil(perDay / 5);
  const hs = (d: Date) => new Intl.DateTimeFormat(en ? 'en-u-ca-islamic-umalqura' : 'ar-SA-u-ca-islamic-umalqura', { day: 'numeric', month: 'long' }).format(new Date(d.getTime() + hijriAdj() * 86400000));

  return (
    <div className="ramadan">
      <section className="card ramadan-hero" aria-live="polite">
        {inRamadan ? <>
          <p className="eyebrow">{L('اليوم ', 'Day ')}{nf(dayNo)} من رمضان{dayNo > 20 ? L(' — العشر الأواخر', ' — the last ten nights') : ''}</p>
          {today && now < today.sc.times.fajr ? <h2>{L('الإمساك (أذان الفجر) بعد ', 'Imsak (Fajr adhan) in ')}{fd(toFajr)}</h2> : toMaghrib > 0 ? <h2>{L('الإفطار (أذان المغرب) بعد ', 'Iftar (Maghrib adhan) in ')}{fd(toMaghrib)}</h2> : <h2>{L('السحور: أذان الفجر بعد ', 'Suhoor: Fajr adhan in ')}{fd(toFajr)}</h2>}
          {today && <p>{L('الفجر ', 'Fajr ')}{tm(today.sc.times.fajr)} · المغرب {tm(today.sc.times.maghrib)} · {ps.label}</p>}
        </> : now < start ? <>
          <p className="eyebrow">{L('العد التنازلي لشهر رمضان', 'Countdown to Ramadan')}</p>
          <h2>{nf(Math.ceil((start.getTime() - now.getTime()) / 86400000))} {L('يومًا تقريبًا', 'days, roughly')}</h2>
          <p>{L('أوله المتوقَّع: ', 'Expected first day: ')}{start.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </> : <p>{L('انتهى رمضان. تقبّل الله منا ومنكم.', 'Ramadan has ended. May Allah accept from us and from you.')}</p>}
        {st && <p className="note">{L('الصلاة القادمة: ', 'Next prayer: ')}{({ fajr: L('الفجر', 'Fajr'), dhuhr: L('الظهر', 'Dhuhr'), asr: L('العصر', 'Asr'), maghrib: L('المغرب', 'Maghrib'), isha: L('العشاء', 'Isha') } as Record<string, string>)[st.next.name]} بعد {fd(st.remainingMs)}</p>}
        <p className="note">{L('التاريخ حسب تقويم أم القرى بعد تعديلك (', 'Date by the Umm al-Qura calendar after your adjustment (')}{hijriAdj() ? `${hijriAdj() > 0 ? '+' : ''}${nf(hijriAdj())} ${L('يوم', 'day')}` : L('بلا تعديل', 'no adjustment')}). {L('العبرة بإعلان بلدك الرسمي برؤية الهلال.', 'What counts is your country’s official moon-sighting announcement.')}</p>
        <div className="row no-print">
          <label>{L('أول يوم رمضان عندك (حسب الإعلان) ', 'Your first day of Ramadan (as announced) ')}<input type="date" value={manual} onChange={(e) => { setManual(e.target.value); try { if (e.target.value) localStorage.setItem(SKEY, e.target.value); else localStorage.removeItem(SKEY); } catch { /* ignore */ } }} /></label>
          {manual && <button type="button" className="btn ghost small" onClick={() => { setManual(''); try { localStorage.removeItem(SKEY); } catch { /* ignore */ } }}>{L('رجوع للتقويم', 'Back to the calendar')}</button>}
          <Link className="btn ghost small" href="/prayer">{L('تغيير المدينة وطريقة الحساب', 'Change city and calculation method')}</Link>
        </div>
      </section>

      <section className="section" id="imsakiya"><h2>{L('إمساكية رمضان — ', 'Ramadan timetable — ')}{ps.label}</h2>
        <p className="note">{L('الإمساك هنا قبل الفجر بعشر دقائق احتياطًا عند من يأخذ به؛ والواجب الإمساك عند طلوع الفجر الصادق (أذان الفجر).', 'Imsak here is ten minutes before Fajr, a precaution some follow; the obligation is to stop at true dawn (the Fajr adhan).')}</p>
        <div style={{ overflowX: "auto" }}><table className="month"><thead><tr><th>{L('اليوم', 'Day')}</th><th>{L('الهجري', 'Hijri')}</th><th>{L('الميلادي', 'Gregorian')}</th><th>{L('الإمساك', 'Imsak')}</th><th>{L('الفجر', 'Fajr')}</th><th>{L('الشروق', 'Sunrise')}</th><th>{L('الظهر', 'Dhuhr')}</th><th>{L('العصر', 'Asr')}</th><th>{L('المغرب (الإفطار)', 'Maghrib (iftar)')}</th><th>{L('العشاء', 'Isha')}</th></tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i} aria-current={iso(r.d) === iso(now) ? 'date' : undefined}><td>{nf(i + 1)}</td><td>{i === 29 && hij(new Date(r.d.getTime() + hijriAdj() * 86400000)).m !== 9 ? L('٣٠ رمضان إن لم يُرَ الهلال', '30 Ramadan if the moon is not sighted') : hs(r.d)}</td><td>{r.d.toLocaleDateString(loc, { weekday: 'short', day: 'numeric', month: 'short' })}</td>
            <td>{tm(new Date(r.sc.times.fajr.getTime() - 10 * 60000))}</td><td>{tm(r.sc.times.fajr)}</td><td>{tm(r.sc.times.sunrise)}</td><td>{tm(r.sc.times.dhuhr)}</td><td>{tm(r.sc.times.asr)}</td><td><strong>{tm(r.sc.times.maghrib)}</strong></td><td>{tm(r.sc.times.isha)}</td></tr>)}</tbody></table></div>
        <div className="row no-print"><button type="button" className="btn ghost" onClick={() => window.print()}>{L('اطبع الإمساكية (A4)', 'Print the timetable (A4)')}</button>
          <button type="button" className="btn ghost" onClick={() => { const url = location.href.split('#')[0] + '#imsakiya'; if (navigator.share) navigator.share({ title: L('إمساكية رمضان — نور لأمي', 'Ramadan timetable — Noor Li Ummi'), url }).catch(() => undefined); else navigator.clipboard?.writeText(url); }}>{L('شارك الإمساكية', 'Share the timetable')}</button></div>
      </section>

      <section className="section no-print" id="khatma"><h2>{L('خطة ختم القرآن في رمضان', 'Ramadan Quran plan')}</h2>
        <div className="row"><label>{L('عدد الختمات ', 'Number of khatmas ')}<select value={khatmas} onChange={(e) => setKhatmas(Number(e.target.value))}>{[1, 2, 3, 4].map((k) => <option key={k} value={k}>{nf(k)}</option>)}</select></label></div>
        <p>{L('نحو ', 'About ')}<strong>{nf(perDay)}</strong>{L(' صفحة يوميًا (من ٦٠٤ صفحة)، أي قرابة ', ' pages a day (of 604), about ')}<strong>{nf(perPrayer)}</strong>{L(' صفحات بعد كل صلاة. ', ' pages after each prayer. ')}{khatmas === 1 && L('ختمة واحدة = جزء كل يوم تقريبًا.', 'One khatma ≈ one juz a day.')}</p>
        <div className="row"><Link className="btn" href="/wird">{L('ابدأ ورد رمضان وتابعه', 'Start and follow a Ramadan wird')}</Link><Link className="btn ghost" href="/khatma">{L('ختمة جماعية مع العائلة', 'A family khatma')}</Link></div>
      </section>

      <section className="section no-print" id="track"><h2>{L('متابعتي في رمضان', 'My Ramadan')}</h2>
        <p className="note">{L('علامات لك وحدك على هذا الجهاز، بلا عدّ ولا نقاط. ضع علامة لما تيسّر.', 'Marks for you alone on this device — no counts, no points.')}</p>
        <div style={{ overflowX: "auto" }}><table className="month"><thead><tr><th>{L('اليوم', 'Day')}</th><th>{L('صيام', 'Fast')}</th><th>{L('قيام', 'Qiyam')}</th><th>{L('وتر', 'Witr')}</th></tr></thead>
          <tbody>{days.map((d, i) => { const k = iso(d); const future = d > now; return <tr key={k}><td>{nf(i + 1)}</td>{(['s', 'q', 'w'] as const).map((f) => <td key={f}><input type="checkbox" disabled={future} checked={!!log[k]?.[f]} onChange={() => set(k, f)} aria-label={`${({ s: L('صيام', 'Fast'), q: L('قيام', 'Qiyam'), w: L('وتر', 'Witr') })[f]} يوم ${i + 1}`} /></td>)}</tr>; })}</tbody></table></div>
      </section>

      <section className="section no-print" id="notify"><h2>{L('تنبيهات اختيارية', 'Optional reminders')}</h2>
        <p className="note">{L('تنبيه قبل الفجر بـ٤٥ دقيقة للسحور، وعند المغرب للإفطار، وعند الثلث الأخير للقيام. تعمل والصفحة مفتوحة في المتصفح؛ لتنبيهات الأذان الدائمة استعمل ', 'A reminder 45 minutes before Fajr for suhoor, at Maghrib for iftar, and at the last third of the night for qiyam. They work while this page is open; for permanent adhan alerts use ')}<Link href="/adhan">{L('إعدادات الأذان', 'adhan settings')}</Link>{L(' أو التطبيق.', ' or the app.')}</p>
        <label><input type="checkbox" checked={notify} onChange={async (e) => { const on = e.target.checked; if (on && typeof Notification !== 'undefined' && Notification.permission !== 'granted') { const p = await Notification.requestPermission(); setPerm(p); if (p !== 'granted') return; } setNotify(on); try { localStorage.setItem(NKEY, on ? '1' : '0'); } catch { /* ignore */ } }} />{L(' فعّل تنبيهات السحور والإفطار والقيام', ' Turn on suhoor, iftar and qiyam reminders')}</label>
        {perm === 'denied' && <p className="note">{L('رفض المتصفح الإذن بالتنبيهات؛ يمكنك تغييره من إعدادات الموقع في المتصفح.', 'The browser refused notifications; you can change it in the site settings of your browser.')}</p>}
      </section>
    </div>
  );
}
