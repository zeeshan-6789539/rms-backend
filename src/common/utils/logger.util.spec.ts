import { describe, expect, it } from 'vitest';
import { toNestLogLevels } from './logger.util.js';

describe('toNestLogLevels', () => {
  it('maps info to log and keeps every more severe level', () => {
    expect(toNestLogLevels('info')).toEqual(['fatal', 'error', 'warn', 'log']);
  });

  it('enables everything for trace', () => {
    expect(toNestLogLevels('trace')).toEqual([
      'fatal',
      'error',
      'warn',
      'log',
      'debug',
      'verbose',
    ]);
  });

  it('keeps only fatal for fatal', () => {
    expect(toNestLogLevels('fatal')).toEqual(['fatal']);
  });
});
