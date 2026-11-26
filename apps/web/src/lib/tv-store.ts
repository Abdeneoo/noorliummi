'use client';
/**
 * TVQuran's official embedded player, kept in one place in the root layout so it survives page navigation.
 * We never extract the MP3 behind it: the iframe is TVQuran's own player, shown with its own controls.
 * Only one sound at a time: opening it pauses the site player, and starting the site player (or the adhan) closes it.
 */
import { toggle } from './audio-store';
export interface TvNow { id: number; title: string; by: string; page?: string }
type S = { now: TvNow | null; small: boolean; consent: boolean };
let st: S = { now: null, small: false, consent: false };
const subs = new Set<() => void>();
const set = (p: Partial<S>) => { st = { ...st, ...p }; subs.forEach((f) => f()); };
export const tvSubscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export const tvState = () => st;
const OK = 'noor.tv.ok';
export function tvInit() { try { set({ consent: localStorage.getItem(OK) === '1' }); } catch { /* ignore */ } if (typeof window !== 'undefined') { addEventListener('noor:adhan', () => tvClose()); addEventListener('noor:audio-play', () => tvClose()); } }
export function tvAgree() { try { localStorage.setItem(OK, '1'); } catch { /* ignore */ } set({ consent: true }); }
export function tvOpen(now: TvNow) { toggle(false); set({ now, small: false }); }
export function tvClose() { if (st.now) set({ now: null }); }
export function tvSmall(v: boolean) { set({ small: v }); }
