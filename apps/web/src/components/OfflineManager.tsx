'use client';
import { useEffect, useState } from 'react';
import { OFFLINE_CACHE, usage } from '@/lib/offline-audio';
/** What is saved on this device for offline listening, with a button to clear it. */
export default function OfflineManager() {
  const [n, setN] = useState<number | null>(null); const [u, setU] = useState<{ used: number; quota: number } | null>(null);
  const load = async () => { if (!('caches' in window)) return; const c = await caches.open(OFFLINE_CACHE); setN((await c.keys()).length); setU(await usage()); };
  useEffect(() => { void load(); }, []);
  if (!n) return null;
  return (
    <p className="note card" style={{ padding: 12 }}>محفوظ على جهازك للاستماع دون إنترنت: {n.toLocaleString('ar-EG')} تسجيلًا{u ? ` · مساحة الموقع على جهازك ${(u.used / 1048576).toFixed(0)} م.ب` : ''}.{' '}
      <button type="button" className="btn ghost small" onClick={async () => { if (!confirm('حذف كل التسجيلات المحفوظة (ومنها السور المحفوظة)؟')) return; await caches.delete(OFFLINE_CACHE); await load(); setN(0); }}>احذف الكل</button></p>
  );
}
