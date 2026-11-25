'use client';
import { useState } from 'react';

/**
 * Nearby mosques from OpenStreetMap (ODbL) via the public Overpass API. Runs only when the user taps the button;
 * the location is rounded to 2 decimals (about 1 km) before it is sent, and is not sent to our server.
 */
const ENDPOINTS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
type Place = { id: string; name: string; lat: number; lon: number; km: number };
const L = {
  ar: { find: 'ابحث عن المساجد القريبة', radius: 'المسافة', km: (n: number) => `${n} كم`, searching: 'جارٍ البحث…', none: 'لم نجد مساجد مسجّلة في الخريطة ضمن هذه المسافة. جرّب مسافة أكبر.', fail: 'تعذّر الاتصال بخدمة الخرائط الآن. حاول لاحقًا.', noGeo: 'تعذّر معرفة موقعك. اسمح بالموقع أو اختر مدينتك من الصفحة الرئيسية.', unnamed: 'مسجد (بلا اسم في الخريطة)', dist: (k: number) => `${k < 1 ? `${Math.round(k * 1000)} م` : `${k.toFixed(1)} كم`}`, map: 'الخريطة', route: 'الاتجاهات', count: (n: number) => `${n} مسجدًا`, privacy: 'عند الضغط يُرسل موقعك مقرّبًا (نحو كيلومتر) إلى خدمة Overpass العامة للبحث في خرائط OpenStreetMap، ولا يُرسل إلى خادمنا.', credit: 'بيانات الخرائط © مساهمو OpenStreetMap، بترخيص ODbL. قد تكون غير مكتملة أو قديمة.' },
  en: { find: 'Find nearby mosques', radius: 'Distance', km: (n: number) => `${n} km`, searching: 'Searching…', none: 'No mosques are mapped within this distance. Try a larger distance.', fail: 'Could not reach the map service right now. Please try later.', noGeo: 'Could not get your location. Allow location or choose your city on the home page.', unnamed: 'Mosque (no name on the map)', dist: (k: number) => `${k < 1 ? `${Math.round(k * 1000)} m` : `${k.toFixed(1)} km`}`, map: 'Map', route: 'Directions', count: (n: number) => `${n} mosques`, privacy: 'When you tap, your location — rounded to about 1 km — is sent to the public Overpass service to search OpenStreetMap. It is not sent to our server.', credit: 'Map data © OpenStreetMap contributors, licensed under ODbL. It may be incomplete or out of date.' },
};
const dist = (a: number, b: number, c: number, d: number) => {
  const r = Math.PI / 180, x = Math.sin(((c - a) * r) / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(((d - b) * r) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(x));
};

export default function MosqueFinder({ lang = 'ar' }: { lang?: 'ar' | 'en' }) {
  const t = L[lang];
  const [r, setR] = useState(3);
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState(''); const [list, setList] = useState<Place[] | null>(null);

  const where = () => new Promise<{ lat: number; lon: number }>((ok, no) => {
    const fromSaved = () => { try { const s = JSON.parse(localStorage.getItem('noor.prayer.v1') ?? 'null')?.s; if (s) return ok({ lat: s.latitude, lon: s.longitude }); } catch { /* ignore */ } no(new Error('geo')); };
    if (!('geolocation' in navigator)) return fromSaved();
    navigator.geolocation.getCurrentPosition((p) => ok({ lat: p.coords.latitude, lon: p.coords.longitude }), fromSaved, { maximumAge: 600000, timeout: 12000 });
  });

  const search = async () => {
    setBusy(true); setMsg(''); setList(null);
    let pos; try { pos = await where(); } catch { setMsg(t.noGeo); setBusy(false); return; }
    const lat = Math.round(pos.lat * 100) / 100, lon = Math.round(pos.lon * 100) / 100;
    const q = `[out:json][timeout:25];nwr["amenity"="place_of_worship"]["religion"="muslim"](around:${r * 1000},${lat},${lon});out center 80;`;
    for (const ep of ENDPOINTS) {
      try {
        const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 30000);
        const res = await fetch(ep, { method: 'POST', body: new URLSearchParams({ data: q }), signal: ctl.signal }); clearTimeout(to);
        if (!res.ok) continue;
        const j = (await res.json()) as { elements: { type: string; id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }[] };
        const places = j.elements.map((e) => {
          const la = e.lat ?? e.center?.lat ?? lat, lo = e.lon ?? e.center?.lon ?? lon; const tg = e.tags ?? {};
          return { id: `${e.type}/${e.id}`, name: (lang === 'ar' ? tg['name:ar'] ?? tg.name : tg['name:en'] ?? tg.name) ?? '', lat: la, lon: lo, km: dist(pos.lat, pos.lon, la, lo) };
        }).sort((a, b) => a.km - b.km);
        setList(places); if (!places.length) setMsg(t.none); setBusy(false); return;
      } catch { /* try next endpoint */ }
    }
    setMsg(t.fail); setBusy(false);
  };

  return (
    <div>
      <section className="card">
        <div className="row">
          <div className="field"><label htmlFor="mr">{t.radius}</label>
            <select id="mr" value={r} onChange={(e) => setR(+e.target.value)}>{[1, 3, 5, 10].map((n) => <option key={n} value={n}>{t.km(n)}</option>)}</select></div>
          <button type="button" className="btn" onClick={search} disabled={busy}>{busy ? t.searching : t.find}</button>
        </div>
        <p className="note">{t.privacy}</p>
        {msg && <p className="note" role="status">{msg}</p>}
      </section>
      {list && list.length > 0 && (
        <section className="card">
          <p className="meta"><span>{t.count(list.length)}</span></p>
          <ul className="athar-items">
            {list.map((p) => (
              <li key={p.id}>
                <span><strong>{p.name || t.unnamed}</strong> <small>· {t.dist(p.km)}</small></span>
                <span className="row" style={{ margin: 0 }}>
                  <a className="btn ghost small" href={`https://www.openstreetmap.org/${p.id}`} rel="noopener" target="_blank">{t.map}</a>
                  <a className="btn ghost small" href={`https://www.openstreetmap.org/directions?to=${p.lat}%2C${p.lon}`} rel="noopener" target="_blank">{t.route}</a>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className="note"><a href="https://www.openstreetmap.org/copyright" rel="noopener">© OpenStreetMap</a></p>
    </div>
  );
}
