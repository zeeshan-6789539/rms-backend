import type { refreshTokens } from '../schema/refresh-tokens.schema.js';

export type IRefreshTokenRow = typeof refreshTokens.$inferSelect;
export type INewRefreshTokenRow = typeof refreshTokens.$inferInsert;
