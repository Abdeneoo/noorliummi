/**
 * Sunnah.com API adapter — INACTIVE until SUNNAH_API_KEY is set in the server's secrets file
 * (/opt/noorliummi/secrets/app.env, loaded by systemd). The key is never sent to the browser and never committed.
 * Before importing anything: check coverage with collections() (the API exposes only part of its data),
 * and record each collection's licence/attribution terms in docs/DATA_SOURCES.md.
 */
const BASE = 'https://api.sunnah.com/v1';
export const sunnahEnabled = (env: NodeJS.ProcessEnv = process.env) => !!env.SUNNAH_API_KEY?.trim();

async function call<T>(path: string, env: NodeJS.ProcessEnv = process.env): Promise<T> {
  if (!sunnahEnabled(env)) throw new Error('Sunnah.com adapter is disabled (no SUNNAH_API_KEY)');
  const r = await fetch(`${BASE}${path}`, { headers: { 'X-API-Key': env.SUNNAH_API_KEY!.trim(), accept: 'application/json' }, cache: 'no-store' });
  if (r.status === 429) throw new Error('Sunnah.com rate limit reached');
  if (!r.ok) throw new Error(`Sunnah.com ${r.status} for ${path}`);
  return (await r.json()) as T;
}
export interface SunnahCollection { name: string; hasBooks: boolean; totalHadith: number; totalAvailableHadith: number; collection: { lang: string; title: string }[] }
export const collections = (env?: NodeJS.ProcessEnv) => call<{ data: SunnahCollection[] }>('/collections?limit=100', env);
export const books = (c: string, env?: NodeJS.ProcessEnv) => call<{ data: unknown[] }>(`/collections/${encodeURIComponent(c)}/books?limit=500`, env);
export const hadiths = (c: string, book: string, page = 1, env?: NodeJS.ProcessEnv) =>
  call<{ data: unknown[]; next: number | null }>(`/collections/${encodeURIComponent(c)}/books/${encodeURIComponent(book)}/hadiths?limit=50&page=${page}`, env);
