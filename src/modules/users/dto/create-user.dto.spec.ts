import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { CreateUserDto } from './create-user.dto.js';

const baseUser = {
  email: 'aisha@rms.local',
  password: 'password123',
  name: 'Aisha Khan',
};

const phoneErrors = async (phone?: string) => {
  const dto = plainToInstance(CreateUserDto, { ...baseUser, phone });
  const errors = await validate(dto);
  return errors.filter((error) => error.property === 'phone');
};

describe('CreateUserDto phone', () => {
  it('accepts a local Pakistani number', async () => {
    expect(await phoneErrors('03296789539')).toHaveLength(0);
  });

  it('accepts an international Pakistani number', async () => {
    expect(await phoneErrors('+923296789539')).toHaveLength(0);
  });

  it('is optional', async () => {
    expect(await phoneErrors(undefined)).toHaveLength(0);
  });

  it('rejects a number that is too short', async () => {
    const errors = await phoneErrors('0329678953');
    expect(errors).toHaveLength(1);
    expect(errors[0]?.constraints).toMatchObject({
      isPhoneNumber: 'phone must be a valid Pakistani number, e.g. 03296789539',
    });
  });

  it('rejects a number from another country', async () => {
    const errors = await phoneErrors('+14155552671');
    expect(errors).toHaveLength(1);
  });
});
