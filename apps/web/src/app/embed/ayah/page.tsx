import { ayahOfDay } from '@/lib/daily';
import { arDigits } from '@/lib/quran';
export const revalidate = 3600;
/** Embeddable «آية اليوم» card: <iframe src="https://…/embed/ayah" width="100%" height="260" style="border:0"></iframe> */
export default async function EmbedAyah() {
  const d = new Date(Date.now() + 3 * 3600_000).toISOString().slice(0, 10);
  const a = await ayahOfDay(d);
  const site = (process.env.SITE_URL || 'https://staging.noorliummi.io').replace(/\/$/, '');
  return (
    <a href={`${site}/quran/${a.s}#a${a.a}`} target="_blank" rel="noopener" style={{ display: 'block', textDecoration: 'none', color: '#F3E9D2', background: 'linear-gradient(160deg,#0B1F19,#163a30)', borderRadius: 18, padding: '18px 20px', fontFamily: "'IBM Plex Sans Arabic',sans-serif", border: '1px solid rgba(198,166,107,.45)' }}>
      <div style={{ color: '#C6A66B', fontSize: 13 }}>آية اليوم</div>
      <p style={{ fontFamily: "'Amiri Quran',serif", fontSize: 21, lineHeight: 2.1, margin: '8px 0' }}>{a.t} ﴿{arDigits(a.a)}﴾</p>
      <div style={{ fontSize: 13, opacity: .8 }}>سورة {a.name}، الآية {arDigits(a.a)} — نور لأمي</div>
    </a>
  );
}
