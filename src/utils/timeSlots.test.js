import { describe, expect, it } from 'vitest';
import { buildPreferredTimeOptions, parseOpeningHours } from './timeSlots';

describe('preferred time slots', () => {
  it('parses Daily 11:00 AM – 11:00 PM', () => {
    expect(parseOpeningHours('Daily 11:00 AM – 11:00 PM')).toEqual({
      open: { hours: 11, minutes: 0 },
      close: { hours: 23, minutes: 0 },
    });
  });

  it('starts with ASAP and uses 15-minute labels', () => {
    const now = new Date('2026-11-02T12:02:00');
    const options = buildPreferredTimeOptions('Daily 11:00 AM – 11:00 PM', now);

    expect(options[0]).toMatchObject({ value: 'ASAP' });
    expect(options.some((option) => /12:45/i.test(option.label))).toBe(true);
    expect(options.filter((option) => option.group === 'Today').length).toBeGreaterThan(4);
    expect(options.filter((option) => option.group === 'Tomorrow').length).toBeGreaterThan(4);
  });
});
