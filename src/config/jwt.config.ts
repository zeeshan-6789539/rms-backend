import { registerAs } from '@nestjs/config';
import { toExpiresIn } from '../common/utils/jwt.util.js';
import { getEnv } from './env.js';
import type { IJwtConfig } from './interfaces/i-jwt-config.js';

export const JWT_CONFIG_NAMESPACE = 'jwt';

export const jwtConfig = registerAs(JWT_CONFIG_NAMESPACE, (): IJwtConfig => {
  const env = getEnv();

  return {
    accessSecret: env.JWT_ACCESS_SECRET,
    accessExpiresIn: toExpiresIn(env.JWT_ACCESS_EXPIRES_IN),
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpiresIn: toExpiresIn(env.JWT_REFRESH_EXPIRES_IN),
    issuer: env.JWT_ISSUER,
  };
});
