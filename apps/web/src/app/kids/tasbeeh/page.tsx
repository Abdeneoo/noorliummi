import KidBlocked from '@/components/KidBlocked';
import KidTasbeeh from '@/components/KidTasbeeh';
import { allows } from '@/lib/family-rules';
import { kidHere } from '@/lib/kid-page';
export default async function Page() { const k = await kidHere(); if (k?.timeUp) return null; return k && allows(k.allowed, 'tasbeeh') ? <KidTasbeeh /> : <KidBlocked />; }
