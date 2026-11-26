'use client';
import { useEffect, useState } from 'react';
import { canSave, removeAll, saveAll, savedCount } from '@/lib/offline-audio';
/** «احفظ للاستماع دون إنترنت» for a list of recordings; shows the approximate size first. */
export default function SaveOffline({ srcs, size }: { srcs: string[]; size?: string }) {
  const ok = srcs.filter(canSave); const [n, setN] = useState(0); const [busy, setBusy] = useState(false); const [p, setP] = useState(0);
  useEffect(() => { void savedCount(ok).then(setN); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [ok.length]);
  if (!ok.length) return null;
  const all = n >= ok.length;
  return (
    <span className="save-off">
      {busy ? <span className="note">جارٍ الحفظ {p.toLocaleString('ar-EG')}/{ok.length.toLocaleString('ar-EG')}…</span>
        : all ? <button type="button" className="btn ghost small" onClick={async () => { await removeAll(ok); setN(0); }}>✓ محفوظ دون إنترنت — احذف</button>
        : <button type="button" className="btn ghost small" onClick={async () => { if (size && !confirm(`سيُحفظ على جهازك نحو ${size}. متابعة؟`)) return; setBusy(true); await saveAll(ok, setP).catch(() => undefined); setBusy(false); setN(await savedCount(ok)); }}>⬇ احفظ دون إنترنت{size ? ` (${size})` : ''}</button>}
    </span>
  );
}
