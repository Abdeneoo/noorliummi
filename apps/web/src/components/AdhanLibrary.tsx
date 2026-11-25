'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  PRAYER_LIST, SOUNDS, addLocalFiles, cacheOffline, dropOffline, fmtDur, isOffline, listLocal, loadCatalogue, loadFavs, playSound, removeLocal, stopSound, toggleFav,
  type AdhanPrefs, type CatalogueItem, type LocalAdhan, type Prayer,
} from '@/lib/adhan';

type Lang = 'ar' | 'en';
type Item = { id: string; title: string; sub: string; dur: number | null; groups: string[]; kind: 'site' | 'device'; file?: string; search: string };
const GROUPS = ['all', 'fav', 'fajr', 'haramain', 'egyptian', 'famous', 'device'] as const;
type Group = (typeof GROUPS)[number];
const L = {
  ar: {
    title: 'مكتبة الأذان', intro: 'استمع قبل الاختيار، وخصّص صوتًا لكل صلاة أو صوتًا خاصًا للفجر.',
    g: { all: 'الكل', fav: 'المفضلة', fajr: 'أذان الفجر', haramain: 'الحرمان الشريفان', egyptian: 'القراء المصريون', famous: 'أصوات مشهورة', device: 'من جهازي' } as Record<Group, string>,
    search: 'ابحث باسم المؤذن أو البلد', none: 'لا توجد تسجيلات هنا بعد.', play: 'استماع', stop: 'إيقاف', fav: 'أضف للمفضلة', unfav: 'أزل من المفضلة',
    use: 'استخدمه لـ', all: 'كل الصلوات', remove: 'حذف من الجهاز', offline: 'حفظ دون إنترنت', offlineOn: 'محفوظ دون إنترنت ✓',
    site: 'على الموقع', device: 'على جهازك', import: 'أضف تسجيلات من جهازك', importNote: 'اختر ملفًا أو عدة ملفات صوتية (حتى 40 ميغابايت للملف). تُحفظ على هذا الجهاز وحده ولا تُرفع إلى أي خادم، وتعمل دون إنترنت.',
    progress: (d: number, t: number) => `جارٍ الإضافة ${d} من ${t}…`,
    result: (a: number, m: number, s: number) => `أُضيف ${a} تسجيلًا${m ? `، تعرّفنا على ${m} منها من المكتبات المعروفة` : ''}${s ? `، وتُرك ${s} (ليس صوتًا أو أكبر من الحد)` : ''}.`,
    quota: 'امتلأت مساحة التخزين المتاحة للموقع في هذا المتصفح؛ احذف بعض التسجيلات أو أضف عددًا أقل.',
    rights: 'لماذا لا تظهر هنا مكتبات الأذان الكبيرة؟', rightsBody: (n: number) => `راجعنا ${n} تسجيلًا من مكتبتين عامتين، وكلها بانتظار إذن أصحاب الحقوق قبل استضافتها على الموقع: المستودع بلا ترخيص، وأغلب ملفاته منقولة من مواقع أخرى (assabile وislamweb وغيرهما)، وموقع AlAdhan يتيح ملفاته «للاستخدام الشخصي». يمكنك تنزيلها لنفسك من مصدرها ثم إضافتها هنا من جهازك، وسيتعرّف الموقع على اسم المؤذن والتصنيف تلقائيًا.`,
    src1: 'مستودع Kiwifu/adhan-mp3', src2: 'صفحة تنزيل الأذان في AlAdhan', fajr: 'فجر',
  },
  en: {
    title: 'Adhan library', intro: 'Listen before choosing, and set a sound for each prayer or a special one for Fajr.',
    g: { all: 'All', fav: 'Favourites', fajr: 'Fajr adhan', haramain: 'The Two Holy Mosques', egyptian: 'Egyptian reciters', famous: 'Famous voices', device: 'On my device' } as Record<Group, string>,
    search: 'Search by muezzin or country', none: 'No recordings here yet.', play: 'Listen', stop: 'Stop', fav: 'Add to favourites', unfav: 'Remove from favourites',
    use: 'Use for', all: 'All prayers', remove: 'Remove from device', offline: 'Save for offline', offlineOn: 'Saved for offline ✓',
    site: 'On the site', device: 'On your device', import: 'Add recordings from your device', importNote: 'Choose one or more audio files (up to 40 MB each). They are stored on this device only, never uploaded, and work offline.',
    progress: (d: number, t: number) => `Adding ${d} of ${t}…`,
    result: (a: number, m: number, s: number) => `Added ${a}${m ? `, ${m} recognised from known collections` : ''}${s ? `, ${s} skipped (not audio or too large)` : ''}.`,
    quota: 'This browser has no storage left for the site; remove some recordings or add fewer.',
    rights: 'Why aren’t the large adhan collections here?', rightsBody: (n: number) => `We reviewed ${n} recordings from two public collections; all are waiting for the rights holders’ permission before the site can host them: the repository has no licence and most files come from other sites (assabile, islamweb and others), and AlAdhan offers its files “for personal use”. You can download them for yourself from the source and add them here from your device — the site recognises the muezzin and category automatically.`,
    src1: 'Kiwifu/adhan-mp3 repository', src2: 'AlAdhan adhan downloads page', fajr: 'Fajr',
  },
};
const PRAYER_NAME = { ar: { fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' }, en: { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' } };
const norm = (s: string) => s.toLowerCase().replace(/[ًٌٍَُِّْـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');

export default function AdhanLibrary({ lang = 'ar', prefs, update }: { lang?: Lang; prefs: AdhanPrefs; update: (p: AdhanPrefs) => void }) {
  const t = L[lang];
  const [group, setGroup] = useState<Group>('all');
  const [q, setQ] = useState('');
  const [favs, setFavs] = useState<string[]>([]);
  const [local, setLocal] = useState<LocalAdhan[]>([]);
  const [cat, setCat] = useState<CatalogueItem[]>([]);
  const [playing, setPlaying] = useState<string | null>(null);
  const [offline, setOffline] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState('');
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { setFavs(loadFavs()); void listLocal().then(setLocal); void loadCatalogue().then(setCat).catch(() => undefined);
    void Promise.all(SOUNDS.map(async (s) => [s.id, await isOffline(s.file)] as const)).then((r) => setOffline(Object.fromEntries(r))); return () => stopSound(); }, []);

  const byId = useMemo(() => new Map(cat.map((c) => [c.id, c])), [cat]);
  const items: Item[] = useMemo(() => {
    const site: Item[] = SOUNDS.map((s) => ({ id: s.id, title: lang === 'en' ? `Adhan — ${s.by}` : s.title, sub: `${s.by} · ${s.license}`, dur: s.duration, groups: [...(s.groups ?? []), ...(s.kind === 'fajr' ? ['fajr'] : [])], kind: 'site', file: s.file, search: norm(`${s.title} ${s.by}`) }));
    const dev: Item[] = local.map((x) => {
      const m = x.match ? byId.get(x.match) : undefined;
      const title = m ? (lang === 'en' ? m.t.en : m.t.ar ?? m.t.en) : x.name.replace(/\.[a-z0-9]+$/i, '').replace(/_/g, ' ');
      const place = m ? [m.p?.[lang] ?? m.p?.en, m.co?.[lang]].filter(Boolean).join(' · ') : '';
      return { id: x.id, title, sub: place || x.name, dur: x.duration ?? m?.d ?? null, groups: [...(m?.g ?? []), 'device'], kind: 'device', search: norm(`${title} ${x.name} ${m?.t.en ?? ''} ${m?.t.ar ?? ''} ${place}`) };
    });
    return [...site, ...dev];
  }, [local, byId, lang]);
  const shown = items.filter((i) => (group === 'all' ? true : group === 'fav' ? favs.includes(i.id) : i.groups.includes(group))).filter((i) => !q.trim() || i.search.includes(norm(q.trim())));
  const reviewed = cat.length;

  const listen = async (id: string) => {
    if (playing === id) { stopSound(); setPlaying(null); return; }
    try { await playSound(id, prefs.volume); setPlaying(id); } catch { setPlaying(null); }
  };
  const assign = (id: string, target: string) => {
    if (!target) return;
    const sound = { ...prefs.sound };
    if (target === 'all') PRAYER_LIST.forEach((p) => { sound[p] = id; }); else sound[target as Prayer] = id;
    update({ ...prefs, sound });
  };
  const used = (id: string) => PRAYER_LIST.filter((p) => prefs.sound[p] === id);
  const onFiles = async (fl: FileList | null) => {
    if (!fl?.length) return;
    const files = Array.from(fl);
    const r = await addLocalFiles(files, (d, tot) => setMsg(t.progress(d, tot)));
    setLocal(await listLocal()); window.dispatchEvent(new Event('noor:adhan-lib'));
    setMsg(r.quota ? t.quota : t.result(r.added, r.matched, r.skipped));
    if (r.added) setGroup('device');
    if (input.current) input.current.value = '';
  };

  return (
    <section className="card adhan-lib" aria-labelledby="lib-title">
      <h2 id="lib-title">{t.title}</h2>
      <p className="note" style={{ marginTop: 0 }}>{t.intro}</p>
      <div className="lib-tools">
        <input type="search" className="search" placeholder={t.search} aria-label={t.search} value={q} onChange={(e) => setQ(e.target.value)} />
        <ul className="chips lib-groups" role="tablist">
          {GROUPS.map((g) => <li key={g}><button type="button" role="tab" aria-selected={group === g} className={group === g ? 'on' : ''} onClick={() => setGroup(g)}>{t.g[g]}</button></li>)}
        </ul>
      </div>
      {shown.length === 0 ? <p className="note">{t.none}</p> : (
        <ul className="lib-list">
          {shown.map((i) => (
            <li key={i.id} className={playing === i.id ? 'playing' : ''}>
              <button type="button" className="lib-play" onClick={() => void listen(i.id)} aria-label={`${playing === i.id ? t.stop : t.play}: ${i.title}`}>
                <svg viewBox="0 0 24 24" aria-hidden="true">{playing === i.id ? <path d="M8 6h3v12H8zM13 6h3v12h-3z" /> : <path d="M8 5.5v13l10-6.5Z" />}</svg>
              </button>
              <div className="lib-meta">
                <strong>{i.title}</strong>
                <small>{i.sub}{i.groups.includes('fajr') ? ` · ${t.fajr}` : ''} · {i.kind === 'site' ? t.site : t.device}{used(i.id).length ? ` · ${used(i.id).map((p) => PRAYER_NAME[lang][p]).join('، ')}` : ''}</small>
              </div>
              <span className="lib-dur">{fmtDur(i.dur)}</span>
              <button type="button" className={favs.includes(i.id) ? 'lib-fav on' : 'lib-fav'} aria-pressed={favs.includes(i.id)} aria-label={favs.includes(i.id) ? t.unfav : t.fav} onClick={() => setFavs(toggleFav(i.id))}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 14 9l5.5.5-4.2 3.6 1.3 5.4L12 15.6l-4.6 2.9 1.3-5.4L4.5 9.5 10 9Z" /></svg>
              </button>
              <select aria-label={`${t.use}: ${i.title}`} value="" onChange={(e) => assign(i.id, e.target.value)}>
                <option value="">{t.use}…</option>
                <option value="all">{t.all}</option>
                {PRAYER_LIST.map((p) => <option key={p} value={p}>{PRAYER_NAME[lang][p]}</option>)}
              </select>
              {i.kind === 'site' && i.file && (
                <button type="button" className="btn ghost small" onClick={async () => { const f = i.file as string; if (offline[i.id]) { await dropOffline(f); setOffline({ ...offline, [i.id]: false }); } else if (await cacheOffline(f)) setOffline({ ...offline, [i.id]: true }); }}>{offline[i.id] ? t.offlineOn : t.offline}</button>
              )}
              {i.kind === 'device' && <button type="button" className="btn ghost small" onClick={async () => { await removeLocal(i.id); setLocal(await listLocal()); window.dispatchEvent(new Event('noor:adhan-lib')); if (used(i.id).length) { const sound = { ...prefs.sound }; used(i.id).forEach((p) => { sound[p] = SOUNDS[0]?.id ?? 'chime'; }); update({ ...prefs, sound }); } }}>{t.remove}</button>}
            </li>
          ))}
        </ul>
      )}
      <div className="lib-import">
        <h3>{t.import}</h3>
        <p className="note">{t.importNote}</p>
        <label className="btn">{t.import}<input ref={input} type="file" accept="audio/*,.mp3,.m4a,.ogg,.oga,.wav,.opus" multiple hidden onChange={(e) => void onFiles(e.target.files)} /></label>
        {msg && <p className="note" role="status">{msg}</p>}
      </div>
      <details className="lib-rights">
        <summary>{t.rights}</summary>
        <p>{t.rightsBody(reviewed)}</p>
        <p><a href="https://github.com/Kiwifu/adhan-mp3" rel="noopener">{t.src1}</a> · <a href="https://aladhan.com/download-adhans" rel="noopener">{t.src2}</a></p>
      </details>
    </section>
  );
}
