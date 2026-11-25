import index from '@/generated/adhkar/index.json';
export interface AdhkarCat { id: number; title: string; count: number }
export interface Dhikr { n: number; t: string; c: number; r: string }
export const ADHKAR = index as AdhkarCat[];
export async function loadAdhkar(id: number) {
  return (await import(`@/generated/adhkar/${id}.json`)).default as { id: number; title: string; items: Dhikr[] };
}
export const stripMarks = (s: string) => s.replace(/[ً-ٰٟـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
