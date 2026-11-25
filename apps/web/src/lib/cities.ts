import type { MethodId } from '@noor/prayer-engine';
export interface City { id: string; ar: string; en: string; lat: number; lng: number; tz: string; method: MethodId }
/** Starter list for manual selection (no location permission needed). Coordinates are city centres. */
export const CITIES: City[] = [
  { id: 'makkah', ar: 'مكة المكرمة', en: 'Makkah', lat: 21.4225, lng: 39.8262, tz: 'Asia/Riyadh', method: 'UmmAlQura' },
  { id: 'madinah', ar: 'المدينة المنورة', en: 'Madinah', lat: 24.4672, lng: 39.6112, tz: 'Asia/Riyadh', method: 'UmmAlQura' },
  { id: 'riyadh', ar: 'الرياض', en: 'Riyadh', lat: 24.7136, lng: 46.6753, tz: 'Asia/Riyadh', method: 'UmmAlQura' },
  { id: 'jeddah', ar: 'جدة', en: 'Jeddah', lat: 21.5433, lng: 39.1728, tz: 'Asia/Riyadh', method: 'UmmAlQura' },
  { id: 'dammam', ar: 'الدمام', en: 'Dammam', lat: 26.4207, lng: 50.0888, tz: 'Asia/Riyadh', method: 'UmmAlQura' },
  { id: 'cairo', ar: 'القاهرة', en: 'Cairo', lat: 30.0444, lng: 31.2357, tz: 'Africa/Cairo', method: 'Egyptian' },
  { id: 'alexandria', ar: 'الإسكندرية', en: 'Alexandria', lat: 31.2001, lng: 29.9187, tz: 'Africa/Cairo', method: 'Egyptian' },
  { id: 'dubai', ar: 'دبي', en: 'Dubai', lat: 25.2048, lng: 55.2708, tz: 'Asia/Dubai', method: 'Dubai' },
  { id: 'kuwait', ar: 'الكويت', en: 'Kuwait City', lat: 29.3759, lng: 47.9774, tz: 'Asia/Kuwait', method: 'Kuwait' },
  { id: 'doha', ar: 'الدوحة', en: 'Doha', lat: 25.2854, lng: 51.531, tz: 'Asia/Qatar', method: 'Qatar' },
  { id: 'amman', ar: 'عمّان', en: 'Amman', lat: 31.9539, lng: 35.9106, tz: 'Asia/Amman', method: 'MuslimWorldLeague' },
  { id: 'jerusalem', ar: 'القدس', en: 'Jerusalem', lat: 31.7683, lng: 35.2137, tz: 'Asia/Jerusalem', method: 'MuslimWorldLeague' },
  { id: 'istanbul', ar: 'إسطنبول', en: 'Istanbul', lat: 41.0082, lng: 28.9784, tz: 'Europe/Istanbul', method: 'Turkey' },
  { id: 'casablanca', ar: 'الدار البيضاء', en: 'Casablanca', lat: 33.5731, lng: -7.5898, tz: 'Africa/Casablanca', method: 'MuslimWorldLeague' },
  { id: 'karachi', ar: 'كراتشي', en: 'Karachi', lat: 24.8607, lng: 67.0011, tz: 'Asia/Karachi', method: 'Karachi' },
  { id: 'jakarta', ar: 'جاكرتا', en: 'Jakarta', lat: -6.2088, lng: 106.8456, tz: 'Asia/Jakarta', method: 'Singapore' },
  { id: 'kualalumpur', ar: 'كوالالمبور', en: 'Kuala Lumpur', lat: 3.139, lng: 101.6869, tz: 'Asia/Kuala_Lumpur', method: 'Singapore' },
  { id: 'london', ar: 'لندن', en: 'London', lat: 51.5074, lng: -0.1278, tz: 'Europe/London', method: 'MoonsightingCommittee' },
  { id: 'paris', ar: 'باريس', en: 'Paris', lat: 48.8566, lng: 2.3522, tz: 'Europe/Paris', method: 'MuslimWorldLeague' },
  { id: 'newyork', ar: 'نيويورك', en: 'New York', lat: 40.7128, lng: -74.006, tz: 'America/New_York', method: 'NorthAmerica' },
];

/** Calculation method conventionally used in a region, chosen from the device timezone (no location needed). */
const TZ_METHOD: [RegExp, MethodId][] = [
  [/^Asia\/Riyadh$/, 'UmmAlQura'], [/^Africa\/Cairo$/, 'Egyptian'], [/^Asia\/Dubai$/, 'Dubai'], [/^Asia\/Kuwait$/, 'Kuwait'], [/^Asia\/Qatar$/, 'Qatar'],
  [/^Europe\/Istanbul$/, 'Turkey'], [/^Asia\/Tehran$/, 'Tehran'], [/^Asia\/(Karachi|Kolkata|Dhaka|Kabul)$/, 'Karachi'],
  [/^Asia\/(Singapore|Kuala_Lumpur|Jakarta|Makassar|Jayapura|Brunei)$/, 'Singapore'], [/^America\//, 'NorthAmerica'], [/^Europe\/London$/, 'MoonsightingCommittee'],
];
export function methodForTimezone(tz: string): MethodId {
  return TZ_METHOD.find(([re]) => re.test(tz))?.[1] ?? 'MuslimWorldLeague';
}
/** A sensible starting city for the device timezone, before any location permission. */
export function cityForTimezone(tz: string): City | undefined {
  return CITIES.find((c) => c.tz === tz && c.id !== 'makkah' && c.id !== 'madinah' && c.id !== 'jeddah' && c.id !== 'dammam' && c.id !== 'alexandria') ?? CITIES.find((c) => c.tz === tz);
}
/** Nearest listed city and its distance (km), for a friendly label only. */
export function nearestCityDist(lat: number, lng: number): { city: City; km: number } {
  let best = CITIES[0]; let bd = Infinity;
  for (const c of CITIES) {
    const dLat = (c.lat - lat) * 111; const dLng = (c.lng - lng) * 111 * Math.cos((lat * Math.PI) / 180);
    const d = Math.hypot(dLat, dLng); if (d < bd) { bd = d; best = c; }
  }
  return { city: best, km: bd };
}
/** Nearest listed city within ~60 km, for a friendly label only. */
export function nearestCity(lat: number, lng: number): City | undefined {
  let best: City | undefined; let bd = Infinity;
  for (const c of CITIES) {
    const dLat = (c.lat - lat) * 111; const dLng = (c.lng - lng) * 111 * Math.cos((lat * Math.PI) / 180);
    const d = Math.hypot(dLat, dLng); if (d < bd) { bd = d; best = c; }
  }
  return bd <= 60 ? best : undefined;
}

/** Language-neutral place label for saved prayer settings (older data has only the Arabic label). */
export function placeLabel(v: { label: string; cid?: string; near?: boolean; src?: string }, lang: 'ar' | 'en'): string {
  const city = v.cid ? CITIES.find((c) => c.id === v.cid) : CITIES.find((c) => v.label === c.ar || v.label === `قرب ${c.ar}` || v.label === `${c.ar} (موقعك)`);
  const near = v.cid ? !!v.near : !!city && v.label.startsWith('قرب ');
  if (!city) return lang === 'ar' ? (v.label || 'موقعك الحالي') : 'Your location';
  const name = lang === 'ar' ? city.ar : city.en;
  return near ? (lang === 'ar' ? `قرب ${name}` : `near ${name}`) : name;
}
