import KidBlocked from '@/components/KidBlocked';
import { allows } from '@/lib/family-rules';
import { kidHere } from '@/lib/kid-page';
import { arDigits, loadSurah } from '@/lib/quran';
import { RECITERS, surahUrl } from '@/lib/reciters';
export default async function KidSurah({ params }: { params: Promise<{ n: string }> }) {
  const k = await kidHere(); if (k?.timeUp) return null; const n = Number((await params).n);
  if (!k || !Number.isInteger(n) || n < 1 || n > 114 || !allows(k.allowed, 'quran', n)) return <KidBlocked />;
  const s = await loadSurah(n);
  return (
    <article><h1 className="kid-center">سورة {s.meta.name}</h1>
      <audio controls preload="none" style={{ width: '100%' }} src={surahUrl(RECITERS[0], n)} aria-label={`تلاوة سورة ${s.meta.name} — ${RECITERS[0].name}`} />
      {s.bismillah && <p className="kid-ayat kid-center">{s.bismillah}</p>}
      <p className="kid-ayat" lang="ar">{s.ayat.map((a) => <span key={a.n}>{a.t} <span aria-hidden="true">﴿{arDigits(a.n)}﴾</span> </span>)}</p>
    </article>
  );
}
