import { describe, expect, it } from 'vitest';
import {
  addDays,
  randomDate,
  randomInt,
  randomItem,
  weightedPick,
} from './random.util.js';

describe('randomInt', () => {
  it('stays within the inclusive bounds', () => {
    for (let i = 0; i < 100; i += 1) {
      const value = randomInt(5, 5);
      expect(value).toBe(5);
    }
  });

  it('never exceeds the given range', () => {
    for (let i = 0; i < 100; i += 1) {
      const value = randomInt(1, 3);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(3);
    }
  });
});

describe('randomItem', () => {
  it('only returns values from the given array', () => {
    const items = ['a', 'b', 'c'];

    for (let i = 0; i < 50; i += 1) {
      expect(items).toContain(randomItem(items));
    }
  });
});

describe('randomDate', () => {
  it('stays within the inclusive bounds', () => {
    const from = new Date('2025-01-01T00:00:00Z');
    const to = new Date('2025-01-02T00:00:00Z');

    for (let i = 0; i < 50; i += 1) {
      const value = randomDate(from, to);
      expect(value.getTime()).toBeGreaterThanOrEqual(from.getTime());
      expect(value.getTime()).toBeLessThanOrEqual(to.getTime());
    }
  });
});

describe('addDays', () => {
  it('shifts the date forward by whole days', () => {
    const base = new Date('2025-01-01T00:00:00Z');
    expect(addDays(base, 5).toISOString()).toBe('2025-01-06T00:00:00.000Z');
  });

  it('shifts the date backward for negative values', () => {
    const base = new Date('2025-01-10T00:00:00Z');
    expect(addDays(base, -5).toISOString()).toBe('2025-01-05T00:00:00.000Z');
  });
});

describe('weightedPick', () => {
  it('always returns the only option when it is the sole entry', () => {
    expect(weightedPick([{ value: 'only', weight: 1 }])).toBe('only');
  });

  it('never returns a zero-weight option', () => {
    for (let i = 0; i < 50; i += 1) {
      const result = weightedPick([
        { value: 'never', weight: 0 },
        { value: 'always', weight: 1 },
      ]);
      expect(result).toBe('always');
    }
  });
});
