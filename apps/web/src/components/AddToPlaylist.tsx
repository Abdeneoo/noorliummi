'use client';
import { useState, useSyncExternalStore } from 'react';
import type { Track } from '@/lib/audio-store';
import { FAV, addTracks, createPlaylist, plSubscribe, playlists } from '@/lib/playlists';
const EMPTY: never[] = [];
/** «أضف إلى قائمة»: adds tracks to the favourites, an existing personal playlist, or a new one. */
export default function AddToPlaylist({ tracks, name = '' }: { tracks: Track[]; name?: string }) {
  const lists = useSyncExternalStore(plSubscribe, playlists, () => EMPTY);
  const [open, setOpen] = useState(false); const [done, setDone] = useState(''); const [nm, setNm] = useState(name);
  if (!tracks.length) return null;
  const add = (id: string, label: string) => { addTracks(id, tracks); setDone(`أُضيف إلى «${label}»`); setOpen(false); setTimeout(() => setDone(''), 2500); };
  return (
    <span className="add-pl" style={{ position: 'relative' }}>
      <button type="button" className="btn ghost small" aria-expanded={open} onClick={() => setOpen(!open)}>＋ قائمة</button>
      {done && <span className="note" role="status"> {done}</span>}
      {open && (
        <span className="card" style={{ position: 'absolute', zIndex: 20, insetInlineStart: 0, top: '110%', minWidth: 220, display: 'grid', gap: 6, padding: 10 }}>
          <button type="button" className="btn ghost small" onClick={() => add(FAV, 'المفضلة')}>★ المفضلة</button>
          {lists.filter((p) => p.id !== FAV).map((p) => <button key={p.id} type="button" className="btn ghost small" onClick={() => add(p.id, p.name)}>{p.name}</button>)}
          <form onSubmit={(e) => { e.preventDefault(); if (!nm.trim()) return; const id = createPlaylist(nm); add(id, nm.trim()); }} style={{ display: 'flex', gap: 4 }}>
            <input value={nm} onChange={(e) => setNm(e.target.value)} maxLength={60} placeholder="اسم قائمة جديدة" aria-label="اسم قائمة جديدة" style={{ flex: 1, minWidth: 0 }} />
            <button className="btn small">أنشئ</button></form>
        </span>
      )}
    </span>
  );
}
