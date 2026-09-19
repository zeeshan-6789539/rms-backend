import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UuidParamDto } from '../../common/dto/uuid-param.dto.js';
import { UserRole } from '../../common/enums/user-role.enum.js';
import type { IPaginatedResult } from '../../common/interfaces/i-paginated-result.js';
import type { IAuthenticatedUser } from '../auth/interfaces/i-authenticated-user.js';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto.js';
import { QuerySubcategoriesDto } from './dto/query-subcategories.dto.js';
import { SubcategoryResponseDto } from './dto/subcategory-response.dto.js';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto.js';
import { SubcategoriesService } from './subcategories.service.js';

@ApiTags('Subcategories')
@ApiBearerAuth()
@Controller({ path: 'subcategories', version: '1' })
export class SubcategoriesController {
  constructor(private readonly subcategoriesService: SubcategoriesService) {}

  @Post()
  @Roles(UserRole.CLIENT_ADMIN, UserRole.MANAGER)
  @ResponseMessage('Subcategory created successfully')
  @ApiOperation({ summary: 'Create a subcategory under a category' })
  create(
    @CurrentUser() user: IAuthenticatedUser,
    @Body() dto: CreateSubcategoryDto,
  ): Promise<SubcategoryResponseDto> {
    return this.subcategoriesService.create(user, dto);
  }

  @Get()
  @ResponseMessage('Subcategories retrieved successfully')
  @ApiOperation({
    summary: 'List subcategories for your company, paginated and searchable',
    description:
      'Newest first by default. Filter with categoryId; search matches name.',
  })
  findAll(
    @CurrentUser() user: IAuthenticatedUser,
    @Query() query: QuerySubcategoriesDto,
  ): Promise<IPaginatedResult<SubcategoryResponseDto>> {
    return this.subcategoriesService.findAll(user, query);
  }

  @Get(':id')
  @ResponseMessage('Subcategory retrieved successfully')
  @ApiOperation({ summary: 'Get a subcategory by id' })
  findOne(
    @CurrentUser() user: IAuthenticatedUser,
    @Param() params: UuidParamDto,
  ): Promise<SubcategoryResponseDto> {
    return this.subcategoriesService.findOne(user, params.id);
  }

  @Patch(':id')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.MANAGER)
  @ResponseMessage('Subcategory updated successfully')
  @ApiOperation({ summary: 'Update a subcategory' })
  update(
    @CurrentUser() user: IAuthenticatedUser,
    @Param() params: UuidParamDto,
    @Body() dto: UpdateSubcategoryDto,
  ): Promise<SubcategoryResponseDto> {
    return this.subcategoriesService.update(user, params.id, dto);
  }

  @Patch(':id/restore')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.MANAGER)
  @ResponseMessage('Subcategory reactivated successfully')
  @ApiOperation({ summary: 'Set status back to active' })
  restore(
    @CurrentUser() user: IAuthenticatedUser,
    @Param() params: UuidParamDto,
  ): Promise<SubcategoryResponseDto> {
    return this.subcategoriesService.restore(user, params.id);
  }

  // 200, not 204 — a 204 carries no body, so the envelope would never arrive
  @Delete(':id')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Subcategory deleted successfully')
  @ApiOperation({
    summary: 'Delete a subcategory',
    description:
      'Sets status to false. Refused while it still has active products.',
  })
  remove(
    @CurrentUser() user: IAuthenticatedUser,
    @Param() params: UuidParamDto,
  ): Promise<SubcategoryResponseDto> {
    return this.subcategoriesService.remove(user, params.id);
  }
}
