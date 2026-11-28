import type { Metadata } from 'next';
import Link from 'next/link';
import { LIBRARY } from '@/lib/library';
import { arDigits } from '@/lib/quran';
export const metadata: Metadata = { title: 'المكتبة' };
export default function Library() {
  return (
    <article style={{ maxWidth: 820, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow">المعرفة</p><h1>المكتبة</h1><p>كتب كاملة بنص طبعة محددة وترقيم صفحاتها، دون اختصار.</p></header>
      <ul className="athar-dir">{LIBRARY.map((b) => <li key={b.key}><Link href={`/library/${b.key}`}><strong>{b.ar}</strong><small>{b.author} — {b.edition}</small><small>{b.key === 'riyad' ? `${arDigits(b.sections.reduce((t, s) => t + s.n, 0))} حديثًا في ${arDigits(b.sections.length)} بابًا` : `${arDigits(b.sections.length)} قسمًا بحسب صفحات الطبعة`}</small></Link></li>)}
        <li><Link href="/hadith/nawawi"><strong>الأربعون النووية</strong><small>الإمام النووي — في قسم الحديث</small></Link></li></ul>
    </article>
  );
}
