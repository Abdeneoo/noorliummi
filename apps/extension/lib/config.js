// Shared settings. BASE is the only server the extension talks to (the public site, launch approved 2026-11-26).
export const BASE = 'https://noorliummi.io';
export const DEFAULTS = {
  cityId: 'riyadh', custom: null, asr: 'shafi', lang: 'ar', theme: 'dark',
  adhanEnabled: true, adhanUrl: `${BASE}/audio/adhan/iw-05b894088d.mp3`, adhanFajrUrl: '', adhanName: '', adhanVolume: 0.8,
  prayersOn: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
  prePrayerEnabled: true, prePrayerMinutes: 10,
  dhikrIntervalMinutes: 60, dhikrChapters: [130, 131, 108],
  wirdGoal: 4, wirdReminderHours: 3,
  fastingReminderEnabled: true, fastReminderAt: '20:00', kahfReminderEnabled: true,
  duhaEnabled: false, duhaAfterSunrise: 20, qiyamEnabled: false, qiyamIgnoresSleep: true,
  sleepModeEnabled: true, sleepStart: '23:00', sleepEnd: '05:00', muteUntil: 0,
  atharUrl: '', atharName: '',
};
export async function getSettings() { const d = await chrome.storage.local.get('settings'); const s = { ...DEFAULTS, ...(d.settings || {}) }; s.prayersOn = { ...DEFAULTS.prayersOn, ...(s.prayersOn || {}) }; return s; }
export async function saveSettings(s) { await chrome.storage.local.set({ settings: s }); }
// Counters and bookkeeping live apart from settings, so a reminder never overwrites a setting the user just changed.
export async function getState() { const d = await chrome.storage.local.get('state'); return d.state || {}; }
export async function setState(patch) { const st = await getState(); await chrome.storage.local.set({ state: { ...st, ...patch } }); }
/** Only Noor Li Ummi pages may be pinned (no other sites, no javascript: links). */
export const safeAthar = (u) => { try { const x = new URL(u); return x.protocol === 'https:' && /(^|\.)noorliummi\.io$/.test(x.hostname) && x.pathname.startsWith('/athar/') ? x.href : ''; } catch { return ''; } };
