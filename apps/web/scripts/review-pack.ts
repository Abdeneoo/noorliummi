/** Writes docs/review/INHERITANCE_CASES.md: the calculator's output for well-known cases, for a fara'id specialist to check. Run: pnpm tsx scripts/review-pack.ts */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { inherit, type Heirs } from '../src/lib/inheritance';
const H = (o: Partial<Heirs>): Heirs => ({ husband: false, wives: 0, father: false, mother: false, sons: 0, daughters: 0, siblings: 0, others: false, ...o });
const CASES: [string, Partial<Heirs>][] = [
  ['زوج وأب وأم (العمرية الأولى)', { husband: true, father: true, mother: true }], ['زوجة وأب وأم (العمرية الثانية)', { wives: 1, father: true, mother: true }],
  ['زوج وابن وبنت', { husband: true, sons: 1, daughters: 1 }], ['زوجة وأب وأم وبنتان (المنبرية — عول من ٢٤ إلى ٢٧)', { wives: 1, father: true, mother: true, daughters: 2 }],
  ['زوج وأب وأم وبنتان (عول من ١٢ إلى ١٥)', { husband: true, father: true, mother: true, daughters: 2 }], ['زوج وأم وبنتان (عول من ١٢ إلى ١٣)', { husband: true, mother: true, daughters: 2 }],
  ['أب وبنت', { father: true, daughters: 1 }], ['أب وأم وبنت', { father: true, mother: true, daughters: 1 }], ['أم وبنت فقط (رد)', { mother: true, daughters: 1 }], ['زوج وبنت فقط (رد على البنت دون الزوج)', { husband: true, daughters: 1 }],
  ['ثلاث زوجات وابنان', { wives: 3, sons: 2 }], ['أربع زوجات وأم وثلاثة أبناء وبنتان', { wives: 4, mother: true, sons: 3, daughters: 2 }], ['أب وأم وأخوان (حجب الأم من الثلث إلى السدس)', { father: true, mother: true, siblings: 2 }], ['أب وأم وأخ واحد', { father: true, mother: true, siblings: 1 }],
  ['أب فقط', { father: true }], ['ابن فقط', { sons: 1 }], ['بنتان فقط (رد)', { daughters: 2 }], ['زوجة فقط', { wives: 1 }], ['أم فقط (رد)', { mother: true }], ['أب وأم', { father: true, mother: true }], ['زوجة وابن وأب وأم مع أقارب آخرين', { wives: 1, sons: 1, father: true, mother: true, others: true }],
  ['أم وأخوان بلا أب ولا ابن (خارج النطاق)', { mother: true, siblings: 2 }], ['زوج وبنت مع أقارب آخرين (خارج النطاق)', { husband: true, daughters: 1, others: true }],
];
const fr = ([n, d]: [number, number]) => (d === 1 ? String(n) : `${n}/${d}`);
let md = `# ملف مراجعة حاسبة الميراث — للعرض على متخصص في الفرائض\n\nهذا الملف مولَّد آليًا من كود الحاسبة (\`apps/web/src/lib/inheritance.ts\`). المطلوب من المراجع: التحقق من صحة كل نصيب وسببه، ومن أن الحالات المرفوضة ينبغي رفضها.\n\n**نطاق الحاسبة عمدًا:** الزوج أو الزوجات، الأب، الأم، الأبناء، البنات. عدد الإخوة يُسأل عنه لأثره في نصيب الأم فقط. كل ما عدا ذلك يُرفض بعبارة «اسأل عالمًا».\n\n**قواعد مطبّقة:** فروض الزوجين والأبوين والبنات، التعصيب بالابن والأب، المسألتان العمريتان، العول، الرد على غير الزوجين (قول الجمهور)، حجب الإخوة للأم من الثلث إلى السدس.\n\n**حالة المراجعة: لم يراجعها متخصص بعد.** النتائج في الموقع معلَّمة «استرشادية غير معتمدة».\n\n`;
CASES.forEach(([title, o], i) => {
  const r = inherit(H(o)); md += `## ${i + 1}. ${title}\n\n`;
  if (!r.ok) md += `- **ترفضها الحاسبة:** ${r.reason}\n`;
  else { md += '| الوارث | العدد | النصيب | لكل واحد | السبب |\n|---|---|---|---|---|\n' + r.shares.map((s) => `| ${s.who} | ${s.count} | ${fr(s.total)} | ${fr(s.each)} | ${s.basis} |`).join('\n') + '\n'; if (r.note) md += `\n- ملاحظة الحاسبة: ${r.note}\n`; }
  md += '\n- رأي المراجع: ☐ صحيح ☐ خطأ — التصويب: ............\n\n';
});
md += `---\nاسم المراجع: ............ التاريخ: ............ التوقيع: ............\n`;
writeFileSync(resolve(__dirname, '../../../docs/review/INHERITANCE_CASES.md'), md); console.log(`review pack: ${CASES.length} cases`);
