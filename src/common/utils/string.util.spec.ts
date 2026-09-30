import { describe, expect, it } from 'vitest';
import { escapeLikePattern, formatSequenceCode } from './string.util.js';

describe('formatSequenceCode', () => {
  it('zero-pads the value to the width', () => {
    expect(formatSequenceCode('P', 7)).toBe('P-0007');
  });

  it('keeps every digit once the value outgrows the width', () => {
    expect(formatSequenceCode('P', 12345)).toBe('P-12345');
  });
});

describe('escapeLikePattern', () => {
  it('escapes the wildcards so a search term cannot widen the match', () => {
    expect(escapeLikePattern('100%_off')).toBe('100\\%\\_off');
  });

  it('escapes the escape character itself', () => {
    expect(escapeLikePattern('a\\b')).toBe('a\\\\b');
  });
});
