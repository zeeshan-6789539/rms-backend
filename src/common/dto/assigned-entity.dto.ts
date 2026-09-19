import { ApiProperty } from '@nestjs/swagger';

export class AssignedEntityDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Sunset Apartments' })
  name!: string;
}
