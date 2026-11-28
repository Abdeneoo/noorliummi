import { NextResponse } from 'next/server';
import { isAdmin, sameOrigin } from '@/lib/admin';
import { db } from '@/lib/db';
import { IHA, PROPHETS, QD, TV } from '@/lib/duas';
import { fiqhIndex } from '@/lib/fiqh';
import { bookList } from '@/lib/books';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ADHKAR, loadAdhkar } from '@/lib/adhkar';
import { hiddenDuas, resetHidden } from '@/lib/duas-hidden';
export const dynamic = 'force-dynamic';
const deny = () => NextResponse.json({ error: 'غير مسموح.' }, { status: 401 });
const K = 'paV29H2gm56kvLPy';
/** Content inventory for moderators: what is imported from where, audio coverage, hidden items. */
export async function GET(req: Request) {
  if (!isAdmin(req)) return deny();
  let opendua = 0, hisnItems = 0;
  for (const c of ADHKAR) { const d = await loadAdhkar(c.id); hisnItems += d.items.length; opendua += d.items.filter((x) => x.a).length; }
  const ihTracks = IHA.reduce((t, it) => { const f = it.attachments.filter((a) => a.type === 'MP3'); return t + (f.length > 1 ? f.filter((a) => !/كامل/.test(a.desc ?? '')).length : f.length); }, 0);
  const sources = [
    { id: 'qahtani', name: 'الدعاء من الكتاب والسنة (IslamHouse cnt 19)', items: QD.duas.length, detail: `قرآن ${QD.duas.filter((d) => d.kind === 'quran').length} · سنة ${QD.duas.filter((d) => d.kind === 'sunnah').length} · بصوت ${QD.duas.filter((d) => d.audio).length}`, license: 'IslamHouse: دون تعديل مع ذكر المصدر' },
    { id: 'prophets', name: 'أدعية الأنبياء (التفسير الميسر، QuranEnc)', items: PROPHETS.length, detail: `${new Set(PROPHETS.map((p) => p.prophet)).size} أنبياء`, license: 'QuranEnc: دون تعديل مع ذكر المصدر' },
    { id: 'hisn', name: 'حصن المسلم + OpenDua (محمد جمعة)', items: hisnItems, detail: `بتسجيل ${opendua} (${Math.round((opendua / hisnItems) * 100)}٪)`, license: 'CC BY 4.0 للتسجيلات' },
    { id: 'ih-audio', name: 'صوتيات IslamHouse (حصن المسلم كاملًا، العفاسي، خطب)', items: IHA.length, detail: `${ihTracks} مقطعًا يُبث من IslamHouse`, license: 'IslamHouse: دون تعديل مع ذكر المصدر' },
    { id: 'tvquran', name: 'TVQuran — قنوت وختم', items: TV.length, detail: 'تضمين رسمي فقط', license: 'التشغيل المباشر بانتظار إذن' },
    { id: 'fiqh', name: 'الفقه الميسر', items: fiqhIndex().kitabs.reduce((t, k) => t + k.abwab.length, 0), detail: `${fiqhIndex().kitabs.length} كتابًا`, license: 'IslamHouse' },
    { id: 'books', name: 'الكتب المختارة', items: bookList().length, detail: bookList().map((b) => b.slug).join('، '), license: 'لكل كتاب مصدره في /sources' },
  ];
  const last = await db().query<{ value: string }>("SELECT value FROM site_settings WHERE key = 'ih.updates'").then((r) => r.rows[0]?.value ?? null).catch(() => null);
  return NextResponse.json({ sources, hidden: [...(await hiddenDuas())], lastUpdates: last ? JSON.parse(last) : null }, { headers: { 'cache-control': 'no-store' } });
}
/** { action: 'hide' | 'show', id } hides a dua (q<n>) or a recording; { action: 'check' } tests every streamed recording link; { action: 'updates' } compares IslamHouse with the snapshot. */
export async function POST(req: Request) {
  if (!isAdmin(req) || !sameOrigin(req)) return deny();
  let b: { action?: string; id?: string } = {}; try { b = await req.json(); } catch { /* empty */ }
  if ((b.action === 'hide' || b.action === 'show') && typeof b.id === 'string' && /^[a-z0-9:-]{1,40}$/.test(b.id)) {
    resetHidden(); const h = await hiddenDuas(); if (b.action === 'hide') h.add(b.id); else h.delete(b.id);
    await db().query("INSERT INTO site_settings (key, value) VALUES ('duas.hidden',$1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()", [[...h].join(',')]);
    resetHidden(); return NextResponse.json({ ok: true });
  }
  if (b.action === 'check') {
    const urls = [...IHA.flatMap((it) => it.attachments.filter((a) => a.type === 'MP3').map((a) => a.url)), ...TV.map((t) => t.mp3)];
    const bad: string[] = []; let i = 0;
    const worker = async () => { while (i < urls.length) { const u = urls[i++]; try { const r = await fetch(u, { method: 'HEAD', signal: AbortSignal.timeout(15000) }); if (!r.ok) bad.push(`${r.status} ${u}`); } catch { bad.push(`timeout ${u}`); } } };
    await Promise.all(Array.from({ length: 6 }, worker));
    return NextResponse.json({ checked: urls.length, bad });
  }
  if (b.action === 'updates') {
    const changes: string[] = [];
    for (const it of IHA) {
      try { const r = await fetch(`https://api3.islamhouse.com/v3/${K}/main/get-item/${it.id}/ar/json`, { signal: AbortSignal.timeout(15000) }); const j = await r.json() as { attachments?: { url: string }[] };
        const now = new Set((j.attachments ?? []).map((a) => a.url)); const was = new Set(it.attachments.map((a) => a.url));
        const add = [...now].filter((u) => !was.has(u)).length, del = [...was].filter((u) => !now.has(u)).length;
        if (add || del) changes.push(`${it.title} (${it.id}): +${add} / −${del}`);
      } catch { changes.push(`${it.title} (${it.id}): تعذّر الوصول`); }
    }
    // Hisn al-Muslim in other languages: same files still published?
    const hisn = JSON.parse(readFileSync(join(process.cwd(), 'src/generated/ih-quran/hisn.json'), 'utf8')) as Record<string, { id: number; title: string; files: { url: string }[] }[]>;
    for (const [l, eds] of Object.entries(hisn)) for (const e of eds) {
      try { const r = await fetch(`https://api3.islamhouse.com/v3/${K}/main/get-item/${e.id}/${l}/json`, { signal: AbortSignal.timeout(15000) }); const j = await r.json() as { attachments?: { url: string }[] };
        const now = new Set((j.attachments ?? []).map((a) => a.url)); if (e.files.some((f) => !now.has(f.url)) || now.size !== e.files.length) changes.push(`حصن المسلم (${l}) ${e.id}: تغيّرت الملفات`);
      } catch { changes.push(`حصن المسلم (${l}) ${e.id}: تعذّر الوصول`); }
      await new Promise((ok) => setTimeout(ok, 400));
    }
    // Encyclopedia books: same number of pages?
    for (const b of bookList().filter((x) => x.id > 0)) {
      try { const r = await fetch(`https://cnt.islamhouse.com/api/v1/books/page-data/${b.id}?page_number=1`, { signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'NoorLiUmmi/1.0' } }); const j = await r.json() as { meta?: { total_pages?: number } };
        const pages = JSON.parse(readFileSync(join(process.cwd(), `src/generated/books/${b.slug}/index.json`), 'utf8')).pages as number | undefined;
        if (pages && j.meta?.total_pages && j.meta.total_pages !== pages) changes.push(`كتاب «${b.title}»: ${pages} ← ${j.meta.total_pages} صفحات`);
      } catch { changes.push(`كتاب «${b.title}»: تعذّر الوصول`); }
      await new Promise((ok) => setTimeout(ok, 1500));
    }
    const res = { at: new Date().toISOString(), changes };
    await db().query("INSERT INTO site_settings (key, value) VALUES ('ih.updates', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value", [JSON.stringify(res)]).catch(() => {});
    return NextResponse.json({ items: IHA.length, changes });
  }
  return NextResponse.json({ error: 'طلب غير صحيح.' }, { status: 400 });
}
