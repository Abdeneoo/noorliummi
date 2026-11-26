'use client';
import type { Track } from '@/lib/audio-store';
import { play } from '@/lib/audio-store';
/** A button that plays a track (or a list) in the site-wide player. */
export default function PlayTrack({ tracks, start = 0, label, className = 'btn ghost small', lang = 'ar' }: { tracks: Track[]; start?: number; label?: string; className?: string; lang?: 'ar' | 'en' }) {
  return <button type="button" className={className} onClick={() => play(tracks, start)}>{label ?? (lang === 'en' ? '▶ Listen' : '▶ استمع')}</button>;
}
