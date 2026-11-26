'use client';
import { useState } from 'react';
type T = { id: number; title: string; period: 'daily' | 'weekly'; done: boolean };
export default function KidTasks({ tasks }: { tasks: T[] }) {
  const [list, setList] = useState(tasks);
  const toggle = async (t: T) => { const done = !t.done; setList((l) => l.map((x) => (x.id === t.id ? { ...x, done } : x))); const r = await fetch('/api/kids/done', { method: 'POST', headers: { 'content-type': 'application/json', 'x-noor': '1' }, body: JSON.stringify({ task: t.id, done }) }); if (!r.ok) setList((l) => l.map((x) => (x.id === t.id ? { ...x, done: !done } : x))); };
  if (!list.length) return null;
  return <section><h2>مهامي</h2><ul className="kid-tasks">{list.map((t) => <li key={t.id}><label><input type="checkbox" checked={t.done} onChange={() => toggle(t)} /><span className={t.done ? 'done' : ''}>{t.title}</span><small style={{ marginInlineStart: 'auto', color: 'var(--muted)' }}>{t.period === 'daily' ? 'اليوم' : 'هذا الأسبوع'}</small></label></li>)}</ul></section>;
}
