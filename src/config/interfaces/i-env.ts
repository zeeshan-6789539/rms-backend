import type { z } from 'zod';
import type { envSchema } from '../env.validation.js';

export type IEnv = z.infer<typeof envSchema>;
