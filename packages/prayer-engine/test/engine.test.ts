import { describe, expect, it } from 'vitest';
import {
  formatCountdown,
  formatTime,
  getDaySchedule,
  getMonthSchedule,
  getPrayerStatus,
  hijriMonth,
  qiblaDirection,
  type PrayerSettings,
} from '../src/index';

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Reference values fetched from api.aladhan.com on 2026-11-25 for 2026-03-15
 * (an independent implementation). We allow ±2 min for rounding differences.
 */
const CASES: { name: string; s: PrayerSettings; ref: Record<string, string>; tol?: number }[] = [
  {
    name: 'Makkah / Umm al-Qura (Ramadan)',
    s: { latitude: 21.4225, longitude: 39.8262, timezone: 'Asia/Riyadh', method: 'UmmAlQura' },
    ref: { fajr: '05:14', sunrise: '06:30', dhuhr: '12:30', asr: '15:53', maghrib: '18:30', isha: '20:30' },
  },
  {
    name: 'Cairo / Egyptian',
    s: { latitude: 30.0444, longitude: 31.2357, timezone: 'Africa/Cairo', method: 'Egyptian' },
    ref: { fajr: '04:39', sunrise: '06:05', dhuhr: '12:04', asr: '15:28', maghrib: '18:03', isha: '19:20' },
  },
  {
    name: 'Jakarta / MWL',
    s: { latitude: -6.2088, longitude: 106.8456, timezone: 'Asia/Jakarta', method: 'MuslimWorldLeague' },
    ref: { fajr: '04:48', sunrise: '05:57', dhuhr: '12:02', asr: '15:11', maghrib: '18:06', isha: '19:11' },
  },
  {
    name: 'London / MWL (high latitude, middle of the night)',
    s: { latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London', method: 'MuslimWorldLeague', highLatitudeRule: 'middleOfTheNight' },
    ref: { fajr: '04:23', sunrise: '06:15', dhuhr: '12:09', asr: '15:18', maghrib: '18:05', isha: '19:51' },
    // Asr differs by 3 min at the equinox between Adhan JS and AlAdhan (algorithmic variance, see docs/PROGRESS.md)
    tol: 3,
  },
];

describe('cross-validation against AlAdhan', () => {
  for (const c of CASES) {
    it(c.name, () => {
      const day = getDaySchedule(c.s, '2026-03-15');
      for (const [p, ref] of Object.entries(c.ref)) {
        const got = formatTime(day.times[p as keyof typeof day.times], c.s.timezone);
        expect(Math.abs(toMin(got) - toMin(ref)), `${p}: got ${got}, ref ${ref}`).toBeLessThanOrEqual(c.tol ?? 2);
      }
    });
  }
});

describe('Umm al-Qura Ramadan Isha', () => {
  const s: PrayerSettings = { latitude: 21.4225, longitude: 39.8262, timezone: 'Asia/Riyadh', method: 'UmmAlQura' };
  it('detects Ramadan via the Umm al-Qura calendar', () => {
    expect(hijriMonth(2026, 3, 15)).toBe(9);
    expect(hijriMonth(2026, 11, 25)).not.toBe(9);
  });
  it('uses 120 min in Ramadan and 90 min otherwise', () => {
    const r = getDaySchedule(s, '2026-03-15');
    expect((r.times.isha.getTime() - r.times.maghrib.getTime()) / 60000).toBe(120);
    const n = getDaySchedule(s, '2026-11-25');
    expect((n.times.isha.getTime() - n.times.maghrib.getTime()) / 60000).toBe(90);
    const off = getDaySchedule({ ...s, ummAlQuraRamadanIsha: false }, '2026-03-15');
    expect((off.times.isha.getTime() - off.times.maghrib.getTime()) / 60000).toBe(90);
  });
});

describe('ordering, status and countdown', () => {
  const riyadh: PrayerSettings = { latitude: 24.7136, longitude: 46.6753, timezone: 'Asia/Riyadh', method: 'UmmAlQura' };
  it('prayers are strictly ordered every day of a year', () => {
    for (let m = 1; m <= 12; m++) {
      for (const day of getMonthSchedule(riyadh, 2026, m)) {
        const t = day.times;
        const seq = [t.fajr, t.sunrise, t.dhuhr, t.asr, t.maghrib, t.isha].map((d) => d.getTime());
        for (let i = 1; i < seq.length; i++) expect(seq[i]).toBeGreaterThan(seq[i - 1]);
        expect(day.lastThirdOfTheNight.getTime()).toBeGreaterThan(day.middleOfTheNight.getTime());
      }
    }
  });
  it('after Isha the next prayer is tomorrow’s Fajr', () => {
    const day = getDaySchedule(riyadh, '2026-11-25');
    const now = new Date(day.times.isha.getTime() + 60_000);
    const st = getPrayerStatus(riyadh, now);
    expect(st.current.name).toBe('isha');
    expect(st.next.name).toBe('fajr');
    expect(st.next.time.getTime()).toBeGreaterThan(now.getTime());
    expect(st.remainingMs).toBeGreaterThan(0);
  });
  it('before Fajr the current prayer is yesterday’s Isha', () => {
    const day = getDaySchedule(riyadh, '2026-11-25');
    const st = getPrayerStatus(riyadh, new Date(day.times.fajr.getTime() - 60_000));
    expect(st.current.name).toBe('isha');
    expect(st.next.name).toBe('fajr');
    expect(st.remainingMs).toBe(60_000);
  });
  it('between Sunrise and Dhuhr the current prayer stays Fajr', () => {
    const day = getDaySchedule(riyadh, '2026-11-25');
    const st = getPrayerStatus(riyadh, new Date(day.times.sunrise.getTime() + 60_000));
    expect(st.current.name).toBe('fajr');
    expect(st.next.name).toBe('dhuhr');
  });
  it('formats countdown', () => {
    expect(formatCountdown(3_723_000)).toBe('01:02:03');
    expect(formatCountdown(-5)).toBe('00:00:00');
  });
  it('applies manual adjustments', () => {
    const base = getDaySchedule(riyadh, '2026-11-25');
    const adj = getDaySchedule({ ...riyadh, adjustments: { fajr: 3 } }, '2026-11-25');
    expect((adj.times.fajr.getTime() - base.times.fajr.getTime()) / 60000).toBe(3);
    expect(() => getDaySchedule({ ...riyadh, adjustments: { fajr: 500 } }, '2026-11-25')).toThrow();
  });
  it('handles DST transitions (London, last Sunday of March 2026)', () => {
    const s: PrayerSettings = { latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London', method: 'MuslimWorldLeague' };
    const before = formatTime(getDaySchedule(s, '2026-03-28').times.dhuhr, s.timezone);
    const after = formatTime(getDaySchedule(s, '2026-03-29').times.dhuhr, s.timezone);
    expect(toMin(after) - toMin(before)).toBeGreaterThanOrEqual(59);
  });
  it('rejects invalid input', () => {
    expect(() => getDaySchedule({ ...riyadh, latitude: 95 }, '2026-01-01')).toThrow();
    expect(() => getDaySchedule({ ...riyadh, timezone: 'Mars/Base' }, '2026-01-01')).toThrow();
    expect(() => getDaySchedule(riyadh, '2026/01/01')).toThrow();
  });
});

describe('qibla', () => {
  it('matches known bearings (±0.5°)', () => {
    // Reference bearings from great-circle formula to the Kaaba (21.4225, 39.8262)
    expect(qiblaDirection(30.0444, 31.2357)).toBeCloseTo(136.1, 0);
    expect(qiblaDirection(51.5074, -0.1278)).toBeCloseTo(118.99, 0);
    expect(qiblaDirection(40.7128, -74.006)).toBeCloseTo(58.48, 0);
  });
});
