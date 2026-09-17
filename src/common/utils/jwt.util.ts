import type { JwtSignOptions } from '@nestjs/jwt';

// Narrows a validated env string ("15m", "7d") to the ms-backed expiresIn union
export const toExpiresIn = (value: string): JwtSignOptions['expiresIn'] =>
  value as JwtSignOptions['expiresIn'];
