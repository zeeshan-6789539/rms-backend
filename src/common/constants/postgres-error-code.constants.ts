// https://www.postgresql.org/docs/current/errcodes-appendix.html
export const PG_UNIQUE_VIOLATION = '23505';
export const PG_FOREIGN_KEY_VIOLATION = '23503';
export const PG_NOT_NULL_VIOLATION = '23502';
export const PG_CHECK_VIOLATION = '23514';
export const PG_STRING_TOO_LONG = '22001';
export const PG_INVALID_TEXT_REPRESENTATION = '22P02';
export const PG_NUMERIC_OUT_OF_RANGE = '22003';
export const PG_SERIALIZATION_FAILURE = '40001';
export const PG_DEADLOCK_DETECTED = '40P01';
export const PG_LOCK_NOT_AVAILABLE = '55P03';
export const PG_CONNECTION_FAILURE = '08006';
