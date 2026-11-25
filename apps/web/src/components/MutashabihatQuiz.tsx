'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SURAHS, arDigits } from '@/lib/quran';
type Q = { surah: number; ayah: number; other: [number, number]; options: string[]; answer: number };
/** Three daily questions: which of two similar wordings is in the named surah. Score stays on the device. */
export default function MutashabihatQuiz() {
  const [qs, setQs] = useState<Q[] | null>(null); const [pick, setPick] = useState<(number | null)[]>([null, null, null]); const [err, setErr] = useState(false);
  const day = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  useEffect(() => {
    fetch(`/api/mutashabihat/quiz?d=${day}`).then((r) => r.json()).then(setQs).catch(() => setErr(true));
    try { const v = JSON.parse(localStorage.getItem(`noor.mquiz.${day}`) || 'null'); if (Array.isArray(v)) setPick(v); } catch { /* ignore */ }
  }, [day]);
  const choose = (qi: number, oi: number) => { if (pick[qi] != null) return; const p = pick.slice(); p[qi] = oi; setPick(p); try { localStorage.setItem(`noor.mquiz.${day}`, JSON.stringify(p)); } catch { /* ignore */ } };
  if (err) return <p className="note">تعذّر تحميل تحدّي اليوم.</p>;
  if (!qs) return <p className="note" role="status">جارٍ تجهيز أسئلة اليوم…</p>;
  const answered = pick.filter((p) => p != null).length; const right = qs.filter((q, i) => pick[i] === q.answer).length;
  return (
    <section className="mquiz" aria-labelledby="mq-title">
      <h2 id="mq-title">تحدّي اليوم: ٣ أسئلة</h2>
      <ol className="mq-list">
        {qs.map((q, qi) => (
          <li key={qi} className="card">
            <p className="mq-q">أيُّ الصيغتين في <strong>سورة {SURAHS[q.surah - 1].name}</strong> (الآية {arDigits(q.ayah)})؟</p>
            <div className="mq-opts">
              {q.options.map((o, oi) => {
                const state = pick[qi] == null ? '' : oi === q.answer ? ' right' : pick[qi] === oi ? ' wrong' : '';
                return <button key={oi} type="button" lang="ar" className={`mq-opt${state}`} onClick={() => choose(qi, oi)} aria-pressed={pick[qi] === oi ? 'true' : 'false'}>{o}</button>;
              })}
            </div>
            {pick[qi] != null && <p className="note">{pick[qi] === q.answer ? 'أحسنت.' : 'الصيغة الأخرى هي الصواب.'} الثانية في <Link href={`/quran/${q.other[0]}#a${q.other[1]}`}>سورة {SURAHS[q.other[0] - 1].name} {arDigits(q.other[1])}</Link> · <Link href={`/mutashabihat/${q.surah}#a${q.ayah}`}>المتشابهات</Link></p>}
          </li>
        ))}
      </ol>
      {answered === 3 && <p className="note" role="status">أجبت {arDigits(right)} من ٣ صحيحًا. أسئلة جديدة غدًا بإذن الله.</p>}
    </section>
  );
}
