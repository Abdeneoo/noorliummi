import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { qeList, qeSura } from '@/lib/quranenc-live';
import { SURAHS, loadSurah } from '@/lib/quran';
export const revalidate = 86400;
export async function generateMetadata({ params }: { params: Promise<{ key: string; s: string }> }): Promise<Metadata> { const { key, s } = await params; const t = (await qeList()).find((x) => x.key === key); return { title: `${SURAHS[Number(s) - 1]?.name ?? ''} — ${t?.title ?? key}` }; }
export default async function TrSura({ params }: { params: Promise<{ key: string; s: string }> }) {
  const { key, s: ss } = await params; const s = Number(ss);
  const t = (await qeList()).find((x) => x.key === key); const rows = await qeSura(key, s); if (!t || !rows) notFound();
  const { ayat } = await loadSurah(s);
  return (
    <article className="reader" style={{ maxWidth: 860 }}>
      <header><p className="eyebrow"><Link href="/translations">الترجمات</Link></p><h1>سورة {SURAHS[s - 1].name}</h1><p dir={t.direction}><strong>{t.title}</strong> — v{t.version}</p></header>
      <nav className="chips" aria-label="السور" style={{ maxHeight: 120, overflow: "auto" }}>{SURAHS.map((x) => <Link key={x.index} href={`/translations/${key}/${x.index}`} className={x.index === s ? "btn small" : "btn ghost small"}>{x.index}</Link>)}</nav>
      <ol style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 10 }}>{rows.map((r) => <li key={r.aya} id={`a${r.aya}`} className="card">
        <p lang="ar" dir="rtl" style={{ fontFamily: 'var(--font-quran)', fontSize: '1.2rem', lineHeight: 2.2, margin: 0 }}>{ayat[r.aya - 1]?.t} ﴿{r.aya.toLocaleString('ar-EG')}﴾</p>
        <p dir={t.direction} style={{ margin: '6px 0 0' }}>{r.t}</p>{r.fn && <details><summary>الحواشي</summary><p dir={t.direction} style={{ whiteSpace: 'pre-line' }}>{r.fn}</p></details>}</li>)}</ol>
      <nav className="pager">{s > 1 ? <Link className="btn ghost" href={`/translations/${key}/${s - 1}`}>السورة السابقة</Link> : <span />}<Link className="btn ghost" href={`/quran/${s}`}>المصحف</Link>{s < 114 ? <Link className="btn ghost" href={`/translations/${key}/${s + 1}`}>السورة التالية</Link> : <span />}</nav>
      <p className="note"><Link href="/sources">المصادر</Link></p>
    </article>
  );
}
