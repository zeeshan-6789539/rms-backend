import { describe, expect, it } from 'vitest';
import { decryptSecret, encryptSecret } from './encryption.util.js';

const KEY = 'a'.repeat(64);
const OTHER_KEY = 'b'.repeat(64);

describe('encryptSecret / decryptSecret', () => {
  it('round-trips the plaintext', () => {
    expect(decryptSecret(encryptSecret('smtp-password', KEY), KEY)).toBe('smtp-password');
  });

  it('never stores the plaintext and uses a fresh IV each time', () => {
    const first = encryptSecret('smtp-password', KEY);

    expect(first).not.toContain('smtp-password');
    expect(encryptSecret('smtp-password', KEY)).not.toBe(first);
  });

  it('rejects a payload decrypted with the wrong key', () => {
    expect(() => decryptSecret(encryptSecret('smtp-password', KEY), OTHER_KEY)).toThrow();
  });

  it('rejects a malformed payload', () => {
    expect(() => decryptSecret('not-encrypted', KEY)).toThrow(/malformed/);
  });
});
