import { ayatOf, type Dua } from '@/lib/duas';
import { surahName } from '@/lib/duas';
import DuaCard from './DuaCard';
import { hiddenDuas } from '@/lib/duas-hidden';
import { DuaReciterBar } from './DuaAyahPlayer';
/** A list of duas; when it contains Quranic duas, a reciter bar plays all their ayat in the site-wide player. */
export default async function DuaList({ list: all0 }: { list: Dua[] }) {
  const hid = await hiddenDuas(); const list = all0.filter((d) => !hid.has(`q${d.n}`));
  const withAyat = await Promise.all(list.map(async (d) => ({ d, ayat: await ayatOf(d) })));
  const all = withAyat.flatMap(({ ayat }) => ayat.map((x) => ({ ...x, title: `${surahName(x.s)}: ${x.a}` })));
  return (
    <>
      {all.length > 0 && <DuaReciterBar all={all} />}
      <ul className="dhikr-list">{withAyat.map(({ d, ayat }) => <DuaCard key={d.n} d={d} ayat={ayat} />)}</ul>
    </>
  );
}
