import { describe, expect, it } from 'vitest';
import { uuidv7, uuidv7Timestamp } from './uuid.util.js';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('uuidv7', () => {
  it('produces a canonical uuid with version 7 and the RFC 9562 variant', () => {
    expect(uuidv7()).toMatch(UUID_PATTERN);
  });

  it('never repeats a value', () => {
    const values = new Set(Array.from({ length: 50_000 }, () => uuidv7()));

    expect(values.size).toBe(50_000);
  });

  it('sorts lexicographically in generation order', () => {
    const values = Array.from({ length: 10_000 }, () => uuidv7());

    expect(values).toEqual([...values].sort());
  });

  it('encodes the current time in the leading 48 bits', () => {
    const before = Date.now();
    const value = uuidv7();
    const after = Date.now();

    expect(uuidv7Timestamp(value)).toBeGreaterThanOrEqual(before);
    expect(uuidv7Timestamp(value)).toBeLessThanOrEqual(after + 1);
  });
});
