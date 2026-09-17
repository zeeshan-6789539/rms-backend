// Deterministic env for e2e runs, applied before AppModule is imported
process.env.TZ = 'UTC';
process.env.NODE_ENV ??= 'test';
process.env.LOG_LEVEL ??= 'fatal';
process.env.SWAGGER_ENABLED ??= 'false';
process.env.DATABASE_URL ??=
  'postgresql://postgres:postgres@localhost:5432/rms_test';
process.env.JWT_ACCESS_SECRET ??= 'e2e-access-secret-value-at-least-32-chars';
process.env.JWT_REFRESH_SECRET ??= 'e2e-refresh-secret-value-at-least-32-chars';
