import { describe, expect, it } from 'vitest';
import { escapeLikePattern } from './string.util.js';

describe('escapeLikePattern', () => {
  it('escapes the wildcards so a search term cannot widen the match', () => {
    expect(escapeLikePattern('100%_off')).toBe('100\\%\\_off');
  });

  it('escapes the escape character itself', () => {
    expect(escapeLikePattern('a\\b')).toBe('a\\\\b');
  });
});
