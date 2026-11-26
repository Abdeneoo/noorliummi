import { randomBytes, scrypt as _scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto';

/** Password hashing with scrypt (Node built-in, no extra dependency). Stored as scrypt$N$r$p$salt$hash (hex). */
const scrypt = (pw: string, salt: Buffer, len: number, o: ScryptOptions) => new Promise<Buffer>((ok, no) => _scrypt(pw, salt, len, o, (e, k) => (e ? no(e) : ok(k))));
const N = 16384, R = 8, P = 1, LEN = 64;
const norm = (pw: string) => pw.normalize('NFKC');

/** Returns an Arabic error message, or null when the password is acceptable. */
export function passwordProblem(pw: unknown, email?: string): string | null {
  if (typeof pw !== 'string') return 'اكتب كلمة المرور.';
  const p = norm(pw);
  if (p.length < 8) return 'كلمة المرور قصيرة: 8 أحرف على الأقل.';
  if (p.length > 128) return 'كلمة المرور طويلة جدًا (128 حرفًا على الأكثر).';
  if (/^(.)\1+$/.test(p) || /^(?:12345678|123456789|1234567890|password|qwertyui|11111111|00000000|abcdefgh)/i.test(p)) return 'كلمة المرور سهلة التخمين. اختر غيرها.';
  if (email && p.toLowerCase() === email.toLowerCase()) return 'لا تجعل كلمة المرور هي بريدك.';
  return null;
}
export async function hashPassword(pw: string): Promise<string> {
  const salt = randomBytes(16);
  const k = await scrypt(norm(pw), salt, LEN, { N, r: R, p: P, maxmem: 64 * 1024 * 1024 });
  return `scrypt$${N}$${R}$${P}$${salt.toString('hex')}$${k.toString('hex')}`;
}
export async function verifyPassword(pw: string, stored: string | null | undefined): Promise<boolean> {
  const m = /^scrypt\$(\d+)\$(\d+)\$(\d+)\$([a-f0-9]{32})\$([a-f0-9]{128})$/.exec(stored ?? '');
  // Without a stored hash, still spend the same work so timing does not reveal which addresses exist.
  const [n, r, p, salt, hash] = m ? [Number(m[1]), Number(m[2]), Number(m[3]), m[4], m[5]] : [N, R, P, '0'.repeat(32), '0'.repeat(128)];
  const k = await scrypt(norm(pw), Buffer.from(salt, 'hex'), LEN, { N: n, r, p, maxmem: 64 * 1024 * 1024 });
  return !!m && timingSafeEqual(k, Buffer.from(hash, 'hex'));
}
