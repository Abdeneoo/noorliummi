'use client';
import { useEffect, useRef, useState } from 'react';
import { DEFAULT_PREFS, PRAYER_AR, PRAYER_LIST, SOUNDS, loadPrayerSettings, loadPrefs, playSound, savePrefs, soundsFor, stopSound, type AdhanPrefs, type Prayer } from '@/lib/adhan';

const PRAYER_EN: Record<Prayer, string> = { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };
const L = {
  ar: {
    prayer: (p: Prayer) => PRAYER_AR[p], chime: 'نغمة تنبيه هادئة', silent: 'إشعار صامت فقط',
    enabledMsg: 'تم التفعيل، ويُسمع الآن الأذان للاختبار (أوقفه بزر «إسكات الصوت الآن»). إن لم تسمع شيئًا فارفع صوت الوسائط في جهازك.',
    blocked: 'المتصفح منع الصوت. اضغط الزر مرة أخرى، وتأكد أن صوت الوسائط مرتفع وأن الموقع غير مكتوم في إعدادات المتصفح.',
    previewFail: 'تعذّر تشغيل الصوت في هذا المتصفح.', noWake: 'هذا المتصفح لا يدعم إبقاء الشاشة مضاءة.', wakeFail: 'تعذّر إبقاء الشاشة مضاءة.',
    status: 'حالة الأذان', chooseCity: 'اختر مدينتك أولًا من الصفحة الرئيسية حتى تُحسب المواقيت.', on: 'الأذان مفعّل على هذا الجهاز.', off: 'الأذان غير مفعّل.',
    stopAdhan: 'إيقاف الأذان', enable: 'تفعيل الأذان والسماح بالصوت', test: 'اختبر الأذان الآن', mute: 'إسكات الصوت الآن', allowNotif: 'السماح بالإشعارات', volume: 'مستوى الصوت',
    notif: (n: string) => `الإشعارات: ${n === 'granted' ? 'مسموحة' : n === 'denied' ? 'مرفوضة من إعدادات المتصفح' : n === 'default' ? 'لم يُطلب الإذن بعد' : 'غير مدعومة في هذا المتصفح'}.`,
    perPrayer: 'صوت كل صلاة', preview: 'معاينة',
    kiosk: 'وضع اللوحة المفتوحة', kioskNote: 'لجهاز يبقى مفتوحًا على الموقع (تابلت أو كمبيوتر في البيت أو المسجد): يمنع انطفاء الشاشة حتى يعمل الأذان في وقته.', awakeOn: 'الشاشة مضاءة — اضغط للإلغاء', awakeOff: 'إبقاء الشاشة مضاءة',
    limits: 'ما يستطيعه المتصفح وما لا يستطيعه',
    limitList: ['يعمل الأذان ما دامت صفحة من الموقع مفتوحة والجهاز غير نائم.', 'إذا أُغلق المتصفح أو نام الهاتف فلن يُسمع الصوت؛ هذا قيد من المتصفحات نفسها، وحلّه الكامل في تطبيق الهاتف لاحقًا.', 'يحتاج المتصفح أن تلمس الصفحة مرة في كل زيارة حتى يُسمح بالصوت لاحقًا؛ إن لم يحدث ذلك ظهر إشعار بدل الصوت إن سمحت بالإشعارات.', 'على آيفون: الأذان يُسمع بصوت الوسائط حتى مع زر الصامت، لكنه لا يعمل إلا والصفحة ظاهرة على الشاشة.', 'فتح الموقع في أكثر من تبويب لا يكرر الأذان.'],
    credits: 'مصادر التسجيلات وتراخيصها', license: 'الترخيص', page: 'صفحة المصدر', pending: 'لم يُعتمد بعد بالاستماع.',
  },
  en: {
    prayer: (p: Prayer) => PRAYER_EN[p], chime: 'Gentle chime', silent: 'Silent notification only',
    enabledMsg: 'Enabled — the adhan is playing now as a test (stop it with “Mute now”). If you hear nothing, turn up your device’s media volume.',
    blocked: 'The browser blocked the sound. Tap the button again, make sure media volume is up and the site is not muted in your browser settings.',
    previewFail: 'Could not play sound in this browser.', noWake: 'This browser cannot keep the screen on.', wakeFail: 'Could not keep the screen on.',
    status: 'Adhan status', chooseCity: 'Choose your city on the home page first so the times can be calculated.', on: 'The adhan is enabled on this device.', off: 'The adhan is not enabled.',
    stopAdhan: 'Turn off the adhan', enable: 'Enable the adhan and allow sound', test: 'Test the adhan now', mute: 'Mute now', allowNotif: 'Allow notifications', volume: 'Volume',
    notif: (n: string) => `Notifications: ${n === 'granted' ? 'allowed' : n === 'denied' ? 'blocked in browser settings' : n === 'default' ? 'not requested yet' : 'not supported in this browser'}.`,
    perPrayer: 'Sound for each prayer', preview: 'Preview',
    kiosk: 'Always-on display', kioskNote: 'For a device that stays open on the site (a tablet or computer at home or in the mosque): keeps the screen on so the adhan plays on time.', awakeOn: 'Screen kept on — tap to cancel', awakeOff: 'Keep the screen on',
    limits: 'What a browser can and cannot do',
    limitList: ['The adhan plays while a page of the site is open and the device is awake.', 'If the browser is closed or the phone sleeps, no sound plays — a limit of browsers themselves; the full solution is the future phone app.', 'The browser needs one tap on the page per visit before it allows sound later; otherwise a notification is shown instead, if you allowed notifications.', 'On iPhone the adhan plays through media volume even with the silent switch on, but only while the page is on screen.', 'Opening the site in several tabs does not repeat the adhan.'],
    credits: 'Recording sources and licences', license: 'Licence', page: 'Source page', pending: 'Not yet approved by listening.',
  },
};

