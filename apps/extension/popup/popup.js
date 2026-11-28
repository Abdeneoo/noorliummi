import { CITIES, NAMES, PRAYERS, timesFor, clock, hijri, placeOf, qibla, nearestMethod } from '../lib/engine.js';
import { ADHKAR } from '../lib/adhkar.js';
import { BASE, getSettings, saveSettings, getState, setState, safeAthar } from '../lib/config.js';

const $ = (id) => document.getElementById(id);
const T = {
  ar: { umrah: 'العمرة', sections: 'كل الأقسام', settings: 'الإعدادات', back: 'رجوع', next: 'الصلاة القادمة', swap: 'التالي', reset: 'تصفير', of33: 'من ٣٣', plus: '+ صفحة', read: 'اقرأ', athar: '🌿 صفحة أثر مثبّتة', edit: 'تعديل', atharEmpty: 'لم تثبّت صفحة أثر بعد — الصق رابط صفحة من الموقع.', atharCreate: 'صفحات الأثر', atharOpen: 'افتح الصفحة', quran: 'القرآن', adhkar: 'الأذكار', tafsir: 'التفسير', prayer: 'الصلاة', athar_: 'أثر' },
  en: { umrah: 'Umrah', sections: 'All sections', settings: 'Settings', back: 'Back', next: 'Next prayer', swap: 'Next', reset: 'Reset', of33: 'of 33', plus: '+ Page', read: 'Read', athar: '🌿 Pinned Athar page', edit: 'Edit', atharEmpty: 'No page pinned — paste a link to a page on the site.', atharCreate: 'Athar pages', atharOpen: 'Open page', quran: 'Quran', adhkar: 'Adhkar', tafsir: 'Tafsir', prayer: 'Prayer', athar_: 'Athar' },
};
let s = {}; let st = {}; let showingSettings = false; let pool = []; let di = 0;
const today = () => new Date().toISOString().slice(0, 10);
const city = () => placeOf(s);

