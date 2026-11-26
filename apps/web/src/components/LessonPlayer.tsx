'use client';
import { useEffect, useRef, useState } from 'react';
type A = { order: number; size: string; extension_type: string; description: string | null; url: string };
const FAV = 'noor.lessons.fav'; const POS = 'noor.lessons.pos';
const read = <T,>(k: string, d: T): T => { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? d; } catch { return d; } };
/** Plays a lesson's audio/video parts from the source's servers, remembers where you stopped (per part) and your favourites — on this device. */
export default function LessonPlayer({ id, title, attachments }: { id: number; title: string; attachments: A[] }) {
  const media = attachments.filter((a) => ['MP3', 'MP4', 'M4A'].includes(a.extension_type)); const docs = attachments.filter((a) => !media.includes(a));
  const [i, setI] = useState(0); const [fav, setFav] = useState(false); const [copied, setCopied] = useState(false); const el = useRef<HTMLMediaElement | null>(null);
  useEffect(() => { setFav(!!read<Record<string, string>>(FAV, {})[id]); const p = read<Record<string, { i: number; t: number }>>(POS, {})[id]; if (p && p.i < media.length) setI(p.i); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);
  const save = () => { const m = el.current; if (!m) return; const all = read<Record<string, { i: number; t: number }>>(POS, {}); all[id] = { i, t: Math.floor(m.currentTime) }; const keys = Object.keys(all); if (keys.length > 200) delete all[keys[0]]; try { localStorage.setItem(POS, JSON.stringify(all)); } catch { /* ignore */ } };
  const restore = () => { const m = el.current; const p = read<Record<string, { i: number; t: number }>>(POS, {})[id]; if (m && p && p.i === i && p.t > 5 && p.t < (m.duration || Infinity) - 5) m.currentTime = p.t; };
  const toggleFav = () => { const all = read<Record<string, string>>(FAV, {}); if (all[id]) delete all[id]; else all[id] = title; try { localStorage.setItem(FAV, JSON.stringify(all)); } catch { /* ignore */ } setFav(!fav); };
  const share = async () => { const url = location.href; if (navigator.share) { try { await navigator.share({ title, url }); return; } catch { return; } } await navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const cur = media[i];
  return (
    <section className="card">
      {cur && (cur.extension_type === 'MP4'
        ? <video key={cur.url} ref={(e) => { el.current = e; }} controls preload="metadata" playsInline style={{ width: '100%', borderRadius: 12 }} src={cur.url} onLoadedMetadata={restore} onTimeUpdate={save} onEnded={() => i < media.length - 1 && setI(i + 1)} />
        : <audio key={cur.url} ref={(e) => { el.current = e; }} controls preload="metadata" style={{ width: '100%' }} src={cur.url} onLoadedMetadata={restore} onTimeUpdate={save} onEnded={() => i < media.length - 1 && setI(i + 1)} />)}
      {media.length > 1 && <ol className="lesson-parts">{media.map((a, k) => <li key={a.url}><button type="button" className={k === i ? 'on' : ''} onClick={() => setI(k)}>{a.description || `الجزء ${(k + 1).toLocaleString('ar-EG')}`} <small>{a.size}</small></button></li>)}</ol>}
      {docs.length > 0 && <ul className="chips" style={{ marginTop: 12 }}>{docs.map((a) => <li key={a.url}><a href={a.url} target="_blank" rel="noopener">{a.description || a.extension_type} ({a.extension_type}{a.size ? ` · ${a.size}` : ''}) ↗</a></li>)}</ul>}
      {!attachments.length && <p className="note">لا مرفقات لهذه المادة في المصدر.</p>}
      <div className="row"><button type="button" className={fav ? 'btn small' : 'btn ghost small'} aria-pressed={fav ? 'true' : 'false'} onClick={toggleFav}>{fav ? '★ في المفضلة' : '☆ أضف للمفضلة'}</button><button type="button" className="btn ghost small" onClick={share}>{copied ? 'نُسخ الرابط ✓' : 'مشاركة'}</button></div>
    </section>
  );
}
