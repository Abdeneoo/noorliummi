import { describe, expect, it } from 'vitest';
import { hashToken, isSlug, newSlug, validateAthar, validateReason } from '../src/lib/athar';

const ok = { display_name: 'والدي رحمه الله', dedication: 'إلى أبي', dua_text: 'اللهم اغفر له', items: [{ kind: 'surah', ref: 36 }, { kind: 'dhikr', ref: 1 }] };
describe('athar validation', () => {
  it('accepts a normal page and trims', () => {
    const r = validateAthar({ ...ok, display_name: '  والدي   رحمه الله ' });
    expect(r.ok).toBe(true); if (r.ok) { expect(r.value.display_name).toBe('والدي رحمه الله'); expect(r.value.items).toHaveLength(2); }
  });
  it('requires a name and enforces lengths', () => {
    expect(validateAthar({ ...ok, display_name: ' ' }).ok).toBe(false);
    expect(validateAthar({ ...ok, display_name: 'ا'.repeat(81) }).ok).toBe(false);
    expect(validateAthar({ ...ok, dua_text: 'ا'.repeat(1001) }).ok).toBe(false);
  });
  it.each(['زوروا https://x.y', 'www.example.com', 'تابعوا example.com', 'اتصل 0501234567', 'حسابي @someone', 't.me/abc', 'wa.me/123'])('refuses links/contacts: %s', (t) => {
    expect(validateAthar({ ...ok, dua_text: t }).ok).toBe(false);
  });
  it('rejects bad items and dedupes', () => {
    expect(validateAthar({ ...ok, items: [{ kind: 'surah', ref: 115 }] }).ok).toBe(false);
    expect(validateAthar({ ...ok, items: [{ kind: 'dhikr', ref: 99999 }] }).ok).toBe(false);
    expect(validateAthar({ ...ok, items: [{ kind: 'video', ref: 1 }] }).ok).toBe(false);
    expect(validateAthar({ ...ok, items: Array.from({ length: 11 }, (_, i) => ({ kind: 'surah', ref: i + 1 })) }).ok).toBe(false);
    const r = validateAthar({ ...ok, items: [{ kind: 'surah', ref: 1 }, { kind: 'surah', ref: 1 }] });
    expect(r.ok && r.value.items.length).toBe(1);
  });
  it('strips bidi/control characters', () => {
    const r = validateAthar({ ...ok, display_name: 'أ‮ب\u0000' }); expect(r.ok && r.value.display_name).toBe('أب');
  });
  it('slugs are unguessable-format and tokens hash', () => {
    const s = newSlug(); expect(isSlug(s)).toBe(true); expect(newSlug()).not.toBe(s);
    expect(hashToken('a')).toHaveLength(64);
    expect(validateReason({ reason: '' }).ok).toBe(false);
  });
});

describe('athar reciter item', () => {
  it('accepts one full-mushaf reciter and rejects bad or repeated ones', async () => {
    const { validateAthar } = await import('../src/lib/athar');
    const base = { display_name: 'والدي', dedication: '', dua_text: '' };
    expect(validateAthar({ ...base, items: [{ kind: 'reciter', ref: 0 }] }).ok).toBe(true);
    expect(validateAthar({ ...base, items: [{ kind: 'reciter', ref: 999 }] }).ok).toBe(false);
    expect(validateAthar({ ...base, items: [{ kind: 'reciter', ref: 0 }, { kind: 'reciter', ref: 1 }] }).ok).toBe(false);
  });
});
