'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { play as playAudio, positions } from '@/lib/audio-store';
type Ep = { id: string; t: string; full: string; d: string; embed: boolean; audio?: string };
type YTPlayer = { getCurrentTime(): number; getDuration(): number; loadVideoById(o: { videoId: string; startSeconds?: number }): void; destroy(): void };
type YTNs = { Player: new (el: HTMLElement, o: object) => YTPlayer };
declare global { interface Window { YT?: YTNs; onYouTubeIframeAPIReady?: () => void } }
const OK = 'noor.yt.ok'; const POS = 'noor.series.pos'; const FAV = 'noor.series.fav'; const LAST = 'noor.series.last';
const read = <T,>(k: string, d: T): T => { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? d; } catch { return d; } };
const write = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };
const sec = (d: string) => d.split(':').reduce((a, x) => a * 60 + Number(x), 0);
let apiPromise: Promise<YTNs> | null = null;
function loadApi(): Promise<YTNs> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  return (apiPromise ??= new Promise((res) => { const prev = window.onYouTubeIframeAPIReady; window.onYouTubeIframeAPIReady = () => { prev?.(); res(window.YT!); }; const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(s); }));
}
/**
 * Episode list + YouTube's official embedded player (privacy-enhanced host), loaded only after the visitor agrees.
 * Remembers each episode's position and finished episodes on this device, resumes, plays the next one, searches titles, keeps favourites.
 */
