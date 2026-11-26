import type { MetadataRoute } from 'next';
export const dynamic = 'force-dynamic';
/** Staging (default): nothing is crawled. After launch approval set NOOR_PUBLIC=1 and SITE_URL to the public domain. */
export default function robots(): MetadataRoute.Robots {
  const base = (process.env.SITE_URL || 'https://staging.noorliummi.io').replace(/\/$/, '');
  if (process.env.NOOR_PUBLIC !== '1') return { rules: { userAgent: '*', disallow: '/' } };
  // Link-preview bots (Messenger, WhatsApp, Telegram, X…) may read shared pages, including athar pages (those stay noindex for search engines).
  const previews = ['facebookexternalhit', 'Facebot', 'meta-externalagent', 'WhatsApp', 'TelegramBot', 'Twitterbot', 'Slackbot', 'Discordbot', 'LinkedInBot', 'SkypeUriPreview', 'Pinterestbot'];
  return { rules: [{ userAgent: previews, allow: '/', disallow: ['/api/admin/', '/account', '/admin'] }, { userAgent: '*', allow: '/', disallow: ['/api/', '/athar/', '/account', '/admin'] }], sitemap: `${base}/sitemap.xml` };
}
