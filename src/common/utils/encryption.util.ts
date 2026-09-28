import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const PAYLOAD_SEPARATOR = ':';

// Reversible (unlike hashSecret) because the plaintext must be sent to a third party, e.g. an SMTP login
export const encryptSecret = (plain: string, keyHex: string): string => {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, Buffer.from(keyHex, 'hex'), iv);
  const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);

  return [iv, cipher.getAuthTag(), ciphertext]
    .map((part) => part.toString('base64'))
    .join(PAYLOAD_SEPARATOR);
};

export const decryptSecret = (payload: string, keyHex: string): string => {
  const [iv, authTag, ciphertext] = payload
    .split(PAYLOAD_SEPARATOR)
    .map((part) => Buffer.from(part, 'base64'));

  if (!iv || !authTag || !ciphertext) {
    throw new Error('Encrypted secret is malformed — expected "iv:authTag:ciphertext"');
  }

  const decipher = createDecipheriv(ALGORITHM, Buffer.from(keyHex, 'hex'), iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
};
