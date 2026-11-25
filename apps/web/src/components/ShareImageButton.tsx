'use client';
import { useState } from 'react';
import { shareStory, type Story } from '@/lib/story';
/** «مشاركة كصورة»: builds a 9:16 story image on the device and shares or downloads it. */
export default function ShareImageButton({ story, getStory, lang = 'ar', className = 'btn ghost small' }: { story?: Story; getStory?: () => Story | null; lang?: 'ar' | 'en'; className?: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button type="button" className={className} disabled={busy} onClick={async () => { setBusy(true); const st = story ?? getStory?.(); try { if (st) await shareStory(st); } finally { setBusy(false); } }}>
      {busy ? (lang === 'ar' ? 'جارٍ التجهيز…' : 'Preparing…') : (lang === 'ar' ? 'مشاركة كصورة' : 'Share as image')}
    </button>
  );
}
