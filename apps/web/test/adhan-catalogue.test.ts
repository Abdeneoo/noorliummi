import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const cat = JSON.parse(readFileSync(resolve(__dirname, '../../../database/sources/adhan-collections/catalogue.json'), 'utf8'));
const reg = JSON.parse(readFileSync(resolve(__dirname, '../../../database/sources/adhan/registry.json'), 'utf8')) as { audio_id: string; publish: boolean; local_file_path: string | null; redistribution_allowed: boolean }[];

describe('adhan collections catalogue (rights)', () => {
  it('lists every recording of the pinned collections with metadata only', () => {
    expect(cat.items.length).toBe(238);
    expect(cat.items.filter((x: { collection: string }) => x.collection === 'kiwifu').length).toBe(231);
  });
  it('hosts only what the registry documents, streams the rest from source', () => {
    for (const x of cat.items) expect(['hosted', 'stream', 'pending', 'rejected']).toContain(x.status);
    const hostedIds = new Set(reg.filter((r) => r.publish).map((r) => (r as { catalogue_id?: string }).catalogue_id).filter(Boolean));
    for (const x of cat.items.filter((x: { status: string }) => x.status === 'hosted')) expect(hostedIds.has(x.id), `${x.file} hosted without registry entry`).toBe(true);
    for (const x of cat.items.filter((x: { status: string }) => x.status === 'stream')) expect(x.url).toMatch(/^https:\/\/(raw\.githubusercontent\.com\/Kiwifu\/adhan-mp3\/b9180a2|cdn\.aladhan\.com\/)/);
    const hosted = readdirSync(resolve(__dirname, '../public/audio/adhan'));
    const published = new Set(reg.filter((r) => r.publish).map((r) => r.local_file_path?.split('/').pop()));
    for (const f of hosted) expect(published.has(f), `${f} is hosted but not published in the registry`).toBe(true);
    for (const r of reg.filter((r) => r.publish)) expect(r.redistribution_allowed).toBe(true);
  });
  it('flags duplicates, short files and gives every pending item a reason', () => {
    const dup = cat.items.filter((x: { reasons: string[] }) => x.reasons.includes('duplicate'));
    expect(dup.length).toBe(1);
    for (const x of cat.items) expect(x.reasons.length).toBeGreaterThan(0);
    expect(cat.items.filter((x: { flags: string[] }) => x.flags.includes('possibly_incomplete')).length).toBe(2);
  });
  it('classifies Fajr, Haramain and Egyptian reciters', () => {
    const g = (k: string) => cat.items.filter((x: { groups: string[] }) => x.groups.includes(k)).length;
    expect(g('fajr')).toBeGreaterThanOrEqual(15);
    expect(g('haramain')).toBeGreaterThanOrEqual(12);
    expect(g('egyptian')).toBeGreaterThanOrEqual(15);
  });
});
