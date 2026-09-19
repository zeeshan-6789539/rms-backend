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
import { CategoriesService } from './categories.service.js';
import { CategoryResponseDto } from './dto/category-response.dto.js';
import { CategoryTreeResponseDto } from './dto/category-tree-response.dto.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { QueryCategoriesDto } from './dto/query-categories.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller({ path: 'categories', version: '1' })
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(UserRole.CLIENT_ADMIN, UserRole.MANAGER)
  @ResponseMessage('Category created successfully')
  @ApiOperation({ summary: 'Create a category for your company' })
  create(
    @CurrentUser() user: IAuthenticatedUser,
    @Body() dto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.create(user, dto);
  }

  @Get()
  @ResponseMessage('Categories retrieved successfully')
  @ApiOperation({
    summary: 'List categories for your company, paginated and searchable',
    description: 'Newest first by default. Search matches name.',
  })
  findAll(
    @CurrentUser() user: IAuthenticatedUser,
    @Query() query: QueryCategoriesDto,
  ): Promise<IPaginatedResult<CategoryResponseDto>> {
    return this.categoriesService.findAll(user, query);
  }

  @Get('tree')
  @ResponseMessage('Category tree retrieved successfully')
  @ApiOperation({
    summary:
      'List active categories with nested active subcategories and product counts',
  })
  findTree(
    @CurrentUser() user: IAuthenticatedUser,
  ): Promise<CategoryTreeResponseDto[]> {
    return this.categoriesService.findTree(user);
  }

  @Get(':id')
  @ResponseMessage('Category retrieved successfully')
  @ApiOperation({ summary: 'Get a category by id' })
  findOne(
    @CurrentUser() user: IAuthenticatedUser,
    @Param() params: UuidParamDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.findOne(user, params.id);
  }

  @Patch(':id')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.MANAGER)
  @ResponseMessage('Category updated successfully')
  @ApiOperation({ summary: 'Update a category' })
  update(
    @CurrentUser() user: IAuthenticatedUser,
    @Param() params: UuidParamDto,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.update(user, params.id, dto);
  }

  @Patch(':id/restore')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.MANAGER)
  @ResponseMessage('Category reactivated successfully')
  @ApiOperation({ summary: 'Set status back to active' })
  restore(
    @CurrentUser() user: IAuthenticatedUser,
    @Param() params: UuidParamDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.restore(user, params.id);
  }

  // 200, not 204 — a 204 carries no body, so the envelope would never arrive
  @Delete(':id')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Category deleted successfully')
  @ApiOperation({
    summary: 'Delete a category',
    description:
      'Sets status to false. Refused while it still has active subcategories.',
  })
  remove(
    @CurrentUser() user: IAuthenticatedUser,
    @Param() params: UuidParamDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.remove(user, params.id);
  }
}
