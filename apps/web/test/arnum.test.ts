import { describe, it, expect } from 'vitest';
import { ayat, arCount, DHIKR, BOOK } from '@/lib/arnum';
describe('arabic counting', () => {
  it('follows number–noun agreement', () => {
    expect(ayat(1)).toBe('آية واحدة'); expect(ayat(2)).toBe('آيتان'); expect(ayat(7)).toBe('٧ آيات');
    expect(ayat(11)).toBe('١١ آيةً'); expect(ayat(286)).toBe('٢٨٦ آيةً'); expect(ayat(100)).toBe('١٠٠ آية'); expect(ayat(103)).toBe('١٠٣ آيات');
    expect(arCount(1, DHIKR)).toBe('ذكر واحد'); expect(arCount(2, DHIKR)).toBe('ذكران'); expect(arCount(12, BOOK)).toBe('١٢ كتابًا');
  });
});
