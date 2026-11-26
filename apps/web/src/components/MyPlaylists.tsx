'use client';
import { useState, useSyncExternalStore } from 'react';
import { play } from '@/lib/audio-store';
import { FAV, deletePlaylist, moveTrack, plSubscribe, playlists, removeTrack, renamePlaylist, createPlaylist } from '@/lib/playlists';
const EMPTY: never[] = [];
/** The visitor's own playlists (this device only): play, reorder, remove, rename, delete. */
export default function MyPlaylists() {
  const lists = useSyncExternalStore(plSubscribe, playlists, () => EMPTY);
  const [nm, setNm] = useState(''); const [ask, setAsk] = useState('');
  return (
    <section className="section" id="mine"><h2>قوائمي</h2>
      <p className="note">تُحفظ على هذا الجهاز فقط. أضف إليها من أي صفحة فيها زر «＋ قائمة». التكرار والسرعة ومؤقت النوم من المشغّل أسفل الشاشة، ويُحفظ آخر موضع لكل تسجيل.</p>
      <form className="row" onSubmit={(e) => { e.preventDefault(); if (nm.trim()) { createPlaylist(nm); setNm(''); } }}>
        <input value={nm} onChange={(e) => setNm(e.target.value)} maxLength={60} placeholder="اسم قائمة جديدة" aria-label="اسم قائمة جديدة" /><button className="btn ghost">أنشئ قائمة</button></form>
      {lists.length === 0 && <p className="note">لا توجد قوائم بعد.</p>}
      {lists.map((p) => (
        <details key={p.id} className="card" style={{ marginTop: 8 }} open={p.id === FAV}>
          <summary><strong>{p.id === FAV ? '★ ' : ''}{p.name}</strong> — {p.tracks.length.toLocaleString('ar-EG')} تسجيلًا</summary>
          <div className="row" style={{ marginTop: 8 }}>
            <button type="button" className="btn small" disabled={!p.tracks.length} onClick={() => play(p.tracks.map((t) => ({ ...t, page: t.page ?? '/playlists' })))}>▶ شغّل القائمة</button>
            {p.id !== FAV && <button type="button" className="btn ghost small" onClick={() => { const n = window.document.getElementById(`rn-${p.id}`) as HTMLInputElement | null; if (n?.value.trim()) renamePlaylist(p.id, n.value); }}>إعادة تسمية</button>}
            {p.id !== FAV && <input id={`rn-${p.id}`} defaultValue={p.name} maxLength={60} aria-label="الاسم الجديد" style={{ maxWidth: 180 }} />}
            {ask === p.id ? <><span>حذف القائمة؟</span><button type="button" className="btn small" onClick={() => { deletePlaylist(p.id); setAsk(''); }}>نعم، احذف</button><button type="button" className="btn ghost small" onClick={() => setAsk('')}>إلغاء</button></>
              : <button type="button" className="btn ghost small" onClick={() => setAsk(p.id)}>حذف القائمة</button>}
          </div>
          <ol className="athar-items">{p.tracks.map((t, k) => (
            <li key={`${t.id}-${k}`}><button type="button" className="btn ghost small" onClick={() => play(p.tracks, k)} aria-label={`تشغيل ${t.title}`}>▶</button> {t.title} <small className="note">{t.by}</small>
              <button type="button" className="btn ghost small" aria-label="أعلى" disabled={k === 0} onClick={() => moveTrack(p.id, k, -1)}>↑</button>
              <button type="button" className="btn ghost small" aria-label="أسفل" disabled={k === p.tracks.length - 1} onClick={() => moveTrack(p.id, k, 1)}>↓</button>
              <button type="button" className="btn ghost small" aria-label={`إزالة ${t.title}`} onClick={() => removeTrack(p.id, k)}>إزالة</button></li>
          ))}</ol>
        </details>
      ))}
    </section>
  );
}
