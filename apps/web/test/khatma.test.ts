import { describe, expect, it } from 'vitest';
import { cleanReader, validateKhatma } from '../src/lib/khatma-rules';
import { fridayIcs } from '../src/lib/ics';
import juz from '../src/generated/juz.json';

describe('group khatma', () => {
  it('validates the dedication name', () => {
    expect(validateKhatma({ display_name: '  أمي   الغالية ' })).toEqual({ ok: true, v: { display_name: 'أمي الغالية', feminine: false, athar_slug: null, kind: 'quran', phrase: 0, target: 0 } });
    expect(validateKhatma({ display_name: '' }).ok).toBe(false);
    expect(validateKhatma({ display_name: 'زوروا www.example.com' }).ok).toBe(false);
    const r = validateKhatma({ display_name: 'أمي', feminine: true, athar_slug: 'abcdefgh2345' }); expect(r.ok && r.v.feminine && r.v.athar_slug).toBe('abcdefgh2345');
    const bad = validateKhatma({ display_name: 'أمي', athar_slug: '../x' }); expect(bad.ok && bad.v.athar_slug).toBe(null);
  });
  it('validates dhikr pages', () => { const r = validateKhatma({ display_name: 'أبي', kind: 'dhikr', phrase: 4, target: 1000 }); expect(r.ok && [r.v.kind, r.v.phrase, r.v.target]).toEqual(['dhikr', 4, 1000]); const x = validateKhatma({ display_name: 'أبي', kind: 'dhikr', phrase: 99, target: 7 }); expect(x.ok && [x.v.phrase, x.v.target]).toEqual([0, 0]); });
  it('cleans reader names', () => { expect(cleanReader(' أبو  أحمد ')).toBe('أبو أحمد'); expect(cleanReader('0501234567890')).toBe(''); expect(cleanReader('x'.repeat(60))).toHaveLength(40); });
  it('has the 30 juz starts from Tanzil', () => { expect(juz).toHaveLength(30); expect(juz[0]).toEqual([1, 1]); expect(juz[1]).toEqual([2, 142]); expect(juz[29]).toEqual([78, 1]); });
});
describe('friday reminder', () => {
  it('is a weekly Friday event with the link', () => {
    const s = fridayIcs({ title: 'سورة الكهف, والدعاء', url: 'https://x.test/athar/a', hour: 9, description: 'd' });
    expect(s).toContain('RRULE:FREQ=WEEKLY;BYDAY=FR'); expect(s).toContain('SUMMARY:سورة الكهف\\, والدعاء'); expect(s).toContain('URL:https://x.test/athar/a');
    const day = s.match(/DTSTART:(\d{8})T090000/)![1]; expect(new Date(`${day.slice(0, 4)}-${day.slice(4, 6)}-${day.slice(6)}T12:00:00`).getDay()).toBe(5);
  });
});
