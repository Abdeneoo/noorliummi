'use client';
import { useEffect, useState } from 'react';
type Tr = { book: number; title: string; items: { ar: string; t: string }[] };
const LANGS = { ur: { name: 'اردو', dir: 'rtl' }, tr: { name: 'Türkçe', dir: 'ltr' }, id: { name: 'Indonesia', dir: 'ltr' } } as const;
type L = keyof typeof LANGS;
const KEY = 'noor.adhkar.tr';
const BOOK: Record<number, string> = { 12290: 'الأذكار التي تقال صباحًا ومساءً', 12306: 'حصن المسلم (الإصدار 4.0)' };
/** The publisher's own translation of this chapter, phrase by phrase with its Arabic, exactly as published by IslamHouse. */
export default function AdhkarTranslation({ data }: { data: Partial<Record<L, Tr>> }) {
  const langs = (Object.keys(LANGS) as L[]).filter((l) => data[l]); const [lang, setLang] = useState<L | ''>('');
  useEffect(() => { try { const q = new URLSearchParams(location.search).get('tr'); const v = (q || localStorage.getItem(KEY)) as L | null; if (v && data[v]) setLang(v); } catch { /* ignore */ } }, [data]);
  const pick = (l: L | '') => { setLang(l); try { if (l) localStorage.setItem(KEY, l); else localStorage.removeItem(KEY); } catch { /* ignore */ } };
  if (!langs.length) return null; const d = lang ? data[lang] : null;
  return (
    <section className="section" aria-label="ترجمة الباب">
      <div className="row" style={{ alignItems: 'center' }}><strong>ترجمة هذا الباب:</strong>
        <button type="button" className={!lang ? 'btn small' : 'btn ghost small'} aria-pressed={!lang ? 'true' : 'false'} onClick={() => pick('')}>بدون</button>
        {langs.map((l) => <button key={l} type="button" lang={l} className={lang === l ? 'btn small' : 'btn ghost small'} aria-pressed={lang === l ? 'true' : 'false'} onClick={() => pick(l)}>{LANGS[l].name}</button>)}</div>
      {d && lang && <div className="card">
        <h2 lang={lang} dir={LANGS[lang].dir} style={{ fontSize: '1.1rem' }}>{d.title}</h2>
        <ol className="adhkar-tr">{d.items.map((x, i) => <li key={i}><p className="ar" lang="ar" dir="rtl">{x.ar}</p><p className="he-tr" lang={lang} dir={LANGS[lang].dir} style={{ whiteSpace: 'pre-line' }}>{x.t}</p></li>)}</ol>
        <p className="note">النص العربي وترجمته كما نشرهما موقع دار الإسلام IslamHouse.com في كتاب «{BOOK[d.book]}» (<a href={`https://cnt.islamhouse.com/`} target="_blank" rel="noopener">المصدر ↗</a>)، دون تعديل. قد يختلف لفظ النص العربي يسيرًا عن نسختنا أعلاه بحسب الطبعة.</p>
      </div>}
    </section>
  );
}
