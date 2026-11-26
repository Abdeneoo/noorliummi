'use client';
import { useState, useSyncExternalStore } from 'react';
import { play } from '@/lib/audio-store';
import { FAV, deletePlaylist, moveTrack, plSubscribe, playlists, removeTrack, renamePlaylist, createPlaylist } from '@/lib/playlists';
const EMPTY: never[] = [];
/** The visitor's own playlists (this device only): play, reorder, remove, rename, delete. */
export default function MyPlaylists({ lang = 'ar' }: { lang?: 'ar' | 'en' }) {
  const en = lang === 'en'; const L = (a: string, e: string) => (en ? e : a);
  const lists = useSyncExternalStore(plSubscribe, playlists, () => EMPTY);
  const [nm, setNm] = useState(''); const [ask, setAsk] = useState('');
  return (
    <section className="section" id="mine"><h2>{L('قوائمي', 'My playlists')}</h2>
      <p className="note">{L('تُحفظ على هذا الجهاز فقط. أضف إليها من أي صفحة فيها زر «＋ قائمة». التكرار والسرعة ومؤقت النوم من المشغّل أسفل الشاشة، ويُحفظ آخر موضع لكل تسجيل.', 'Kept on this device only. Add to them from any page with a “＋ Playlist” button. Repeat, speed and sleep timer are in the player at the bottom; the last position of each recording is remembered.')}</p>
      <form className="row" onSubmit={(e) => { e.preventDefault(); if (nm.trim()) { createPlaylist(nm); setNm(''); } }}>
        <input value={nm} onChange={(e) => setNm(e.target.value)} maxLength={60} placeholder={L('اسم قائمة جديدة', 'New playlist name')} aria-label={L('اسم قائمة جديدة', 'New playlist name')} /><button className="btn ghost">{L('أنشئ قائمة', 'Create playlist')}</button></form>
      {lists.length === 0 && <p className="note">{L('لا توجد قوائم بعد.', 'No playlists yet.')}</p>}
      {lists.map((p) => (
        <details key={p.id} className="card" style={{ marginTop: 8 }} open={p.id === FAV}>
          <summary><strong>{p.id === FAV ? '★ ' : ''}{p.name}</strong> — {en ? p.tracks.length : p.tracks.length.toLocaleString('ar-EG')}{L(' تسجيلًا', ' recordings')}</summary>
          <div className="row" style={{ marginTop: 8 }}>
            <button type="button" className="btn small" disabled={!p.tracks.length} onClick={() => play(p.tracks.map((t) => ({ ...t, page: t.page ?? '/playlists' })))}>{L('▶ شغّل القائمة', '▶ Play playlist')}</button>
            {p.id !== FAV && <button type="button" className="btn ghost small" onClick={() => { const n = window.document.getElementById(`rn-${p.id}`) as HTMLInputElement | null; if (n?.value.trim()) renamePlaylist(p.id, n.value); }}>{L('إعادة تسمية', 'Rename')}</button>}
            {p.id !== FAV && <input id={`rn-${p.id}`} defaultValue={p.name} maxLength={60} aria-label={L('الاسم الجديد', 'New name')} style={{ maxWidth: 180 }} />}
            {ask === p.id ? <><span>{L('حذف القائمة؟', 'Delete this playlist?')}</span><button type="button" className="btn small" onClick={() => { deletePlaylist(p.id); setAsk(''); }}>{L('نعم، احذف', 'Yes, delete')}</button><button type="button" className="btn ghost small" onClick={() => setAsk('')}>{L('إلغاء', 'Cancel')}</button></>
              : <button type="button" className="btn ghost small" onClick={() => setAsk(p.id)}>{L('حذف القائمة', 'Delete playlist')}</button>}
          </div>
          <ol className="athar-items">{p.tracks.map((t, k) => (
            <li key={`${t.id}-${k}`}><button type="button" className="btn ghost small" onClick={() => play(p.tracks, k)} aria-label={`${L('تشغيل', 'Play')} ${t.title}`}>▶</button> {t.title} <small className="note">{t.by}</small>
              <button type="button" className="btn ghost small" aria-label={L('أعلى', 'Up')} disabled={k === 0} onClick={() => moveTrack(p.id, k, -1)}>↑</button>
              <button type="button" className="btn ghost small" aria-label={L('أسفل', 'Down')} disabled={k === p.tracks.length - 1} onClick={() => moveTrack(p.id, k, 1)}>↓</button>
              <button type="button" className="btn ghost small" aria-label={`${L('إزالة', 'Remove')} ${t.title}`} onClick={() => removeTrack(p.id, k)}>{L('إزالة', 'Remove')}</button></li>
          ))}</ol>
        </details>
      ))}
    </section>
  );
}
