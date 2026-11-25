'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Grade } from 'ts-fsrs';
import surahs from '@/generated/surahs.json';
import { ayat } from '@/lib/arnum';
import { GRADES, addRange, emptyState, parseBackup, parseKey, preview, queue, removeSurah, review, stats, type HifzState } from '@/lib/hifz';

const KEY = 'noor.hifz.v1';
const S = surahs as { index: number; name: string; tname: string; ayas: number }[];
const ar = (n: number) => n.toLocaleString('ar-EG');
const startOf = (s: number) => S.slice(0, s - 1).reduce((t, x) => t + x.ayas, 0) + 1;
const when = (d: Date, now: Date, lang: 'ar' | 'en') => {
  const m = Math.round((d.getTime() - now.getTime()) / 60000);
  const h = Math.round(m / 60); const dd = Math.round(h / 24);
  if (lang === 'en') return m < 60 ? `${Math.max(1, m)} min` : h < 24 ? `${h} h` : `${dd} d`;
  if (m < 60) return `${ar(Math.max(1, m))} د`;
  if (h < 24) return `${ar(h)} س`;
  return `${ar(dd)} يوم`;
};
const L = {
  ar: {
    n: (k: number) => ayat(k), num: (k: number) => ar(k), sname: (i: number) => `سورة ${S[i - 1].name}`,
    storeFail: 'تعذّر الحفظ على هذا الجهاز (المساحة ممتلئة أو التخزين معطّل).', loading: 'جارٍ التحميل…', added: (k: number) => `أُضيف إلى خطتك ${ayat(k)}.`, already: 'هذه الآيات مضافة من قبل.',
    listenFail: 'تعذّر تشغيل التلاوة الآن.', restored: 'استُعيدت النسخة.', badFile: 'الملف غير صالح.',
    inPlan: (k: number) => `في خطتك ${ayat(k)}`, due: (k: number) => `للمراجعة الآن ${ar(k)}`, learned: (k: number) => `رسخت ${ar(k)}`,
    review: 'المراجعة', pos: (i: number, a: number) => `سورة ${S[i - 1].name}، الآية ${ar(a)}`, isNew: 'آية جديدة', before: 'ما قبلها:',
    recite: 'اقرأ الآية من حفظك، ثم اضغط لتتحقق.', reveal: 'أظهر الآية', listen: 'استمع', how: 'كيف كان حفظك؟',
    nothing: 'لا شيء للمراجعة الآن. أحسنت، عُد لاحقًا.', start: 'ابدأ بإضافة آيات تريد حفظها.', check: 'تحقّق مجددًا',
    addTitle: 'أضف إلى خطتك', surah: 'السورة', from: 'من الآية', to: 'إلى الآية', add: 'أضف', perDay: 'آيات جديدة في اليوم',
    planTitle: 'السور في خطتك', remove: 'إزالة', removeQ: (i: number) => `إزالة سورة ${S[i - 1].name} من الخطة؟ يُمسح تقدّمك فيها.`,
    backupTitle: 'نسخة احتياطية', backupNote: 'تقدّمك محفوظ على هذا الجهاز فقط ولا يُرسل لأي خادم. احفظ نسخة لتنقله إلى جهاز آخر.', download: 'تنزيل نسخة', restore: 'استعادة نسخة',
    credits: 'الجدولة بخوارزمية FSRS (مكتبة ts-fsrs). نص الآيات من Tanzil، والتلاوة بصوت الحصري تُبث من Islamic Network.',
    opt: (x: { index: number; name: string }) => `${x.index}. ${x.name}`,
  },
  en: {
    n: (k: number) => `${k} ${k === 1 ? 'ayah' : 'ayat'}`, num: (k: number) => String(k), sname: (i: number) => `Surah ${S[i - 1].tname}`,
    storeFail: 'Could not save on this device (storage full or disabled).', loading: 'Loading…', added: (k: number) => `Added ${k} ${k === 1 ? 'ayah' : 'ayat'} to your plan.`, already: 'These ayat are already in your plan.',
    listenFail: 'Could not play the recitation right now.', restored: 'Backup restored.', badFile: 'This file is not a valid backup.',
    inPlan: (k: number) => `In your plan: ${k}`, due: (k: number) => `Due now: ${k}`, learned: (k: number) => `Learned: ${k}`,
    review: 'Review', pos: (i: number, a: number) => `Surah ${S[i - 1].tname}, ayah ${a}`, isNew: 'New ayah', before: 'The ayah before:',
    recite: 'Recite the ayah from memory, then tap to check.', reveal: 'Show the ayah', listen: 'Listen', how: 'How well did you remember it?',
    nothing: 'Nothing to review right now. Well done — come back later.', start: 'Start by adding ayat you want to memorise.', check: 'Check again',
    addTitle: 'Add to your plan', surah: 'Surah', from: 'From ayah', to: 'To ayah', add: 'Add', perDay: 'New ayat per day',
    planTitle: 'Surahs in your plan', remove: 'Remove', removeQ: (i: number) => `Remove Surah ${S[i - 1].tname} from your plan? Your progress in it will be erased.`,
    backupTitle: 'Backup', backupNote: 'Your progress is stored on this device only and never sent to a server. Download a backup to move it to another device.', download: 'Download backup', restore: 'Restore backup',
    credits: 'Scheduling uses the FSRS algorithm (ts-fsrs). Ayah text from Tanzil; recitation by Al-Husary streamed from Islamic Network.',
    opt: (x: { index: number; tname: string }) => `${x.index}. ${x.tname}`,
  },
};

