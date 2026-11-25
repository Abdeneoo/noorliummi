import Link from 'next/link';
import Icon from './Icon';
export type Tile = { href: string; icon: string; title: string; desc: string; lang?: string };
export default function Tiles({ items, label }: { items: Tile[]; label?: string }) {
  return (
    <ul className="tiles" aria-label={label}>
      {items.map((t) => (
        <li key={t.href}><Link href={t.href} hrefLang={t.lang}><Icon name={t.icon} /><strong>{t.title}</strong><small>{t.desc}</small></Link></li>
      ))}
    </ul>
  );
}
export function Hub({ eyebrow, title, intro, items, children }: { eyebrow?: string; title: string; intro?: string; items: Tile[]; children?: React.ReactNode }) {
  return (
    <>
      <header className="page-head">{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{intro && <p>{intro}</p>}</header>
      {children}
      <div className="section"><Tiles items={items} /></div>
    </>
  );
}
