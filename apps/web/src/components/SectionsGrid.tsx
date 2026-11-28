import Link from 'next/link';
import Icon from './Icon';
import { SECTIONS, type Lang } from '@/lib/sections';

/** All sections as grouped tiles. `compact` = the «المزيد» sheet (no descriptions). */
export function FeaturedSections({ lang = 'ar', pick, all }: { lang?: Lang; pick: string[]; all: { href: string; title: string } }) {
  const flat = SECTIONS[lang].flatMap((g) => g.items); const items = pick.map((h) => flat.find((x) => x.href === h)).filter(Boolean) as typeof flat;
  return (
    <ul className="sx-feature">
      {items.map((it, i) => <li key={it.href} style={{ '--i': i } as React.CSSProperties}><Link href={it.href} className="sx-tile"><span className="sx-ico"><Icon name={it.icon} /></span><span className="sx-t"><strong>{it.title}</strong>{it.desc && <small>{it.desc}</small>}</span></Link></li>)}
      <li style={{ '--i': items.length } as React.CSSProperties}><Link href={all.href} className="sx-tile sx-all"><span className="sx-ico"><Icon name="grid" /></span><span className="sx-t"><strong>{all.title}</strong></span></Link></li>
    </ul>
  );
}

export default function SectionsGrid({ lang = 'ar', compact = false, only }: { lang?: Lang; compact?: boolean; only?: string[] }) {
  const groups = SECTIONS[lang].filter((g) => !only || only.includes(g.id));
  let i = 0;
  return (
    <div className={`sx${compact ? ' sx-compact' : ''}`}>
      {groups.map((g) => (
        <section key={g.id} className="sx-group" aria-labelledby={`sx-${g.id}`}>
          <h3 id={`sx-${g.id}`}>{g.title}</h3>
          <ul>{g.items.map((it) => (
            <li key={it.href} style={{ '--i': i++ } as React.CSSProperties}>
              <Link href={it.href} className="sx-tile"><span className="sx-ico"><Icon name={it.icon} /></span><span className="sx-t"><strong>{it.title}</strong>{!compact && it.desc && <small>{it.desc}</small>}</span></Link>
            </li>))}</ul>
        </section>
      ))}
    </div>
  );
}
