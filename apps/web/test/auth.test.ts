import { describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
describe('account email normalisation', () => {
  it('accepts plain addresses and rejects others', async () => {
    const { normEmail } = await import('../src/lib/auth');
    expect(normEmail('  Me@Example.COM ')).toBe('me@example.com');
    expect(normEmail('no-reply@noorliummi.io')).toBe('no-reply@noorliummi.io');
    for (const bad of ['', 'a', 'a@b', 'a b@c.com', '<x>@y.com', 'x@y.c', 1, null]) expect(normEmail(bad)).toBeNull();
  });
});
