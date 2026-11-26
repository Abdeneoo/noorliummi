'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
/** The user's favourite lessons (kept on this device). */
export default function LessonShelf() {
  const [fav, setFav] = useState<[string, string][]>([]);
  useEffect(() => { try { setFav(Object.entries(JSON.parse(localStorage.getItem('noor.lessons.fav') || '{}'))); } catch { /* ignore */ } }, []);
  if (!fav.length) return null;
  return <section className="section"><h2>مفضلتي</h2><ul className="athar-dir">{fav.map(([id, t]) => <li key={id}><Link href={`/lessons/${id}`}><strong>{t}</strong></Link></li>)}</ul></section>;
}