export default function Hifz({ lang = 'ar' }: { lang?: 'ar' | 'en' }) {
  const t = L[lang];
  const [tr, setTr] = useState<Record<number, { tr: string; fn: string }[]>>({});
  const [st, setSt] = useState<HifzState | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [s, setS] = useState(1); const [from, setFrom] = useState(1); const [to, setTo] = useState(7);
  const [show, setShow] = useState(false); const [msg, setMsg] = useState('');
  const [text, setText] = useState<Record<number, string[]>>({});
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { let v = emptyState(); try { const r = localStorage.getItem(KEY); if (r) v = parseBackup(r); } catch { /* fresh */ } setSt(v); }, []);
  const save = (v: HifzState) => { const c = structuredClone(v); setSt(c); try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { setMsg(t.storeFail); } };

  const q = useMemo(() => (st ? queue(st, now) : []), [st, now]);
  const cur = q[0];
  const [cs, ca] = cur ? parseKey(cur) : [0, 0];
  useEffect(() => {
    if (!cs || text[cs]) return;
    import(`@/generated/surah/${cs}.json`).then((m) => setText((p) => ({ ...p, [cs]: (m.default as { ayat: { t: string }[] }).ayat.map((x) => x.t) })));
  }, [cs, text]);
  useEffect(() => {
    if (lang !== 'en' || !cs || tr[cs]) return;
    import(`@/generated/en/quran/${cs}.json`).then((m) => setTr((p) => ({ ...p, [cs]: (m.default as { ayat: { tr: string; fn: string }[] }).ayat })));
  }, [cs, tr, lang]);
  useEffect(() => { setShow(false); audio.current?.pause(); }, [cur]);

  if (!st) return <p aria-busy="true">{t.loading}</p>;
  const info = stats(st, now);
  const surah = S[s - 1];

  const add = () => { const v = structuredClone(st); const n = addRange(v, s, from, to, surah.ayas); save(v); setNow(new Date()); setMsg(n ? t.added(n) : t.already); };
  const grade = (g: Grade) => { const v = structuredClone(st); const t = new Date(); review(v, cur, g, t); save(v); setNow(t); };
  const listen = () => { audio.current ??= new Audio(); audio.current.src = `https://cdn.islamic.network/quran/audio/128/ar.husary/${startOf(cs) + ca - 1}.mp3`; audio.current.play().catch(() => setMsg(t.listenFail)); };
  const backup = () => { const b = new Blob([JSON.stringify(st)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `noor-hifz-${new Date().toISOString().slice(0, 10)}.json`; a.click(); };
  const restore = async (f?: File) => { if (!f) return; try { save(parseBackup(await f.text())); setNow(new Date()); setMsg(t.restored); } catch { setMsg(t.badFile); } };
  const surahsIn = [...new Set(st.added.map((k) => parseKey(k)[0]))];
  const pv = cur ? preview(st, cur, now) : null;
  const words = text[cs];

  return (
    <div>
      <p className="meta"><span>{t.inPlan(info.total)}</span><span>{t.due(info.dueNow)}</span><span>{t.learned(info.review)}</span></p>

      {cur ? (
        <section className="card" aria-label={t.review}>
          <p className="meta"><span>{t.pos(cs, ca)}</span>{st.cards[cur].state === 0 && <span>{t.isNew}</span>}</p>
          {ca > 1 && words && <p className="note">{t.before}</p>}
          {ca > 1 && words && <p lang="ar" dir="rtl" className="ayat" style={{ opacity: 0.75, fontSize: '1.25rem' }}>{words[ca - 2]}</p>}
          {!show ? (
            <div className="row" style={{ justifyContent: 'center', margin: '16px 0' }}>
              <p style={{ width: '100%', textAlign: 'center' }}>{t.recite}</p>
              <button type="button" className="btn" onClick={() => setShow(true)}>{t.reveal}</button>
              <button type="button" className="btn ghost" onClick={listen}>{t.listen}</button>
            </div>
          ) : (
            <>
              <p lang="ar" dir="rtl" className="ayat">{words?.[ca - 1] ?? '…'}</p>
              {lang === 'en' && tr[cs] && <><p className="en-tr">{tr[cs][ca - 1].tr}</p>{tr[cs][ca - 1].fn && <p className="en-fn">{tr[cs][ca - 1].fn}</p>}</>}
              <p className="note" style={{ textAlign: 'center' }}>{t.how}</p>
              <div className="row hifz-grades">
                {GRADES.map(({ g, ar: arLabel, en: enLabel }) => (
                  <button key={g} type="button" className={g === 3 ? 'btn' : 'btn ghost'} onClick={() => grade(g)}>{lang === 'en' ? enLabel : arLabel}<small>{pv ? when(pv[g], now, lang) : ''}</small></button>
                ))}
              </div>
            </>
          )}
        </section>
      ) : (
        <section className="card"><p>{info.total ? t.nothing : t.start}</p>
          {info.total > 0 && <button type="button" className="btn ghost" onClick={() => setNow(new Date())}>{t.check}</button>}</section>
      )}

      <section className="card">
        <h2 style={{ marginTop: 0, fontSize: '1.05rem' }}>{t.addTitle}</h2>
        <div className="row">
          <div className="field"><label htmlFor="hs">{t.surah}</label>
            <select id="hs" value={s} onChange={(e) => { const n = +e.target.value; setS(n); setFrom(1); setTo(Math.min(S[n - 1].ayas, 10)); }}>
              {S.map((x) => <option key={x.index} value={x.index}>{t.opt(x)}</option>)}
            </select></div>
          <div className="field"><label htmlFor="hf">{t.from}</label><input id="hf" type="number" min={1} max={surah.ayas} value={from} onChange={(e) => setFrom(+e.target.value)} /></div>
          <div className="field"><label htmlFor="ht">{t.to}</label><input id="ht" type="number" min={1} max={surah.ayas} value={to} onChange={(e) => setTo(+e.target.value)} /></div>
          <button type="button" className="btn" onClick={add}>{t.add}</button>
        </div>
        <div className="row">
          <div className="field"><label htmlFor="hn">{t.perDay}</label>
            <select id="hn" value={st.newPerDay} onChange={(e) => save({ ...st, newPerDay: +e.target.value })}>{[3, 5, 10, 15, 20, 30].map((n) => <option key={n} value={n}>{t.num(n)}</option>)}</select></div>
        </div>
        {msg && <p className="note" role="status">{msg}</p>}
      </section>

      {surahsIn.length > 0 && (
        <section className="card">
          <h2 style={{ marginTop: 0, fontSize: '1.05rem' }}>{t.planTitle}</h2>
          <ul className="athar-items">{surahsIn.map((x) => (
            <li key={x}>{t.sname(x)} ({t.n(st.added.filter((k) => parseKey(k)[0] === x).length)})
              <button type="button" className="btn ghost small" onClick={() => { if (confirm(t.removeQ(x))) { const v = structuredClone(st); removeSurah(v, x); save(v); } }}>{t.remove}</button></li>
          ))}</ul>
        </section>
      )}

      <section className="card">
        <h2 style={{ marginTop: 0, fontSize: '1.05rem' }}>{t.backupTitle}</h2>
        <p className="note">{t.backupNote}</p>
        <div className="row">
          <button type="button" className="btn ghost" onClick={backup} disabled={!info.total} title={!info.total ? (lang === 'en' ? 'Add ayat to your plan first' : 'أضف آيات إلى خطتك أولًا') : undefined}>{t.download}</button>
          <label className="btn ghost">{t.restore}<input type="file" accept="application/json" hidden onChange={(e) => restore(e.target.files?.[0])} /></label>
        </div>
      </section>
    </div>
  );
}
