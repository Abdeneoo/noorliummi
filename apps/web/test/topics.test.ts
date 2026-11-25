import { describe, expect, it } from 'vitest';
import { TOPICS, topicAyat } from '../src/lib/topics';
const get = (id: string) => TOPICS.find((t) => t.id === id)!;
describe('quran topic word search', () => {
  it('finds the parents ayat', async () => {
    const r = await topicAyat(get('parents')); const k = r.map((x) => `${x.s}:${x.a}`);
    for (const ref of ['2:83', '17:23', '31:14', '46:15', '71:28', '14:41']) expect(k).toContain(ref);
  });
  it('finds mother without matching ummah', async () => {
    const k = (await topicAyat(get('mother'))).map((x) => `${x.s}:${x.a}`);
    for (const ref of ['31:14', '46:15', '28:7', '20:38']) expect(k).toContain(ref);
    expect(k).not.toContain('2:128'); // «أمة مسلمة»
  });
  it('tawba excludes tabut', async () => { const k = (await topicAyat(get('tawba'))).map((x) => `${x.s}:${x.a}`); expect(k).not.toContain('2:248'); expect(k).toContain('66:8'); });
});
