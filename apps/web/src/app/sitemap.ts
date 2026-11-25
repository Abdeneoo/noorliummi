import type { MetadataRoute } from 'next';
import surahs from '@/generated/surahs.json';
import { ADHKAR } from '@/lib/adhkar';
export const dynamic = 'force-dynamic';
/** Empty on staging; the full list only when NOOR_PUBLIC=1 (after launch approval). */
export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.NOOR_PUBLIC !== '1') return [];
  const base = (process.env.SITE_URL || 'https://staging.noorliummi.io').replace(/\/$/, '');
  const paths = ['/', '/quran', '/prayer', '/adhkar', '/knowledge', '/tafsir', '/hadith', '/names', '/mutashabihat', '/hifz', '/tasbeeh', '/tools', '/sadaqah', '/sources', '/dedication',
    '/en', '/en/quran', '/en/prayer', '/en/adhkar', '/en/knowledge', '/en/names', '/en/sources',
    ...(surahs as { index: number }[]).flatMap((s) => [`/quran/${s.index}`, `/tafsir/${s.index}`, `/en/quran/${s.index}`]),
    ...ADHKAR.map((c) => `/adhkar/${c.id}`)];
  return paths.map((p) => ({ url: `${base}${p}` }));
}
