'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
type Item = { id: string; href: string; title: string; group: string };
/** Preparation checklist: read each chapter (in the order of the rites) and tick it; kept on this device only. */
export default function HajjChecklist({ items }: { items: Item[] }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  useEffect(() => { try { setDone(JSON.parse(localStorage.getItem('noor.hajjcheck') || '{}')); } catch { /* ignore */ } }, []);
  const flip = (id: string) => { const d = { ...done, [id]: !done[id] }; setDone(d); try { localStorage.setItem('noor.hajjcheck', JSON.stringify(d)); } catch { /* ignore */ } };
  const groups = [...new Set(items.map((x) => x.group))]; const n = items.filter((x) => done[x.id]).length;
  return (
    <section className="card"><h2 style={{ marginTop: 0 }}>قائمة الاستعداد للحج والعمرة</h2>
      <p className="note">اقرأ كل باب بالترتيب وعلّم عليه. تُحفظ العلامات على جهازك فقط. ({n.toLocaleString('ar-EG')} من {items.length.toLocaleString('ar-EG')})</p>
      {groups.map((g) => <div key={g}><h3>{g}</h3><ul className="check-list">{items.filter((x) => x.group === g).map((x) => (
        <li key={x.id}><label><input type="checkbox" checked={!!done[x.id]} onChange={() => flip(x.id)} /> <span className={done[x.id] ? 'done' : ''}>{x.title}</span></label> <Link href={x.href}>اقرأ</Link></li>))}</ul></div>)}
      {n > 0 && <button type="button" className="btn ghost small" onClick={() => { setDone({}); try { localStorage.removeItem('noor.hajjcheck'); } catch { /* ignore */ } }}>ابدأ من جديد</button>}
    </section>
  );
}
