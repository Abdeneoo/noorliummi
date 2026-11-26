'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
const norm = (s: string) => s.replace(/[ً-ْٰ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
/** Finds a topic among the source's categories (the source's API offers no full-text search). */
export default function LessonCatSearch({ cats }: { cats: [number, string][] }) {
  const [q, setQ] = useState(''); const nq = norm(q.trim());
  const hits = useMemo(() => (nq.length < 2 ? [] : cats.filter(([, t]) => norm(t).includes(nq)).slice(0, 30)), [nq, cats]);
  return (
    <section className="section"><label htmlFor="lq"><strong>ابحث عن موضوع</strong></label>
      <input id="lq" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="مثل: الصلاة، الزكاة، التوحيد، رمضان" style={{ width: '100%', marginTop: 6 }} />
      {nq.length >= 2 && (hits.length ? <ul className="chips" style={{ marginTop: 10 }}>{hits.map(([id, t]) => <li key={id}><Link href={`/lessons/c/${id}`}>{t}</Link></li>)}</ul> : <p className="note">لا يوجد تصنيف بهذا الاسم. البحث هنا في أسماء التصنيفات.</p>)}
    </section>
  );
}
