import { describe, expect, it } from 'vitest';
import { letters, parseBook } from '../src/lib/openiti-book';
const SAMPLE = `#META# 020.BookTITLE	:: كتاب\n#META#Header#End#\n\n### | [مقدمة]\n# بسم الله ms001 الرحمن\n~~الرحيم PageV01P005\n### || 1- باب الأول\n# قال تعالى @QB@ فاذكروني @QE@\n### ||| 1/1- \n# حديث أول\nPageV01P006\n# تتمة\n### ||| 2/2 - \n# شطر%~%شطر\n`;
describe('openiti book parser', () => {
  it('sections, numbers, pages and markup', () => {
    const b = parseBook(SAMPLE, 'riyad'); expect(b.meta.BookTITLE).toBe('كتاب'); expect(b.sections.map((s) => s.title)).toEqual(['[مقدمة]', '1- باب الأول']);
    expect(b.sections[0].blocks).toEqual([{ p: 'بسم الله الرحمن الرحيم' }, { pg: '5' }]);
    expect(b.sections[1].blocks).toEqual([{ p: 'قال تعالى ﴿فاذكروني﴾' }, { n: '1' }, { p: 'حديث أول' }, { pg: '6' }, { p: 'تتمة' }, { n: '2' }, { v: 'شطر * شطر' }]);
  });
  it('drops no Arabic letter', () => { const b = parseBook(SAMPLE, 'adhkar-nawawi'); const got = letters(b.sections.flatMap((s) => s.blocks.map((x) => ('p' in x ? x.p : 'h' in x ? x.h : 'v' in x ? x.v : ''))).join('')); expect(got).toBe(letters(SAMPLE.split('#META#Header#End#')[1].replace(/ms\d+/g, ''))); });
});
