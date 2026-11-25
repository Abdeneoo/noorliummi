/**
 * Dua for a deceased woman: the funeral dua narrated by Muslim (Hisn al-Muslim, ch. 56 #1) with its pronouns
 * made feminine, as the scholars direct for a woman ("اللهم اغفر لها إن كانت امرأة" — Ibn Baz, fatwa 14536).
 * Only the pronoun suffixes change; every other word is the source text unchanged (checked by test).
 */
export const FEMININE: [string, string][] = [
  ['لَهُ', 'لَهَا'], ['وَاِرْحَمْهُ،', 'وَاِرْحَمْهَا،'], ['وَعَافِهِ،', 'وَعَافِهَا،'], ['عَنْهُ،', 'عَنْهَا،'], ['نُزُلَهُ،', 'نُزُلَهَا،'],
  ['مُدْخَلَهُ،', 'مُدْخَلَهَا،'], ['وَاغْسِلْهُ', 'وَاغْسِلْهَا'], ['وَنَقِّهِ', 'وَنَقِّهَا'], ['وَأَبْدِلْهُ', 'وَأَبْدِلْهَا'], ['دَارِهِ،', 'دَارِهَا،'],
  ['أَهْلِهِ،', 'أَهْلِهَا،'], ['زَوْجِهِ،', 'زَوْجِهَا،'], ['وَأَدْخِلْهُ', 'وَأَدْخِلْهَا'], ['وَأَعِذْهُ', 'وَأَعِذْهَا'],
];
export function feminine(text: string): string {
  const map = new Map(FEMININE);
  return text.split(' ').map((w) => map.get(w) ?? w).join(' ');
}
export const FEMININE_BASIS = { label: 'بتأنيث الضمير للمرأة', url: 'https://binbaz.org.sa/fatwas/14536/' };
