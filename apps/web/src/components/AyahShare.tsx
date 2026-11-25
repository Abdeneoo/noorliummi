'use client';
import { useState } from 'react';
import ShareImageButton from './ShareImageButton';
/** Pick an ayah of this surah and share it as a 9:16 image. The text is read from the page (no extra download). */
export default function AyahShare({ surah, name, count, lang = 'ar' }: { surah: number; name: string; count: number; lang?: 'ar' | 'en' }) {
  const [n, setN] = useState(1);
  const ar = (x: number) => x.toLocaleString('ar-EG');
  const get = () => {
    const el = document.getElementById(`a${n}`); if (!el) return null;
    const c = el.cloneNode(true) as HTMLElement; c.querySelector('.ayah-end')?.remove();
    return { text: `${c.textContent?.trim() ?? ''} ﴿${ar(n)}﴾`, caption: `سورة ${name} · الآية ${ar(n)}`, quran: true, path: `/quran/${surah}#a${n}` };
  };
  return (
    <div className="row ayah-share" style={{ justifyContent: 'center' }}>
      <div className="field" style={{ flex: '0 1 150px' }}><label htmlFor="as">{lang === 'ar' ? 'شارك آية كصورة' : 'Share an ayah as image'}</label>
        <select id="as" value={n} onChange={(e) => setN(Number(e.target.value))}>{Array.from({ length: count }, (_, i) => i + 1).map((x) => <option key={x} value={x}>{lang === 'ar' ? `الآية ${ar(x)}` : `Ayah ${x}`}</option>)}</select></div>
      <ShareImageButton lang={lang} className="btn ghost" getStory={get} />
    </div>
  );
}
