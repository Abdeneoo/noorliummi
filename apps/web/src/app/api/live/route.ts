import { NextResponse } from 'next/server';
import { liveSettings } from '@/lib/settings';
export const dynamic = 'force-dynamic';
export async function GET() { const s = await liveSettings(); return NextResponse.json({ makkah: s['live.makkah'], madinah: s['live.madinah'] }, { headers: { 'cache-control': 'public, max-age=300' } }); }
