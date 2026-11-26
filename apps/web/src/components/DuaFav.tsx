'use client';
import { useEffect, useState } from 'react';
const KEY = 'noor.duaFav';
const read = (): string[] => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
/** Star a dua (kept on this device only). */
export default function DuaFav({ id }: { id: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => { setOn(read().includes(id)); }, [id]);
  const flip = () => { const l = read(); const n = l.includes(id) ? l.filter((x) => x !== id) : [...l, id]; try { localStorage.setItem(KEY, JSON.stringify(n)); } catch { /* ignore */ } setOn(!on); };
  return <button type="button" className="btn ghost small" aria-pressed={on} onClick={flip}>{on ? '★ في المفضلة' : '☆ المفضلة'}</button>;
}
