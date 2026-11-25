import type { Metadata } from 'next';
import Link from 'next/link';
import AtharForm from '@/components/AtharForm';
import MyAthar from '@/components/MyAthar';
import { cleanQuery } from '@/lib/athar';
import { listPages } from '@/lib/athar-store';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'صفحات الأثر — صدقة جارية', robots: { index: false, follow: false } };
const arNum = (n: number) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

export default async function Athar({ searchParams }: { searchParams: Promise<{ q?: string; p?: string; new?: string }> }) {
  const sp = await searchParams;
  const q = cleanQuery(sp.q ?? '');
  const page = Math.max(0, Math.min(100, Number(sp.p) || 0));
  let list: Awaited<ReturnType<typeof listPages>> = { rows: [], more: false };
  let dbErr = false;
  try { list = await listPages(q, page); } catch { dbErr = true; }
  return (
    <article className="athar-home">
      <header className="page-head">
        <p className="eyebrow">الصدقة الجارية</p>
        <h1>صفحات الأثر</h1>
        <p>صفحات أهداها أصحابها لمن يحبون: سور وأذكار ودعاء. ادخل، اقرأ، وادعُ لأصحابها.</p>
      </header>

      <div className="athar-actions">
        <a className="btn" href="#new">اصنع صفحة لمن تحب</a>
        <MyAthar />
      </div>

      <section className="card" aria-labelledby="dir-title">
        <h2 id="dir-title">الدليل</h2>
        <form className="row" role="search" action="/athar" style={{ marginTop: 0 }}>
          <input type="search" name="q" defaultValue={q} placeholder="ابحث بالاسم" aria-label="ابحث بالاسم" style={{ flex: '1 1 220px' }} />
          <button className="btn ghost">بحث</button>
          {q && <Link className="btn ghost" href="/athar">الكل</Link>}
        </form>
        {dbErr ? <p className="note">تعذّر تحميل الدليل الآن.</p> : list.rows.length === 0 ? (
          <p className="note">{q ? `لا توجد صفحة منشورة في الدليل بهذا الاسم.` : 'لا توجد صفحات في الدليل بعد. الصفحات تظهر هنا فقط إذا اختار أصحابها ذلك.'}</p>
        ) : (
          <ul className="athar-dir">
            {list.rows.map((r) => (
              <li key={r.slug}>
                <Link href={`/athar/${r.slug}`}>
                  <strong>{r.display_name}</strong>
                  {r.dedication && <small>{r.dedication}</small>}
                </Link>
              </li>
            ))}
          </ul>
        )}
        {(page > 0 || list.more) && (
          <div className="pager">
            {page > 0 ? <Link className="btn ghost" href={`/athar?${new URLSearchParams({ ...(q ? { q } : {}), p: String(page - 1) })}`}>السابق</Link> : <span />}
            <span className="note">صفحة {arNum(page + 1)}</span>
            {list.more ? <Link className="btn ghost" href={`/athar?${new URLSearchParams({ ...(q ? { q } : {}), p: String(page + 1) })}`}>التالي</Link> : <span />}
          </div>
        )}
      </section>

      <section id="new" className="section" aria-labelledby="new-title">
        <h2 id="new-title">اصنع صفحة</h2>
        <ul className="note">
          <li>اختر سورًا أو ختمة كاملة بصوت قارئ، وأذكارًا، واكتب إهداءك ودعاءك، ثم شارك الرابط.</li>
          <li>الصفحة لا تظهر في الدليل إلا إذا اخترت ذلك، ولا تظهر في محركات البحث.</li>
          <li>يمكنك تعديلها من «صفحاتي» على هذا الجهاز، أو من رابط التعديل الذي يظهر بعد الإنشاء (احفظه لتعدّل من أي جهاز).</li>
        </ul>
        <AtharForm />
      </section>
    </article>
  );
}
