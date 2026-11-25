import { describe, expect, it } from 'vitest';
import { sectionOf } from '../src/lib/stats';
describe('usage sections', () => {
  it('keeps only the section name', () => {
    expect(sectionOf('/')).toBe('home'); expect(sectionOf('/en')).toBe('home-en'); expect(sectionOf('/quran/2')).toBe('quran'); expect(sectionOf('/en/adhkar/27')).toBe('adhkar-en');
    expect(sectionOf('/athar/abcdefgh2345')).toBe('athar'); expect(sectionOf('/whatever/x')).toBe('other'); expect(sectionOf('/admin')).toBeNull(); expect(sectionOf('https://x')).toBeNull();
  });
});
