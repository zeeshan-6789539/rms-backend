import type { JwtSignOptions } from '@nestjs/jwt';

export interface IJwtConfig {
  accessSecret: string;
  accessExpiresIn: JwtSignOptions['expiresIn'];
  refreshSecret: string;
  refreshExpiresIn: JwtSignOptions['expiresIn'];
  issuer: string;
}
