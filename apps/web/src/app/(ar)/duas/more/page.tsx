import type { Metadata } from 'next';
import Link from 'next/link';
import DuaNav from '@/components/DuaNav';
import PlayTrack from '@/components/PlayTrack';
import { listShared } from '@/lib/rights';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'من مكتبات أخرى — أدعية وتلاوات على مواقع أصحابها', description: 'روابط إلى مكتبات صوتية للأدعية والرقية على مواقع أصحابها، دون نسخ محتواها.' };

export default async function MorePage() {
  const libs = await listShared();
  return (
    <article style={{ maxWidth: 820, margin: '24px auto' }}>
      <h1>من مكتبات أخرى</h1>
      <DuaNav />
      <p className="note">هذه مكتبات يملكها أصحابها. لا ننسخ ملفاتها ولا نرفعها على خوادمنا: كل رابط يفتح المادة على موقع صاحبها، والحقوق كلها لهم.
        ما يُشغَّل هنا من خوادمهم مباشرة لا يكون إلا بعد إذن مسجّل منهم.</p>
      {libs.length === 0 && <p className="card">لا توجد مكتبات معروضة الآن.</p>}
      {libs.map((l) => {
        const list = l.key === 'islamweb-dua' ? [] : l.items;
        return (
          <section key={l.key} className="card" style={{ marginBottom: 16 }}>
            <h2 style={{ marginTop: 0 }}>{l.title}</h2>
            <a className="btn" href={l.source_url} target="_blank" rel="noopener">افتح المكتبة على موقع {l.owner} ↗</a>
            {l.key === 'islamweb-dua' && <p className="note">{l.items.length.toLocaleString('ar-EG')} مادة صوتية في القسم (دعاء ختم القرآن، القنوت، الأذكار) بأصوات المعيقلي واللحيدان والقطامي والدوسري وغيرهم.</p>}
            {list.length > 0 && (
              <details style={{ marginTop: 12 }}><summary>{list.length.toLocaleString('ar-EG')} مادة</summary>
                <ul className="athar-items">{list.map((it, k) => (
                  <li key={k}>{l.mode === 'stream' && it.file
                    ? <><PlayTrack tracks={[{ id: `${l.key}-${k}`, src: it.file, title: it.title, by: l.owner, source: `${l.owner}: ${it.url}`, page: '/duas/more' }]} /> {it.title}</>
                    : <a href={it.url} target="_blank" rel="noopener">{it.title} ↗</a>}</li>
                ))}</ul>
              </details>
            )}
          </section>
        );
      })}
      <p className="note">تملك مكتبة وتريد إضافتها أو إزالتها؟ <Link href="/contribute">راسلنا</Link>.</p>
    </article>
  );
}
