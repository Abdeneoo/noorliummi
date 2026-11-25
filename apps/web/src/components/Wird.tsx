'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import pagesStart from '@/generated/pages.json';
import nawawi from '@/generated/hadith/nawawi.json';
import { SURAHS, arDigits } from '@/lib/quran';
import { arCount } from '@/lib/arnum';
import { PAGES, doneToday, expectedEnd, markDone, newPlan, parseWird, streak, todayRange, type PlanKind, type WirdState } from '@/lib/wird';
import { logDay } from '@/lib/daylog';
import { downloadIcs, dailyIcs } from '@/lib/ics';
import { TodayAdhkar } from './HomeWidgets';

const P = pagesStart as [number, number][];
const KEY = 'noor.wird';
const PAGE_W: [string, string, string, string] = ['صفحة', 'صفحتان', 'صفحات', 'صفحةً'];
const DAY_W: [string, string, string, string] = ['يوم', 'يومان', 'أيام', 'يومًا'];
const PLANS: { kind: PlanKind; label: string; n?: number }[] = [
  { kind: 'page', label: 'صفحة في اليوم' }, { kind: 'pages', label: 'خمس صفحات في اليوم', n: 5 }, { kind: 'juzWeek', label: 'جزء في الأسبوع' },
  { kind: 'pages', label: 'جزء في اليوم (ختمة في شهر)', n: 20 }, { kind: 'ramadan', label: 'ختمة رمضان (٢١ صفحة في اليوم)' },
];
const at = (page: number) => { const [s, a] = P[page - 1]; return { s, a, label: `سورة ${SURAHS[s - 1].name}، الآية ${arDigits(a)}` }; };

/** «وِردي اليومي»: Quran portion by plan, adhkar by time of day, hadith of the day. Everything stays on this device. */
export default function Wird() {
  const [st, setSt] = useState<WirdState | null | undefined>(undefined); const [custom, setCustom] = useState(60); const [hour, setHour] = useState(6);
  useEffect(() => { try { setSt(parseWird(localStorage.getItem(KEY))); } catch { setSt(null); } }, []);
  const save = (v: WirdState | null) => { setSt(v); try { if (v) localStorage.setItem(KEY, JSON.stringify(v)); else localStorage.removeItem(KEY); } catch { /* storage blocked */ } };
  const now = new Date();
  // Hadith of the day: one of an-Nawawi's forty-two, in order, by day of the year.
  const h = (nawawi as { n: number; t: string }[])[Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(now.getFullYear(), 0, 1)) / 86400000) % 42];
  if (st === undefined) return <p className="note" role="status">جارٍ التحميل…</p>;
  const done = st ? doneToday(st, now) : false; const r = st ? todayRange(st) : null; const sk = st ? streak(st, now) : 0;
  return (
    <div className="wird">
      {!st ? (
        <section className="card">
          <h2 style={{ marginTop: 0 }}>اختر خطة الختمة</h2>
          <div className="wird-plans">{PLANS.map((p) => <button key={p.label} type="button" className="btn ghost" onClick={() => save(newPlan(p.kind, p.n ?? 1))}>{p.label}</button>)}</div>
          <div className="row"><div className="field" style={{ flex: '0 1 220px' }}><label htmlFor="wc">أو: أختم في عدد من الأيام</label><input id="wc" type="number" min={7} max={1000} value={custom} onChange={(e) => setCustom(Number(e.target.value))} /></div>
            <button type="button" className="btn" onClick={() => save(newPlan('days', custom))}>ابدأ</button></div>
          <p className="note">تُحفظ الخطة على جهازك فقط، ويمكن تغييرها في أي وقت.</p>
        </section>
      ) : r && (
        <section className={`card wird-today${done ? ' done' : ''}`}>
          <p className="eyebrow">ورد القرآن اليوم{st.khatmas > 0 ? ` · أتممت ${arCount(st.khatmas, ['ختمة', 'ختمتين', 'ختمات', 'ختمةً'], 'واحدة')}` : ''}</p>
          {done ? <h2>أتممت ورد اليوم</h2> : <h2>{r.from === r.to ? `الصفحة ${arDigits(r.from)}` : `من الصفحة ${arDigits(r.from)} إلى ${arDigits(r.to)}`}</h2>}
          {!done && <p>من {at(r.from).label}{r.to < PAGES ? <> إلى ما قبل {at(r.to + 1).label}</> : ' إلى آخر المصحف'}</p>}
          <div className="khatma-bar" role="progressbar" aria-valuemin={0} aria-valuemax={PAGES} aria-valuenow={st.page - 1} aria-label="الصفحات المقروءة"><span style={{ width: `${((st.page - 1) / PAGES) * 100}%` }} /></div>
          <p className="note">قرأت {arDigits(st.page - 1)} من {arDigits(PAGES)} صفحة · الختم المتوقع {new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }).format(expectedEnd(st, now))}{sk > 1 ? ` · ${arCount(sk, DAY_W)} متتالية` : ''}</p>
          <div className="row">
            {!done && <Link className="btn" href={`/quran/${at(r.from).s}#a${at(r.from).a}`}>اقرأ الآن</Link>}
            {!done && <button type="button" className="btn ghost" onClick={() => { save(markDone(st, new Date())); logDay('q'); }}>قرأت ورد اليوم</button>}
            {done && <Link className="btn ghost" href={`/quran/${at(st.page).s}#a${at(st.page).a}`}>اقرأ زيادة ({arCount(st.perDay, PAGE_W, 'واحدة')} التالية)</Link>}
          </div>
          <details className="pp-settings"><summary>الخطة والتذكير</summary>
            <p className="note">خطتك: {arCount(st.perDay, PAGE_W, 'واحدة')} في اليوم، بدأت {st.start}.</p>
            <div className="row"><div className="field" style={{ flex: '0 1 180px' }}><label htmlFor="wh">ساعة التذكير اليومي</label>
              <select id="wh" value={hour} onChange={(e) => setHour(Number(e.target.value))}>{[5, 6, 7, 9, 13, 17, 20, 21, 22].map((x) => <option key={x} value={x}>{arDigits(x)}:٠٠</option>)}</select></div>
              <button type="button" className="btn ghost" onClick={() => downloadIcs(dailyIcs({ title: 'وِردي اليومي من القرآن', url: `${location.origin}/wird`, hour }), 'wird-reminder.ics')}>أضف تذكيرًا يوميًا إلى التقويم</button></div>
            <button type="button" className="linkish" onClick={() => { if (confirm('تغيير الخطة يبدأ العدّ من الصفحة الحالية بخطة جديدة. متابعة؟')) save(null); }}>غيّر الخطة</button>
          </details>
        </section>
      )}
      <div className="duo section"><TodayAdhkar />
        <section className="card feature"><p className="eyebrow">حديث اليوم</p><h2>الأربعون النووية — الحديث {arDigits(h.n)}</h2>
          <p lang="ar" className="wird-hadith">{h.t.length > 420 ? `${h.t.slice(0, 420)}…` : h.t}</p>
          <div className="row"><Link className="btn ghost" href={`/hadith/nawawi#h${h.n}`}>اقرأه كاملًا</Link></div></section></div>
    </div>
  );
}
