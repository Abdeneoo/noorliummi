import { describe, expect, it } from 'vitest';
import { buildPersons, fileUrl, hasSurah, personKey } from '../src/lib/reciter-list';
describe('reciter list', () => {
  it('merges a reciter across sources and keeps every version', () => {
    const ps = buildPersons([{ id: 5, name: 'عبدالباسط عبدالصمد', en: 'Abdulbasit Abdulsamad', versions: [{ id: 'mq:5:1', name: 'حفص عن عاصم - مرتل', en: 'Hafs - Murattal', hafs: true, server: 'https://cdn.mp3quran.net/x/' }, { id: 'mq:5:2', name: 'ورش عن نافع - مرتل', en: 'Warsh', hafs: false, server: 'https://cdn.mp3quran.net/w/', list: '1,2,112' }] }]);
    const p = ps.find((x) => x.key === personKey('عبد الباسط عبد الصمد'))!; expect(p.versions.length).toBe(5); // 3 built in (murattal, mujawwad, ayah) + 2 fetched
    expect(ps.filter((x) => x.name.includes('الباسط')).length).toBe(1);
    const warsh = p.versions.find((v) => v.id === 'mq:5:2')!; expect(hasSurah(warsh, 112)).toBe(true); expect(hasSurah(warsh, 3)).toBe(false); expect(fileUrl(warsh, 2)).toBe('https://cdn.mp3quran.net/w/002.mp3');
    expect(ps.some((x) => x.name === 'محمود خليل الحصري')).toBe(true);
  });
});
