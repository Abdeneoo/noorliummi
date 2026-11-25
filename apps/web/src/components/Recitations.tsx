'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import surahs from '@/generated/surahs.json';
type Row = { id: number; user_id: number; display_name: string | null; surah: number; ayah_from: number; ayah_to: number; teacher_note: string; heard_at: string | null; created_at: string; expires_at: string };
const S = surahs as { index: number; name: string; ayas: number }[]; const H = { 'x-noor': '1' }; const CONSENT = 'noor.rec.ok';
const d = (s: string) => new Date(s).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' });
const ar = (n: number) => n.toLocaleString('ar-EG');
/** In a circle: the member records a recitation and sends it to the supervisor; the supervisor listens and writes a note. */
export default function Recitations({ slug, canRecord, fam }: { slug: string; canRecord: boolean; fam: boolean }) {
  const [data, setData] = useState<{ owner: boolean; rows: Row[] } | null>(null); const [msg, setMsg] = useState('');
  const [agreed, setAgreed] = useState(false); const [surah, setSurah] = useState(1); const [from, setFrom] = useState(1); const [to, setTo] = useState(7);
  const [state, setState] = useState<'idle' | 'rec' | 'ready' | 'send'>('idle'); const [secs, setSecs] = useState(0); const [blob, setBlob] = useState<Blob | null>(null); const [url, setUrl] = useState('');
  const rec = useRef<MediaRecorder | null>(null); const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const load = useCallback(async () => { const r = await fetch(`/api/recitations?circle=${slug}`, { cache: 'no-store' }); if (r.ok) setData(await r.json()); }, [slug]);
  useEffect(() => { void load(); try { setAgreed(localStorage.getItem(CONSENT) === '1'); } catch { /* ignore */ } return () => { rec.current?.state === 'recording' && rec.current.stop(); if (timer.current) clearInterval(timer.current); }; }, [load]);
  const stop = () => { if (rec.current?.state === 'recording') rec.current.stop(); if (timer.current) clearInterval(timer.current); };
  const start = async () => {
    setMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } });
      const mime = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'].find((m) => MediaRecorder.isTypeSupported(m)) ?? '';
      const r = new MediaRecorder(stream, { ...(mime ? { mimeType: mime } : {}), audioBitsPerSecond: 32000 }); const chunks: Blob[] = []; rec.current = r;
      r.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      r.onstop = () => { stream.getTracks().forEach((t) => t.stop()); const b = new Blob(chunks, { type: r.mimeType || 'audio/webm' }); setBlob(b); setUrl(URL.createObjectURL(b)); setState('ready'); };
      r.start(); setSecs(0); setState('rec'); timer.current = setInterval(() => setSecs((v) => { if (v >= 299) stop(); return v + 1; }), 1000);
    } catch { setMsg('تعذّر استخدام الميكروفون. اسمح به من إعدادات المتصفح.'); }
  };
  const discard = () => { if (url) URL.revokeObjectURL(url); setBlob(null); setUrl(''); setState('idle'); };
  const send = async () => {
    if (!blob) return; setState('send');
    const r = await fetch(`/api/recitations?circle=${slug}&surah=${surah}&from=${from}&to=${to}`, { method: 'POST', headers: { ...H, 'x-consent': '1', 'content-type': blob.type.split(';')[0] || 'audio/webm' }, body: blob });
    if (r.ok) { discard(); setMsg('أُرسل التسميع.'); void load(); } else { setMsg((await r.json().catch(() => ({}))).error ?? 'تعذّر الإرسال.'); setState('ready'); }
  };
  const del = async (id: number) => { if (!confirm('حذف هذا التسجيل نهائيًا؟')) return; await fetch(`/api/recitations/${id}`, { method: 'DELETE', headers: H }); void load(); };
  const note = async (id: number, old: string) => { const t = prompt('ملاحظتك على هذا التسميع (تظهر للطالب):', old); if (t == null) return; await fetch(`/api/recitations/${id}`, { method: 'POST', headers: { ...H, 'content-type': 'application/json' }, body: JSON.stringify({ note: t }) }); void load(); };
  const max = S[surah - 1].ayas;
  return (
    <section className="card"><h2 style={{ marginTop: 0 }}>التسميع الصوتي</h2>
      {msg && <p className="note" role="status">{msg}</p>}
      {canRecord && (!agreed ? (
        <div>
          <p>قبل أول تسجيل، اقرأ ووافق:</p>
          <ul className="note"><li>لا يبدأ التسجيل إلا بضغطك، وتسمعه قبل الإرسال، ولك ألا ترسله.</li><li>يُحفظ التسجيل على خادم الموقع بصورة خاصة، ولا يسمعه إلا {fam ? 'وليّ الأمر' : 'المعلّم'} المشرف على هذه المجموعة وأنت. لا رابط عام له.</li>
            <li>يُحذف تلقائيًا بعد ٣٠ يومًا، وتستطيع حذفه في أي وقت، ويُحذف عند مغادرتك المجموعة أو حذف حسابك.</li><li>لا يُرسل إلى أي جهة خارجية، ولا يُستخدم لتدريب أي نموذج ذكاء اصطناعي.</li><li>إن كنت دون الثامنة عشرة فسجّل بعلم وليّ أمرك وموافقته.</li></ul>
          <button type="button" className="btn" onClick={() => { try { localStorage.setItem(CONSENT, '1'); } catch { /* ignore */ } setAgreed(true); }}>قرأت وأوافق</button>
        </div>) : (
        <div>
          <div className="row" style={{ marginTop: 0 }}>
            <div className="field"><label htmlFor="rc-s">السورة</label><select id="rc-s" value={surah} onChange={(e) => { const v = Number(e.target.value); setSurah(v); setFrom(1); setTo(Math.min(7, S[v - 1].ayas)); }}>{S.map((x) => <option key={x.index} value={x.index}>{ar(x.index)}. {x.name}</option>)}</select></div>
            <div className="field" style={{ flex: '0 1 90px' }}><label htmlFor="rc-f">من الآية</label><input id="rc-f" type="number" min={1} max={max} value={from} onChange={(e) => setFrom(Math.max(1, Math.min(max, Number(e.target.value) || 1)))} /></div>
            <div className="field" style={{ flex: '0 1 90px' }}><label htmlFor="rc-t">إلى الآية</label><input id="rc-t" type="number" min={from} max={max} value={to} onChange={(e) => setTo(Math.max(from, Math.min(max, Number(e.target.value) || from)))} /></div>
          </div>
          <div className="row">
            {state === 'idle' && <button type="button" className="btn" onClick={start}>ابدأ التسجيل</button>}
            {state === 'rec' && <button type="button" className="btn" onClick={stop}><span className="spin" aria-hidden="true" /> يسجّل… {ar(Math.floor(secs / 60))}:{ar(secs % 60).padStart(2, '٠')} — اضغط للإيقاف</button>}
            {(state === 'ready' || state === 'send') && <><audio controls src={url} style={{ flex: '1 1 240px' }} /><button type="button" className="btn" disabled={state === 'send'} onClick={send}>{state === 'send' ? 'جارٍ الإرسال…' : 'أرسل للمشرف'}</button><button type="button" className="btn ghost" onClick={discard}>احذف وأعد</button></>}
          </div>
          <p className="note">الحد خمس دقائق للتسجيل الواحد.</p>
        </div>))}
      {data && data.rows.length > 0 && <ul className="tafsir-list" style={{ listStyle: 'none', padding: 0, marginTop: 14 }}>
        {data.rows.map((r) => (
          <li key={r.id} className="card">
            <p className="meta"><span>{data.owner ? `${r.display_name ?? 'عضو'} — ` : ''}سورة {S[r.surah - 1].name}، الآيات {ar(r.ayah_from)} إلى {ar(r.ayah_to)}</span><span>{d(r.created_at)}</span><span>يُحذف {d(r.expires_at)}</span></p>
            <audio controls preload="none" src={`/api/recitations/${r.id}`} style={{ width: '100%' }} />
            {r.teacher_note && <p><strong>ملاحظة المشرف:</strong> {r.teacher_note}</p>}
            <div className="row">{data.owner ? <button type="button" className="btn ghost small" onClick={() => note(r.id, r.teacher_note)}>{r.teacher_note ? 'عدّل الملاحظة' : 'اكتب ملاحظة'}</button>
              : <><span className="note" style={{ margin: 0 }}>{r.heard_at ? 'استمع إليه المشرف ✓' : 'لم يُستمع إليه بعد'}</span><button type="button" className="btn ghost small" onClick={() => del(r.id)}>احذف التسجيل</button></>}</div>
          </li>))}
      </ul>}
      {data && data.rows.length === 0 && !canRecord && <p className="note">لا تسجيلات بعد.</p>}
    </section>
  );
}
