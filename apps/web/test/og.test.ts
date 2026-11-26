import { describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { atharSvg, renderPng, wrap } from '../src/lib/og';
import { ogLine, ogVersion } from '../src/lib/og-meta';
describe('athar share image', () => {
  it('renders a 1200×630 PNG and escapes text', () => {
    const svg = atharSvg('أمي <الغالية> & "فاطمة"', 'اللهم اغفر لها'); expect(svg).toContain('&lt;الغالية&gt; &amp; &quot;فاطمة&quot;'); expect(svg).toContain('direction="rtl"');
    const png = renderPng(svg); expect(png.subarray(1, 4).toString()).toBe('PNG'); expect(png.readUInt32BE(16)).toBe(1200); expect(png.readUInt32BE(20)).toBe(630);
  });
  it('wraps long names and marks truncation', () => { const l = wrap('كلمة '.repeat(60), 54, 980, 2); expect(l).toHaveLength(2); expect(l[1].endsWith('…')).toBe(true); expect(wrap('Yusuf', 100, 980, 2)).toEqual(['Yusuf']); });
  it('version follows the name and the line', () => { expect(ogVersion('أ', 'ب')).not.toBe(ogVersion('أ', 'ج')); expect(ogVersion('أ', '')).toBe(ogVersion('أ', '')); expect(ogLine('')).toBe('نسألكم الدعاء'); expect(ogLine('سطر أول\nثان')).toBe('سطر أول'); });
});
