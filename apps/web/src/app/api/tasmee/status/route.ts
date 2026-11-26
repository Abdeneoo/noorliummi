import { NextResponse } from 'next/server';
import { tarteelUp } from '@/lib/tarteel';
export const dynamic = 'force-dynamic';
export async function GET() { return NextResponse.json({ up: await tarteelUp() }, { headers: { 'cache-control': 'no-store' } }); }
