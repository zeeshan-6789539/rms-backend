import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  DEFAULT_RENT_DUE_DAY,
  MAX_RENT_DUE_DAY,
  MIN_RENT_DUE_DAY,
} from '../../../common/constants/rent-due-day.constants.js';
import { PropertyType } from '../../../common/enums/property-type.enum.js';

const RENT_DUE_DAY_MESSAGE = `rentDueDay must be a whole day of the month between ${MIN_RENT_DUE_DAY} and ${MAX_RENT_DUE_DAY}`;

export class CreatePropertyDto {
  @ApiProperty({ example: 'Sunset Apartments' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  @MaxLength(500)
  addressLine1!: string;

  @ApiProperty({ example: 'Karachi' })
  @IsString()
  @MaxLength(100)
  city!: string;

  @ApiProperty({ enum: PropertyType, example: PropertyType.HOME })
  @IsEnum(PropertyType, {
    message: `propertyType must be one of: ${Object.values(PropertyType).join(', ')}`,
  })
  propertyType!: PropertyType;

  @ApiPropertyOptional({
    minimum: MIN_RENT_DUE_DAY,
    maximum: MAX_RENT_DUE_DAY,
    default: DEFAULT_RENT_DUE_DAY,
    description: 'Day of the month the monthly rent invoice falls due',
  })
  @IsInt({ message: RENT_DUE_DAY_MESSAGE })
  @Min(MIN_RENT_DUE_DAY, { message: RENT_DUE_DAY_MESSAGE })
  @Max(MAX_RENT_DUE_DAY, { message: RENT_DUE_DAY_MESSAGE })
  @IsOptional()
  rentDueDay?: number;

  @ApiPropertyOptional({
    default: true,
    description: 'true is active, false is deactivated',
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
