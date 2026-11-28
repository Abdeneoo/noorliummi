import Link from 'next/link';
import { libBook } from '@/lib/library';

/** Majalis of Ibn Rajab's «لطائف المعارف» for one season (by the book's own month groups). */
export default function LataifSeason({ group, title }: { group: RegExp; title: string }) {
  const b = libBook('lataif'); const secs = b?.sections.filter((s) => s.group && group.test(s.group)) ?? [];
  if (!secs.length) return null;
  return (
    <section className="section reveal"><div className="section-head"><h2>{title}</h2><Link href="/library/lataif">الكتاب كاملًا</Link></div>
      <p className="note">من «لطائف المعارف فيما لمواسم العام من الوظائف» للحافظ ابن رجب الحنبلي.</p>
      <ul className="athar-dir">{secs.map((s) => <li key={s.i}><Link href={`/library/lataif/${s.i}`}><strong>{s.title.replace(/\.$/, '')}</strong></Link></li>)}</ul>
    </section>
  );
}
