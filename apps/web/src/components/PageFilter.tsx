'use client';
import { useEffect, useState } from 'react';
/** Filters the hadith cards of a long section page by text, and adds a "copy link" button to each card. */
export default function PageFilter({ target }: { target: string }) {
  const [q, setQ] = useState(''); const [n, setN] = useState<number | null>(null);
  const norm = (s: string) => s.replace(/[ً-ٰٟ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>(`${target} > li.card`));
    for (const li of items) {
      if (li.querySelector('.copy-link') || !li.id) continue;
      const b = document.createElement('button'); b.type = 'button'; b.className = 'btn ghost small copy-link'; b.textContent = 'نسخ الرابط';
      b.onclick = () => { void navigator.clipboard?.writeText(`${location.origin}${location.pathname}#${li.id}`); b.textContent = 'نُسخ ✓'; setTimeout(() => { b.textContent = 'نسخ الرابط'; }, 1500); };
      li.querySelector('.meta')?.appendChild(b);
    }
  }, [target]);
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>(`${target} > li`));
    const k = norm(q.trim());
    let shown = 0;
    for (const li of items) { const hit = !k || norm(li.textContent ?? '').includes(k); li.hidden = !hit; if (hit && li.classList.contains('card')) shown++; }
    setN(k ? shown : null);
  }, [q, target]);
  return (
    <div className="row" style={{ marginTop: 0, marginBottom: 12 }}>
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث في هذه الصفحة" aria-label="ابحث في هذه الصفحة" style={{ flex: '1 1 240px' }} />
      {n !== null && <span className="note" role="status" style={{ margin: 0 }}>{n} حديثًا</span>}
    </div>
  );
}
