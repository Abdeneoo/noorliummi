'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { NAMES, readMine } from './AtharForm';

/** Pages this device can edit (created here, or opened with their private edit link). */
export default function MyAthar() {
  const [pages, setPages] = useState<[string, string][]>([]);
  useEffect(() => {
    let names: Record<string, string> = {}; try { names = JSON.parse(localStorage.getItem(NAMES) ?? '{}'); } catch { /* ignore */ }
    setPages(Object.keys(readMine()).map((s) => [s, names[s] ?? s]));
  }, []);
  if (!pages.length) return null;
  return (
    <details className="my-athar">
      <summary className="btn ghost">صفحاتي ({pages.length})</summary>
      <ul>{pages.map(([s, n]) => <li key={s}><Link href={`/athar/${s}`}>{n}</Link></li>)}</ul>
    </details>
  );
}
