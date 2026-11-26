'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { parseWird, todayRange, doneToday } from '@/lib/wird';
import { hasLast, toggle } from '@/lib/audio-store';
import pagesStart from '@/generated/pages.json';
const PS = pagesStart as [number, number][];
const pageHref = (p: number) => { const [s, a] = PS[Math.max(0, p - 1)] ?? [1, 1]; return `/quran/${s}#a${a}`; };

/**
 * «يومي مع الله»: the personal, on-device part of the daily board. Everything stays in localStorage unless the visitor
 * syncs it from their account elsewhere. No points, no streak scores, no judgement of anyone's worship.
 */
const P = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
const PN: Record<string, string> = { fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' };
const PN_EN: Record<string, string> = { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };
const K = { prayers: 'noor.today.prayers', tasks: 'noor.today.tasks', done: 'noor.today.done', hide: 'noor.today.hide', track: 'noor.today.trackPrayers' };
const day = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const rd = <T,>(k: string, f: T): T => { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : f; } catch { return f; } };
const wr = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };
type Task = { id: string; t: string; at?: string };

export default function TodayBoard({ lang = 'ar' }: { lang?: 'ar' | 'en' }) {
  const en = lang === 'en'; const L = (a: string, e: string) => (en ? e : a);
  const [ready, setReady] = useState(false); const [d, setD] = useState('');
  const [track, setTrack] = useState(false); const [pr, setPr] = useState<Record<string, string[]>>({});
  const [tasks, setTasks] = useState<Task[]>([]); const [done, setDone] = useState<Record<string, string[]>>({}); const [nt, setNt] = useState(''); const [na, setNa] = useState('');
  const [wird, setWird] = useState<{ from: number; to: number; ok: boolean } | null>(null); const [due, setDue] = useState<number | null>(null); const [resume, setResume] = useState(false);
  const [hour, setHour] = useState(12); const [hide, setHide] = useState<string[]>([]);
  useEffect(() => {
    setD(day()); setHour(new Date().getHours()); setTrack(rd(K.track, false)); setPr(rd(K.prayers, {})); setTasks(rd(K.tasks, [])); setDone(rd(K.done, {})); setHide(rd(K.hide, []));
    try { const w = parseWird(localStorage.getItem('noor.wird')); if (w) { const r = todayRange(w); setWird({ ...r, ok: doneToday(w) }); } } catch { /* ignore */ }
    try { const h = JSON.parse(localStorage.getItem('noor.hifz.v1') || 'null'); if (h?.cards) { const now = Date.now(); setDue(Object.values(h.cards as Record<string, { due: string }>).filter((c) => new Date(c.due).getTime() <= now).length); } } catch { /* ignore */ }
    setResume(hasLast()); setReady(true);
  }, []);
  useEffect(() => { // optional reminders for personal tasks with a time (this tab, while open)
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const ts = tasks.filter((t) => t.at && !(done[d] ?? []).includes(t.id)).map((t) => { const [h, m] = t.at!.split(':').map(Number); const at = new Date(); at.setHours(h, m, 0, 0); const ms = at.getTime() - Date.now(); return ms > 0 ? setTimeout(() => { try { new Notification(L('نور لأمي — تذكير', 'Noor Li Ummi — reminder'), { body: t.t }); } catch { /* ignore */ } }, ms) : null; });
    return () => ts.forEach((x) => x && clearTimeout(x));
  }, [tasks, done, d]);
  if (!ready) return null;
  const flipP = (p: string) => { const l = pr[d] ?? []; const n = { ...pr, [d]: l.includes(p) ? l.filter((x) => x !== p) : [...l, p] }; const keep = Object.fromEntries(Object.entries(n).filter(([k]) => k >= day().slice(0, 8) + '01' || k === d)); setPr(keep); wr(K.prayers, keep); };
  const flipT = (id: string) => { const l = done[d] ?? []; const n = { [d]: l.includes(id) ? l.filter((x) => x !== id) : [...l, id] }; setDone(n); wr(K.done, n); };
  const addT = () => { if (!nt.trim()) return; const n = [...tasks, { id: Date.now().toString(36), t: nt.trim().slice(0, 120), at: na || undefined }]; setTasks(n); wr(K.tasks, n); setNt(''); setNa(''); if (na && typeof Notification !== 'undefined' && Notification.permission === 'default') void Notification.requestPermission(); };
  const delT = (id: string) => { const n = tasks.filter((t) => t.id !== id); setTasks(n); wr(K.tasks, n); };
  const show = (k: string) => !hide.includes(k);
  const flipHide = (k: string) => { const n = hide.includes(k) ? hide.filter((x) => x !== k) : [...hide, k]; setHide(n); wr(K.hide, n); };
  const morning = hour >= 3 && hour < 12;
  return (
    <>
      {show('adhkar') && <section className="card"><p className="eyebrow">{L('أذكار الوقت', 'Adhkar for now')}</p>
        <h2 style={{ margin: '4px 0' }}>{morning ? L('أذكار الصباح', 'Morning adhkar') : hour < 21 ? L('أذكار المساء', 'Evening adhkar') : L('أذكار النوم', 'Adhkar before sleep')}</h2>
        <div className="row"><Link className="btn" href={`${en ? '/en' : ''}${morning ? '/adhkar/27' : hour < 21 ? '/adhkar/28' : '/adhkar/29'}`}>{L('اقرأ واستمع', 'Read and listen')}</Link><Link className="btn ghost" href="/playlists#sleep">{L('أدعية قبل النوم', 'Duas before sleep')}</Link></div></section>}
      {show('prayers') && <section className="card"><p className="eyebrow">{L('صلواتي اليوم (اختياري)', 'My prayers today (optional)')}</p>
        {track ? <div className="row" role="group" aria-label={L('الصلوات', 'Prayers')}>{P.map((p) => <label key={p} className="chip-check"><input type="checkbox" checked={(pr[d] ?? []).includes(p)} onChange={() => flipP(p)} /> {en ? PN_EN[p] : PN[p]}</label>)}</div>
          : <p className="note" style={{ margin: 0 }}>{L('علامة خاصة بك على هذا الجهاز، بلا أرقام ولا تقييم.', 'A private mark on this device — no numbers, no judgement.')}</p>}
        <button type="button" className="btn ghost small" onClick={() => { setTrack(!track); wr(K.track, !track); }}>{track ? L('إخفاء المتابعة', 'Hide tracking') : L('فعّل متابعة الصلوات', 'Turn on prayer marks')}</button></section>}
      {show('wird') && <section className="card"><p className="eyebrow">{L('وِردي القرآني والختمة', 'My Quran wird and khatma')}</p>
        {wird ? <><p style={{ margin: '4px 0' }}>{L('ورد اليوم: من صفحة ', 'Today’s wird: page ')}{en ? wird.from : wird.from.toLocaleString('ar-EG')}{L(' إلى ', ' to ')}{en ? wird.to : wird.to.toLocaleString('ar-EG')} {wird.ok && L('— تمّ ✓', '— done ✓')}</p><div className="row"><Link className="btn" href={pageHref(wird.from)}>{L('اقرأ ورد اليوم', 'Read today’s wird')}</Link><Link className="btn ghost" href="/wird">{L('الخطة', 'Plan')}</Link></div></>
          : <><p style={{ margin: '4px 0' }}>{L('لم تبدأ خطة ختمة بعد.', 'No khatma plan yet.')}</p><Link className="btn" href="/wird">{L('ابدأ خطة ختمة', 'Start a khatma plan')}</Link></>}</section>}
      {show('hifz') && <section className="card"><p className="eyebrow">{L('الحفظ والمراجعة', 'Memorisation and review')}</p>
        <p style={{ margin: '4px 0' }}>{due === null ? L('لم تضف سورًا للمراجعة بعد.', 'No surahs added for review yet.') : due ? (en ? `${due} ayat due for review today.` : `${due.toLocaleString('ar-EG')} آية مستحقة للمراجعة اليوم.`) : L('لا مراجعة مستحقة الآن.', 'Nothing due for review now.')}</p><Link className="btn ghost" href="/hifz">{L('افتح الحفظ', 'Open memorisation')}</Link></section>}
      {show('continue') && <section className="card"><p className="eyebrow">{L('استكمال', 'Continue')}</p>
        <div className="row"><Link className="btn ghost" href="/quran">{L('تابع القراءة', 'Continue reading')}</Link>{resume && <button type="button" className="btn ghost" onClick={() => toggle(true)}>{L('▶ تابع الاستماع', '▶ Resume listening')}</button>}<Link className="btn ghost" href="/playlists#mine">{L('قوائمي', 'My playlists')}</Link></div></section>}
      {show('tasks') && <section className="card"><p className="eyebrow">{L('أعمالي اليوم وتذكيراتي', 'My deeds today and reminders')}</p>
        <ul className="athar-items">{tasks.map((t) => <li key={t.id}><label><input type="checkbox" checked={(done[d] ?? []).includes(t.id)} onChange={() => flipT(t.id)} /> {t.t}</label>{t.at && <small className="note"> · {t.at}</small>} <button type="button" className="btn ghost small" onClick={() => delT(t.id)} aria-label={`${L('حذف', 'Delete')} ${t.t}`}>{L('حذف', 'Delete')}</button></li>)}</ul>
        <form className="row" onSubmit={(e) => { e.preventDefault(); addT(); }}><input value={nt} onChange={(e) => setNt(e.target.value)} maxLength={120} placeholder={L('مثال: صلة رحم، صدقة، درس', 'e.g. visit family, charity, a lesson')} aria-label={L('عمل جديد', 'New deed')} /><input type="time" value={na} onChange={(e) => setNa(e.target.value)} aria-label={L('وقت التذكير (اختياري)', 'Reminder time (optional)')} /><button className="btn ghost">{L('أضف', 'Add')}</button></form>
        <p className="note" style={{ margin: 0 }}>{L('الأعمال تتكرر كل يوم وتُصفَّر علاماتها يوميًا. التذكير يعمل والصفحة مفتوحة.', 'Deeds repeat daily and their marks reset each day. Reminders work while this page is open.')}</p></section>}
      <details className="card no-print"><summary>{L('تخصيص اللوحة', 'Customise the board')}</summary><div className="row">{[['adhkar', L('أذكار الوقت', 'Adhkar for now')], ['prayers', L('الصلوات', 'Prayers')], ['wird', L('الورد', 'Wird')], ['hifz', L('الحفظ', 'Memorisation')], ['continue', L('الاستكمال', 'Continue')], ['tasks', L('الأعمال', 'Deeds')]].map(([k, l]) => <label key={k}><input type="checkbox" checked={show(k)} onChange={() => flipHide(k)} /> {l}</label>)}</div></details>
    </>
  );
}
