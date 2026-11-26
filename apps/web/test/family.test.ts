import { describe, expect, it } from 'vitest';
import { allows, cleanAllowed, kidGate, periodKey, timeUp, validPin, weekKey } from '../src/lib/family-rules';
describe('family content rules', () => {
  it('drops anything the parent could not have chosen', () => {
    const a = cleanAllowed({ sections: ['quran', 'admin', 'adhkar', 'quran'], surahs: [1, 114, 115, 0, 'x', 1], adhkar: [27, -1], lessons: [5, 5], extra: true });
    expect(a).toEqual({ sections: ['quran', 'adhkar'], surahs: [1, 114], adhkar: [27], lessons: [5] });
    expect(cleanAllowed(null)).toEqual({ sections: [], surahs: [], adhkar: [], lessons: [] });
  });
  it('allows only listed sections and items', () => {
    const a = cleanAllowed({ sections: ['quran', 'tasbeeh'], surahs: [112, 113] });
    expect(allows(a, 'quran', 112)).toBe(true); expect(allows(a, 'quran', 2)).toBe(false);
    expect(allows(a, 'adhkar', 1)).toBe(false); expect(allows(a, 'lessons')).toBe(false); expect(allows(a, 'tasbeeh')).toBe(true);
    expect(allows(cleanAllowed({ surahs: [1] }), 'quran', 1)).toBe(false); // section itself not enabled
  });
  it('keeps a child session inside the child area', () => {
    for (const p of ['/kids', '/kids/surah/1', '/api/kids/me']) expect(kidGate(p)).toBe('ok');
    for (const p of ['/', '/quran/2', '/lessons/5', '/admin', '/account', '/family', '/kidsx']) expect(kidGate(p)).toBe('redirect');
    for (const p of ['/api/family', '/api/account', '/api/v1/surah', '/api/admin/users', '/api/kidsx']) expect(kidGate(p)).toBe('deny');
  });
  it('period keys, pin and time limit', () => {
    expect(periodKey('daily', new Date('2026-11-26T10:00:00Z'))).toBe('2026-11-26');
    expect(weekKey(new Date('2026-11-26T10:00:00Z'))).toBe('2026-W48'); expect(weekKey(new Date('2027-01-01T00:00:00Z'))).toBe('2026-W53');
    expect(validPin('1234')).toBe(true); expect(validPin('123')).toBe(false); expect(validPin('12a4')).toBe(false); expect(validPin(1234)).toBe(false);
    expect(timeUp(null, 999)).toBe(false); expect(timeUp(30, 29)).toBe(false); expect(timeUp(30, 30)).toBe(true);
  });
});