function renderPrayer() {
  const lang = s.lang === 'en' ? 'en' : 'ar'; const c = city(); const now = Date.now();
  $('cityBadge').textContent = lang === 'en' ? c.en : c.ar; $('hijriDate').textContent = hijri().label;
  renderRamadan(lang);
  const t = timesFor(s); let nk = PRAYERS.find((p) => t[p] > now); let nt = nk ? t[nk] : timesFor(s, new Date(), 1).fajr; nk = nk || 'fajr';
  $('nextPrayerName').textContent = NAMES[nk][lang];
  const sec = Math.max(0, Math.floor((nt - now) / 1000)); $('countdown').textContent = [Math.floor(sec / 3600), Math.floor((sec % 3600) / 60), sec % 60].map((x) => String(x).padStart(2, '0')).join(':');
  const grid = $('prayerGrid'); grid.textContent = '';
  for (const p of ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']) { const d = document.createElement('div'); d.className = `prayer-pill${p === nk ? ' next' : ''}`; const a = document.createElement('span'); a.textContent = NAMES[p][lang]; const b = document.createElement('strong'); b.textContent = clock(t[p], c.tz); d.append(a, b); grid.append(d); }
}
/** Ramadan line: day of Ramadan and time to Maghrib (iftar) / Fajr, or a countdown in the second half of Sha'ban (Umm al-Qura). */
function renderRamadan(lang) {
  const el = $('ramadanLine'); if (!el) return; const h = hijri(); const now = Date.now(); const t = timesFor(s);
  const hm = (ms) => { const m = Math.max(0, Math.round(ms / 60000)); return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`; };
  let txt = '';
  if (h.month === 9) { const toM = t.maghrib - now; const toF = (t.fajr > now ? t.fajr : timesFor(s, new Date(), 1).fajr) - now;
    txt = lang === 'en' ? `Ramadan day ${h.day} · ${toM > 0 ? `iftar in ${hm(toM)}` : `Fajr in ${hm(toF)}`}` : `رمضان — اليوم ${h.day} · ${toM > 0 ? `الإفطار بعد ${hm(toM)}` : `الإمساك (الفجر) بعد ${hm(toF)}`}`; }
  else if (h.month === 8 && h.day >= 15) txt = lang === 'en' ? `Ramadan in about ${30 - h.day} days` : `رمضان بعد نحو ${30 - h.day} يومًا`;
  el.hidden = !txt; el.textContent = txt;
}
function renderQibla() { const q = qibla(s); $('qiblaArrow').style.transform = `rotate(${q}deg)`; $('qiblaDeg').textContent = `${Math.round(q)}° ${s.lang === 'en' ? 'from true north (clockwise)' : 'من الشمال الجغرافي باتجاه عقارب الساعة'}`; }
function renderDhikr() { const x = pool[di % pool.length]; if (!x) return; $('dhikrText').textContent = x.t; $('dhikrRef').textContent = `${x.r} — حصن المسلم: ${x.title}`; }
function renderCounters() {
  $('tasbeehCount').textContent = st.tasbeeh ?? 0;
  const tg = [33, 70, 100].includes(s.tasbeehTarget) ? s.tasbeehTarget : 33;
  $('tasbeehSub').textContent = s.lang === 'en' ? `of ${tg}` : `من ${String(tg).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d])}`;
  document.querySelectorAll('#targetRow button').forEach((b) => b.classList.toggle('on', Number(b.dataset.t) === tg));
  const done = st.wirdDate === today() ? st.wirdDone ?? 0 : 0; const goal = Math.max(1, s.wirdGoal);
  $('wirdProgressText').textContent = `${done}/${goal}`; $('wirdBar').style.width = `${Math.min(100, Math.round((done / goal) * 100))}%`;
}
function renderAthar() {
  const t = T[s.lang === 'en' ? 'en' : 'ar']; const u = safeAthar(s.atharUrl);
  $('atharDesc').textContent = u ? (s.atharName ? `صدقة جارية: ${s.atharName}` : u) : t.atharEmpty;
  $('atharOpenLink').href = u || `${BASE}/athar`; $('atharOpenLink').textContent = u ? t.atharOpen : t.atharCreate;
}
function applyLang() {
  const lang = s.lang === 'en' ? 'en' : 'ar'; const t = T[lang];
  document.documentElement.lang = lang; document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl'; document.body.dataset.theme = s.theme || 'dark';
  $('themeBtn').textContent = s.theme === 'light' ? '🌙' : '☀️'; $('tabToggleBtn').textContent = showingSettings ? t.back : t.settings;
  $('nextPrayerLabel').textContent = t.next; $('nextDhikrBtn').textContent = t.swap; $('tasbeehResetBtn').textContent = t.reset;
  $('wirdPlusBtn').textContent = t.plus; $('openQuranLink').textContent = t.read; $('atharTitle').textContent = t.athar; $('editAtharBtn').textContent = t.edit;
  document.querySelectorAll('.footer-links a').forEach((a) => { const k = a.dataset.i18n === 'athar' ? 'athar_' : a.dataset.i18n; if (t[k]) a.textContent = t[k]; a.href = `${BASE}/${a.dataset.i18n}`; });
  $('openQuranLink').href = `${BASE}/wird`; renderAthar();
}
async function loadAdhans() {
  try {
    const r = await fetch(`${BASE}/api/v1/adhans`); const j = await r.json(); const all = j.items || [];
    const fill = (sel, items, cur, first) => { sel.textContent = ''; if (first) sel.append(new Option(first, '')); for (const x of items) sel.append(new Option(s.lang === 'en' ? x.title_en : x.title, x.url)); sel.value = cur || (first ? '' : items[0]?.url || ''); };
    fill($('adhanSelect'), all.filter((x) => x.kind === 'regular'), s.adhanUrl); fill($('adhanFajrSelect'), all.filter((x) => x.kind === 'fajr'), s.adhanFajrUrl, 'نفس الأذان');
    const lic = all.find((x) => x.url === s.adhanUrl) ?? all[0]; if (lic) $('adhanLicense').textContent = `المصدر: ${lic.by} — ${lic.license}`;
  } catch { $('adhanSelect').textContent = ''; $('adhanSelect').append(new Option('تعذّر تحميل القائمة (بلا إنترنت)', s.adhanUrl)); }
}
/** Ayah and hadith of the day: fetched once a day from the site and kept in chrome.storage.local (works offline afterwards). */
async function daily(kind) {
  const key = `daily:${kind}`; const d = (await chrome.storage.local.get(key))[key];
  if (d && d.date === today()) return d.j;
  try { const j = await (await fetch(`${BASE}/api/v1/${kind}?date=${today()}`)).json(); if (j && j.text) { await chrome.storage.local.set({ [key]: { date: today(), j } }); return j; } } catch { /* offline */ }
  return d?.j ?? null;
}
async function loadAyah() {
  const a = await daily('ayah-of-day'); if (a) { $('ayahText').textContent = a.text; $('ayahRef').textContent = `${a.surah_name} — ${a.ayah}`; $('ayahLink').href = a.url; $('ayahCard').hidden = false; }
  const h = await daily('hadith-of-day'); if (h) { $('hadithText').textContent = h.text; $('hadithRef').textContent = `${h.book} — ${h.number}`; $('hadithLink').href = h.url; $('hadithCard').hidden = false; }
}
function renderMute() {
  const on = s.muteUntil && Date.now() < s.muteUntil; $('muteBtn').classList.toggle('active', Boolean(on));
  $('muteState').textContent = on ? `${s.lang === 'en' ? 'until' : 'حتى'} ${new Date(s.muteUntil).toLocaleTimeString(s.lang === 'en' ? 'en' : 'ar-EG', { hour: '2-digit', minute: '2-digit' })}` : '';
}
async function renderFocus() { const a = await chrome.alarms.get('focus'); $('focusState').textContent = a ? `${s.lang === 'en' ? 'ends' : 'تنتهي'} ${new Date(a.scheduledTime).toLocaleTimeString(s.lang === 'en' ? 'en' : 'ar-EG', { hour: '2-digit', minute: '2-digit' })}` : ''; }
function fillSettings() {
  $('citySelect').textContent = ''; if (s.custom) $('citySelect').append(new Option(s.lang === 'en' ? 'My location' : 'موقعي الحالي', 'here')); for (const c of CITIES) $('citySelect').append(new Option(s.lang === 'en' ? c.en : c.ar, c.id)); $('citySelect').value = s.cityId;
  $('asrSelect').value = s.asr; $('duhaToggle').checked = s.duhaEnabled; $('duhaMinInput').value = s.duhaAfterSunrise; $('qiyamToggle').checked = s.qiyamEnabled; $('qiyamSleepToggle').checked = s.qiyamIgnoresSleep;
  $('adhanToggle').checked = s.adhanEnabled; $('prePrayerToggle').checked = s.prePrayerEnabled; $('preMinutesInput').value = s.prePrayerMinutes;
  $('dhikrIntervalSelect').value = String(s.dhikrIntervalMinutes); $('fastingToggle').checked = s.fastingReminderEnabled; $('fastAtInput').value = s.fastReminderAt; $('kahfToggle').checked = s.kahfReminderEnabled;
  $('sleepToggle').checked = s.sleepModeEnabled; $('sleepStartInput').value = s.sleepStart; $('sleepEndInput').value = s.sleepEnd;
  $('wirdGoalInput').value = s.wirdGoal; $('wirdHoursInput').value = s.wirdReminderHours; $('langSelect').value = s.lang;
  $('badgeToggle').checked = s.badgeEnabled !== false; renderMute(); renderFocus();
  const box = $('prayersOn'); box.textContent = ''; for (const p of PRAYERS) { const l = document.createElement('label'); l.className = 'field row'; const sp = document.createElement('span'); sp.textContent = NAMES[p][s.lang === 'en' ? 'en' : 'ar']; const i = document.createElement('input'); i.type = 'checkbox'; i.checked = s.prayersOn[p]; i.addEventListener('change', async () => { s.prayersOn = { ...s.prayersOn, [p]: i.checked }; await saveSettings(s); }); l.append(sp, i); box.append(l); }
}
function bind() {
  $('tabToggleBtn').addEventListener('click', () => { showingSettings = !showingSettings; $('homeView').classList.toggle('hidden', showingSettings); $('settingsView').classList.toggle('hidden', !showingSettings); applyLang(); if (showingSettings) loadAdhans(); });
  $('themeBtn').addEventListener('click', async () => { s.theme = s.theme === 'light' ? 'dark' : 'light'; applyLang(); await saveSettings(s); });
  $('muteBtn').addEventListener('click', async () => { const on = s.muteUntil && Date.now() < s.muteUntil; s.muteUntil = on ? 0 : Date.now() + 3600000; renderMute(); await saveSettings(s); });
  document.querySelectorAll('[data-mute]').forEach((b) => b.addEventListener('click', async () => { const m = Number(b.dataset.mute); s.muteUntil = m ? Date.now() + m * 60000 : 0; renderMute(); await saveSettings(s); }));
  document.querySelectorAll('#targetRow button').forEach((b) => b.addEventListener('click', async () => { s.tasbeehTarget = Number(b.dataset.t); st.tasbeeh = 0; renderCounters(); await setState({ tasbeeh: 0 }); await saveSettings(s); }));
  document.querySelectorAll('[data-focus]').forEach((b) => b.addEventListener('click', () => chrome.runtime.sendMessage({ type: 'FOCUS', minutes: Number(b.dataset.focus) }, () => renderFocus())));
  $('nextDhikrBtn').addEventListener('click', () => { di++; renderDhikr(); });
  $('tasbeehBtn').addEventListener('click', async () => { const tg = [33, 70, 100].includes(s.tasbeehTarget) ? s.tasbeehTarget : 33; st.tasbeeh = ((st.tasbeeh ?? 0) + 1) % (tg + 1); renderCounters(); await setState({ tasbeeh: st.tasbeeh }); });
  $('tasbeehResetBtn').addEventListener('click', async () => { st.tasbeeh = 0; renderCounters(); await setState({ tasbeeh: 0 }); });
  $('wirdPlusBtn').addEventListener('click', async () => { const d = st.wirdDate === today() ? st.wirdDone ?? 0 : 0; st.wirdDate = today(); st.wirdDone = d + 1; renderCounters(); await setState({ wirdDate: st.wirdDate, wirdDone: st.wirdDone }); });
  $('editAtharBtn').addEventListener('click', () => { $('atharNameInput').value = s.atharName; $('atharUrlInput').value = s.atharUrl; $('atharForm').classList.toggle('hidden'); });
  $('atharForm').addEventListener('submit', async (e) => { e.preventDefault(); const u = safeAthar($('atharUrlInput').value.trim()); s.atharName = $('atharNameInput').value.trim().slice(0, 60); s.atharUrl = u; $('atharForm').classList.add('hidden'); renderAthar(); await saveSettings(s); });
  const bindS = (id, key, prop = 'value', tf = (v) => v) => $(id).addEventListener('change', async (e) => { s[key] = tf(e.target[prop]); await saveSettings(s); applyLang(); renderPrayer(); renderCounters(); });
  $('citySelect').addEventListener('change', async (e) => { s.cityId = e.target.value; await saveSettings(s); applyLang(); renderPrayer(); renderQibla(); }); bindS('adhanToggle', 'adhanEnabled', 'checked'); bindS('prePrayerToggle', 'prePrayerEnabled', 'checked');
  bindS('preMinutesInput', 'prePrayerMinutes', 'value', (v) => Math.min(60, Math.max(1, Number(v) || 10))); bindS('dhikrIntervalSelect', 'dhikrIntervalMinutes', 'value', Number);
  bindS('fastingToggle', 'fastingReminderEnabled', 'checked'); bindS('fastAtInput', 'fastReminderAt'); bindS('kahfToggle', 'kahfReminderEnabled', 'checked');
  bindS('sleepToggle', 'sleepModeEnabled', 'checked'); bindS('sleepStartInput', 'sleepStart'); bindS('sleepEndInput', 'sleepEnd');
  bindS('wirdGoalInput', 'wirdGoal', 'value', (v) => Math.min(50, Math.max(1, Number(v) || 4))); bindS('wirdHoursInput', 'wirdReminderHours', 'value', (v) => Math.min(12, Math.max(0, Number(v) || 0)));
  bindS('langSelect', 'lang'); bindS('asrSelect', 'asr'); bindS('duhaToggle', 'duhaEnabled', 'checked'); bindS('duhaMinInput', 'duhaAfterSunrise', 'value', (v) => Math.min(60, Math.max(10, Number(v) || 20)));
  bindS('qiyamToggle', 'qiyamEnabled', 'checked'); bindS('qiyamSleepToggle', 'qiyamIgnoresSleep', 'checked'); bindS('badgeToggle', 'badgeEnabled', 'checked');
  $('locateBtn').addEventListener('click', () => {
    $('locateMsg').textContent = '…';
    navigator.geolocation.getCurrentPosition(async (pos) => {
      // Rounded to about 1 km and kept on this device only; never sent anywhere.
      const lat = Math.round(pos.coords.latitude * 100) / 100; const lng = Math.round(pos.coords.longitude * 100) / 100;
      s.custom = { id: 'here', ar: 'موقعي الحالي', en: 'My location', lat, lng, tz: Intl.DateTimeFormat().resolvedOptions().timeZone, method: nearestMethod(lat, lng) }; s.cityId = 'here';
      await saveSettings(s); fillSettings(); applyLang(); renderPrayer(); renderQibla(); $('locateMsg').textContent = s.lang === 'en' ? 'Location saved on this device.' : 'حُفظ الموقع على جهازك فقط.';
    }, () => { $('locateMsg').textContent = s.lang === 'en' ? 'Location not allowed.' : 'لم يُسمح بتحديد الموقع.'; }, { timeout: 15000, maximumAge: 3600000 });
  }); bindS('adhanSelect', 'adhanUrl'); bindS('adhanFajrSelect', 'adhanFajrUrl');
  $('testAdhanBtn').addEventListener('click', () => chrome.runtime.sendMessage({ type: 'TEST_ADHAN' }));
  $('stopAdhanBtn').addEventListener('click', () => chrome.runtime.sendMessage({ type: 'STOP_ADHAN' }));
}
(async function init() {
  s = await getSettings(); st = await getState();
  pool = ADHKAR.filter((x) => s.dhikrChapters.includes(x.ch)); di = Math.floor(Math.random() * Math.max(1, pool.length));
  fillSettings(); applyLang(); renderPrayer(); renderQibla(); renderDhikr(); renderCounters(); bind(); loadAyah();
  setInterval(renderPrayer, 1000);
})();
