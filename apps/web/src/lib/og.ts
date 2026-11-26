import 'server-only';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
/**
 * Share image (1200×630 PNG) for an athar page: site identity, «صدقة جارية», the name, and a short line.
 * Drawn as SVG and rendered with resvg, which shapes and orders Arabic correctly (Amiri, OFL). No photos, ever.
 */
const FONT_DIR = join(process.cwd(), 'src/assets/fonts');
const FONT_FILES = ['Amiri-Arabic-400.ttf', 'Amiri-Arabic-700.ttf', 'Amiri-Latin-400.ttf', 'Amiri-Latin-700.ttf'].map((f) => join(FONT_DIR, f));
const esc = (s: string) => s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]!));
const isAr = (s: string) => /[؀-ۿ]/.test(s);
/** Greedy wrap by an estimated width (Amiri averages ~0.5em per Arabic letter, ~0.55em per Latin letter). */
export function wrap(text: string, size: number, maxWidth: number, maxLines: number): string[] {
  const per = size * (isAr(text) ? 0.47 : 0.55); const limit = Math.max(6, Math.floor(maxWidth / per)); const out: string[] = []; let line = '';
  for (const w of text.replace(/\s+/g, ' ').trim().split(' ')) {
    const t = line ? `${line} ${w}` : w;
    if (t.length > limit && line) { out.push(line); line = w; } else line = t;
    if (out.length === maxLines) break;
  }
  if (line && out.length < maxLines) out.push(line);
  if (out.length === maxLines && text.replace(/\s+/g, ' ').trim().length > out.join(' ').length) out[maxLines - 1] = `${out[maxLines - 1].replace(/[\s،,.]+$/, '')}…`;
  return out;
}
export function atharSvg(name: string, line: string): string {
  const n = name.trim().slice(0, 80); const size = n.length <= 14 ? 104 : n.length <= 24 ? 84 : n.length <= 40 ? 66 : 54;
  const nameLines = wrap(n, size, 980, 2); const sub = wrap(line.trim(), 38, 940, nameLines.length > 1 ? 1 : 2);
  // «صدقة جارية» sits at y=205; the name starts below it, and the line follows the name (never reaching the footer rule at 528).
  const nameY = 232 + size * 0.86; const subY = Math.min(nameY + (nameLines.length - 1) * size * 1.12 + 78, sub.length > 1 ? 448 : 500);
  const t = (s: string, y: number, fs: number, fill: string, weight = 400) => `<text x="600" y="${y}" font-family="Amiri" font-size="${fs}" font-weight="${weight}" fill="${fill}" text-anchor="middle" direction="${isAr(s) ? 'rtl' : 'ltr'}" xml:lang="${isAr(s) ? 'ar' : 'en'}">${esc(s)}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#103D32"/><stop offset="1" stop-color="#0B2A22"/></linearGradient>
<radialGradient id="glow" cx="50%" cy="42%" r="55%"><stop offset="0" stop-color="#C6A66B" stop-opacity=".22"/><stop offset="1" stop-color="#C6A66B" stop-opacity="0"/></radialGradient>
<pattern id="p" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M32 4l8 20 20 8-20 8-8 20-8-20-20-8 20-8z" fill="none" stroke="#C6A66B" stroke-opacity=".10" stroke-width="1.2"/></pattern></defs>
<rect width="1200" height="630" fill="url(#bg)"/><rect width="1200" height="630" fill="url(#p)"/><rect width="1200" height="630" fill="url(#glow)"/>
<rect x="28" y="28" width="1144" height="574" rx="26" fill="none" stroke="#C6A66B" stroke-opacity=".55" stroke-width="2"/>
<path d="M560 150V118c0-22 18-38 40-48 22 10 40 26 40 48v32" fill="none" stroke="#C6A66B" stroke-width="3" stroke-linecap="round"/><path d="M600 96c7 9 11 15 11 21a11 11 0 0 1-22 0c0-6 4-12 11-21z" fill="#F6E3B4"/>
${t('صدقة جارية', 205, 36, '#C6A66B')}
${nameLines.map((l, i) => t(l, nameY + i * size * 1.12, size, '#F8F6F0', 700)).join('\n')}
${sub.map((l, i) => t(l, subY + i * 54, 38, '#E6D3A8')).join('\n')}
<line x1="470" y1="528" x2="730" y2="528" stroke="#C6A66B" stroke-opacity=".5" stroke-width="1.5"/>
${t('نور لأمي', 580, 40, '#F8F6F0', 700)}
</svg>`;
}
export function renderPng(svg: string): Buffer {
  return Buffer.from(new Resvg(svg, { font: { fontFiles: FONT_FILES, loadSystemFonts: false, defaultFontFamily: 'Amiri' }, fitTo: { mode: 'width', value: 1200 } }).render().asPng());
}
