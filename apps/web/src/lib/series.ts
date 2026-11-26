import data from '@/data/video-series.json';
/**
 * Video series by Ahmed Amer, played with YouTube's own embedded player (youtube-nocookie) after the visitor agrees.
 * Where the lecturer's audio podcast (published under his name on Spotify/Spreaker) has the same episode, it is played as audio
 * from the podcast's own servers instead (owner's choice, 2026-11-26). Nothing is downloaded or re-hosted. Episode lists were taken from the channel's own playlists, ordered by lesson number,
 * and each episode's embedding permission was checked through YouTube's oEmbed endpoint on the date in `checked`.
 */
export interface Ep { id: string; t: string; d: string; embed: boolean; audio?: { u: string; s: number; t: string } }
export interface Series { slug: string; title: string; about: string; playlist: string; eps: Ep[] }
export const SERIES = data.series as Series[];
export const AUDIO = data.audio as { name: string; feed: string; spotify: string; checked: string };
export const LECTURER = data.lecturer; export const CHANNEL = data.channel; export const CHECKED = data.checked;
export const seriesBy = (slug: string) => SERIES.find((s) => s.slug === slug) ?? null;
/** Strips the repeated series name and lecturer from a title for the list ("… - الدرس الأول - العالم قبل الإسلام"). */
export const shortTitle = (t: string) => t.replace(/\s*-\s*(أحمد|احمد) عامر\s*$/, '').replace(/^سلسلة السيرة النبوية\s*-\s*/, '').replace(/^أصحاب رسول الله\s*-\s*/, '').replace(/^(قصص القرآن|قصص السنة|مجالس القرآن)\s*-\s*/, '').trim();
export const seconds = (d: string) => d.split(':').reduce((a, x) => a * 60 + Number(x), 0);
