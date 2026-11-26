/**
 * EveryAyah (everyayah.com): one file per ayah. Streamed from their server only (no copy, no offline), with attribution —
 * the same treatment as MP3Quran (no published redistribution terms; owner's decision, 26 Nov 2026). Only reciters the
 * site does not already have ayah by ayah through Islamic Network are listed, so nothing is duplicated.
 */
export type EaRec = { f: string; name: string; en: string };
export const EA: EaRec[] = [
  { f: 'Alafasy_128kbps', name: 'مشاري راشد العفاسي', en: 'Mishary Rashid Alafasy' },
  { f: 'Nasser_Alqatami_128kbps', name: 'ناصر القطامي', en: 'Nasser Al-Qatami' },
  { f: 'Yasser_Ad-Dussary_128kbps', name: 'ياسر الدوسري', en: 'Yasser Al-Dosari' },
  { f: 'Ahmed_Neana_128kbps', name: 'أحمد نعينع', en: 'Ahmed Neana' },
  { f: 'Ghamadi_40kbps', name: 'سعد الغامدي', en: 'Saad Al-Ghamdi' },
  { f: 'Fares_Abbad_64kbps', name: 'فارس عباد', en: 'Fares Abbad' },
  { f: 'Salah_Al_Budair_128kbps', name: 'صلاح البدير', en: 'Salah Al-Budair' },
  { f: 'Muhsin_Al_Qasim_192kbps', name: 'عبد المحسن القاسم', en: 'Abdul Mohsen Al-Qasim' },
  { f: 'Khaalid_Abdullaah_al-Qahtaanee_192kbps', name: 'خالد القحطاني', en: 'Khalid Al-Qahtani' },
  { f: 'Abdullah_Matroud_128kbps', name: 'عبد الله المطرود', en: 'Abdullah Al-Matroud' },
  { f: 'Ali_Jaber_64kbps', name: 'علي جابر', en: 'Ali Jaber' },
  { f: 'Abdullaah_3awwaad_Al-Juhaynee_128kbps', name: 'عبد الله عواد الجهني', en: 'Abdullah Awad Al-Juhani' },
  { f: 'Salaah_AbdulRahman_Bukhatir_128kbps', name: 'صلاح بو خاطر', en: 'Salah Bukhatir' },
  { f: 'Akram_AlAlaqimy_128kbps', name: 'أكرم العلاقمي', en: 'Akram Al-Alaqimy' },
  { f: 'Yaser_Salamah_128kbps', name: 'ياسر سلامة', en: 'Yaser Salamah' },
  { f: 'Sahl_Yassin_128kbps', name: 'سهل ياسين', en: 'Sahl Yassin' },
  { f: 'Mohammad_al_Tablaway_128kbps', name: 'محمد محمود الطبلاوي', en: 'Mohammad Al-Tablawi' },
  { f: 'Mustafa_Ismail_48kbps', name: 'مصطفى إسماعيل', en: 'Mustafa Ismail' },
];
const p3 = (n: number) => String(n).padStart(3, '0');
export const eaUrl = (r: EaRec, s: number, a: number) => `https://everyayah.com/data/${r.f}/${p3(s)}${p3(a)}.mp3`;
