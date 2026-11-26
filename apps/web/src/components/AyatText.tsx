'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * Ayah text with an optional tajweed colour layer. The text is never changed: colouring only wraps
 * unchanged characters in spans. Annotations: cpfair/quran-tajweed (CC BY 4.0), mapped onto our Tanzil text.
 */
type Ann = [string, number, number];
const KEY = 'noor.tajweed';
const RULES: { id: string; ar: string; en: string }[] = [
  { id: 'madd_6', ar: 'مد لازم (6 حركات)', en: 'Madd lazim (6)' },
  { id: 'madd_muttasil', ar: 'مد متصل (4–5)', en: 'Madd muttasil (4–5)' },
  { id: 'madd_munfasil', ar: 'مد منفصل (4–5)', en: 'Madd munfasil (4–5)' },
  { id: 'madd_246', ar: 'مد عارض أو لين (2–4–6)', en: 'Madd arid / leen (2–4–6)' },
  { id: 'madd_2', ar: 'مد طبيعي (حركتان)', en: 'Natural madd (2)' },
  { id: 'ghunnah', ar: 'غنة', en: 'Ghunnah' },
  { id: 'ikhfa', ar: 'إخفاء', en: 'Ikhfa' },
  { id: 'ikhfa_shafawi', ar: 'إخفاء شفوي', en: 'Ikhfa shafawi' },
  { id: 'iqlab', ar: 'إقلاب', en: 'Iqlab' },
  { id: 'idghaam_ghunnah', ar: 'إدغام بغنة', en: 'Idgham with ghunnah' },
  { id: 'idghaam_no_ghunnah', ar: 'إدغام بلا غنة', en: 'Idgham without ghunnah' },
  { id: 'idghaam_shafawi', ar: 'إدغام شفوي', en: 'Idgham shafawi' },
  { id: 'idghaam_mutajanisayn', ar: 'إدغام متجانسين', en: 'Idgham mutajanisayn' },
  { id: 'idghaam_mutaqaribayn', ar: 'إدغام متقاربين', en: 'Idgham mutaqaribayn' },
  { id: 'qalqalah', ar: 'قلقلة', en: 'Qalqalah' },
  { id: 'hamzat_wasl', ar: 'همزة وصل', en: 'Hamzat al-wasl' },
  { id: 'lam_shamsiyyah', ar: 'لام شمسية', en: 'Lam shamsiyyah' },
  { id: 'silent', ar: 'لا يُنطق', en: 'Not pronounced' },
];
const label = (id: string, lang: 'ar' | 'en') => RULES.find((r) => r.id === id)?.[lang] ?? id;

function colour(text: string, anns: Ann[], lang: 'ar' | 'en') {
  if (!anns.length) return text;
  const cuts = new Set<number>([0, text.length]);
  for (const [, a, b] of anns) { cuts.add(a); cuts.add(b); }
  const pts = [...cuts].sort((x, y) => x - y);
  const out: React.ReactNode[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1]; const seg = text.slice(a, b);
    const on = anns.filter(([, s, e]) => s <= a && e >= b).sort((x, y) => x[1] - y[1]);
    out.push(on.length ? <span key={a} className={`tj tj-${on[0][0]}`} title={on.map(([r]) => label(r, lang)).join('، ')}>{seg}</span> : seg);
  }
  return out;
}

const arDigits = (n: number) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

export default function AyatText({ surah, ayat, lang = 'ar' }: { surah: number; ayat: { n: number; t: string }[]; lang?: 'ar' | 'en' }) {
  const [on, setOn] = useState(false);
  const [data, setData] = useState<Record<string, Ann[]> | null>(null);
  useEffect(() => { try { setOn(localStorage.getItem(KEY) === '1'); } catch { /* ignore */ } }, []);
  useEffect(() => {
    if (!on || data) return;
    import(`@/generated/tajweed/${surah}.json`).then((m) => setData(m.default as Record<string, Ann[]>)).catch(() => setData({}));
  }, [on, data, surah]);
  const toggle = () => { const v = !on; setOn(v); try { localStorage.setItem(KEY, v ? '1' : '0'); } catch { /* ignore */ } };
  const used = on && data ? RULES.filter((r) => Object.values(data).some((v) => v.some(([id]) => id === r.id))) : [];

  return (
    <>
      <div className="row" style={{ justifyContent: 'center', margin: '4px 0' }}>
        <button type="button" className={on ? 'btn' : 'btn ghost'} aria-pressed={on ? 'true' : 'false'} onClick={toggle}>{lang === 'ar' ? (on ? 'إخفاء ألوان التجويد' : 'تلوين أحكام التجويد') : (on ? 'Hide tajweed colours' : 'Show tajweed colours')}</button>
      </div>
      {on && data && (
        <details className="tj-legend" open>
          <summary>{lang === 'ar' ? 'دليل الألوان' : 'Colour key'}</summary>
          <ul>{used.map((r) => <li key={r.id}><span className={`tj tj-${r.id}`} aria-hidden="true">●</span> {r[lang]}</li>)}</ul>
          <p className="note">{lang === 'ar'
            ? 'تلوين آلي لرواية حفص، لم يراجعه معلم تجويد بعد. للاستعانة لا للاعتماد، والمرجع التلقي من معلم.'
            : 'Automatic colouring for the Hafs reading, not yet reviewed by a tajweed teacher. A learning aid; learning from a teacher remains the reference.'}</p>
        </details>
      )}
      <div className="ayat" lang="ar" dir="rtl">
        {ayat.map((a) => (
          <span key={a.n} id={`a${a.n}`}>{on && data ? colour(a.t, data[a.n] ?? [], lang) : a.t}<Link className="ayah-end" href={lang === 'ar' ? `/tafsir/${surah}#a${a.n}` : `/en/quran/${surah}#a${a.n}`} aria-label={lang === 'ar' ? `تفسير الآية ${a.n}` : `Ayah ${a.n}`}><span aria-hidden="true">﴿{arDigits(a.n)}﴾</span></Link> </span>
        ))}
      </div>
    </>
  );
}
