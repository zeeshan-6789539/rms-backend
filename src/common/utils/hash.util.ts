import { hash, verify } from '@node-rs/argon2';

// OWASP argon2id baseline: 19 MiB memory, 2 iterations, 1 lane
const ARGON2_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

export const hashSecret = (plain: string): Promise<string> =>
  hash(plain, ARGON2_OPTIONS);

export const verifySecret = async (
  digest: string,
  plain: string,
): Promise<boolean> => {
  try {
    return await verify(digest, plain);
  } catch {
    return false;
  }
};
