'use client';
import { useEffect, useRef, useState } from 'react';
import { BUILTIN, DEFAULT_PREFS, PRAYER_AR, PRAYER_LIST, SOUNDS, loadPrayerSettings, loadPrefs, playSound, savePrefs, soundsFor, stopSound, type AdhanPrefs } from '@/lib/adhan';

export default function AdhanSettings() {
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
    try { await playSound('chime', prefs.volume); update({ ...prefs, enabled: true }); setMsg('تم التفعيل. سمعتَ الآن نغمة الاختبار.'); }
    catch { setMsg('المتصفح منع الصوت. اضغط الزر مرة أخرى أو تحقق من إعدادات الصوت للموقع.'); }
  };
  const preview = async (id: string) => { setMsg(''); try { await playSound(id, prefs.volume); } catch { setMsg('تعذّر تشغيل الصوت في هذا المتصفح.'); } };
  const askNotif = async () => { if ('Notification' in window) setNotif(await Notification.requestPermission()); };
  const toggleAwake = async () => {
    if (awake) { await lock.current?.release(); lock.current = null; setAwake(false); return; }
    try {
      const wl = (navigator as unknown as { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } }).wakeLock;
      if (!wl) { setMsg('هذا المتصفح لا يدعم إبقاء الشاشة مضاءة.'); return; }
      lock.current = await wl.request('screen'); setAwake(true);
    } catch { setMsg('تعذّر إبقاء الشاشة مضاءة.'); }
  };

  if (!ready) return <section className="card" aria-busy="true"><p className="note">…</p></section>;
  return (
    <div className="grid">
      <section className="card">
        <h2>حالة الأذان</h2>
        {!hasCity && <p className="review-banner">اختر مدينتك أولًا من الصفحة الرئيسية حتى تُحسب المواقيت.</p>}
        <p style={{ margin: '0 0 12px' }}>{prefs.enabled ? 'الأذان مفعّل على هذا الجهاز.' : 'الأذان غير مفعّل.'}</p>
        <div className="row" style={{ marginTop: 0 }}>
          {prefs.enabled
            ? <button type="button" className="btn ghost" onClick={() => { stopSound(); update({ ...prefs, enabled: false }); }}>إيقاف الأذان</button>
            : <button type="button" className="btn" onClick={enable}>تفعيل الأذان والسماح بالصوت</button>}
          <button type="button" className="btn ghost" onClick={stopSound}>إسكات الصوت الآن</button>
          {notif === 'default' && <button type="button" className="btn ghost" onClick={askNotif}>السماح بالإشعارات</button>}
        </div>
        <label htmlFor="vol" className="note" style={{ display: 'block' }}>مستوى الصوت</label>
        <input id="vol" type="range" min={0.1} max={1} step={0.1} value={prefs.volume} onChange={(e) => update({ ...prefs, volume: Number(e.target.value) })} style={{ width: '100%' }} />
        {msg && <p className="note" role="status">{msg}</p>}
        <p className="note">الإشعارات: {notif === 'granted' ? 'مسموحة' : notif === 'denied' ? 'مرفوضة من إعدادات المتصفح' : notif === 'default' ? 'لم يُطلب الإذن بعد' : 'غير مدعومة في هذا المتصفح'}.</p>
      </section>

      <section className="card">
        <h2>صوت كل صلاة</h2>
        {PRAYER_LIST.map((p) => (
          <div className="row" key={p} style={{ marginTop: 10 }}>
            <div className="field"><label htmlFor={`s-${p}`}>{PRAYER_AR[p]}</label>
              <select id={`s-${p}`} value={prefs.sound[p]} onChange={(e) => update({ ...prefs, sound: { ...prefs.sound, [p]: e.target.value } })}>
                {BUILTIN.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
                {soundsFor(p).map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select></div>
            <button type="button" className="btn ghost" onClick={() => preview(prefs.sound[p])} disabled={prefs.sound[p] === 'silent'}>معاينة</button>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>وضع اللوحة المفتوحة</h2>
        <p style={{ margin: '0 0 12px', color: 'var(--muted)' }}>لجهاز يبقى مفتوحًا على الموقع (تابلت أو كمبيوتر في البيت أو المسجد): يمنع انطفاء الشاشة حتى يعمل الأذان في وقته.</p>
        <button type="button" className={awake ? 'btn' : 'btn ghost'} onClick={toggleAwake} aria-pressed={awake}>{awake ? 'الشاشة مضاءة — اضغط للإلغاء' : 'إبقاء الشاشة مضاءة'}</button>
      </section>

      <section className="card">
        <h2>ما يستطيعه المتصفح وما لا يستطيعه</h2>
        <ul className="plain">
          <li>يعمل الأذان ما دامت صفحة من الموقع مفتوحة والجهاز غير نائم.</li>
          <li>إذا أُغلق المتصفح أو نام الهاتف فلن يُسمع الصوت؛ هذا قيد من المتصفحات نفسها، وحلّه الكامل في تطبيق الهاتف لاحقًا.</li>
          <li>قد يمنع المتصفح الصوت إلى أن تلمس الصفحة مرة في كل زيارة؛ عندها يظهر إشعار بدل الصوت إن سمحت بالإشعارات.</li>
          <li>فتح الموقع في أكثر من تبويب لا يكرر الأذان.</li>
        </ul>
      </section>

      {SOUNDS.length > 0 && (
        <section className="card">
          <h2>مصادر التسجيلات وتراخيصها</h2>
          <ul className="plain">
            {SOUNDS.map((s) => (
              <li key={s.id}><strong>{s.title}</strong> — {s.by}. الترخيص: <a href={s.licenseUrl} rel="noopener license">{s.license}</a>. <a href={s.source} rel="noopener">صفحة المصدر</a>.{s.note ? ` ${s.note}` : ''}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
