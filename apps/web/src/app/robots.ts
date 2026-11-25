import type { MetadataRoute } from 'next';
export const dynamic = 'force-dynamic';
/** Staging (default): nothing is crawled. After launch approval set NOOR_PUBLIC=1 and SITE_URL to the public domain. */
export default function robots(): MetadataRoute.Robots {
  const base = (process.env.SITE_URL || 'https://staging.noorliummi.io').replace(/\/$/, '');
  if (process.env.NOOR_PUBLIC !== '1') return { rules: { userAgent: '*', disallow: '/' } };
  return { rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/athar/', '/account', '/admin'] }, sitemap: `${base}/sitemap.xml` };
}
