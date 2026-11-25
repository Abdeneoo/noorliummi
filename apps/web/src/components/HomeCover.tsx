import Link from 'next/link';
import BrandLogo from './BrandLogo';
import Icon from './Icon';

/**
 * Home cover with its motion layer (pure CSS/SVG, no JS): breathing light, drifting geometric
 * pattern, an arch that draws itself around the logo, and slow rising motes. Everything rests
 * in its final, visible state when the user prefers reduced motion.
 */
const MOTES = [
  [8, 11, 0, 3], [17, 14, 4, 2], [26, 9, 2, 4], [35, 13, 7, 2], [44, 10, 1, 3], [53, 15, 5, 2],
  [61, 12, 3, 4], [69, 9, 8, 2], [77, 14, 2, 3], [85, 11, 6, 2], [92, 13, 0, 3], [22, 16, 9, 2], [72, 16, 10, 2], [48, 18, 12, 3],
];
type Lang = 'ar' | 'en';
const C = {
  ar: { alt: 'شعار نور لأمي', title: 'نور لأمي', tag: 'نورٌ لا ينطفئ، وأثرٌ لا ينقطع', ded: 'إهداء',
    // Official dedication text (brand guide) + the owner's dua, shown in full.
    lines: ['إلى أمي الغالية، التي رحلت عن عيني ولم ترحل عن قلبي.', 'أُنشئ هذا المشروع ابتغاء وجه الله، ورجاء أن يكون صدقة جارية عنها. نسألكم الدعاء لها بالرحمة والمغفرة.'],
    dua: 'اللهم اغفر لها وارحمها، وآنس وحشتها، ونوّر قبرها، واجعلها من أهل الفردوس الأعلى، واجمعنا بها في جنتك لقاءً لا فراق بعده.',
    a: 'افتح المصحف', b: 'الصلاة والأذان', ha: '/quran', hb: '/prayer' },
  en: { alt: 'Noor Li Ummi logo', title: 'Noor Li Ummi', tag: 'A light that never fades, a legacy that never ends', ded: 'Dedication',
    lines: ['To my beloved mother, who has left my sight but never my heart.', 'This project was made seeking the Face of Allah, in the hope that it will be an ongoing charity on her behalf. Please remember her in your prayers, asking Allah for His mercy and forgiveness for her.'],
    dua: '',
    a: 'Open the Quran', b: 'Prayer & Adhan', ha: '/en/quran', hb: '/en/prayer' },
};
export default function HomeCover({ lang = 'ar' }: { lang?: Lang }) {
  const c = C[lang];
  return (
    <section className="cover" aria-labelledby="cover-title">
      <div className="cover-bg" aria-hidden="true">
        <svg className="pattern" width="100%" height="100%">
          <defs>
            <pattern id="star8" width="64" height="64" patternUnits="userSpaceOnUse">
              <path d="M32 6 39 25 58 32 39 39 32 58 25 39 6 32 25 25Z M32 14 37.5 26.5 50 32 37.5 37.5 32 50 26.5 37.5 14 32 26.5 26.5Z" fill="none" stroke="currentColor" strokeWidth="1" />
              <path d="M13.6 13.6 32 21 50.4 13.6 43 32 50.4 50.4 32 43 13.6 50.4 21 32Z" fill="none" stroke="currentColor" strokeWidth=".6" />
            </pattern>
          </defs>
          <rect width="200%" height="200%" fill="url(#star8)" />
        </svg>
        <div className="glow" />
        {MOTES.map(([x, d, delay, s], i) => <span key={i} className="mote" style={{ ['--x' as string]: `${x}%`, ['--d' as string]: `${d}s`, ['--delay' as string]: `-${delay}s`, ['--s' as string]: `${s}px` }} />)}
      </div>
      <div className="cover-inner">
        <div className="cover-art">
          <svg className="arch" viewBox="0 0 360 440" aria-hidden="true">
            <path className="arch-outer" pathLength="1" d="M18 440V196C18 104 92 40 180 10c88 30 162 94 162 186v244" />
            <path className="arch-inner" pathLength="1" d="M40 440V200C40 120 104 66 180 38c76 28 140 82 140 162v240" />
            <path className="arch-shine" pathLength="1" d="M18 440V196C18 104 92 40 180 10c88 30 162 94 162 186v244" />
          </svg>
          <BrandLogo alt={c.alt} priority />
        </div>
        <div className="cover-text">
          <h1 id="cover-title" className="rise" style={{ ['--i' as string]: 1 }}>{c.title}</h1>
          <p className="tagline rise" style={{ ['--i' as string]: 2 }}>{c.tag}</p>
          <div className="cover-dedication rise" style={{ ['--i' as string]: 3 }}>
            <p className="eyebrow">{c.ded}</p>
            <p className="ded-first">{c.lines[0]}</p>
            <p>{c.lines[1]}</p>
            {c.dua && <p className="ded-dua">{c.dua}</p>}
          </div>
          <div className="actions rise" style={{ ['--i' as string]: 4 }}>
            <Link className="btn light" href={c.ha}><Icon name="quran" />{c.a}</Link>
            <Link className="btn outline-light" href={c.hb}><Icon name="prayer" />{c.b}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
