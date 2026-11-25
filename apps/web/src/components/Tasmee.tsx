'use client';
import { useEffect, useRef, useState } from 'react';
import { compare } from '@/lib/tasmee';
type Rec = { lang: string; interimResults: boolean; continuous: boolean; maxAlternatives: number; start(): void; stop(): void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null; onerror: ((e: { error: string }) => void) | null; onend: (() => void) | null };
const CONSENT = 'noor.tasmee.ok';
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
  useEffect(() => { const w = window as unknown as Record<string, unknown>; setSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition)); return () => rec.current?.stop(); }, []);
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
  if (!supported) return <p className="note">{ar ? 'التسميع بالصوت غير مدعوم في هذا المتصفح (يعمل في Chrome و Safari الحديثين).' : 'Voice recitation check is not supported in this browser (works in recent Chrome and Safari).'}</p>;
  return (
    <div className="tasmee">
      {ask ? (
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
