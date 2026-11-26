import 'server-only';
/**
 * The Quran recitation checker runs on this same server as a separate, resource-capped service (whisper.cpp + Tarteel's model),
 * listening on 127.0.0.1 only. One clip is processed at a time; a short queue, then "busy". Audio is passed through, never stored.
 */
const URL_ = process.env.TARTEEL_URL || 'http://127.0.0.1:3050';
let running = 0; const MAX_WAIT = 3;
export async function tarteelUp(): Promise<boolean> { try { const r = await fetch(`${URL_}/`, { signal: AbortSignal.timeout(1500), cache: 'no-store' }); return r.status < 500; } catch { return false; } }
export async function transcribe(wav: ArrayBuffer): Promise<{ text: string } | { error: 'busy' | 'down' }> {
  if (running > MAX_WAIT) return { error: 'busy' };
  running++;
  try {
    const fd = new FormData(); fd.append('file', new Blob([wav], { type: 'audio/wav' }), 'a.wav'); fd.append('response_format', 'json'); fd.append('temperature', '0'); fd.append('language', 'ar');
    const r = await fetch(`${URL_}/inference`, { method: 'POST', body: fd, signal: AbortSignal.timeout(90_000), cache: 'no-store' });
    if (!r.ok) return { error: 'down' };
    const j = (await r.json()) as { text?: string }; return { text: String(j.text ?? '').trim().slice(0, 4000) };
  } catch { return { error: 'down' }; } finally { running--; }
}
