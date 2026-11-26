/** Browser-side: turns a recorded clip (any format the browser records) into 16 kHz mono 16-bit WAV, the input Whisper expects. */
export class SilentError extends Error {}
export async function toWav16k(blob: Blob): Promise<Blob> {
  const buf = await blob.arrayBuffer();
  const Ctx = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
  const ctx = new Ctx(); const src = await ctx.decodeAudioData(buf.slice(0)); ctx.close().catch(() => {});
  const len = Math.max(1, Math.ceil(src.duration * 16000)); const off = new OfflineAudioContext(1, len, 16000);
  const node = off.createBufferSource(); node.buffer = src; node.connect(off.destination); node.start(); const out = (await off.startRendering()).getChannelData(0);
  // Speech models invent words on silence, so a near-silent clip is refused here instead of being sent.
  let sum = 0; for (let i = 0; i < out.length; i++) sum += out[i] * out[i]; if (out.length < 8000 || Math.sqrt(sum / out.length) < 0.004) throw new SilentError('silent');
  const data = new DataView(new ArrayBuffer(44 + out.length * 2)); const s = (o: number, t: string) => { for (let i = 0; i < t.length; i++) data.setUint8(o + i, t.charCodeAt(i)); };
  s(0, 'RIFF'); data.setUint32(4, 36 + out.length * 2, true); s(8, 'WAVE'); s(12, 'fmt '); data.setUint32(16, 16, true); data.setUint16(20, 1, true); data.setUint16(22, 1, true);
  data.setUint32(24, 16000, true); data.setUint32(28, 32000, true); data.setUint16(32, 2, true); data.setUint16(34, 16, true); s(36, 'data'); data.setUint32(40, out.length * 2, true);
  for (let i = 0; i < out.length; i++) { const v = Math.max(-1, Math.min(1, out[i])); data.setInt16(44 + i * 2, v < 0 ? v * 0x8000 : v * 0x7fff, true); }
  return new Blob([data.buffer], { type: 'audio/wav' });
}
