import { OmitType } from '@nestjs/swagger';
import { CreateUserDto } from '../../users/dto/create-user.dto.js';

// Self-service signup cannot choose its own role or activation state
export class RegisterDto extends OmitType(CreateUserDto, [
  'role',
  'status',
] as const) {}
