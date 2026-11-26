'use client';
/**
 * One audio player for the whole site (Arabic layout). It lives in the root layout, so it keeps playing across page
 * changes; only one recording plays at a time (also across tabs). Positions are kept on this device per track id.
 * Nothing starts by itself after a reload: the last track is restored paused.
 */
export interface Track { id: string; src: string; title: string; by?: string; source?: string; license?: string; page?: string; text?: string }
export interface AudioState { queue: Track[]; i: number; playing: boolean; t: number; d: number; rate: number; repeat: 'off' | 'one' | 'all'; sleepAt: number; open: boolean; expanded: boolean }
const POS = 'noor.audio.pos'; const LAST = 'noor.audio.last';
let st: AudioState = { queue: [], i: 0, playing: false, t: 0, d: 0, rate: 1, repeat: 'off', sleepAt: 0, open: false, expanded: false };
const subs = new Set<() => void>();
let el: HTMLAudioElement | null = null; let bc: BroadcastChannel | null = null; let sleepTimer: ReturnType<typeof setTimeout> | null = null; let lastSave = 0;
const emit = () => subs.forEach((f) => f());
const set = (p: Partial<AudioState>) => { st = { ...st, ...p }; emit(); };
export const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export const getState = () => st;
const read = <T,>(k: string, d: T): T => { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? d; } catch { return d; } };
const write = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };
export const positions = (): Record<string, number> => read(POS, {});
const cur = () => st.queue[st.i];
function savePos(done = false) {
  const tr = cur(); if (!tr || !el) return; const all = positions();
  all[tr.id] = done ? -1 : Math.floor(el.currentTime); write(POS, all);
  write(LAST, { queue: st.queue, i: st.i, rate: st.rate });
}
function media() {
  if (!('mediaSession' in navigator)) return; const tr = cur(); if (!tr) return;
  navigator.mediaSession.metadata = new MediaMetadata({ title: tr.title, artist: tr.by ?? '', album: 'نور لأمي', artwork: [{ src: '/icon-512.png', sizes: '512x512', type: 'image/png' }] });
  const h: [MediaSessionAction, MediaSessionActionHandler][] = [['play', () => toggle(true)], ['pause', () => toggle(false)], ['previoustrack', () => skip(-1)], ['nexttrack', () => skip(1)],
    ['seekbackward', () => seek(-10)], ['seekforward', () => seek(10)], ['seekto', (d) => { if (el && d.seekTime != null) el.currentTime = d.seekTime; }], ['stop', () => close()]];
  for (const [a, f] of h) { try { navigator.mediaSession.setActionHandler(a, f); } catch { /* unsupported */ } }
}
function ensure() {
  if (el || typeof window === 'undefined') return el;
  el = new Audio(); el.preload = 'metadata';
  el.addEventListener('play', () => { set({ playing: true }); bc?.postMessage('playing'); if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing'; });
  el.addEventListener('pause', () => { set({ playing: false }); savePos(); if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused'; });
  el.addEventListener('timeupdate', () => { set({ t: el!.currentTime, d: el!.duration || 0 }); if (Date.now() - lastSave > 5000) { lastSave = Date.now(); savePos(); } });
  el.addEventListener('loadedmetadata', () => set({ d: el!.duration || 0 }));
  el.addEventListener('ended', () => {
    savePos(true);
    if (st.repeat === 'one') { el!.currentTime = 0; void el!.play(); return; }
    if (st.i < st.queue.length - 1) load(st.i + 1, true); else if (st.repeat === 'all' && st.queue.length) load(0, true);
  });
  try { bc = new BroadcastChannel('noor-audio'); bc.onmessage = (e) => { if (e.data === 'playing' && el && !el.paused) el.pause(); }; } catch { /* old browser */ }
  // The adhan has priority: pause while it plays (resumes only if the user presses play).
  window.addEventListener('noor:adhan', () => { if (el && !el.paused) el.pause(); });
  window.addEventListener('pagehide', () => savePos());
  return el;
}
function load(i: number, play: boolean) {
  const a = ensure(); const tr = st.queue[i]; if (!a || !tr) return;
  set({ i, t: 0, d: 0, open: true });
  a.src = tr.src; a.playbackRate = st.rate;
  const p = positions()[tr.id];
  a.onloadedmetadata = () => { if (p && p > 5 && p < a.duration - 5) a.currentTime = p; a.onloadedmetadata = null; };
  media(); write(LAST, { queue: st.queue, i, rate: st.rate });
  if (play) void a.play().catch(() => set({ playing: false }));
}
/** Play a track or a list (starting at `start`). Replaces what is playing. */
export function play(queue: Track | Track[], start = 0) {
  try { dispatchEvent(new Event('noor:audio-play')); } catch { /* ignore */ }
  const q = Array.isArray(queue) ? queue : [queue];
  if (cur() && q[start] && cur()!.id === q[start].id && el?.src) { set({ queue: q, i: start }); toggle(true); return; }
  set({ queue: q }); load(start, true);
}
export function toggle(force?: boolean) { const a = ensure(); if (!a || !cur()) return; const go = force ?? a.paused; if (go) { if (!a.src) load(st.i, true); else void a.play().catch(() => undefined); } else a.pause(); }
export function skip(d: number) { const n = st.i + d; if (n >= 0 && n < st.queue.length) load(n, true); }
export function seek(s: number) { if (el) el.currentTime = Math.max(0, Math.min((el.duration || 0) - 1, el.currentTime + s)); }
export function seekTo(t: number) { if (el) el.currentTime = t; }
export function setRate(r: number) { set({ rate: r }); if (el) el.playbackRate = r; write(LAST, { queue: st.queue, i: st.i, rate: r }); }
export function cycleRepeat() { set({ repeat: st.repeat === 'off' ? 'all' : st.repeat === 'all' ? 'one' : 'off' }); }
export function sleepIn(min: number) { if (sleepTimer) clearTimeout(sleepTimer); if (!min) { set({ sleepAt: 0 }); return; } set({ sleepAt: Date.now() + min * 60000 }); sleepTimer = setTimeout(() => { el?.pause(); set({ sleepAt: 0 }); }, min * 60000); }
export function close() { el?.pause(); savePos(); try { localStorage.removeItem(LAST); } catch { /* ignore */ } set({ open: false, expanded: false, queue: [], i: 0 }); }
export function expand(v: boolean) { set({ expanded: v }); }
/** Restore the last list paused (no autoplay) once the dock mounts. */
export function restore() { const l = read<{ queue: Track[]; i: number; rate: number } | null>(LAST, null); if (l?.queue?.length && !st.queue.length) set({ queue: l.queue, i: Math.min(l.i, l.queue.length - 1), rate: l.rate || 1, open: false }); }
export const hasLast = () => !!read<{ queue: Track[] } | null>(LAST, null)?.queue?.length;
