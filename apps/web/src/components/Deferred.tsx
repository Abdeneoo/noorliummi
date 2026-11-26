'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
/**
 * Invisible background helpers (adhan scheduler, visit counter) loaded only after the page has painted and the browser is idle,
 * so their code is not part of the first load. They render nothing, so deferring them cannot shift the layout.
 */
const AdhanController = dynamic(() => import('./AdhanController'), { ssr: false });
const Beacon = dynamic(() => import('./Beacon'), { ssr: false });
export default function Deferred({ adhan = true }: { adhan?: boolean }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const go = () => setReady(true);
    if (w.requestIdleCallback) w.requestIdleCallback(go, { timeout: 3000 }); else setTimeout(go, 1500);
  }, []);
  if (!ready) return null;
  return <>{adhan && <AdhanController />}<Beacon /></>;
}
