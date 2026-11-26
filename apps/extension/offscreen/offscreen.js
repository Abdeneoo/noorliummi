// Offscreen document: plays the adhan streamed from the Noor Li Ummi site (recordings it hosts with a documented licence).
// If the device is offline, a short gentle tone is played instead.
function chime() {
  try {
    const ctx = new AudioContext();
    [523.25, 659.25, 783.99].forEach((f, i) => { const o = ctx.createOscillator(); const g = ctx.createGain(); o.frequency.value = f; const t = ctx.currentTime + i * 0.25; g.gain.setValueAtTime(0.001, t); g.gain.exponentialRampToValueAtTime(0.15, t + 0.05); g.gain.exponentialRampToValueAtTime(0.001, t + 0.6); o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.65); });
  } catch { /* ignore */ }
}
chrome.runtime.onMessage.addListener((msg) => {
  const a = document.getElementById('adhanAudio');
  if (msg?.type === 'STOP_ADHAN_NOW') { a.pause(); a.currentTime = 0; return; }
  if (msg?.type !== 'PLAY_ADHAN') return;
  a.volume = Math.min(1, Math.max(0, Number(msg.volume ?? 0.8)));
  a.src = msg.src; a.play().catch(chime);
  a.onerror = chime;
});
