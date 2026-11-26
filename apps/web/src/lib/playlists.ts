'use client';
/** Personal playlists, kept on this device (localStorage). Tracks are references to sources the site already plays. */
import type { Track } from './audio-store';
export interface Playlist { id: string; name: string; tracks: Track[]; created: number }
const KEY = 'noor.playlists';
const subs = new Set<() => void>();
let cache: Playlist[] | null = null;
const read = (): Playlist[] => { if (cache) return cache; try { cache = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { cache = []; } return cache!; };
const write = (l: Playlist[]) => { cache = l; try { localStorage.setItem(KEY, JSON.stringify(l)); } catch { /* full or blocked */ } subs.forEach((f) => f()); };
export const plSubscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export const playlists = () => (typeof window === 'undefined' ? [] : read());
export const FAV = 'fav';
const clean = (t: Track): Track => ({ id: t.id, src: t.src, title: t.title, by: t.by, source: t.source, license: t.license, page: t.page });
export function createPlaylist(name: string, tracks: Track[] = []): string {
  const id = `p${Date.now().toString(36)}`; write([...read(), { id, name: name.trim().slice(0, 60) || 'قائمتي', tracks: tracks.map(clean), created: Date.now() }]); return id;
}
export function addTracks(id: string, tracks: Track[]) {
  let l = read();
  if (id === FAV && !l.some((p) => p.id === FAV)) l = [...l, { id: FAV, name: 'المفضلة', tracks: [], created: Date.now() }];
  write(l.map((p) => (p.id === id ? { ...p, tracks: [...p.tracks, ...tracks.filter((t) => !p.tracks.some((x) => x.id === t.id)).map(clean)].slice(0, 500) } : p)));
}
export function removeTrack(id: string, k: number) { write(read().map((p) => (p.id === id ? { ...p, tracks: p.tracks.filter((_, i) => i !== k) } : p))); }
export function moveTrack(id: string, k: number, d: number) {
  write(read().map((p) => { if (p.id !== id) return p; const t = [...p.tracks]; const j = k + d; if (j < 0 || j >= t.length) return p; [t[k], t[j]] = [t[j], t[k]]; return { ...p, tracks: t }; }));
}
export function renamePlaylist(id: string, name: string) { write(read().map((p) => (p.id === id ? { ...p, name: name.trim().slice(0, 60) || p.name } : p))); }
export function deletePlaylist(id: string) { write(read().filter((p) => p.id !== id)); }
export const isFav = (trackId: string) => read().find((p) => p.id === FAV)?.tracks.some((t) => t.id === trackId) ?? false;
