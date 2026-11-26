'use client';
import { useEffect, useState } from 'react';
import { qiblaDirection } from '@noor/prayer-engine';
import QiblaCompass from './QiblaCompass';
import { CITIES } from '@/lib/cities';

const PACK = ['/travel', '/adhkar/96', '/adhkar/97', '/adhkar/98', '/adhkar/101', '/adhkar/102', '/adhkar/103', '/adhkar/104', '/adhkar/105', '/adhkar/106', '/adhkar/10', '/adhkar/27', '/adhkar/28', '/adhkar/29', '/fiqh/salah/19', '/fiqh/taharah/8', '/fiqh/siyam/33', '/times', '/quran/1', '/quran/36', '/quran/67', '/quran/112', '/quran/113', '/quran/114', '/offline'];
const CHECK = ['جواز السفر والتأشيرة والتذاكر', 'شاحن الهاتف وبطارية احتياطية', 'الأدوية والوصفات', 'سجادة صلاة خفيفة', 'تحديد مكان الإقامة وأقرب مسجد', 'تحميل «حزمة السفر» أدناه قبل الانطلاق', 'كتابة الوصية والديون عند السفر الطويل', 'توديع الأهل بدعاء السفر'];
const CHECK_EN: Record<string, string> = { 'جواز السفر والتأشيرة والتذاكر': 'Passport, visa and tickets', 'شاحن الهاتف وبطارية احتياطية': 'Phone charger and power bank', 'الأدوية والوصفات': 'Medicines and prescriptions', 'سجادة صلاة خفيفة': 'A light prayer mat', 'تحديد مكان الإقامة وأقرب مسجد': 'Where you will stay and the nearest mosque', 'تحميل «حزمة السفر» أدناه قبل الانطلاق': 'Download the travel pack below before you leave', 'كتابة الوصية والديون عند السفر الطويل': 'Write your will and debts for a long journey', 'توديع الأهل بدعاء السفر': 'Say the travel dua with your family' };
/** Qibla for where you are now, a timezone check, an offline travel pack and a packing list (kept on this device). */
export default function TravelTools({ lang = 'ar' }: { lang?: 'ar' | 'en' }) {
  const en = lang === 'en'; const L = (a: string, e: string) => (en ? e : a);
  const [q, setQ] = useState<number | null>(null); const [tzMsg, setTzMsg] = useState(''); const [pack, setPack] = useState(''); const [chk, setChk] = useState<string[]>([]); const [geo, setGeo] = useState('');
  useEffect(() => {
    try {
      const sv = JSON.parse(localStorage.getItem('noor.prayer.v1') || 'null'); const dev = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (sv?.s) { setQ(qiblaDirection(sv.s.latitude, sv.s.longitude)); if (sv.s.timezone && sv.s.timezone !== dev) setTzMsg(en ? `Your times are saved for ${sv.s.timezone} but this device is now on ${dev}. If you have travelled, update your location in the prayer card above.` : `مواقيتك محفوظة لمنطقة ${sv.s.timezone} بينما جهازك الآن على ${dev}. إن كنت قد سافرت فحدّث موقعك من بطاقة الصلاة أعلاه.`); }
      else { const c = CITIES.find((x) => x.tz === dev) ?? CITIES[0]; setQ(qiblaDirection(c.lat, c.lng)); }
      setChk(JSON.parse(localStorage.getItem('noor.travel.check') || '[]'));
    } catch { /* ignore */ }
  }, []);
  const here = () => { if (!('geolocation' in navigator)) { setGeo(L('المتصفح لا يدعم تحديد الموقع.', 'This browser cannot find your location.')); return; } setGeo(L('جارٍ تحديد موقعك…', 'Finding your location…')); navigator.geolocation.getCurrentPosition((p) => { setQ(qiblaDirection(p.coords.latitude, p.coords.longitude)); setGeo(L('حُسبت القبلة لموقعك الحالي (لا يُرسل إلى أي خادم).', 'Qibla calculated for your current location (not sent to any server).')); }, () => setGeo(L('تعذّر تحديد الموقع. اسمح بالموقع أو اختر مدينتك.', 'Could not get your location. Allow location or choose your city.')), { timeout: 12000 }); };
  const download = async () => { setPack(L('جارٍ التحميل…', 'Downloading…')); let ok = 0; for (const u of PACK) { try { const r = await fetch(u, { credentials: 'same-origin' }); if (r.ok) ok++; } catch { /* offline */ } } setPack(en ? `${ok} of ${PACK.length} pages saved on this device. To keep audio, use “Save for offline” next to each list.` : `حُفظت ${ok.toLocaleString('ar-EG')} من ${PACK.length.toLocaleString('ar-EG')} صفحة على هذا الجهاز. لحفظ التسجيلات الصوتية استعمل زر «احفظ دون إنترنت» بجانب كل قائمة.`); };
  const flip = (t: string) => { const n = chk.includes(t) ? chk.filter((x) => x !== t) : [...chk, t]; setChk(n); try { localStorage.setItem('noor.travel.check', JSON.stringify(n)); } catch { /* ignore */ } };
  return (
    <>
      {tzMsg && <p className="card note" role="status">{tzMsg}</p>}
      <section className="card" id="qibla"><h2>{L('اتجاه القبلة', 'Qibla direction')}</h2><div className="row"><button type="button" className="btn ghost" onClick={here}>{L('احسب القبلة لموقعي الآن', 'Qibla for where I am now')}</button></div>{geo && <p className="note">{geo}</p>}{q !== null && <QiblaCompass qibla={q} lang={lang} />}</section>
      <section className="card" id="pack"><h2>{L('حزمة السفر دون إنترنت', 'Offline travel pack')}</h2><p className="note">{L('تحفظ صفحات الأذكار وأدعية السفر وأحكام المسافر والسور القصيرة وجدول المواقيت على جهازك.', 'Saves the adhkar, travel duas, traveller rulings, short surahs and the prayer timetable on your device.')}</p>
        <button type="button" className="btn" onClick={download}>{L('نزّل حزمة السفر', 'Download the travel pack')}</button>{pack && <p className="note" role="status">{pack}</p>}</section>
      <section className="card" id="checklist"><h2>{L('قائمة الاستعداد للسفر', 'Travel checklist')}</h2><ul className="athar-items">{CHECK.map((t) => <li key={t}><label><input type="checkbox" checked={chk.includes(t)} onChange={() => flip(t)} /> {en ? CHECK_EN[t] ?? t : t}</label></li>)}</ul>
        <button type="button" className="btn ghost small" onClick={() => { setChk([]); try { localStorage.removeItem('noor.travel.check'); } catch { /* ignore */ } }}>{L('تصفير القائمة', 'Reset the list')}</button></section>
    </>
  );
}
