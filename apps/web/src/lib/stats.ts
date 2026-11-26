/** Maps a path to a site section for the usage counts. Only the section name is ever stored. */
const SECTIONS = ['quran', 'tafsir', 'hadith', 'adhkar', 'prayer', 'times', 'adhan', 'mosques', 'names', 'mutashabihat', 'hifz', 'tasbeeh', 'wird', 'khatma', 'athar', 'duas', 'topics',
  'sakina', 'listen', 'calendar', 'situations', 'knowledge', 'tools', 'sadaqah', 'dedication', 'sources', 'verify', 'privacy', 'account', 'embed', 'search', 'zakat', 'hajj', 'report', 'library', 'prophets', 'circle', 'inheritance', 'display', 'transparency', 'developers', 'live', 'talqeen', 'lessons', 'family', 'kids', 'hadeeth', 'books', 'series'];
export function sectionOf(path: string): string | null {
  if (typeof path !== 'string' || !path.startsWith('/') || path.length > 200) return null;
  const parts = path.split('/').filter(Boolean); if (['ur', 'tr', 'id'].includes(parts[0])) return `quran-${parts[0]}`;
  const en = parts[0] === 'en'; const first = en ? parts[1] : parts[0];
  if (!first) return en ? 'home-en' : 'home';
  if (first === 'admin' || first === 'api' || first === 'offline') return null;
  return SECTIONS.includes(first) ? (en ? `${first}-en` : first) : 'other';
}
