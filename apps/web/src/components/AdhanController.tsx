'use client';
/**
 * Runs on every page while the site is open. At each prayer time it plays the chosen sound once.
 * Limits (stated to the user on /adhan): works only while a tab is open and the device is awake;
 * browsers may block sound until the user has interacted with the page in this session.
 */
import { useEffect } from 'react';
import { getPrayerStatus } from '@noor/prayer-engine';
import { PRAYER_AR, loadPrayerSettings, loadPrefs, notify, playSound, primeAudio, type Prayer } from '@/lib/adhan';

const FIRED = 'noor.adhan.fired';

export default function AdhanController() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      if (timer) clearTimeout(timer);
      const prefs = loadPrefs(); const s = loadPrayerSettings();
      if (!prefs.enabled || !s) return;
      let st; try { st = getPrayerStatus(s, new Date()); } catch { return; }
      const at = st.next.time.getTime(); const name = st.next.name as Prayer;
      // Re-check at least every 5 minutes so sleep/wake and clock changes are picked up.
      timer = setTimeout(() => { void fire(at, name).finally(schedule); }, Math.min(Math.max(at - Date.now(), 0), 5 * 60_000));
    };
    const fire = async (at: number, name: Prayer) => {
      const late = Date.now() - at;
      if (late < 0 || late > 90_000) return; // not yet, or woke up too late: do not sound a stale adhan
      const run = async () => {
        if (localStorage.getItem(FIRED) === String(at)) return; // another tab already did it
        localStorage.setItem(FIRED, String(at));
        const prefs = loadPrefs();
        let blocked = false;
        try { await playSound(prefs.sound[name], prefs.volume); } catch { blocked = true; }
        if (blocked || prefs.sound[name] === 'silent' || document.hidden) { const en = document.documentElement.lang === 'en'; await notify(en ? `It is time for ${({ fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' } as Record<Prayer, string>)[name]} prayer` : `حان الآن وقت صلاة ${PRAYER_AR[name]}`, `noor-adhan-${at}`, en ? 'en' : 'ar'); }
      };
      if ('locks' in navigator) await navigator.locks.request(`noor-adhan-${at}`, { ifAvailable: true }, async (lock) => { if (lock) await run(); });
      else await run();
    };
    // Unlock audio on the first tap/key of the visit so the adhan can play later without another tap.
    const prime = () => { if (loadPrefs().enabled) primeAudio(); };
    window.addEventListener('pointerdown', prime, { capture: true });
    window.addEventListener('keydown', prime, { capture: true });
    schedule();
    const onChange = () => schedule();
    window.addEventListener('noor:adhan-prefs', onChange);
    window.addEventListener('storage', onChange);
    document.addEventListener('visibilitychange', onChange);
    return () => { if (timer) clearTimeout(timer); window.removeEventListener('pointerdown', prime, { capture: true }); window.removeEventListener('keydown', prime, { capture: true }); window.removeEventListener('noor:adhan-prefs', onChange); window.removeEventListener('storage', onChange); document.removeEventListener('visibilitychange', onChange); };
  }, []);
  return null;
}
