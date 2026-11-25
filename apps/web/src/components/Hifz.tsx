'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Grade } from 'ts-fsrs';
import surahs from '@/generated/surahs.json';
import { GRADES, addRange, emptyState, parseBackup, parseKey, preview, queue, removeSurah, review, stats, type HifzState } from '@/lib/hifz';

const KEY = 'noor.hifz.v1';
const S = surahs as { index: number; name: string; ayas: number }[];
const ar = (n: number) => n.toLocaleString('ar-EG');
/** «٣ آيات» / «١١ آية» — Arabic count agreement for ayah. */
const ayat = (n: number) => (n === 1 ? 'آية واحدة' : n === 2 ? 'آيتان' : n <= 10 ? `${ar(n)} آيات` : `${ar(n)} آية`);
const startOf = (s: number) => S.slice(0, s - 1).reduce((t, x) => t + x.ayas, 0) + 1;
const when = (d: Date, now: Date) => {
  const m = Math.round((d.getTime() - now.getTime()) / 60000);
  if (m < 60) return `${ar(Math.max(1, m))} د`;
  const h = Math.round(m / 60); if (h < 24) return `${ar(h)} س`;
  return `${ar(Math.round(h / 24))} يوم`;
};

export default function Hifz() {
  const [st, setSt] = useState<HifzState | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [s, setS] = useState(1); const [from, setFrom] = useState(1); const [to, setTo] = useState(7);
  const [show, setShow] = useState(false); const [msg, setMsg] = useState('');
  const [text, setText] = useState<Record<number, string[]>>({});
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { let v = emptyState(); try { const r = localStorage.getItem(KEY); if (r) v = parseBackup(r); } catch { /* fresh */ } setSt(v); }, []);
  const save = (v: HifzState) => { const c = structuredClone(v); setSt(c); try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { setMsg('تعذّر الحفظ على هذا الجهاز (المساحة ممتلئة أو التخزين معطّل).'); } };

  const q = useMemo(() => (st ? queue(st, now) : []), [st, now]);
  const cur = q[0];
  const [cs, ca] = cur ? parseKey(cur) : [0, 0];
  useEffect(() => {
    if (!cs || text[cs]) return;
    import(`@/generated/surah/${cs}.json`).then((m) => setText((p) => ({ ...p, [cs]: (m.default as { ayat: { t: string }[] }).ayat.map((x) => x.t) })));
  }, [cs, text]);
  useEffect(() => { setShow(false); audio.current?.pause(); }, [cur]);

  if (!st) return <p aria-busy="true">جارٍ التحميل…</p>;
  const info = stats(st, now);
  const surah = S[s - 1];

  const add = () => { const v = structuredClone(st); const n = addRange(v, s, from, to, surah.ayas); save(v); setNow(new Date()); setMsg(n ? `أُضيف إلى خطتك ${ayat(n)}.` : 'هذه الآيات مضافة من قبل.'); };
  const grade = (g: Grade) => { const v = structuredClone(st); const t = new Date(); review(v, cur, g, t); save(v); setNow(t); };
  const listen = () => { audio.current ??= new Audio(); audio.current.src = `https://cdn.islamic.network/quran/audio/128/ar.husary/${startOf(cs) + ca - 1}.mp3`; audio.current.play().catch(() => setMsg('تعذّر تشغيل التلاوة الآن.')); };
  const backup = () => { const b = new Blob([JSON.stringify(st)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `noor-hifz-${new Date().toISOString().slice(0, 10)}.json`; a.click(); };
  const restore = async (f?: File) => { if (!f) return; try { save(parseBackup(await f.text())); setNow(new Date()); setMsg('استُعيدت النسخة.'); } catch { setMsg('الملف غير صالح.'); } };
  const surahsIn = [...new Set(st.added.map((k) => parseKey(k)[0]))];
  const pv = cur ? preview(st, cur, now) : null;
  const words = text[cs];

  return (
    <div>
      <p className="meta"><span>في خطتك {ayat(info.total)}</span><span>للمراجعة الآن {ar(info.dueNow)}</span><span>رسخت {ar(info.review)}</span></p>

      {cur ? (
        <section className="card" aria-label="المراجعة">
          <p className="meta"><span>سورة {S[cs - 1].name}، الآية {ar(ca)}</span>{st.cards[cur].state === 0 && <span>آية جديدة</span>}</p>
          {ca > 1 && words && <p className="note">ما قبلها:</p>}
          {ca > 1 && words && <p lang="ar" className="ayat" style={{ opacity: 0.75, fontSize: '1.25rem' }}>{words[ca - 2]}</p>}
          {!show ? (
            <div className="row" style={{ justifyContent: 'center', margin: '16px 0' }}>
              <p style={{ width: '100%', textAlign: 'center' }}>اقرأ الآية من حفظك، ثم اضغط لتتحقق.</p>
              <button type="button" className="btn" onClick={() => setShow(true)}>أظهر الآية</button>
              <button type="button" className="btn ghost" onClick={listen}>استمع</button>
            </div>
          ) : (
            <>
              <p lang="ar" className="ayat">{words?.[ca - 1] ?? '…'}</p>
              <p className="note" style={{ textAlign: 'center' }}>كيف كان حفظك؟</p>
              <div className="row hifz-grades">
                {GRADES.map(({ g, ar: label }) => (
                  <button key={g} type="button" className={g === 3 ? 'btn' : 'btn ghost'} onClick={() => grade(g)}>{label}<small>{pv ? when(pv[g], now) : ''}</small></button>
                ))}
              </div>
            </>
          )}
        </section>
      ) : (
        <section className="card"><p>{info.total ? 'لا شيء للمراجعة الآن. أحسنت، عُد لاحقًا.' : 'ابدأ بإضافة آيات تريد حفظها.'}</p>
          {info.total > 0 && <button type="button" className="btn ghost" onClick={() => setNow(new Date())}>تحقّق مجددًا</button>}</section>
      )}

      <section className="card">
        <h2 style={{ marginTop: 0, fontSize: '1.05rem' }}>أضف إلى خطتك</h2>
        <div className="row">
          <div className="field"><label htmlFor="hs">السورة</label>
            <select id="hs" value={s} onChange={(e) => { const n = +e.target.value; setS(n); setFrom(1); setTo(Math.min(S[n - 1].ayas, 10)); }}>
              {S.map((x) => <option key={x.index} value={x.index}>{x.index}. {x.name}</option>)}
            </select></div>
          <div className="field"><label htmlFor="hf">من الآية</label><input id="hf" type="number" min={1} max={surah.ayas} value={from} onChange={(e) => setFrom(+e.target.value)} /></div>
          <div className="field"><label htmlFor="ht">إلى الآية</label><input id="ht" type="number" min={1} max={surah.ayas} value={to} onChange={(e) => setTo(+e.target.value)} /></div>
          <button type="button" className="btn" onClick={add}>أضف</button>
        </div>
        <div className="row">
          <div className="field"><label htmlFor="hn">آيات جديدة في اليوم</label>
            <select id="hn" value={st.newPerDay} onChange={(e) => save({ ...st, newPerDay: +e.target.value })}>{[3, 5, 10, 15, 20, 30].map((n) => <option key={n} value={n}>{ar(n)}</option>)}</select></div>
        </div>
        {msg && <p className="note" role="status">{msg}</p>}
      </section>

      {surahsIn.length > 0 && (
        <section className="card">
          <h2 style={{ marginTop: 0, fontSize: '1.05rem' }}>السور في خطتك</h2>
          <ul className="athar-items">{surahsIn.map((x) => (
            <li key={x}>سورة {S[x - 1].name} ({ayat(st.added.filter((k) => parseKey(k)[0] === x).length)})
              <button type="button" className="btn ghost small" onClick={() => { if (confirm(`إزالة سورة ${S[x - 1].name} من الخطة؟ يُمسح تقدّمك فيها.`)) { const v = structuredClone(st); removeSurah(v, x); save(v); } }}>إزالة</button></li>
          ))}</ul>
        </section>
      )}

      <section className="card">
        <h2 style={{ marginTop: 0, fontSize: '1.05rem' }}>نسخة احتياطية</h2>
        <p className="note">تقدّمك محفوظ على هذا الجهاز فقط ولا يُرسل لأي خادم. احفظ نسخة لتنقله إلى جهاز آخر.</p>
        <div className="row">
          <button type="button" className="btn ghost" onClick={backup} disabled={!info.total}>تنزيل نسخة</button>
          <label className="btn ghost">استعادة نسخة<input type="file" accept="application/json" hidden onChange={(e) => restore(e.target.files?.[0])} /></label>
        </div>
      </section>
      <p className="note">الجدولة بخوارزمية FSRS (مكتبة ts-fsrs). نص الآيات من Tanzil، والتلاوة بصوت الحصري تُبث من Islamic Network.</p>
    </div>
  );
}
