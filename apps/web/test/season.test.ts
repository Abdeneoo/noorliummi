import { describe, expect, it } from 'vitest';
import { seasonFor } from '../src/components/SeasonCard';
describe('season card', () => {
  it('shows Friday al-Kahf on an ordinary Friday', () => { expect(seasonFor(new Date('2026-11-27T10:00:00'))?.title).toBe('سورة الكهف'); });
  it('shows nothing on an ordinary weekday', () => { expect(seasonFor(new Date('2026-11-25T10:00:00'))).toBeNull(); });
  it('detects Ramadan 1448', () => { expect(seasonFor(new Date('2027-02-15T10:00:00'))?.title).toBe('رمضان'); });
});
