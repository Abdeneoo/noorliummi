// Survey of the IslamHouse API v3 (read-only): counts per type and language, authors/reciters, dua & adhkar audio, attachments.
// Usage: node scripts/islamhouse-survey.mjs > ../../database/sources/islamhouse-api/survey.json
const K = process.env.ISLAMHOUSE_KEY || 'paV29H2gm56kvLPy'; const B = `https://api3.islamhouse.com/v3/${K}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(p) { for (let i = 0; i < 3; i++) { try { const r = await fetch(`${B}/${p}`, { signal: AbortSignal.timeout(30000) }); if (r.ok) { await sleep(150); return await r.json(); } } catch { /* retry */ } await sleep(800); } return null; }
const nm = (t) => String(t ?? '').replace(/[ً-ٰٟـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/\s+/g, ' ').trim();
const out = { checked: new Date().toISOString(), key: 'public developer key from the official docs (no registration needed)' };
const home = await get('main/home/json'); out.statistics = home?.statistics;
out.languages = (home?.data ?? []).map((l) => ({ code: l.language_code, title: l.title, items: l.total_items, files: l.total_files }));
out.types = {};
for (const lang of ['ar', 'en', 'ur', 'tr', 'id']) { const sc = await get(`main/sitecontent/${lang}/${lang}/json`); out.types[lang] = Object.fromEntries((sc ?? []).map((b) => [b.block_name, b.items_count])); }
// Authors (all pages), then the reciters we look for.
const authors = []; let page = 1, pages = 1;
do { const j = await get(`main/get-authors-data/showall/showall/countdesc/ar/${page}/100/json`); if (!j) break; pages = j.links?.pages_number ?? 1; for (const a of j.data ?? []) authors.push({ id: a.id, title: a.title, kind: a.kind, count: a.items_count ?? a.count ?? null }); page++; } while (page <= pages);
out.authorsTotal = authors.length; out.authorKinds = authors.reduce((m, a) => ((m[a.kind ?? '?'] = (m[a.kind ?? '?'] ?? 0) + 1), m), {});
const WANT = ['مشاري راشد العفاسي', 'عبد الرحمن السديس', 'ماهر المعيقلي', 'ياسر الدوسري', 'إدريس أبكر', 'ناصر القطامي', 'أحمد النفيس', 'إسلام صبحي', 'عبد الرحمن مسعد', 'هزاع البلوشي', 'منصور السالمي', 'سعد الغامدي', 'محمد أيوب', 'محمد جبريل', 'صلاح الجمل', 'خالد الجليل', 'محمد اللحيدان', 'سلمان العتيبي', 'محمد البراك', 'محمد المحيسني', 'محمد متولي الشعراوي', 'محمد حسان', 'مصطفى حسني', 'عمر عبد الكافي', 'عبد الباسط عبد الصمد', 'محمد صديق المنشاوي', 'محمود خليل الحصري', 'مصطفى إسماعيل', 'محمد رفعت', 'محمود علي البنا', 'صلاح بو خاطر', 'فارس عباد', 'سعود الشريم', 'علي جابر', 'علي الحذيفي', 'عبد الله الجهني', 'بندر بليلة', 'أحمد العجمي', 'هاني الرفاعي', 'عبد الباري الثبيتي', 'عمر القزابري', 'توفيق الصايغ', 'ماجد الزامل', 'صلاح البدير', 'عادل ريان', 'عبد المحسن القاسم', 'حمد الدريهم', 'محمد جمعة'];
const key = (t) => nm(t).replace(/^(الشيخ|الدكتور|د\.)\s*/, '').replace(/\s*بن\s*/g, ' ').replace(/عبد ال/g, 'عبدال');
out.reciters = [];
for (const w of WANT) {
  const parts = key(w).split(' ').filter((x) => x.length > 2);
  const hits = authors.filter((a) => parts.every((p) => key(a.title).includes(p)));
  const rows = [];
  for (const h of hits.slice(0, 3)) {
    const types = await get(`main/get-author-types-avaliable/${h.id}/ar/ar/json`);
    const aud = await get(`main/get-author-items/${h.id}/audios/ar/ar/1/50/json`);
    const items = (aud?.data ?? []).map((x) => ({ id: x.id, title: x.title }));
    rows.push({ id: h.id, title: h.title, types, audios: aud?.links?.total_items ?? 0, duaLike: items.filter((x) => /دعاء|ادعيه|اذكار|قنوت|حصن/.test(nm(x.title))) });
  }
  out.reciters.push({ name: w, found: rows });
}
// Categories about dua / adhkar / ruqyah and their audio items with attachments.
const tree = await get('main/get-object-category-tree/ar/json');
const flat = []; const walk = (n, path = []) => { for (const c of n ?? []) { flat.push({ id: c.id, title: c.title, path: [...path, c.title].join(' › ') }); walk(c.sub_categories ?? c.children, [...path, c.title]); } };
walk(Array.isArray(tree) ? tree : tree?.sub_categories ?? tree?.data);
out.categoriesTotal = flat.length;
out.duaCategories = [];
for (const c of flat.filter((c) => /دعاء|الدعاء|اذكار|الاذكار|رقيه|الرقيه/.test(nm(c.title)))) {
  const types = await get(`main/get-category-types-available/${c.id}/ar/ar/json`);
  const aud = await get(`main/get-category-items/${c.id}/audios/ar/ar/1/50/json`);
  const sample = [];
  for (const x of (aud?.data ?? []).slice(0, 12)) { const it = await get(`main/get-item/${x.id}/ar/json`); sample.push({ id: x.id, title: x.title, by: (it?.prepared_by ?? []).map((p) => `${p.title} (${p.kind})`), files: (it?.attachments ?? []).map((a) => ({ type: a.extension_type, size: a.size, url: a.url })) }); }
  out.duaCategories.push({ id: c.id, path: c.path, types, audios: aud?.links?.total_items ?? 0, sample });
}
// Hisn al-Muslim items across types.
out.hisn = [];
for (const t of ['audios', 'books', 'videos']) { let p = 1, n = 1; do { const j = await get(`main/${t}/ar/ar/${p}/100/json`); if (!j) break; n = Math.min(j.links?.pages_number ?? 1, 60); for (const x of j.data ?? []) if (/حصن المسلم|حصن مسلم/.test(nm(x.title))) out.hisn.push({ type: t, id: x.id, title: x.title }); p++; } while (p <= n); }
console.log(JSON.stringify(out, null, 1));
