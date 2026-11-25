'use client';
import { useCallback, useEffect, useState } from 'react';
import { arDigitsN } from '@/lib/arnum';

type Act = { dua: number; read: number; tasbeeh: number };
/** Sends one activity for an athar page (prayed / read / a tasbeeh round). Other components call this. */
export async function recordActivity(slug: string, kind: keyof Act) {
  try { await fetch(`/api/athar/${slug}/activity`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-noor': '1' }, body: JSON.stringify({ kind }) }); } catch { /* offline */ }
  window.dispatchEvent(new CustomEvent('noor:activity', { detail: { slug } }));
}

/**
 * «قنديل النور»: a lantern whose glow grows with the prayers, readings and tasbeeh made from this page.
 * It shows counts of acts only — never any claim about reward.
 */
export default function Lantern({ slug, name, lang = 'ar' }: { slug: string; name: string; lang?: 'ar' | 'en' }) {
  const [a, setA] = useState<Act | null>(null); const [prayed, setPrayed] = useState(false);
  const load = useCallback(async () => { try { const r = await fetch(`/api/athar/${slug}/activity`, { cache: 'no-store' }); if (r.ok) setA(await r.json()); } catch { /* offline */ } }, [slug]);
  useEffect(() => {
    void load();
    // Remember visited pages on this device so the tasbeeh page can offer them.
    try { const v = JSON.parse(localStorage.getItem('noor.athar.visited') || '{}'); v[slug] = name; localStorage.setItem('noor.athar.visited', JSON.stringify(v)); } catch { /* ignore */ }
    try { setPrayed(sessionStorage.getItem(`noor.prayed.${slug}`) === '1'); } catch { /* ignore */ }
    const on = (e: Event) => { if ((e as CustomEvent).detail?.slug === slug) void load(); };
    window.addEventListener('noor:activity', on); return () => window.removeEventListener('noor:activity', on);
  }, [slug, name, load]);
  const total = a ? a.dua + a.read + a.tasbeeh : 0;
  // Glow grows quickly at first, then slowly (log scale), so a new page already shines a little.
  const g = Math.min(1, 0.25 + Math.log10(1 + total) / 3.2);
  const n = (v: number) => (lang === 'ar' ? arDigitsN(v) : String(v));
  const pray = async () => { setPrayed(true); try { sessionStorage.setItem(`noor.prayed.${slug}`, '1'); } catch { /* ignore */ } await recordActivity(slug, 'dua'); };
  return (
    <section className="card lantern" style={{ ['--glow' as string]: g }} aria-label={lang === 'ar' ? 'قنديل النور' : 'Lantern of light'}>
      <svg viewBox="0 0 120 170" className="lantern-svg" aria-hidden="true">
        <defs><radialGradient id="lg" cx="50%" cy="58%" r="50%"><stop offset="0" stopColor="#FFF4D6" /><stop offset=".45" stopColor="#E9C77D" stopOpacity=".85" /><stop offset="1" stopColor="#C6A66B" stopOpacity="0" /></radialGradient></defs>
        <circle className="lantern-halo" cx="60" cy="98" r="58" fill="url(#lg)" />
        <path d="M60 6v14M48 20h24M44 28h32l-4 10H48z" fill="none" stroke="#C6A66B" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M46 38c-10 14-14 30-14 52 0 22 8 40 28 50 20-10 28-28 28-50 0-22-4-38-14-52z" fill="rgba(198,166,107,.12)" stroke="#C6A66B" strokeWidth="2.2" />
        <path d="M60 40v100M40 70c12 6 28 6 40 0M36 104c14 7 34 7 48 0" fill="none" stroke="rgba(198,166,107,.55)" strokeWidth="1.4" />
        <ellipse className="lantern-flame" cx="60" cy="96" rx="7" ry="13" fill="#FFE7AE" />
        <path d="M50 140h20l-4 10H54z" fill="none" stroke="#C6A66B" strokeWidth="2.2" strokeLinejoin="round" />
      </svg>
      <div>
        <p className="eyebrow">{lang === 'ar' ? 'قنديل النور' : 'Lantern of light'}</p>
        <p className="lantern-line">{a == null ? '…' : lang === 'ar'
          ? (total ? `أضاءه الزائرون ${n(total)} مرة: دعاء ${n(a.dua)} · قراءة ${n(a.read)} · تسبيح ${n(a.tasbeeh)}` : 'كن أول من يضيء هذا القنديل بدعوة.')
          : (total ? `Lit ${total} times by visitors: ${a.dua} prayers · ${a.read} readings · ${a.tasbeeh} tasbeeh` : 'Be the first to light this lantern with a prayer.')}</p>
        <button type="button" className="btn" disabled={prayed} onClick={pray}>{prayed ? (lang === 'ar' ? 'تقبّل الله دعاءك ✓' : 'May Allah accept ✓') : (lang === 'ar' ? `دعوتُ لـ${name}` : `I prayed for ${name}`)}</button>
        <p className="note">{lang === 'ar' ? 'يُعدّ الدعاء والقراءة والتسبيح من هذه الصفحة فقط، بلا أي بيانات عن الزائر.' : 'Counts acts made from this page only, with no visitor data.'}</p>
      </div>
    </section>
  );
}
