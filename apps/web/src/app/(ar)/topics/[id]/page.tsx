import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TOPICS, topicAyat } from '@/lib/topics';
import { SURAHS, arDigits } from '@/lib/quran';
import { ayat as count } from '@/lib/arnum';

export const dynamicParams = false;
export function generateStaticParams() { return TOPICS.map((t) => ({ id: t.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params; const t = TOPICS.find((x) => x.id === id);
  return { title: t ? `آيات ${t.title} في القرآن الكريم` : 'مواضيع', description: t ? `الآيات التي ورد فيها لفظ ${t.words} مع التفسير والاستماع.` : undefined };
}
export default async function Topic({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const t = TOPICS.find((x) => x.id === id); if (!t) notFound();
  const list = await topicAyat(t);
  return (
    <article className="reader">
      <header><p className="eyebrow">مواضيع في القرآن</p><h1>آيات {t.title}</h1><div className="meta"><span>{count(list.length)}</span></div></header>
      <p className="note">الآيات التي ورد فيها أحد هذه الألفاظ: {t.words} — جُمعت ببحث لفظي آلي في نص المصحف، فقد تأتي الكلمة بمعنى آخر في بعض المواضع، وليست حصرًا موضوعيًا لكل ما يتعلق بالموضوع.</p>
      <ol className="tafsir-list" style={{ listStyle: 'none', padding: 0 }}>
        {list.map((x) => (
          <li key={`${x.s}:${x.a}`} className="card">
            <p className="tafsir-ayah" lang="ar">{x.text} <span className="ayah-end">﴿{arDigits(x.a)}﴾</span></p>
            <p className="meta" style={{ justifyContent: 'flex-start' }}><span>سورة {SURAHS[x.s - 1].name}، الآية {arDigits(x.a)}</span>
              <Link href={`/quran/${x.s}#a${x.a}`}>في المصحف والاستماع</Link><Link href={`/tafsir/${x.s}#a${x.a}`}>التفسير</Link></p>
          </li>
        ))}
      </ol>
      <nav className="pager"><Link className="btn ghost" href="/topics">كل المواضيع</Link></nav>
    </article>
  );
}