export default function SeriesPlayer({ slug, eps, lecturer }: { slug: string; eps: Ep[]; lecturer: string }) {
  const [ok, setOk] = useState(false); const [cur, setCur] = useState<number | null>(null); const [q, setQ] = useState(''); const [onlyFav, setOnlyFav] = useState(false);
  const [pos, setPos] = useState<Record<string, number>>({}); const [fav, setFav] = useState<string[]>([]); const [auto, setAuto] = useState(true);
  const box = useRef<HTMLDivElement>(null); const au = useRef<HTMLAudioElement>(null); const hasVideo = eps.some((e) => !e.audio); const player = useRef<YTPlayer | null>(null); const curRef = useRef<number | null>(null); const autoRef = useRef(true);
  useEffect(() => { try { setOk(localStorage.getItem(OK) === '1'); } catch { /* ignore */ } setPos({ ...read(POS, {}), ...positions() }); setFav(read(FAV, [])); const last = read<Record<string, number>>(LAST, {})[slug]; if (typeof last === 'number' && eps[last]) setCur(last); }, [slug, eps]);
  useEffect(() => { autoRef.current = auto; }, [auto]);
  const savePos = useCallback(() => { const i = curRef.current; if (i == null) return; const a = eps[i].audio ? au.current : null; const p = a ? null : player.current; if (!a && !p) return; const t = Math.floor(a ? a.currentTime : p!.getCurrentTime?.() || 0); if (!t) return; const all = read<Record<string, number>>(POS, {}); const dur = (a ? a.duration : p!.getDuration?.()) || sec(eps[i].d); all[eps[i].id] = dur && t > dur - 20 ? -1 : t; write(POS, all); setPos(all); }, [eps]);
  const play = useCallback(async (i: number) => {
    const e = eps[i]; if (!e) return; curRef.current = i; setCur(i); const l = read<Record<string, number>>(LAST, {}); l[slug] = i; write(LAST, l);
    if (e.audio) { player.current?.destroy(); player.current = null; if (box.current) box.current.innerHTML = '';
      // Audio episodes play in the site-wide player, so they keep playing while the visitor moves to other pages.
      const list = (autoRef.current ? eps.filter((x) => x.audio) : [e]).map((x) => ({ id: x.id, src: x.audio!, title: x.t, by: lecturer, page: `/series/${slug}`, source: 'Spreaker (البودكاست الرسمي)' }));
      playAudio(list, Math.max(0, list.findIndex((x) => x.id === e.id)));
      return; }
    au.current?.pause();
    if (!e.embed || !ok) return;
    const YT = await loadApi(); const start = Math.max(0, read<Record<string, number>>(POS, {})[e.id] ?? 0);
    if (player.current) { player.current.loadVideoById({ videoId: e.id, startSeconds: start }); return; }
    if (!box.current) return; const el = document.createElement('div'); box.current.innerHTML = ''; box.current.appendChild(el);
    player.current = new YT.Player(el, { host: 'https://www.youtube-nocookie.com', videoId: e.id, playerVars: { start, autoplay: 1, rel: 0, playsinline: 1, hl: 'ar' },
      events: { onStateChange: (ev: { data: number }) => { if (ev.data === 2) savePos(); if (ev.data === 0) { const all = read<Record<string, number>>(POS, {}); all[eps[curRef.current!].id] = -1; write(POS, all); setPos(all); const n = (curRef.current ?? 0) + 1; if (autoRef.current && eps[n]) play(n); } } } });
  }, [eps, ok, slug, savePos, lecturer]);
  useEffect(() => { const t = setInterval(savePos, 10000); const h = () => savePos(); window.addEventListener('pagehide', h); return () => { clearInterval(t); window.removeEventListener('pagehide', h); }; }, [savePos]);
  useEffect(() => () => { player.current?.destroy(); player.current = null; }, []);
  const agree = () => { try { localStorage.setItem(OK, '1'); } catch { /* ignore */ } setOk(true); };
  useEffect(() => { if (ok && cur != null && !player.current) play(cur); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [ok]);
  const toggleFav = (id: string) => { const n = fav.includes(id) ? fav.filter((x) => x !== id) : [...fav, id]; setFav(n); write(FAV, n); };
  const norm = (s: string) => s.replace(/[ً-ْ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
  const shown = useMemo(() => eps.map((e, i) => ({ e, i })).filter(({ e }) => (!q.trim() || norm(e.full).includes(norm(q.trim()))) && (!onlyFav || fav.includes(e.id))), [eps, q, onlyFav, fav]);
  const done = eps.filter((e) => pos[e.id] === -1).length; const c = cur != null ? eps[cur] : null;
  const resumeAt = (id: string) => { const p = pos[id]; return p && p > 0 ? `${Math.floor(p / 60)}:${String(p % 60).padStart(2, '0')}` : ''; };
  return (
    <div className="series">
      <section className="card">
        {!hasVideo ? (cur == null && <p className="note kid-center">اختر حلقة من القائمة.</p>)
          : !ok ? (!c?.audio && <div className="kid-center"><p>المشغّل من يوتيوب (خدمة خارجية قد تضع ملفات تعريف وتعرض إعلانات). نستخدم وضع الخصوصية المحسّن، ولا يُحمَّل شيء من يوتيوب قبل موافقتك.</p><button type="button" className="btn" onClick={agree}>موافق — شغّل الحلقات هنا</button></div>)
          : <div className="yt-box" ref={box} hidden={!!c?.audio}>{cur == null && <p className="note kid-center">اختر حلقة من القائمة.</p>}</div>}
        {c && <div style={{ marginTop: 10 }}><strong>{c.t}</strong> <span className="note">· {c.d}{c.audio ? ' · صوت' : ' · فيديو'}</span>
          <div className="row">
            {cur != null && cur > 0 && <button type="button" className="btn ghost small" onClick={() => play(cur - 1)}>السابقة</button>}
            {cur != null && cur < eps.length - 1 && <button type="button" className="btn ghost small" onClick={() => play(cur + 1)}>التالية</button>}
            <label className="note"><input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} /> تشغيل التالية تلقائيًا</label></div></div>}
      </section>
      <div className="row" style={{ alignItems: 'center' }}><input type="search" aria-label="ابحث في عناوين الحلقات" placeholder="ابحث في الحلقات" value={q} onChange={(e) => setQ(e.target.value)} style={{ flex: 1, minWidth: 180 }} />
        <button type="button" className={onlyFav ? 'btn small' : 'btn ghost small'} aria-pressed={onlyFav ? 'true' : 'false'} onClick={() => setOnlyFav(!onlyFav)}>المفضلة ({fav.filter((id) => eps.some((e) => e.id === id)).length.toLocaleString('ar-EG')})</button>
        <span className="note">شاهدت {done.toLocaleString('ar-EG')} من {eps.length.toLocaleString('ar-EG')}</span></div>
      <ol className="ep-list">{shown.map(({ e, i }) => (
        <li key={e.id} className={cur === i ? 'on' : ''}>
          <button type="button" className="ep" onClick={() => play(i)} aria-current={cur === i ? 'true' : undefined}>
            <span className="n">{(i + 1).toLocaleString('ar-EG')}</span><span className="t">{e.t}</span>
            <span className="d">{pos[e.id] === -1 ? '✓ ' : ''}{resumeAt(e.id) ? `توقفت عند ${resumeAt(e.id)} · ` : ''}{e.d}</span></button>
          <button type="button" className="fav" aria-pressed={fav.includes(e.id) ? 'true' : 'false'} aria-label={`المفضلة: ${e.t}`} onClick={() => toggleFav(e.id)}>{fav.includes(e.id) ? '★' : '☆'}</button>
        </li>))}</ol>
      {!shown.length && <p className="note">لا نتائج.</p>}
    </div>
  );
}
