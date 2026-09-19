import { PartialType } from '@nestjs/swagger';
import { CreateSubcategoryDto } from './create-subcategory.dto.js';

export class UpdateSubcategoryDto extends PartialType(CreateSubcategoryDto) {}
