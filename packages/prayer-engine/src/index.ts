/**
 * @noor/prayer-engine
 * محرك مواقيت الصلاة والقبلة لمنصة نور لأمي.
 *
 * يعمل محليًا بالكامل (دون إنترنت) فوق مكتبة Adhan JS (MIT, Batoul Apps).
 * الحسابات فلكية تقريبية وقد تختلف بدقائق عن الجداول الرسمية المحلية؛
 * لذلك تدعم المكتبة تعديلات يدوية لكل صلاة، ويجب عرض هذا التنبيه للمستخدم.
 */
import {
  CalculationMethod,
  CalculationParameters,
  Coordinates,
  HighLatitudeRule,
  Madhab,
  PrayerTimes,
  Qibla,
  SunnahTimes,
} from 'adhan';

export const PRAYERS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
export type PrayerName = (typeof PRAYERS)[number];

export const METHODS = {
  UmmAlQura: { ar: 'أم القرى (مكة المكرمة)', en: 'Umm al-Qura, Makkah' },
  Egyptian: { ar: 'الهيئة المصرية العامة للمساحة', en: 'Egyptian General Authority of Survey' },
  MuslimWorldLeague: { ar: 'رابطة العالم الإسلامي', en: 'Muslim World League' },
  Karachi: { ar: 'جامعة العلوم الإسلامية، كراتشي', en: 'University of Islamic Sciences, Karachi' },
  Dubai: { ar: 'دبي', en: 'Dubai' },
  Kuwait: { ar: 'الكويت', en: 'Kuwait' },
  Qatar: { ar: 'قطر', en: 'Qatar' },
  Singapore: { ar: 'سنغافورة', en: 'Singapore' },
  Turkey: { ar: 'رئاسة الشؤون الدينية التركية', en: 'Diyanet, Turkey' },
  Tehran: { ar: 'معهد الجيوفيزياء، طهران', en: 'Institute of Geophysics, Tehran' },
  NorthAmerica: { ar: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)', en: 'ISNA, North America' },
  MoonsightingCommittee: { ar: 'لجنة رؤية الهلال', en: 'Moonsighting Committee Worldwide' },
} as const;
export type MethodId = keyof typeof METHODS;

export type AsrMadhab = 'shafi' | 'hanafi';
export type HighLatRule = 'middleOfTheNight' | 'seventhOfTheNight' | 'twilightAngle' | 'auto';

export interface PrayerSettings {
  latitude: number;
  longitude: number;
  /** IANA timezone, e.g. "Asia/Riyadh". Used only for formatting & day boundaries. */
  timezone: string;
  method: MethodId;
  asr?: AsrMadhab;
  highLatitudeRule?: HighLatRule;
  /** Manual per-prayer adjustments in minutes (to match an official local table). */
  adjustments?: Partial<Record<PrayerName, number>>;
  /** Umm al-Qura only: use Isha = Maghrib + 120 min in Ramadan (default true). */
  ummAlQuraRamadanIsha?: boolean;
}

/** Hijri month (1-12) of a Gregorian date using the Umm al-Qura calendar (ICU). */
export function hijriMonth(y: number, m: number, d: number): number {
  const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { month: 'numeric', timeZone: 'UTC' }).formatToParts(
    new Date(Date.UTC(y, m - 1, d, 12)),
  );
  return Number(parts.find((p) => p.type === 'month')!.value);
}

export interface DaySchedule {
  /** Calendar date (YYYY-MM-DD) in the given timezone. */
  date: string;
  times: Record<PrayerName, Date>;
  /** Islamic midnight: midpoint between Maghrib and next Fajr. */
  middleOfTheNight: Date;
  /** Start of the last third of the night (Maghrib → next Fajr). */
  lastThirdOfTheNight: Date;
}

function assertCoordinates(lat: number, lng: number): void {
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) throw new RangeError(`Invalid latitude: ${lat}`);
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) throw new RangeError(`Invalid longitude: ${lng}`);
}

function assertTimezone(tz: string): void {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
  } catch {
    throw new RangeError(`Invalid timezone: ${tz}`);
  }
}

