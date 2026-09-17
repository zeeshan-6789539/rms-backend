import { ApiProperty } from '@nestjs/swagger';
import { IsJWT } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'The refresh token issued by /auth/login' })
  @IsJWT()
  refreshToken!: string;
}
