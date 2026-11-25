'use client';
import Link from 'next/link';
import { logDay } from '@/lib/daylog';
import { useEffect, useState } from 'react';
import { SURAHS, arDigits } from '@/lib/quran';
import Icon from './Icon';
import { ayat } from '@/lib/arnum';

type Lang = 'ar' | 'en';
const KEY = 'noor.lastRead';

/** Records the surah being read (device only) so the home page can offer "continue reading". */
export function LastRead({ surah }: { surah: number }) {
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify({ s: surah, t: Date.now() })); } catch { /* ignore */ } logDay('q'); }, [surah]);
  return null;
}

export function ContinueReading({ lang = 'ar' }: { lang?: Lang }) {
  const [s, setS] = useState<number | null>(null);
  useEffect(() => { try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); if (v && v.s >= 1 && v.s <= 114) setS(v.s); } catch { /* ignore */ } }, []);
  const ar = lang === 'ar';
  const base = ar ? '/quran' : '/en/quran';
  const m = s ? SURAHS[s - 1] : null;
  return (
    <section className="card feature">
      <p className="eyebrow">{ar ? 'القرآن الكريم' : 'The Holy Quran'}</p>
      {m ? (
        <>
          <h2>{ar ? 'تابع القراءة' : 'Continue reading'}</h2>
          <p className="feature-title">{ar ? <>سورة {m.name}</> : <>{m.tname} <span className="muted">· {m.ename}</span></>}</p>
          <p className="note">{ar ? `السورة ${arDigits(m.index)} · ${ayat(m.ayas)}` : `Surah ${m.index} · ${m.ayas} ayat`}</p>
          <div className="row"><Link className="btn" href={`${base}/${m.index}`}><Icon name="quran" />{ar ? 'أكمل' : 'Continue'}</Link><Link className="btn ghost" href={base}>{ar ? 'فهرس السور' : 'All surahs'}</Link></div>
        </>
      ) : (
        <>
          <h2>{ar ? 'ابدأ القراءة' : 'Start reading'}</h2>
          <p className="note">{ar ? 'المصحف كاملًا بالرسم العثماني، مع التلاوة وتفسير الجلالين وألوان التجويد.' : 'The full Quran in Uthmani script with recitation and an English translation of the meanings.'}</p>
          <div className="row"><Link className="btn" href={`${base}/1`}><Icon name="quran" />{ar ? 'الفاتحة' : 'Al-Fatihah'}</Link><Link className="btn ghost" href={base}>{ar ? 'فهرس السور' : 'All surahs'}</Link></div>
        </>
      )}
    </section>
  );
}

/** Today's adhkar: picks morning / evening / sleep by the local hour (ids from Hisn al-Muslim). */
const SETS = {
  morning: { id: 27, ar: 'أذكار الصباح', en: 'Morning adhkar' },
  evening: { id: 28, ar: 'أذكار المساء', en: 'Evening adhkar' },
  sleep: { id: 29, ar: 'أذكار النوم', en: 'Before sleep' },
  salah: { id: 25, ar: 'الأذكار بعد السلام من الصلاة', en: 'After the prayer' },
};
export function TodayAdhkar({ lang = 'ar' }: { lang?: Lang }) {
  const [k, setK] = useState<'morning' | 'evening' | 'sleep'>('morning');
  useEffect(() => { const h = new Date().getHours(); setK(h >= 3 && h < 14 ? 'morning' : h >= 14 && h < 21 ? 'evening' : 'sleep'); }, []);
  const ar = lang === 'ar';
  const base = ar ? '/adhkar' : '/en/adhkar';
  const main = SETS[k];
  const others = (['morning', 'evening', 'sleep', 'salah'] as const).filter((x) => x !== k);
  return (
    <section className="card feature">
      <p className="eyebrow">{ar ? 'أذكار اليوم' : "Today's adhkar"}</p>
      <h2>{ar ? main.ar : main.en}</h2>
      <p className="note">{ar ? 'من حصن المسلم، مع عدّاد لكل ذكر.' : 'From Hisn al-Muslim, with a counter for each dhikr.'}</p>
      <div className="row"><Link className="btn" href={`${base}/${main.id}`}><Icon name="adhkar" />{ar ? 'ابدأ' : 'Begin'}</Link></div>
      <ul className="chips">{others.map((x) => <li key={x}><Link href={`${base}/${SETS[x].id}`}>{ar ? SETS[x].ar : SETS[x].en}</Link></li>)}</ul>
    </section>
  );
}
