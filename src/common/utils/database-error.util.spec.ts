import { ConflictException, HttpStatus } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { mapDatabaseError, withDatabaseErrors } from './database-error.util.js';

const pgError = (code: string, constraint?: string): unknown =>
  Object.assign(new Error('driver failure'), { code, constraint });

describe('mapDatabaseError', () => {
  it('turns a unique violation into a 409 using the constraint message', () => {
    const result = mapDatabaseError(
      pgError('23505', 'users_username_unique_idx'),
      { users_username_unique_idx: 'That username is already taken' },
    );

    expect(result).toBeInstanceOf(ConflictException);
    expect(result?.getStatus()).toBe(HttpStatus.CONFLICT);
    expect(result?.message).toBe('That username is already taken');
  });

  it('falls back to a generic message for an unmapped constraint', () => {
    const result = mapDatabaseError(pgError('23505', 'some_other_idx'));

    expect(result?.message).toBe('A record with these details already exists');
  });

  it('turns a foreign key violation into a 400', () => {
    expect(mapDatabaseError(pgError('23503'))?.getStatus()).toBe(
      HttpStatus.BAD_REQUEST,
    );
  });

  it('turns a deadlock into a retryable 409', () => {
    expect(mapDatabaseError(pgError('40P01'))?.getStatus()).toBe(
      HttpStatus.CONFLICT,
    );
  });

  it('ignores errors that are not from the driver', () => {
    expect(mapDatabaseError(new Error('boom'))).toBeUndefined();
    expect(mapDatabaseError(pgError('99999'))).toBeUndefined();
  });
});

describe('withDatabaseErrors', () => {
  it('returns the operation result when nothing throws', async () => {
    await expect(withDatabaseErrors(async () => 'ok')).resolves.toBe('ok');
  });

  it('rethrows a mapped exception', async () => {
    await expect(
      withDatabaseErrors(
        () => Promise.reject(pgError('23505', 'users_username_unique_idx')),
        { users_username_unique_idx: 'That username is already taken' },
      ),
    ).rejects.toThrow('That username is already taken');
  });

  it('rethrows an unrecognised error untouched', async () => {
    await expect(
      withDatabaseErrors(() => Promise.reject(new Error('boom'))),
    ).rejects.toThrow('boom');
  });
});
