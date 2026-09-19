import { ApiProperty } from '@nestjs/swagger';
import { AssignedEntityDto } from '../../../common/dto/assigned-entity.dto.js';
import { TenantResponseDto } from './tenant-response.dto.js';

export class TenantListResponseDto extends TenantResponseDto {
  @ApiProperty({
    type: [AssignedEntityDto],
    description: 'Property/properties this tenant currently holds an active lease on',
  })
  properties!: AssignedEntityDto[];
}
