'use client';
import { useEffect, useState } from 'react';
const LANGS = { ur: { name: 'اردو', dir: 'rtl' }, tr: { name: 'Türkçe', dir: 'ltr' }, id: { name: 'Indonesia', dir: 'ltr' } } as const;
type L = keyof typeof LANGS;
const KEY = 'noor.hadith.tr';
/**
 * Shows a published translation under each hadith of the page (Arabic always first). Translations come from
 * fawazahmed0/hadith-api and are matched by the hadith number of the same edition — never by text similarity, never machine-made.
 */
export default function HadithTranslation({ book, s, target }: { book: string; s: number; target: string }) {
  const [lang, setLang] = useState<L | ''>(''); const [msg, setMsg] = useState('');
  useEffect(() => { try { const v = localStorage.getItem(KEY) as L | null; if (v && v in LANGS) setLang(v); } catch { /* ignore */ } }, []);
  useEffect(() => {
    document.querySelectorAll(`${target} .hadith-tr`).forEach((e) => e.remove()); setMsg('');
    if (!lang) return; let off = false;
    fetch(`/api/hadith/tr?lang=${lang}&book=${book}&s=${s}`).then((r) => r.json()).then((j: { available: boolean; items: Record<string, string> }) => {
      if (off) return;
      if (!j.available) { setMsg('الترجمة غير متوفرة بعد لهذا الكتاب بهذه اللغة في مصدرنا.'); return; }
      let have = 0; let all = 0;
      document.querySelectorAll<HTMLElement>(`${target} > li.card[id^="h"]`).forEach((li) => {
        const n = li.id.slice(1).split('-')[0]; all++; const t = j.items[n]; const p = document.createElement('p'); p.className = 'hadith-tr'; p.lang = lang; p.dir = LANGS[lang].dir;
        if (t) { p.textContent = t; have++; } else { p.textContent = '— الترجمة غير متوفرة لهذا الحديث —'; p.lang = 'ar'; p.dir = 'rtl'; p.classList.add('missing'); }
        li.appendChild(p);
      });
      setMsg(`${LANGS[lang].name}: ${have} من ${all} في هذه الصفحة. المصدر: fawazahmed0/hadith-api (المترجم غير مذكور في المصدر).`);
    }).catch(() => setMsg('تعذّر تحميل الترجمة.'));
    return () => { off = true; };
  }, [lang, book, s, target]);
  return (
    <div className="row" style={{ marginTop: 0, marginBottom: 12, alignItems: 'center' }}>
      <label htmlFor="h-tr">الترجمة</label>
      <select id="h-tr" value={lang} onChange={(e) => { const v = e.target.value as L | ''; setLang(v); try { localStorage.setItem(KEY, v); } catch { /* ignore */ } }}>
        <option value="">العربية فقط</option>{(Object.keys(LANGS) as L[]).map((l) => <option key={l} value={l}>{LANGS[l].name}</option>)}
      </select>
      {msg && <span className="note" role="status" style={{ margin: 0 }}>{msg}</span>}
    </div>
  );
}
