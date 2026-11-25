/** Arabic labels for Quranic Arabic Corpus tags (from the corpus tagset documentation). Display only. */
export const POS: Record<string, string> = {
  N: 'اسم', PN: 'اسم علم', ADJ: 'صفة', IMPN: 'اسم فعل أمر', PRON: 'ضمير', DEM: 'اسم إشارة', REL: 'اسم موصول', T: 'ظرف زمان', LOC: 'ظرف مكان',
  V: 'فعل', P: 'حرف جر', EMPH: 'لام التوكيد', IMPV: 'لام الأمر', PRP: 'لام التعليل', CONJ: 'حرف عطف', SUB: 'حرف مصدري', ACC: 'حرف نصب',
  AMD: 'حرف استدراك', ANS: 'حرف جواب', AVR: 'حرف ردع', CAUS: 'حرف سببية', CERT: 'حرف تحقيق', CIRC: 'حرف حال', COM: 'واو المعية', COND: 'حرف شرط',
  EQ: 'حرف تسوية', EXH: 'حرف تحضيض', EXL: 'حرف تفصيل', EXP: 'أداة استثناء', FUT: 'حرف استقبال', INC: 'حرف ابتداء', INT: 'حرف تفسير', INTG: 'حرف استفهام',
  NEG: 'حرف نفي', PREV: 'حرف كاف', PRO: 'حرف نهي', REM: 'حرف استئناف', RES: 'أداة حصر', RET: 'حرف إضراب', RSLT: 'حرف واقع في جواب الشرط',
  SUP: 'حرف زائد', SUR: 'حرف فجاءة', VOC: 'حرف نداء', INL: 'حروف مقطعة', DET: 'أداة التعريف',
};
const FEAT: Record<string, string> = {
  PERF: 'ماضٍ', IMPF: 'مضارع', IMPV: 'أمر', PASS: 'مبني للمجهول', NOM: 'مرفوع', ACC: 'منصوب', GEN: 'مجرور', INDEF: 'نكرة',
  'MOOD:IND': 'مرفوع', 'MOOD:SUBJ': 'منصوب', 'MOOD:JUS': 'مجزوم', VN: 'مصدر',
};
const PNG: Record<string, string> = { '1S': 'متكلم مفرد', '1P': 'متكلم جمع', '2MS': 'مخاطب مفرد مذكر', '2FS': 'مخاطبة مفردة', '2D': 'مخاطب مثنى', '2MD': 'مخاطب مثنى مذكر', '2FD': 'مخاطب مثنى مؤنث', '2MP': 'مخاطب جمع مذكر', '2FP': 'مخاطب جمع مؤنث', '3MS': 'غائب مفرد مذكر', '3FS': 'غائبة مفردة', '3D': 'غائب مثنى', '3MD': 'غائب مثنى مذكر', '3FD': 'غائب مثنى مؤنث', '3MP': 'غائب جمع مذكر', '3FP': 'غائب جمع مؤنث', M: 'مذكر', F: 'مؤنث', MS: 'مفرد مذكر', FS: 'مفرد مؤنث', MD: 'مثنى مذكر', FD: 'مثنى مؤنث', MP: 'جمع مذكر', FP: 'جمع مؤنث', P: 'جمع', D: 'مثنى', S: 'مفرد' };
export function featureLabels(f: string[], pos: string): string[] {
  const out: string[] = [];
  const pcpl = f.includes('PCPL');
  if (pcpl) out.push(f.includes('PASS') ? 'اسم مفعول' : 'اسم فاعل');
  for (const x of f) {
    if (x === 'PCPL' || x === 'ACT' || (pcpl && x === 'PASS')) continue;
    if (pos === 'V' && /^\((I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)\)$/.test(x)) { out.push(`الوزن ${x.slice(1, -1)}`); continue; }
    const l = FEAT[x] ?? PNG[x]; if (l) out.push(l);
  }
  return out;
}
const BW: Record<string, string> = { "'": 'ء', A: 'ا', b: 'ب', t: 'ت', v: 'ث', j: 'ج', H: 'ح', x: 'خ', d: 'د', '*': 'ذ', r: 'ر', z: 'ز', s: 'س', $: 'ش', S: 'ص', D: 'ض', T: 'ط', Z: 'ظ', E: 'ع', g: 'غ', f: 'ف', q: 'ق', k: 'ك', l: 'ل', m: 'م', n: 'ن', h: 'ه', w: 'و', y: 'ي' };
/** Root letters from Buckwalter (roots use only these letters). Returns '' if any letter is unknown. */
export function rootArabic(bw: string): string { const a = [...bw].map((c) => BW[c]); return a.every(Boolean) ? a.join(' ') : ''; }
