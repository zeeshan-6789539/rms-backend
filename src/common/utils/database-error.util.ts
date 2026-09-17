import {
  BadRequestException,
  ConflictException,
  HttpException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  PG_CHECK_VIOLATION,
  PG_CONNECTION_FAILURE,
  PG_DEADLOCK_DETECTED,
  PG_FOREIGN_KEY_VIOLATION,
  PG_INVALID_TEXT_REPRESENTATION,
  PG_LOCK_NOT_AVAILABLE,
  PG_NOT_NULL_VIOLATION,
  PG_NUMERIC_OUT_OF_RANGE,
  PG_SERIALIZATION_FAILURE,
  PG_STRING_TOO_LONG,
  PG_UNIQUE_VIOLATION,
} from '../constants/postgres-error-code.constants.js';
import type { IPostgresError } from '../interfaces/i-postgres-error.js';

const isPostgresError = (error: unknown): error is IPostgresError =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  typeof (error as { code: unknown }).code === 'string';

// Turns a raw driver error into a safe, actionable HTTP exception. Callers pass
// a constraint -> message map so each table explains its own rules.
export const mapDatabaseError = (
  error: unknown,
  constraintMessages: Record<string, string> = {},
): HttpException | undefined => {
  if (!isPostgresError(error)) {
    return undefined;
  }

  const named = error.constraint
    ? constraintMessages[error.constraint]
    : undefined;

  switch (error.code) {
    case PG_UNIQUE_VIOLATION:
      return new ConflictException(
        named ?? 'A record with these details already exists',
      );

    case PG_FOREIGN_KEY_VIOLATION:
      return new BadRequestException(
        named ?? 'A referenced record does not exist or is still in use',
      );

    case PG_CHECK_VIOLATION:
      return new BadRequestException(
        named ?? 'The submitted values break a rule enforced by the database',
      );

    case PG_NOT_NULL_VIOLATION:
      return new BadRequestException(
        named ?? `The field "${error.column ?? 'unknown'}" is required`,
      );

    case PG_STRING_TOO_LONG:
      return new BadRequestException(
        named ?? 'One of the submitted values is longer than allowed',
      );

    case PG_NUMERIC_OUT_OF_RANGE:
      return new BadRequestException(
        named ?? 'One of the submitted numbers is out of range',
      );

    case PG_INVALID_TEXT_REPRESENTATION:
      return new BadRequestException(
        named ?? 'One of the submitted values has the wrong format',
      );

    case PG_SERIALIZATION_FAILURE:
    case PG_DEADLOCK_DETECTED:
    case PG_LOCK_NOT_AVAILABLE:
      return new ConflictException(
        'This record was changed by another request. Please retry.',
      );

    case PG_CONNECTION_FAILURE:
      return new ServiceUnavailableException(
        'The database is unreachable. Please try again shortly.',
      );

    default:
      return undefined;
  }
};

// Wraps a repository call so driver errors surface as proper HTTP responses
export const withDatabaseErrors = async <T>(
  operation: () => Promise<T>,
  constraintMessages: Record<string, string> = {},
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    throw mapDatabaseError(error, constraintMessages) ?? error;
  }
};
