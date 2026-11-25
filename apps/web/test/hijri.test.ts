import { describe, expect, it } from 'vitest';
import { daysUntil, hijri, upcoming } from '../src/lib/hijri';
describe('hijri occasions', () => {
  it('finds Ramadan 1448 and the two Eids after 25 Nov 2026', () => {
    const l = upcoming(new Date('2026-11-25T12:00:00')); const t = (s: string) => l.find((o) => o.title === s)!;
    expect(hijri(t('أول رمضان').date)).toMatchObject({ m: 9, d: 1, y: 1448 }); expect(t('أول رمضان').date.getFullYear()).toBe(2027); expect(t('أول رمضان').date.getMonth()).toBe(1);
    expect(daysUntil(t('أول رمضان').date, t('عيد الفطر').date)).toBeGreaterThanOrEqual(29);
    expect(hijri(t('يوم عرفة').date)).toMatchObject({ m: 12, d: 9 });
    expect(l.filter((o) => o.title.startsWith('الأيام البيض')).length).toBeGreaterThanOrEqual(9);
  });
});
