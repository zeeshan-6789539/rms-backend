import { describe, expect, it } from 'vitest';
import './timezone.bootstrap.js';

describe('timezone bootstrap', () => {
  it('pins the process to UTC', () => {
    expect(process.env.TZ).toBe('UTC');
    expect(new Date().getTimezoneOffset()).toBe(0);
  });

  it('serialises dates as UTC instants', () => {
    const date = new Date('2026-09-15T16:45:14.463Z');

    expect(JSON.stringify({ at: date })).toBe(
      '{"at":"2026-09-15T16:45:14.463Z"}',
    );
    expect(date.toISOString()).toBe('2026-09-15T16:45:14.463Z');
  });
});
