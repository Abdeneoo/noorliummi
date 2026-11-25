'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
export default function MyKhatmas() {
  const [l, setL] = useState<{ slug: string; name: string }[]>([]);
  useEffect(() => { try { setL(JSON.parse(localStorage.getItem('noor.khatma.mine') || '[]')); } catch { /* ignore */ } }, []);
  if (!l.length) return null;
  return <section className="section"><h2>ختماتي على هذا الجهاز</h2><ul className="athar-dir">{l.map((k) => <li key={k.slug}><Link href={`/khatma/${k.slug}`}><strong>{k.name}</strong></Link></li>)}</ul></section>;
}
