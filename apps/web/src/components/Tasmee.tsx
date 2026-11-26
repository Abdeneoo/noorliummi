'use client';
import { useEffect, useRef, useState } from 'react';
import { compare } from '@/lib/tasmee';
import { SilentError, toWav16k } from '@/lib/wav';
type Rec = { lang: string; interimResults: boolean; continuous: boolean; maxAlternatives: number; start(): void; stop(): void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null; onerror: ((e: { error: string }) => void) | null; onend: (() => void) | null };
const CONSENT = 'noor.tasmee.ok'; const CONSENT_SRV = 'noor.tasmee.srv';
/**
 * «سمّع بصوتك»: the user recites the ayah from memory; the browser's own speech recognition turns it into text and
 * the words are compared with the ayah. This site never receives or stores the audio. Asked once for consent because
 * some browsers send the audio to their speech service.
 */
export default function Tasmee({ ayah, lang = 'ar', onResult }: { ayah: string; lang?: 'ar' | 'en'; onResult?: (score: number) => void }) {
  const ar = lang === 'ar';
  const [supported, setSupported] = useState(true); const [ask, setAsk] = useState(false); const [on, setOn] = useState(false); const [err, setErr] = useState('');
  const [res, setRes] = useState<ReturnType<typeof compare> | null>(null);
  const rec = useRef<Rec | null>(null); const heard = useRef('');
  const [srv, setSrv] = useState(false); const [askSrv, setAskSrv] = useState(false); const [busy, setBusy] = useState(false); const mr = useRef<MediaRecorder | null>(null); const chunks = useRef<Blob[]>([]); const timer = useRef<number | null>(null);
  useEffect(() => { const w = window as unknown as Record<string, unknown>; setSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition)); fetch('/api/tasmee/status').then((r) => r.json()).then((j) => setSrv(!!j.up && typeof MediaRecorder !== 'undefined')).catch(() => {}); return () => { rec.current?.stop(); mr.current?.stop(); }; }, []);
  // Server mode (Tarteel model on this site's own server): record → 16 kHz WAV in the browser → our server → text. Audio is not stored.
  const startSrv = async () => {
    setRes(null); setErr('');
    let stream: MediaStream; try { stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } }); } catch { setErr(ar ? 'لم يُسمح باستخدام الميكروفون.' : 'Microphone permission was denied.'); return; }
    const m = new MediaRecorder(stream); mr.current = m; chunks.current = [];
    m.ondataavailable = (e) => { if (e.data.size) chunks.current.push(e.data); };
    m.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop()); if (timer.current) clearTimeout(timer.current); setOn(false); setBusy(true);
      try {
        const wav = await toWav16k(new Blob(chunks.current, { type: m.mimeType }));
        const r = await fetch('/api/tasmee/check', { method: 'POST', headers: { 'content-type': 'audio/wav', 'x-noor': '1' }, body: wav });
        const j = await r.json(); if (!r.ok) { setErr(j.error || (ar ? 'تعذّر التسميع.' : 'Check failed.')); return; }
        if (!String(j.text || '').trim()) { setErr(ar ? 'لم يُسمع شيء واضح. اقترب من الميكروفون وحاول مرة أخرى.' : 'Nothing clear was heard. Try again closer to the microphone.'); return; }
        const c = compare(ayah, j.text); setRes(c); onResult?.(c.score);
      } catch (e) { setErr(e instanceof SilentError ? (ar ? 'لم يُسمع صوت واضح. اقترب من الميكروفون وحاول مرة أخرى.' : 'No clear voice was heard. Try again closer to the microphone.') : (ar ? 'تعذّر التسميع. حاول مرة أخرى.' : 'Check failed. Try again.')); } finally { setBusy(false); }
    };
    m.start(); setOn(true); timer.current = window.setTimeout(() => m.state === 'recording' && m.stop(), 75_000);
  };
  const beginSrv = () => { let ok = false; try { ok = localStorage.getItem(CONSENT_SRV) === '1'; } catch { /* ignore */ } if (ok) startSrv(); else setAskSrv(true); };
  useEffect(() => { setRes(null); setErr(''); rec.current?.stop(); }, [ayah]);
  const start = () => {
    const w = window as unknown as Record<string, new () => Rec>; const C = w.SpeechRecognition || w.webkitSpeechRecognition;
    const r = new C(); rec.current = r; heard.current = ''; r.lang = 'ar-SA'; r.interimResults = false; r.continuous = true; r.maxAlternatives = 1;
    r.onresult = (e) => { let t = ''; for (let i = 0; i < e.results.length; i++) t += ` ${e.results[i][0].transcript}`; heard.current = t; };
    r.onerror = (e) => { setErr(e.error === 'not-allowed' ? (ar ? 'لم يُسمح باستخدام الميكروفون.' : 'Microphone permission was denied.') : (ar ? 'تعذّر التعرّف على الصوت. حاول في مكان هادئ.' : 'Could not recognise speech. Try a quieter place.')); };
    r.onend = () => { setOn(false); if (heard.current.trim()) { const c = compare(ayah, heard.current); setRes(c); onResult?.(c.score); } };
    setRes(null); setErr(''); setOn(true); r.start();
  };
  const begin = () => { let ok = false; try { ok = localStorage.getItem(CONSENT) === '1'; } catch { /* ignore */ } if (ok) start(); else setAsk(true); };
  if (!supported && !srv) return <p className="note">{ar ? 'التسميع بالصوت غير مدعوم في هذا المتصفح (يعمل في Chrome و Safari الحديثين).' : 'Voice recitation check is not supported in this browser (works in recent Chrome and Safari).'}</p>;
  return (
    <div className="tasmee">
      {askSrv ? (
        <div className="card" role="dialog" aria-label={ar ? 'إذن التسميع' : 'Recitation check consent'}>
          <p>{ar ? 'يُرسل تسجيل قراءتك إلى خادم منصة نور لأمي فقط، حيث يحوّله نموذج Tarteel المفتوح إلى نص ثم يُقارن بالآية. لا يُحفظ التسجيل ولا يُرسل لأي جهة أخرى ولا يُستخدم في تدريب أي نموذج. الحد ٧٥ ثانية.' : 'Your recording goes only to Noor Li Ummi’s own server, where the open Tarteel model turns it into text to compare with the ayah. It is not stored, not sent anywhere else and not used for training. Limit: 75 seconds.'}</p>
          <div className="row"><button type="button" className="btn" onClick={() => { try { localStorage.setItem(CONSENT_SRV, '1'); } catch { /* ignore */ } setAskSrv(false); startSrv(); }}>{ar ? 'موافق، ابدأ' : 'Agree and start'}</button><button type="button" className="btn ghost" onClick={() => setAskSrv(false)}>{ar ? 'إلغاء' : 'Cancel'}</button></div>
        </div>
      ) : busy ? <p className="note" role="status"><span className="spin" aria-hidden="true" /> {ar ? 'جارٍ التحقق من قراءتك…' : 'Checking your recitation…'}</p>
      : srv && on && mr.current?.state === 'recording' ? <button type="button" className="btn" onClick={() => mr.current?.stop()}><span className="spin" aria-hidden="true" /> {ar ? 'أسمعك… اضغط عند الانتهاء' : 'Listening… tap when done'}</button>
      : srv && !on ? <div className="row"><button type="button" className="btn ghost" onClick={beginSrv}>{ar ? 'سمّع بصوتك' : 'Recite aloud'}</button>{supported && <button type="button" className="btn ghost small" onClick={begin}>{ar ? 'بخدمة المتصفح' : 'Use browser service'}</button>}</div>
      : ask ? (
        <div className="card" role="dialog" aria-label={ar ? 'إذن التسميع بالصوت' : 'Voice check consent'}>
          <p>{ar ? 'التسميع يستخدم خدمة تحويل الكلام إلى نص الخاصة بمتصفحك أو جهازك، وقد ترسل صوتك إلى مزوّدها (مثل Google أو Apple) لتحويله. موقع نور لأمي لا يستقبل صوتك ولا يحفظه؛ تصله الكلمات على جهازك فقط للمقارنة.' : 'This uses your browser or device speech-to-text service, which may send your voice to its provider (such as Google or Apple). Noor Li Ummi never receives or stores your voice; only the recognised words are compared on your device.'}</p>
          <div className="row"><button type="button" className="btn" onClick={() => { try { localStorage.setItem(CONSENT, '1'); } catch { /* ignore */ } setAsk(false); start(); }}>{ar ? 'موافق، ابدأ' : 'Agree and start'}</button><button type="button" className="btn ghost" onClick={() => setAsk(false)}>{ar ? 'إلغاء' : 'Cancel'}</button></div>
        </div>
      ) : on
        ? <button type="button" className="btn" onClick={() => rec.current?.stop()}><span className="spin" aria-hidden="true" /> {ar ? 'أسمعك… اضغط عند الانتهاء' : 'Listening… tap when done'}</button>
        : <button type="button" className="btn ghost" onClick={begin}>{ar ? 'سمّع بصوتك' : 'Recite aloud'}</button>}
      {err && <p className="note" role="alert">{err}</p>}
      {res && (
        <div className="tasmee-res" role="status">
          <p lang="ar" dir="rtl" className="ayat">{res.words.map((w, i) => <span key={i} className={w.ok ? 'tw ok' : 'tw miss'}>{w.w} </span>)}</p>
          <p className="note">{ar
            ? (res.missed === 0 ? 'طابقت كل الكلمات ما سُمع.' : `كلمات لم تُسمع أو اختلفت: ${res.missed.toLocaleString('ar-EG')} (المظلّلة).`) + (res.extra ? ` وكلمات زائدة: ${res.extra.toLocaleString('ar-EG')}.` : '') + ' المقارنة آلية بالكلمات ولا تفحص التشكيل ولا التجويد؛ والمرجع التلقي من معلم.'
            : (res.missed === 0 ? 'Every word matched what was heard.' : `Words not heard or different: ${res.missed} (highlighted).`) + (res.extra ? ` Extra words: ${res.extra}.` : '') + ' This is an automatic word comparison; it does not check vowels or tajweed. A teacher remains the reference.'}</p>
        </div>
      )}
    </div>
  );
}
