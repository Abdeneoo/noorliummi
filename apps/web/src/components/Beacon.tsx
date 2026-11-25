'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
/** Usage counts without tracking: tells the server which section was opened. No cookie, id or address is stored. */
export default function Beacon() {
  const path = usePathname();
  useEffect(() => {
    if (!path || path.startsWith('/admin')) return;
    let first = false; try { first = !sessionStorage.getItem('noor.v'); sessionStorage.setItem('noor.v', '1'); } catch { /* ignore */ }
    try { navigator.sendBeacon?.('/api/hit', JSON.stringify({ p: path, f: first })); } catch { /* ignore */ }
  }, [path]);
  return null;
}