export default function AdhanSettings({ lang = 'ar' }: { lang?: 'ar' | 'en' }) {
  const t = L[lang];
  const [prefs, setPrefs] = useState<AdhanPrefs>(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);
  const [msg, setMsg] = useState('');
  const [notif, setNotif] = useState<string>('unsupported');
  const [awake, setAwake] = useState(false);
  const lock = useRef<{ release: () => Promise<void> } | null>(null);
  const [hasCity, setHasCity] = useState(true);

  useEffect(() => { setPrefs(loadPrefs()); setReady(true); setHasCity(!!loadPrayerSettings()); if ('Notification' in window) setNotif(Notification.permission); return () => { stopSound(); void lock.current?.release(); }; }, []);
  const update = (p: AdhanPrefs) => { setPrefs(p); savePrefs(p); };

  const enable = async () => {
    setMsg('');
    try {
      await playSound(prefs.sound.dhuhr, prefs.volume);
      update({ ...prefs, enabled: true });
      setMsg(t.enabledMsg);
      if ('Notification' in window && Notification.permission === 'default') setNotif(await Notification.requestPermission());
    } catch { setMsg(t.blocked); }
  };
  const preview = async (id: string) => { setMsg(''); try { await playSound(id, prefs.volume); } catch { setMsg(t.previewFail); } };
  const askNotif = async () => { if ('Notification' in window) setNotif(await Notification.requestPermission()); };
  const toggleAwake = async () => {
    if (awake) { await lock.current?.release(); lock.current = null; setAwake(false); return; }
    try {
      const wl = (navigator as unknown as { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } }).wakeLock;
      if (!wl) { setMsg(t.noWake); return; }
      lock.current = await wl.request('screen'); setAwake(true);
    } catch { setMsg(t.wakeFail); }
  };

  if (!ready) return <section className="card" aria-busy="true"><p className="note">…</p></section>;
  return (
    <div className="grid">
      <section className="card">
        <h2>{t.status}</h2>
        {!hasCity && <p className="review-banner">{t.chooseCity}</p>}
        <p style={{ margin: '0 0 12px' }}>{prefs.enabled ? t.on : t.off}</p>
        <div className="row" style={{ marginTop: 0 }}>
          {prefs.enabled
            ? <button type="button" className="btn ghost" onClick={() => { stopSound(); update({ ...prefs, enabled: false }); }}>{t.stopAdhan}</button>
            : <button type="button" className="btn" onClick={enable}>{t.enable}</button>}
          {prefs.enabled && <button type="button" className="btn ghost" onClick={() => preview(prefs.sound.dhuhr)}>{t.test}</button>}
          <button type="button" className="btn ghost" onClick={stopSound}>{t.mute}</button>
          {notif === 'default' && <button type="button" className="btn ghost" onClick={askNotif}>{t.allowNotif}</button>}
        </div>
        <label htmlFor="vol" className="note" style={{ display: 'block' }}>{t.volume}</label>
        <input id="vol" type="range" min={0.1} max={1} step={0.1} value={prefs.volume} onChange={(e) => update({ ...prefs, volume: Number(e.target.value) })} style={{ width: '100%' }} />
        {msg && <p className="note" role="status">{msg}</p>}
        <p className="note">{t.notif(notif)}</p>
      </section>

      <section className="card">
        <h2>{t.perPrayer}</h2>
        {PRAYER_LIST.map((p) => (
          <div className="row" key={p} style={{ marginTop: 10 }}>
            <div className="field"><label htmlFor={`s-${p}`}>{t.prayer(p)}</label>
              <select id={`s-${p}`} value={prefs.sound[p]} onChange={(e) => update({ ...prefs, sound: { ...prefs.sound, [p]: e.target.value } })}>
                {soundsFor(p).map((s) => <option key={s.id} value={s.id}>{lang === 'en' ? `Adhan — ${s.by}` : s.title}</option>)}
                <option value="chime">{t.chime}</option>
                <option value="silent">{t.silent}</option>
              </select></div>
            <button type="button" className="btn ghost" onClick={() => preview(prefs.sound[p])} disabled={prefs.sound[p] === 'silent'}>{t.preview}</button>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>{t.kiosk}</h2>
        <p style={{ margin: '0 0 12px', color: 'var(--muted)' }}>{t.kioskNote}</p>
        <button type="button" className={awake ? 'btn' : 'btn ghost'} onClick={toggleAwake} aria-pressed={awake}>{awake ? t.awakeOn : t.awakeOff}</button>
      </section>

      <section className="card">
        <h2>{t.limits}</h2>
        <ul className="plain">{t.limitList.map((x) => <li key={x}>{x}</li>)}</ul>
      </section>

      {SOUNDS.length > 0 && (
        <section className="card">
          <h2>{t.credits}</h2>
          <ul className="plain">
            {SOUNDS.map((s) => (
              <li key={s.id}><strong>{lang === 'en' ? `Adhan — ${s.by}` : s.title}</strong> — {s.by}. {t.license}: <a href={s.licenseUrl} rel="noopener license">{s.license}</a>. <a href={s.source} rel="noopener">{t.page}</a>.{lang === 'ar' && s.note ? ` ${s.note}` : ''}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
