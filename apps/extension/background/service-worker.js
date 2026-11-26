// نور لأمي — ذكّرني: background scheduler (Manifest V3).
// Everything runs on the device. The only network requests go to the Noor Li Ummi site (BASE): the adhan recording to play,
// and nothing else from here. No analytics, no identifiers, nothing is sent about the user.
import { NAMES, PRAYERS, placeOf, timesFor, fastReason } from '../lib/engine.js';
import { ADHKAR } from '../lib/adhkar.js';
import { BASE, DEFAULTS, getSettings, getState, setState } from '../lib/config.js';

const minutes = (hhmm) => { const [h, m] = String(hhmm).split(':').map(Number); return h * 60 + m; };
function quiet(s, now = new Date()) {
  if (s.muteUntil && Date.now() < s.muteUntil) return true;
  if (!s.sleepModeEnabled) return false;
  const a = minutes(s.sleepStart), b = minutes(s.sleepEnd), m = now.getHours() * 60 + now.getMinutes();
  return a <= b ? m >= a && m < b : m >= a || m < b;
}
const notify = (id, title, message, url) => chrome.notifications.create(id, { type: 'basic', iconUrl: chrome.runtime.getURL('icons/icon128.png'), title, message, priority: 2 }, () => { if (url) setState({ [`url:${id}`]: url }); });
chrome.notifications.onClicked.addListener(async (id) => { const st = await getState(); const url = st[`url:${id}`]; if (url) chrome.tabs.create({ url }); chrome.notifications.clear(id); });

async function playAdhan(prayer) {
  const s = await getSettings();
  try {
    if (!(await chrome.offscreen.hasDocument())) await chrome.offscreen.createDocument({ url: 'offscreen/offscreen.html', reasons: ['AUDIO_PLAYBACK'], justification: 'Play the adhan at prayer time.' });
    const src = prayer === 'fajr' && s.adhanFajrUrl ? s.adhanFajrUrl : s.adhanUrl;
    chrome.runtime.sendMessage({ type: 'PLAY_ADHAN', src, volume: s.adhanVolume });
  } catch { /* offscreen unavailable */ }
}

/** Exact-time alarms for today's (and, after Isha, tomorrow's) prayers: adhan + an alert N minutes before. Rebuilt daily and on any change. */
async function schedule() {
  const s = await getSettings();
  for (const a of await chrome.alarms.getAll()) if (a.name !== 'daily') await chrome.alarms.clear(a.name);
  const now = Date.now();
  for (const off of [0, 1]) {
    const t = timesFor(s, new Date(), off);
    for (const p of PRAYERS) {
      if (!s.prayersOn[p]) continue;
      if (t[p] > now) chrome.alarms.create(`adhan:${p}:${t[p]}`, { when: t[p] });
      const pre = t[p] - s.prePrayerMinutes * 60000;
      if (s.prePrayerEnabled && pre > now) chrome.alarms.create(`pre:${p}:${pre}`, { when: pre });
    }
    // Duha: the chosen number of minutes after sunrise. Qiyam: the start of the last third of the night (from the prayer engine).
    const duha = t.sunrise + s.duhaAfterSunrise * 60000; if (s.duhaEnabled && duha > now) chrome.alarms.create(`duha:x:${duha}`, { when: duha });
    if (s.qiyamEnabled && t.lastThird > now) chrome.alarms.create(`qiyam:x:${t.lastThird}`, { when: t.lastThird });
  }
  if (s.dhikrIntervalMinutes > 0) chrome.alarms.create('dhikr', { periodInMinutes: s.dhikrIntervalMinutes });
  if (s.wirdReminderHours > 0) chrome.alarms.create('wird', { periodInMinutes: s.wirdReminderHours * 60 });
  // Voluntary-fast reminder the evening before, at the chosen time.
  const [h, m] = s.fastReminderAt.split(':').map(Number); const at = new Date(); at.setHours(h, m, 0, 0); if (at.getTime() <= now) at.setDate(at.getDate() + 1);
  if (s.fastingReminderEnabled) chrome.alarms.create('fast', { when: at.getTime() });
  // Friday: Surat al-Kahf reminder at 10:00 local time.
  if (s.kahfReminderEnabled) { const f = new Date(); f.setHours(10, 0, 0, 0); f.setDate(f.getDate() + ((5 - f.getDay() + 7) % 7)); if (f.getTime() <= now) f.setDate(f.getDate() + 7); chrome.alarms.create('kahf', { when: f.getTime() }); }
}
chrome.alarms.create('daily', { periodInMinutes: 360 });

