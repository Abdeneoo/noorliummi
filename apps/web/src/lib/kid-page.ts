import 'server-only';
import { cookies } from 'next/headers';
import { KID, kidOf } from './family';
/** The child of the current child session (server components). */
export async function kidHere() { const v = (await cookies()).get(KID)?.value ?? null; return kidOf(v && /^[a-f0-9]{64}$/.test(v) ? v : null); }
