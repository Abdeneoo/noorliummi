'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import juzStart from '@/generated/juz.json';
import { SURAHS } from '@/lib/quran';
import { arDigitsN as ar } from '@/lib/arnum';
import GroupDhikr from './GroupDhikr';
import QrButton from './QrButton';

type Juz = { juz: number; reader: string; done: boolean; mine?: boolean };
type K = { slug: string; display_name: string; feminine: boolean; athar_slug: string | null; round: number; juz: Juz[]; kind: 'quran' | 'dhikr' | 'dua'; phrase: number; target: number; count: number };
const J = juzStart as [number, number][];
const TOK = (slug: string) => `noor.khatma.claims.${slug}`;
const ADMIN = (slug: string) => `noor.khatma.admin.${slug}`;
const READER = 'noor.khatma.reader';
const load = (k: string): Record<string, string> => { try { return JSON.parse(localStorage.getItem(k) || '{}'); } catch { return {}; } };
const store = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage full or blocked */ } };
const post = (slug: string, body: unknown) => fetch(`/api/khatma/${slug}`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-noor': '1' }, body: JSON.stringify(body) });

export default function KhatmaBoard({ slug, dua }: { slug: string; dua: { masc: string; fem: string; ref: string } }) {
  const [k, setK] = useState<K | null>(null); const [err, setErr] = useState(''); const [busy, setBusy] = useState(0);
  const [reader, setReader] = useState(''); const [admin, setAdmin] = useState(''); const [copied, setCopied] = useState(false);
  const claims = useCallback(() => load(TOK(slug)), [slug]);
  const refresh = useCallback(async () => {
    const r = await fetch(`/api/khatma/${slug}?t=${Object.values(claims()).join(',')}`, { cache: 'no-store' });
    if (r.ok) setK(await r.json()); else setErr('تعذّر تحميل الختمة.');
  }, [slug, claims]);
  useEffect(() => {
    try { setReader(localStorage.getItem(READER) || ''); } catch { /* ignore */ }
    const m = location.hash.match(/k=([a-f0-9]{64})/); if (m) { store(ADMIN(slug), m[1]); history.replaceState(null, '', location.pathname); }
    { const a: unknown = load(ADMIN(slug)); setAdmin(typeof a === 'string' ? a : ''); } void refresh();
    const t = setInterval(() => { if (document.visibilityState === 'visible') void refresh(); }, 30000);
    return () => clearInterval(t);
  }, [slug, refresh]);

  const act = async (juz: number, action: 'claim' | 'done' | 'release' | 'free') => {
    setBusy(juz); setErr('');
    const c = claims();
    const body = action === 'claim' ? { action, juz, reader } : action === 'free' ? { action, juz, token: admin } : { action, juz, token: c[`${k?.round}:${juz}`] };
    const r = await post(slug, body); const j = await r.json().catch(() => ({}));
    if (!r.ok) setErr(j.error ?? 'تعذّر الحفظ.');
    else if (action === 'claim') { c[`${k?.round}:${juz}`] = j.token; store(TOK(slug), c); try { localStorage.setItem(READER, reader); } catch { /* ignore */ } }
    setBusy(0); void refresh();
  };
  const round = async () => { const r = await post(slug, { action: 'round' }); if (r.ok) void refresh(); };
  const share = async () => {
    const url = `${location.origin}/khatma/${slug}`; const text = k?.kind === 'dhikr' ? `ذكر جماعي مُهدى إلى ${k.display_name}. شارك معنا:` : k?.kind === 'dua' ? `ادعُ لـ${k.display_name}:` : `ختمة قرآن مُهداة إلى ${k?.display_name}. اختر جزءًا واقرأه:`;
    if (navigator.share) { try { await navigator.share({ title: 'ختمة جماعية', text, url }); return; } catch { /* cancelled */ } }
    await navigator.clipboard?.writeText(`${text} ${url}`); setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  if (!k) return <p className="note" role="status">{err || 'جارٍ التحميل…'}</p>;
  if (k.kind !== 'quran') return <GroupDhikr g={{ ...k, kind: k.kind }} dua={dua} onShare={share} copied={copied} />;
  const by = new Map(k.juz.map((j) => [j.juz, j]));
  const done = k.juz.filter((j) => j.done).length; const taken = k.juz.length;
  const complete = done === 30;
  const pct = Math.round((done / 30) * 100);
  return (
    <div className="khatma-group">
      <section className="card kg-head">
        <p className="eyebrow">ختمة جماعية{k.round > 1 ? ` · الختمة ${ar(k.round)}` : ''}</p>
        <h1>ختمة مُهداة إلى {k.display_name}</h1>
        <div className="khatma-bar" role="progressbar" aria-valuemin={0} aria-valuemax={30} aria-valuenow={done} aria-label="الأجزاء المقروءة"><span style={{ width: `${pct}%` }} /></div>
        <p className="note">قُرئ {ar(done)} من ٣٠ جزءًا · محجوز {ar(taken - done)} · متاح {ar(30 - taken)}</p>
        <div className="row"><button type="button" className="btn" onClick={share}>{copied ? 'نُسخ الرابط ✓' : 'شارك الرابط مع العائلة'}</button>
          {k.athar_slug && <Link className="btn ghost" href={`/athar/${k.athar_slug}`}>صفحة الأثر</Link>}</div>
        <QrButton path={`/khatma/${slug}`} caption={`ختمة مُهداة إلى ${k.display_name}`} />
      </section>

      {complete && (
        <section className="card kg-done" aria-live="polite">
          <p className="eyebrow">تمّت الختمة بفضل الله</p>
          <h2>ادعوا لـ{k.display_name}</h2>
          <p lang="ar" className="kg-dua">{k.feminine ? dua.fem : dua.masc}</p>
          <p className="note">{dua.ref}. لم يثبت عن النبي ﷺ دعاء مخصوص لختم القرآن، فادعوا بما تيسّر.</p>
          <button type="button" className="btn" onClick={round}>ابدأ ختمة جديدة</button>
        </section>
      )}

      {!complete && (
        <section className="card">
          <div className="field"><label htmlFor="kr">اسمك (اختياري، يظهر للعائلة بجانب الجزء)</label>
            <input id="kr" value={reader} maxLength={40} onChange={(e) => setReader(e.target.value)} placeholder="مثلًا: أبو أحمد" /></div>
          {err && <p className="note" role="alert">{err}</p>}
          <ol className="kg-grid">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => {
              const j = by.get(n); const [s, a] = J[n - 1];
              const cls = j?.done ? 'done' : j ? (j.mine ? 'mine' : 'taken') : 'free';
              return (
                <li key={n} className={`kg-juz ${cls}`}>
                  <strong>الجزء {ar(n)}</strong>
                  <small>{SURAHS[s - 1].name} {ar(a)}</small>
                  {j?.done ? <span className="kg-state">✓ قُرئ{j.reader ? ` · ${j.reader}` : ''}</span>
                    : j?.mine ? <>
                        <Link className="btn small" href={`/quran/${s}#a${a}`}>اقرأ</Link>
                        <button type="button" className="btn small" disabled={busy === n} onClick={() => act(n, 'done')}>أتممت القراءة</button>
                        <button type="button" className="btn ghost small" disabled={busy === n} onClick={() => act(n, 'release')}>اترك الجزء</button>
                      </>
                    : j ? <span className="kg-state">محجوز{j.reader ? ` · ${j.reader}` : ''}{admin && <button type="button" className="linkish" onClick={() => act(n, 'free')}> (إتاحة)</button>}</span>
                    : <button type="button" className="btn ghost small" disabled={busy === n} onClick={() => act(n, 'claim')}>احجز هذا الجزء</button>}
                </li>
              );
            })}
          </ol>
          <p className="note">حجزك محفوظ على هذا الجهاز؛ من جهاز آخر لن تستطيع تعديله. لا يلزم تسجيل دخول.</p>
        </section>
      )}
    </div>
  );
}