export function buildParameters(s: PrayerSettings): CalculationParameters {
  const factory = (CalculationMethod as unknown as Record<string, () => CalculationParameters>)[s.method];
  if (!factory) throw new RangeError(`Unknown method: ${s.method}`);
  const params = factory();
  params.madhab = s.asr === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  const rule = s.highLatitudeRule ?? 'auto';
  params.highLatitudeRule =
    rule === 'auto'
      ? HighLatitudeRule.recommended(new Coordinates(s.latitude, s.longitude))
      : rule === 'seventhOfTheNight'
        ? HighLatitudeRule.SeventhOfTheNight
        : rule === 'twilightAngle'
          ? HighLatitudeRule.TwilightAngle
          : HighLatitudeRule.MiddleOfTheNight;
  const adj = s.adjustments ?? {};
  for (const p of PRAYERS) {
    const v = adj[p];
    if (v !== undefined) {
      if (!Number.isInteger(v) || Math.abs(v) > 60) throw new RangeError(`Adjustment for ${p} must be an integer within ±60 minutes`);
      params.adjustments[p] = v;
    }
  }
  return params;
}

/** Y/M/D parts of an instant as seen in a timezone. */
export function zonedDateParts(instant: Date, timezone: string): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instant);
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  return { y: get('year'), m: get('month'), d: get('day') };
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Schedule for a calendar date. `date` is "YYYY-MM-DD" interpreted in settings.timezone.
 */
export function getDaySchedule(s: PrayerSettings, date: string): DaySchedule {
  assertCoordinates(s.latitude, s.longitude);
  assertTimezone(s.timezone);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) throw new RangeError(`Date must be YYYY-MM-DD: ${date}`);
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const coords = new Coordinates(s.latitude, s.longitude);
  const params = buildParameters(s);
  // Umm al-Qura uses Isha = Maghrib + 120 min during Ramadan (90 min otherwise).
  // adhan-js does not apply this automatically; detect Ramadan with the Umm al-Qura calendar.
  if (s.method === 'UmmAlQura' && s.ummAlQuraRamadanIsha !== false && hijriMonth(y, mo, d) === 9) {
    params.ishaInterval = 120;
  }
  // adhan-js reads the local Y/M/D of the Date object; build it in local time with those components.
  const pt = new PrayerTimes(coords, new Date(y, mo - 1, d), params);
  const sunnah = new SunnahTimes(pt);
  return {
    date,
    times: {
      fajr: pt.fajr,
      sunrise: pt.sunrise,
      dhuhr: pt.dhuhr,
      asr: pt.asr,
      maghrib: pt.maghrib,
      isha: pt.isha,
    },
    middleOfTheNight: sunnah.middleOfTheNight,
    lastThirdOfTheNight: sunnah.lastThirdOfTheNight,
  };
}

export function getScheduleForInstant(s: PrayerSettings, instant: Date): DaySchedule {
  const { y, m, d } = zonedDateParts(instant, s.timezone);
  return getDaySchedule(s, `${y}-${pad(m)}-${pad(d)}`);
}

function shiftDate(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

export interface PrayerStatus {
  /** The obligatory prayer whose time is current (sunrise is excluded), or null before today's Fajr is handled via yesterday's Isha. */
  current: { name: Exclude<PrayerName, 'sunrise'>; time: Date };
  next: { name: Exclude<PrayerName, 'sunrise'>; time: Date };
  /** Milliseconds until `next`. */
  remainingMs: number;
}

const OBLIGATORY = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

/** Current and next obligatory prayer at `now`, crossing day boundaries correctly. */
export function getPrayerStatus(s: PrayerSettings, now: Date): PrayerStatus {
  const today = getScheduleForInstant(s, now);
  const yesterday = getDaySchedule(s, shiftDate(today.date, -1));
  const tomorrow = getDaySchedule(s, shiftDate(today.date, 1));
  const timeline = [
    { name: 'isha' as const, time: yesterday.times.isha },
    ...OBLIGATORY.map((n) => ({ name: n, time: today.times[n] })),
    { name: 'fajr' as const, time: tomorrow.times.fajr },
  ];
  let idx = 0;
  for (let i = 0; i < timeline.length; i++) if (timeline[i].time.getTime() <= now.getTime()) idx = i;
  const current = timeline[idx];
  const next = timeline[idx + 1];
  return { current, next, remainingMs: next.time.getTime() - now.getTime() };
}

/** Monthly table. month is 1-12. */
export function getMonthSchedule(s: PrayerSettings, year: number, month: number): DaySchedule[] {
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return Array.from({ length: days }, (_, i) => getDaySchedule(s, `${year}-${pad(month)}-${pad(i + 1)}`));
}

/** Qibla bearing in degrees clockwise from TRUE north. */
export function qiblaDirection(latitude: number, longitude: number): number {
  assertCoordinates(latitude, longitude);
  return Qibla(new Coordinates(latitude, longitude));
}

/** Format an instant as HH:mm in a timezone (24h, Latin digits by default). */
export function formatTime(instant: Date, timezone: string, locale = 'en-GB', hour12 = false): string {
  return new Intl.DateTimeFormat(locale, { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12 }).format(instant);
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
}
