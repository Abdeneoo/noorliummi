import { describe, expect, it } from 'vitest';
import { hashPassword, passwordProblem, verifyPassword } from '../src/lib/password';
describe('passwords', () => {
  it('hashes with a random salt and verifies only the right password', async () => {
    const a = await hashPassword('نور لأمي 2026'); const b = await hashPassword('نور لأمي 2026');
    expect(a).toMatch(/^scrypt\$16384\$8\$1\$[a-f0-9]{32}\$[a-f0-9]{128}$/); expect(a).not.toBe(b);
    expect(await verifyPassword('نور لأمي 2026', a)).toBe(true);
    expect(await verifyPassword('نور لأمي 2025', a)).toBe(false);
    expect(await verifyPassword('anything', null)).toBe(false);
    expect(await verifyPassword('anything', 'garbage')).toBe(false);
  });
  it('rejects short, trivial or email-equal passwords', () => {
    expect(passwordProblem('short')).toMatch(/قصيرة/);
    expect(passwordProblem('12345678abc')).toMatch(/التخمين/);
    expect(passwordProblem('aaaaaaaaaa')).toMatch(/التخمين/);
    expect(passwordProblem('me@x.com', 'me@x.com')).toMatch(/بريدك/);
    expect(passwordProblem(undefined)).not.toBeNull();
    expect(passwordProblem('Sabr-wa-Salah 7')).toBeNull();
  });
});
