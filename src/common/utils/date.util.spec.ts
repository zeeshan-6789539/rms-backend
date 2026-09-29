import { describe, expect, it } from 'vitest';
import { withDayOfMonth } from './date.util.js';

describe('withDayOfMonth', () => {
  it('pads a single-digit day', () => {
    expect(withDayOfMonth('2026-09-01', 5)).toBe('2026-09-05');
  });

  it('keeps the year and month untouched', () => {
    expect(withDayOfMonth('2026-02-01', 28)).toBe('2026-02-28');
  });
});
