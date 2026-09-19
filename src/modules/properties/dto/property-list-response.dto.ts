import { ApiProperty } from '@nestjs/swagger';
import { AssignedEntityDto } from '../../../common/dto/assigned-entity.dto.js';
import { PropertyResponseDto } from './property-response.dto.js';

export class PropertyListResponseDto extends PropertyResponseDto {
  @ApiProperty({
    type: [AssignedEntityDto],
    description: 'Tenant(s) with an active lease on this property',
  })
  tenants!: AssignedEntityDto[];
}
