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
const K = { prayers: 'noor.today.prayers', tasks: 'noor.today.tasks', done: 'noor.today.done', hide: 'noor.today.hide', track: 'noor.today.trackPrayers' };
const day = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const rd = <T,>(k: string, f: T): T => { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : f; } catch { return f; } };
const wr = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };
type Task = { id: string; t: string; at?: string };

export default function TodayBoard() {
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
    const ts = tasks.filter((t) => t.at && !(done[d] ?? []).includes(t.id)).map((t) => { const [h, m] = t.at!.split(':').map(Number); const at = new Date(); at.setHours(h, m, 0, 0); const ms = at.getTime() - Date.now(); return ms > 0 ? setTimeout(() => { try { new Notification('نور لأمي — تذكير', { body: t.t }); } catch { /* ignore */ } }, ms) : null; });
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
      {show('adhkar') && <section className="card"><p className="eyebrow">أذكار الوقت</p>
        <h2 style={{ margin: '4px 0' }}>{morning ? 'أذكار الصباح' : hour < 21 ? 'أذكار المساء' : 'أذكار النوم'}</h2>
        <div className="row"><Link className="btn" href={morning ? '/adhkar/27' : hour < 21 ? '/adhkar/28' : '/adhkar/29'}>اقرأ واستمع</Link><Link className="btn ghost" href="/playlists#sleep">أدعية قبل النوم</Link></div></section>}
      {show('prayers') && <section className="card"><p className="eyebrow">صلواتي اليوم (اختياري)</p>
        {track ? <div className="row" role="group" aria-label="الصلوات">{P.map((p) => <label key={p} className="chip-check"><input type="checkbox" checked={(pr[d] ?? []).includes(p)} onChange={() => flipP(p)} /> {PN[p]}</label>)}</div>
          : <p className="note" style={{ margin: 0 }}>علامة خاصة بك على هذا الجهاز، بلا أرقام ولا تقييم.</p>}
        <button type="button" className="btn ghost small" onClick={() => { setTrack(!track); wr(K.track, !track); }}>{track ? 'إخفاء المتابعة' : 'فعّل متابعة الصلوات'}</button></section>}
      {show('wird') && <section className="card"><p className="eyebrow">وِردي القرآني والختمة</p>
        {wird ? <><p style={{ margin: '4px 0' }}>ورد اليوم: من صفحة {wird.from.toLocaleString('ar-EG')} إلى {wird.to.toLocaleString('ar-EG')} {wird.ok && '— تمّ ✓'}</p><div className="row"><Link className="btn" href={pageHref(wird.from)}>اقرأ ورد اليوم</Link><Link className="btn ghost" href="/wird">الخطة</Link></div></>
          : <><p style={{ margin: '4px 0' }}>لم تبدأ خطة ختمة بعد.</p><Link className="btn" href="/wird">ابدأ خطة ختمة</Link></>}</section>}
      {show('hifz') && <section className="card"><p className="eyebrow">الحفظ والمراجعة</p>
        <p style={{ margin: '4px 0' }}>{due === null ? 'لم تضف سورًا للمراجعة بعد.' : due ? `${due.toLocaleString('ar-EG')} آية مستحقة للمراجعة اليوم.` : 'لا مراجعة مستحقة الآن.'}</p><Link className="btn ghost" href="/hifz">افتح الحفظ</Link></section>}
      {show('continue') && <section className="card"><p className="eyebrow">استكمال</p>
        <div className="row"><Link className="btn ghost" href="/quran">تابع القراءة</Link>{resume && <button type="button" className="btn ghost" onClick={() => toggle(true)}>▶ تابع الاستماع</button>}<Link className="btn ghost" href="/playlists#mine">قوائمي</Link></div></section>}
      {show('tasks') && <section className="card"><p className="eyebrow">أعمالي اليوم وتذكيراتي</p>
        <ul className="athar-items">{tasks.map((t) => <li key={t.id}><label><input type="checkbox" checked={(done[d] ?? []).includes(t.id)} onChange={() => flipT(t.id)} /> {t.t}</label>{t.at && <small className="note"> · {t.at}</small>} <button type="button" className="btn ghost small" onClick={() => delT(t.id)} aria-label={`حذف ${t.t}`}>حذف</button></li>)}</ul>
        <form className="row" onSubmit={(e) => { e.preventDefault(); addT(); }}><input value={nt} onChange={(e) => setNt(e.target.value)} maxLength={120} placeholder="مثال: صلة رحم، صدقة، درس" aria-label="عمل جديد" /><input type="time" value={na} onChange={(e) => setNa(e.target.value)} aria-label="وقت التذكير (اختياري)" /><button className="btn ghost">أضف</button></form>
        <p className="note" style={{ margin: 0 }}>الأعمال تتكرر كل يوم وتُصفَّر علاماتها يوميًا. التذكير يعمل والصفحة مفتوحة.</p></section>}
      <details className="card no-print"><summary>تخصيص اللوحة</summary><div className="row">{[['adhkar', 'أذكار الوقت'], ['prayers', 'الصلوات'], ['wird', 'الورد'], ['hifz', 'الحفظ'], ['continue', 'الاستكمال'], ['tasks', 'الأعمال']].map(([k, l]) => <label key={k}><input type="checkbox" checked={show(k)} onChange={() => flipHide(k)} /> {l}</label>)}</div></details>
    </>
  );
}
