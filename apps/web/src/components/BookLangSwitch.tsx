'use client';
import { useEffect, useState } from 'react';
const NAMES = { ur: 'اردو', tr: 'Türkçe', id: 'Indonesia' } as const;
type L = keyof typeof NAMES;
const KEY = 'noor.books.tr';
/** Shows the publisher's translation under each paragraph of the chapter (all translations are in the page, hidden until chosen). */
export default function BookLangSwitch({ langs }: { langs: L[] }) {
  const [lang, setLang] = useState<L | ''>('');
  useEffect(() => { try { const q = new URLSearchParams(location.search).get('tr'); const v = (q || localStorage.getItem(KEY)) as L | null; if (v && langs.includes(v)) setLang(v); } catch { /* ignore */ } }, [langs]);
  useEffect(() => { document.querySelectorAll<HTMLElement>('.bk-tr').forEach((e) => { e.hidden = e.dataset.l !== lang; }); }, [lang]);
  const pick = (l: L | '') => { setLang(l); try { if (l) localStorage.setItem(KEY, l); else localStorage.removeItem(KEY); } catch { /* ignore */ } };
  return <div className="row" style={{ alignItems: 'center' }}><strong>الترجمة:</strong><button type="button" className={!lang ? 'btn small' : 'btn ghost small'} aria-pressed={!lang ? 'true' : 'false'} onClick={() => pick('')}>العربية فقط</button>{langs.map((l) => <button key={l} type="button" lang={l} className={lang === l ? 'btn small' : 'btn ghost small'} aria-pressed={lang === l ? 'true' : 'false'} onClick={() => pick(l)}>{NAMES[l]}</button>)}</div>;
}
