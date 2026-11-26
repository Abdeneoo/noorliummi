'use client';
import type { Track } from '@/lib/audio-store';
import { play } from '@/lib/audio-store';
/** A button that plays a track (or a list) in the site-wide player. */
export default function PlayTrack({ tracks, start = 0, label = '▶ استمع', className = 'btn ghost small' }: { tracks: Track[]; start?: number; label?: string; className?: string }) {
  return <button type="button" className={className} onClick={() => play(tracks, start)}>{label}</button>;
}
