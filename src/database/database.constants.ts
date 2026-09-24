export const DRIZZLE = Symbol('DRIZZLE');
export const PG_POOL = Symbol('PG_POOL');

// Fails a hung connection attempt instead of waiting forever for an unreachable server
export const PG_CONNECTION_TIMEOUT_MS = 10_000;
