'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

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
  type G = { q: string; t: string; w?: [number, number]; b?: 's'; r?: string[] };
  const BOOKS = { q: 'ابن قتيبة (ت 276هـ)', s: 'السجستاني (ت 330هـ)' } as const;
  const [tf, setTf] = useState<{ n: number; j?: string; m?: string; g?: G[]; focus?: number } | null>(null);
  const cacheT = useRef<{ jalalayn: Record<string, string>; moyassar: Record<string, string>; gharib: Record<string, G[]> } | null>(null);
  // Gharib al-Quran (Ibn Qutayba): words with an explanation are underlined and open it on tap.
  const [gh, setGh] = useState<Record<string, G[]> | null>(null);
  useEffect(() => { if (lang !== 'ar') return; import(`@/generated/gharib/${surah}.json`).then((m) => setGh(m.default as Record<string, G[]>)).catch(() => setGh({})); }, [surah, lang]);
  const openTafsir = async (n: number, focus?: number) => {
    setTf({ n, focus });
    try { cacheT.current ??= await (await fetch(`/api/tafsir/${surah}`)).json(); const c = cacheT.current!; setTf({ n, j: c.jalalayn[String(n)] ?? '', m: c.moyassar[String(n)], g: c.gharib?.[String(n)] ?? [], focus }); } catch { setTf({ n, j: '', m: '', focus }); }
  };
  const words = (n: number, t: string) => {
    const es = gh?.[String(n)]?.filter((e) => e.w) ?? []; if (!es.length) return t;
    const ws = t.split(' '); const out: React.ReactNode[] = [];
    for (let i = 0; i < ws.length; i++) {
      const k = es.findIndex((e) => e.w![0] === i);
      if (k >= 0) { const [a0, b0] = es[k].w!; out.push(<button key={i} type="button" className="gw" onClick={() => void openTafsir(n, k)} aria-label={`معنى: ${es[k].q}`}>{ws.slice(a0, b0 + 1).join(' ')}</button>, ' '); i = b0; continue; }
      out.push(ws[i], i < ws.length - 1 ? ' ' : '');
    }
    return out;
  };
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
    <>
      <div className="row" style={{ justifyContent: 'center', margin: '4px 0' }}>
        <button type="button" className={on ? 'btn' : 'btn ghost'} aria-pressed={on ? 'true' : 'false'} onClick={toggle}>{lang === 'ar' ? (on ? 'إخفاء ألوان التجويد' : 'تلوين أحكام التجويد') : (on ? 'Hide tajweed colours' : 'Show tajweed colours')}</button>
      </div>
      {on && data && (
        <details className="tj-legend" open>
          <summary>{lang === 'ar' ? 'دليل الألوان' : 'Colour key'}</summary>
          <ul>{used.map((r) => <li key={r.id}><span className={`tj tj-${r.id}`} aria-hidden="true">●</span> {r[lang]}</li>)}</ul>
        </details>
      )}
      <div className="ayat" lang="ar" dir="rtl">
        {ayat.map((a) => (
          <span key={a.n} id={`a${a.n}`}>{on && data ? colour(a.t, data[a.n] ?? [], lang) : gh ? words(a.n, a.t) : a.t}<Link className="ayah-end" href={lang === 'ar' ? `/tafsir/${surah}#a${a.n}` : `/en/quran/${surah}#a${a.n}`} onClick={lang === 'ar' ? (e) => { if (e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); void openTafsir(a.n); } : undefined} aria-label={lang === 'ar' ? `تفسير الآية ${a.n}` : `Ayah ${a.n}`}><span aria-hidden="true">﴿{arDigits(a.n)}﴾</span></Link> </span>
        ))}
      </div>
    </>
      {tf && <div className="tf-panel" role="dialog" aria-label={`تفسير الآية ${tf.n}`}><div className="tf-head"><strong>تفسير الآية {arDigits(tf.n)}</strong><button type="button" className="btn ghost small" onClick={() => setTf(null)} aria-label="إغلاق">✕</button></div>
        {tf.j === undefined ? <p className="note">…</p> : <>{tf.g && tf.g.length > 0 && <><h3>غريب القرآن</h3>{tf.g.map((e, k) => <div key={k} className={k === tf.focus ? 'gw-on' : ''}><p style={{ whiteSpace: 'pre-line', margin: '4px 0 8px' }}>{e.t}</p></div>)}</>}{tf.m && <><h3>التفسير الميسر</h3><p>{tf.m}</p></>}{tf.j && <><h3>تفسير الجلالين</h3><p>{tf.j}</p></>}</>}
        <p className="note"><Link href={`/tafsir/${surah}#a${tf.n}`}>صفحة التفسير</Link> · <Link href={`/gharib/${surah}#a${tf.n}`}>الغريب</Link></p></div>}
    </>
  );
}
