/** Umrah adhkar whose OpenDua recording (CC BY 4.0, Muhammad Jumah) is split into steps or bracketed differently from our
 *  Hisn al-Muslim text, so the automatic exact-text match did not attach it. Each pair was checked by reading both texts:
 *  OD-207-1 travel dua; OD-207-2 «آيبون تائبون…» (said on return); OD-020 «أعوذ بالله العظيم…»; OD-235 «ربنا آتنا…»;
 *  OD-236-1/-2 on as-Safa (the verse and «أبدأ بما بدأ الله به», then «لا إله إلا الله، الله أكبر»). */
export const UMRAH_AUDIO: Record<string, string[]> = { '97:1': ['OD-207-1.mp3'], '106:1': ['OD-207-2.mp3'], '13:1': ['OD-020.mp3'], '118:1': ['OD-235.mp3'], '119:1': ['OD-236-1.mp3', 'OD-236-2.mp3'] };
