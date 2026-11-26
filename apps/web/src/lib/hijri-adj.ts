/** The user's Hijri date adjustment (−1, 0, +1 day) to match local moon sighting; kept on this device. */
export function hijriAdj(): number { if (typeof window === 'undefined') return 0; try { const v = Number(localStorage.getItem('noor.hadj')); return v === 1 || v === -1 ? v : 0; } catch { return 0; } }
/** The date to give an Umm al-Qura formatter so that it shows the adjusted Hijri day. */
export const hshift = (d: Date) => new Date(d.getTime() + hijriAdj() * 86400000);
