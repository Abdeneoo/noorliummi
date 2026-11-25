/**
 * Streamed directly from Islamic Network (cdn.islamic.network); nothing is copied to our server.
 * 'surah' = one file per surah; 'ayah' = one file per ayah, played in sequence (availability checked 2026-11-25).
 */
export type Rec = { id: string; name: string; en: string; mode: 'surah' | 'ayah'; br: number };
/** Append-only: athar pages store a reciter by its index in this list. */
export const RECITERS: Rec[] = [
  { id: 'ar.alafasy', name: 'مشاري راشد العفاسي', en: 'Mishary Rashid Alafasy', mode: 'surah', br: 128 },
  { id: 'ar.abdulbasitmurattal', name: 'عبد الباسط عبد الصمد (مرتّل)', en: 'Abdul Basit Abdul Samad (murattal)', mode: 'surah', br: 128 },
  { id: 'ar.abdulbasitmujawwad', name: 'عبد الباسط عبد الصمد (مجوّد)', en: 'Abdul Basit Abdul Samad (mujawwad)', mode: 'surah', br: 128 },
  { id: 'ar.abdullahbasfar', name: 'عبد الله بصفر', en: 'Abdullah Basfar', mode: 'surah', br: 128 },
  { id: 'ar.husary', name: 'محمود خليل الحصري', en: 'Mahmoud Khalil Al-Husary', mode: 'ayah', br: 128 },
  { id: 'ar.husarymujawwad', name: 'محمود خليل الحصري (مجوّد)', en: 'Mahmoud Khalil Al-Husary (mujawwad)', mode: 'ayah', br: 128 },
  { id: 'ar.minshawi', name: 'محمد صديق المنشاوي', en: 'Mohamed Siddiq Al-Minshawi', mode: 'ayah', br: 128 },
  { id: 'ar.minshawimujawwad', name: 'محمد صديق المنشاوي (مجوّد)', en: 'Mohamed Siddiq Al-Minshawi (mujawwad)', mode: 'ayah', br: 64 },
  { id: 'ar.abdurrahmaansudais', name: 'عبد الرحمن السديس', en: 'Abdur-Rahman As-Sudais', mode: 'ayah', br: 192 },
  { id: 'ar.saoodshuraym', name: 'سعود الشريم', en: 'Saud Ash-Shuraim', mode: 'ayah', br: 64 },
  { id: 'ar.mahermuaiqly', name: 'ماهر المعيقلي', en: 'Maher Al-Muaiqly', mode: 'ayah', br: 128 },
  { id: 'ar.hudhaify', name: 'علي الحذيفي', en: 'Ali Al-Hudhaify', mode: 'ayah', br: 128 },
  { id: 'ar.muhammadayyoub', name: 'محمد أيوب', en: 'Muhammad Ayyub', mode: 'ayah', br: 128 },
  { id: 'ar.muhammadjibreel', name: 'محمد جبريل', en: 'Muhammad Jibreel', mode: 'ayah', br: 128 },
  { id: 'ar.shaatree', name: 'أبو بكر الشاطري', en: 'Abu Bakr Ash-Shatri', mode: 'ayah', br: 128 },
  { id: 'ar.ahmedajamy', name: 'أحمد بن علي العجمي', en: 'Ahmed ibn Ali Al-Ajamy', mode: 'ayah', br: 128 },
  { id: 'ar.hanirifai', name: 'هاني الرفاعي', en: 'Hani Ar-Rifai', mode: 'ayah', br: 192 },
  { id: 'ar.abdulsamad', name: 'عبد الباسط عبد الصمد (آية بآية)', en: 'Abdul Basit Abdul Samad (ayah by ayah)', mode: 'ayah', br: 64 },
  { id: 'ar.aymanswoaid', name: 'أيمن سويد', en: 'Ayman Suwayd', mode: 'ayah', br: 64 },
  { id: 'ar.ibrahimakhbar', name: 'إبراهيم الأخضر', en: 'Ibrahim Al-Akhdar', mode: 'ayah', br: 32 },
];
export const ayahUrl = (r: Rec, global: number) => `https://cdn.islamic.network/quran/audio/${r.br}/${r.id}/${global}.mp3`;
export const surahUrl = (r: Rec, n: number) => `https://cdn.islamic.network/quran/audio-surah/${r.br}/${r.id}/${n}.mp3`;
