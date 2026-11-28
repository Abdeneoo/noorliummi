import type { Metadata } from 'next';
/** Full Open Graph block for a page (Next replaces the layout's openGraph rather than merging it), with og:url. */
export function og(path: string, lang: 'ar' | 'en' = 'ar', title?: string, description?: string): Metadata['openGraph'] {
  const ar = lang === 'ar';
  return {
    type: 'website', url: path, locale: ar ? 'ar_AR' : 'en_US', siteName: ar ? 'نور لأمي | Noor Li Ummi' : 'Noor Li Ummi | نور لأمي',
    ...(title ? { title } : {}), ...(description ? { description } : {}),
    images: [{ url: '/brand/og-cover.jpg', type: 'image/jpeg', width: 1200, height: 630, alt: ar ? 'شعار نور لأمي' : 'Noor Li Ummi logo' }],
  };
}