chrome.runtime.onInstalled.addListener(async () => { const cur = await chrome.storage.local.get('settings'); if (!cur.settings) await chrome.storage.local.set({ settings: DEFAULTS }); await schedule(); });
chrome.runtime.onStartup.addListener(schedule);
chrome.storage.onChanged.addListener((ch, area) => { if (area === 'local' && ch.settings) schedule(); });
chrome.runtime.onMessage.addListener((msg, _s, reply) => {
  if (msg?.type === 'TEST_ADHAN') { playAdhan(msg.prayer || 'dhuhr').then(() => reply({ ok: true })); return true; }
  if (msg?.type === 'STOP_ADHAN') { chrome.runtime.sendMessage({ type: 'STOP_ADHAN_NOW' }); reply({ ok: true }); }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  const s = await getSettings(); const now = new Date(); const lang = s.lang === 'en' ? 'en' : 'ar';
  const city = placeOf(s); const cityName = lang === 'en' ? city.en : city.ar;
  const [kind, p] = alarm.name.split(':');
  if (kind === 'daily') return schedule();
  if (kind === 'adhan') {
    if (Date.now() - alarm.scheduledTime > 10 * 60000) return; // the computer was asleep: do not ring late
    if (!quiet(s, now)) {
      notify(`adhan-${p}-${alarm.scheduledTime}`, lang === 'en' ? `Time for ${NAMES[p].en}` : `حان وقت صلاة ${NAMES[p].ar}`, lang === 'en' ? `${NAMES[p].en} in ${cityName}` : `دخل وقت ${NAMES[p].ar} في ${cityName}`, `${BASE}/prayer`);
      if (s.adhanEnabled) await playAdhan(p);
    }
    if (p === 'isha') schedule();
    return;
  }
  if (kind === 'pre') { if (!quiet(s, now)) notify(`pre-${p}-${alarm.scheduledTime}`, lang === 'en' ? 'Prayer soon' : 'تذكير بالصلاة', lang === 'en' ? `${s.prePrayerMinutes} min to ${NAMES[p].en}` : `بقي ${s.prePrayerMinutes} دقيقة على صلاة ${NAMES[p].ar}`); return; }
  if (kind === 'duha') { if (!quiet(s, now)) notify(`duha-${alarm.scheduledTime}`, lang === 'en' ? 'Duha prayer' : 'صلاة الضحى', lang === 'en' ? 'Its time has begun.' : 'دخل وقتها.', `${BASE}/prayer`); return; }
  if (kind === 'qiyam') { const blocked = s.qiyamIgnoresSleep ? s.muteUntil && Date.now() < s.muteUntil : quiet(s, now); if (!blocked) notify(`qiyam-${alarm.scheduledTime}`, lang === 'en' ? 'Last third of the night' : 'الثلث الأخير من الليل', lang === 'en' ? 'A time for night prayer and dua.' : 'وقت قيام الليل والدعاء.', `${BASE}/prayer`); return; }
  if (kind === 'dhikr') {
    if (quiet(s, now)) return;
    const pool = ADHKAR.filter((x) => s.dhikrChapters.includes(x.ch)); if (!pool.length) return;
    const st = await getState(); const i = ((st.dhikrIdx ?? -1) + 1) % pool.length; await setState({ dhikrIdx: i }); const x = pool[i];
    notify(`dhikr-${Date.now()}`, lang === 'en' ? 'Remembrance' : 'ذكّرني', x.t.length > 220 ? `${x.t.slice(0, 220)}… (${x.r})` : `${x.t} (${x.r})`, `${BASE}/adhkar/${x.ch}`);
    return;
  }
  if (kind === 'wird') {
    const st = await getState(); const today = now.toISOString().slice(0, 10); const done = st.wirdDate === today ? st.wirdDone ?? 0 : 0;
    if (done < s.wirdGoal && !quiet(s, now) && now.getHours() >= 8) notify(`wird-${Date.now()}`, lang === 'en' ? 'Daily wird' : 'وردك اليومي', lang === 'en' ? `${done} of ${s.wirdGoal} pages today. Continue?` : `قرأت ${done} من ${s.wirdGoal} صفحات اليوم. نكمل؟`, `${BASE}/wird`);
    return;
  }
  if (kind === 'fast') {
    const tomorrow = new Date(now.getTime() + 86400000); const r = fastReason(tomorrow);
    if (r && !quiet(s, now)) notify(`fast-${tomorrow.toDateString()}`, lang === 'en' ? 'Voluntary fast tomorrow' : 'صيام نافلة غدًا', lang === 'en' ? { mon: 'Tomorrow is Monday.', thu: 'Tomorrow is Thursday.', white: 'Tomorrow is one of the white days (13–15).' }[r] : { mon: 'غدًا الإثنين.', thu: 'غدًا الخميس.', white: 'غدًا من الأيام البيض (١٣–١٥ من الشهر الهجري).' }[r], `${BASE}/calendar`);
    schedule(); return;
  }
  if (kind === 'kahf') { if (!quiet(s, now)) notify(`kahf-${now.toDateString()}`, lang === 'en' ? 'Friday' : 'يوم الجمعة', lang === 'en' ? 'Surat al-Kahf' : 'سورة الكهف', `${BASE}/quran/18`); schedule(); }
});
