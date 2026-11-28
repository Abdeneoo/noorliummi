'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';

type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<unknown> };
type Lang = 'ar' | 'en';
const T = {
  ar: { h: 'نور لأمي معك في كل مكان', p: 'ثبّته على موبايلك أو كمبيوترك كتطبيق، يفتح بلمسة ويعمل دون إنترنت.',
    phone: 'على الموبايل', phoneD: 'أيقونة على الشاشة الرئيسية، وتنبيه الأذان.', pc: 'على الكمبيوتر', pcD: 'نافذة مستقلة مثل أي برنامج.', ext: 'إضافة كروم', extD: 'المواقيت والأذان وتذكير الورد في المتصفح.',
    install: 'ثبّت الآن', installed: 'مثبّت على هذا الجهاز', how: 'طريقة التثبيت', details: 'التفاصيل',
    ios: 'على آيفون: افتح الموقع في سفاري، ثم زر المشاركة ⎋، ثم «إضافة إلى الشاشة الرئيسية».', android: 'على أندرويد: من قائمة كروم ⋮ اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».', desk: 'على الكمبيوتر: في كروم أو إيدج اضغط أيقونة التثبيت في شريط العنوان.' },
  en: { h: 'Noor Li Ummi, wherever you are', p: 'Install it on your phone or computer like an app. Opens with one tap and works offline.',
    phone: 'On your phone', phoneD: 'An icon on your home screen, with adhan alerts.', pc: 'On your computer', pcD: 'Its own window, like any program.', ext: 'Chrome extension', extD: 'Prayer times, adhan and reminders in your browser.',
    install: 'Install now', installed: 'Installed on this device', how: 'How to install', details: 'Details',
    ios: 'iPhone: open the site in Safari, tap Share ⎋, then “Add to Home Screen”.', android: 'Android: in Chrome’s ⋮ menu choose “Install app” or “Add to Home screen”.', desk: 'Computer: in Chrome or Edge click the install icon in the address bar.' },
};

function Art() {
  return (
    <svg className="ap-art" viewBox="0 0 320 200" aria-hidden="true">
      <defs><radialGradient id="ap-g" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#F6E3B4" stopOpacity=".55" /><stop offset="1" stopColor="#F6E3B4" stopOpacity="0" /></radialGradient></defs>
      <circle className="ap-glow" cx="160" cy="100" r="95" fill="url(#ap-g)" />
      <g className="ap-laptop"><rect x="70" y="52" width="150" height="94" rx="8" /><rect x="80" y="62" width="130" height="74" rx="3" className="ap-screen" /><path d="M52 154h186l-10 10H62Z" />
        <path className="ap-line" d="M96 80h70M96 94h98M96 108h56" /></g>
      <g className="ap-phone"><rect x="214" y="70" width="58" height="104" rx="10" /><rect x="220" y="80" width="46" height="80" rx="3" className="ap-screen" />
        <path className="ap-arch" d="M236 140v-16c0-6 3.5-10 7-12 3.5 2 7 6 7 12v16" /><circle className="ap-dot" cx="243" cy="124" r="2.6" /></g>
      <g className="ap-ext"><path d="M34 70h14a6 6 0 1 1 12 0h14v14a6 6 0 1 1 0 12v14H34V96a6 6 0 1 0 0-12Z" /></g>
    </svg>
  );
}

export default function AppsPanel({ lang = 'ar' }: { lang?: Lang }) {
  const t = T[lang]; const bip = useRef<BIP | null>(null);
  const [can, setCan] = useState(false); const [inst, setInst] = useState(false); const [how, setHow] = useState(false);
  useEffect(() => {
    if (window.matchMedia?.('(display-mode: standalone)').matches) setInst(true);
    const on = (e: Event) => { e.preventDefault(); bip.current = e as BIP; setCan(true); };
    const done = () => { setInst(true); setCan(false); };
    window.addEventListener('beforeinstallprompt', on); window.addEventListener('appinstalled', done);
    return () => { window.removeEventListener('beforeinstallprompt', on); window.removeEventListener('appinstalled', done); };
  }, []);
  const install = async () => { if (!bip.current) { setHow(true); return; } await bip.current.prompt(); await bip.current.userChoice; bip.current = null; setCan(false); };
  const Btn = () => inst ? <span className="ap-ok">✓ {t.installed}</span> : <button type="button" className="btn small" onClick={install}>{can ? t.install : t.how}</button>;
  return (
    <section className="ap reveal" id="apps" aria-labelledby="ap-h">
      <div className="ap-head"><Art /><div><h2 id="ap-h">{t.h}</h2><p>{t.p}</p></div></div>
      <ul className="ap-cards">
        <li><span className="ap-ic"><Icon name="phone" /></span><strong>{t.phone}</strong><small>{t.phoneD}</small><Btn /></li>
        <li><span className="ap-ic"><Icon name="laptop" /></span><strong>{t.pc}</strong><small>{t.pcD}</small><Btn /></li>
        <li><span className="ap-ic"><Icon name="puzzle" /></span><strong>{t.ext}</strong><small>{t.extD}</small><Link className="btn small ghost" href="/extension">{t.details}</Link></li>
      </ul>
      {how && <div className="ap-how" role="note"><p>{t.ios}</p><p>{t.android}</p><p>{t.desk}</p></div>}
    </section>
  );
}
