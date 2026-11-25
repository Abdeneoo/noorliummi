'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
type C = { slug: string; name: string; kind: string; owner: boolean; members: number };
const H = { 'content-type': 'application/json', 'x-noor': '1' };
/** On the account page: the user's halaqat/families and a form to create one. Shown only when signed in. */
export default function MyCircles() {
  const [d, setD] = useState<{ user: boolean; circles: C[] } | null>(null); const [name, setName] = useState(''); const [kind, setKind] = useState('halaqa'); const [err, setErr] = useState('');
  const load = () => fetch('/api/circles', { cache: 'no-store' }).then((r) => r.json()).then(setD).catch(() => setD({ user: false, circles: [] }));
  useEffect(() => { void load(); }, []);
  if (!d?.user) return null;
  const create = async (e: React.FormEvent) => { e.preventDefault(); const r = await fetch('/api/circles', { method: 'POST', headers: H, body: JSON.stringify({ name, kind }) }); const j = await r.json().catch(() => ({})); if (r.ok) location.href = `/circle/${j.slug}`; else setErr(j.error ?? 'تعذّر الإنشاء.'); };
  return (
    <section className="card"><h2 style={{ marginTop: 0 }}>حلقات التحفيظ والأسرة</h2>
      <p className="note">أنشئ حلقة (معلّم وطلاب) أو مجموعة أسرة (وليّ أمر وأبناء) وأرسل رابط الدعوة. يرى المشرف اسم كل عضو وملخص تقدمه في الحفظ فقط، وبموافقة العضو.</p>
      {d.circles.length > 0 && <ul className="athar-dir">{d.circles.map((c) => <li key={c.slug}><Link href={`/circle/${c.slug}`}><strong>{c.name}</strong><small>{c.kind === 'family' ? 'أسرة' : 'حلقة'} · {c.owner ? `أنت المشرف · ${c.members.toLocaleString('ar-EG')} عضوًا` : 'عضو'}</small></Link></li>)}</ul>}
      <form className="row" onSubmit={create}><input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required placeholder="اسم الحلقة أو الأسرة" aria-label="اسم المجموعة" style={{ flex: '1 1 200px' }} />
        <select value={kind} onChange={(e) => setKind(e.target.value)} aria-label="النوع"><option value="halaqa">حلقة تحفيظ</option><option value="family">أسرة</option></select><button className="btn ghost">أنشئ</button></form>
      {err && <p className="note" role="alert">{err}</p>}
    </section>
  );
}
