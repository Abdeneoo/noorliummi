/**
 * Draws a 1080×1920 story image (WhatsApp / Instagram) in the site's colours: emerald night, gold arch, Uthmani or
 * Naskh text, a caption with the source, and the site address. Runs in the browser only (canvas); nothing is uploaded.
 */
export interface Story { text: string; caption: string; quran?: boolean; /** shown after the site address, e.g. /athar/abc */ path?: string }

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  const lines: string[] = [];
  for (const para of text.split('\n')) {
    let line = '';
    for (const w of para.split(/\s+/).filter(Boolean)) {
      const t = line ? `${line} ${w}` : w;
      if (ctx.measureText(t).width > max && line) { lines.push(line); line = w; } else line = t;
    }
    if (line) lines.push(line);
  }
  return lines;
}

export async function drawStory(s: Story): Promise<Blob> {
  const W = 1080, H = 1920;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d')!;
  const family = s.quran ? "'Amiri Quran', 'Amiri', serif" : "'Amiri', 'IBM Plex Sans Arabic', serif";
  try { await Promise.all([document.fonts.load(`64px ${family}`, s.text), document.fonts.load("40px 'IBM Plex Sans Arabic'", s.caption)]); } catch { /* use fallback fonts */ }
  // Background: night emerald with a soft golden glow.
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#0B1F19'); bg.addColorStop(.55, '#123A2F'); bg.addColorStop(1, '#0B1F19');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 760, 40, W / 2, 760, 760); glow.addColorStop(0, 'rgba(233,199,125,.28)'); glow.addColorStop(1, 'rgba(233,199,125,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  // Gold arch frame.
  ctx.strokeStyle = '#C6A66B'; ctx.lineWidth = 4;
  const arch = (x: number, top: number, w: number, bottom: number) => {
    ctx.beginPath(); ctx.moveTo(x, bottom); ctx.lineTo(x, top + w * .55);
    ctx.bezierCurveTo(x, top + w * .2, x + w * .3, top + w * .05, x + w / 2, top);
    ctx.bezierCurveTo(x + w * .7, top + w * .05, x + w, top + w * .2, x + w, top + w * .55);
    ctx.lineTo(x + w, bottom); ctx.stroke();
  };
  arch(90, 170, W - 180, 1700); ctx.strokeStyle = 'rgba(198,166,107,.4)'; ctx.lineWidth = 2; arch(120, 215, W - 240, 1700);
  ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  // Fit the text: shrink until it fits the arch.
  let size = s.quran ? 66 : 58, lines: string[] = [];
  for (; size >= 30; size -= 4) { ctx.font = `${size}px ${family}`; lines = wrap(ctx, s.text, W - 320); if (lines.length * size * 1.9 < 1050) break; }
  const lh = size * 1.9; let y = 900 - ((lines.length - 1) * lh) / 2;
  ctx.fillStyle = '#FFF4D6';
  for (const l of lines) { ctx.fillText(l, W / 2, y); y += lh; }
  ctx.font = "40px 'IBM Plex Sans Arabic', sans-serif"; ctx.fillStyle = '#E6D3A8';
  wrap(ctx, s.caption, W - 320).slice(0, 2).forEach((l, i) => ctx.fillText(l, W / 2, 1520 + i * 56));
  ctx.font = "34px 'IBM Plex Sans Arabic', sans-serif"; ctx.fillStyle = 'rgba(243,233,210,.75)';
  ctx.fillText(s.path ? `${location.host}${s.path}` : `نور لأمي · ${location.host}`, W / 2, 1800);
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('canvas'))), 'image/png'));
}

/** Opens the share sheet with the image where supported, otherwise downloads it. */
export async function shareStory(s: Story, name = 'noor-li-ummi.png') {
  const blob = await drawStory(s);
  const file = new File([blob], name, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file] }); return; } catch { /* cancelled */ return; } }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
