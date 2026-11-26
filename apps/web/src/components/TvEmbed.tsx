'use client';
import { tvOpen } from '@/lib/tv-store';
/** Opens a TVQuran recording in the persistent official player (TvDock). */
export default function TvEmbed({ id, title, by = '', label, lang = 'ar' }: { id: number; title: string; by?: string; label?: string; lang?: 'ar' | 'en' }) {
  return <button type="button" className="btn ghost small" onClick={() => tvOpen({ id, title, by })}>{label ?? (lang === 'en' ? '▶ Listen' : '▶ استمع')}</button>;
}
