import { envSchema } from './env.validation.js';
import type { IEnv } from './interfaces/i-env.js';

let cachedEnv: IEnv | undefined;

// Parsed once per process and reused by every namespaced config factory
export const getEnv = (): IEnv => (cachedEnv ??= envSchema.parse(process.env));
