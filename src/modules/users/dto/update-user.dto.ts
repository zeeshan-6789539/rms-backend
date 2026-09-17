import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto.js';

// password stays optional here — omit it to leave the password unchanged
export class UpdateUserDto extends PartialType(CreateUserDto) {}
