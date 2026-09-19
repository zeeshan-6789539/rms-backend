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
import { CreateProductDto } from './dto/create-product.dto.js';
import { ProductPriceHistoryResponseDto } from './dto/product-price-history-response.dto.js';
import { ProductResponseDto } from './dto/product-response.dto.js';
import { QueryProductsDto } from './dto/query-products.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { ProductsService } from './products.service.js';

@ApiTags('Products')
@ApiBearerAuth()
@Controller({ path: 'products', version: '1' })
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(UserRole.CLIENT_ADMIN, UserRole.MANAGER)
  @ResponseMessage('Product created successfully')
  @ApiOperation({ summary: 'Create a product under a subcategory' })
  create(
    @CurrentUser() user: IAuthenticatedUser,
    @Body() dto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.create(user, dto);
  }

  @Get()
  @ResponseMessage('Products retrieved successfully')
  @ApiOperation({
    summary: 'List products for your company, paginated and searchable',
    description:
      'Newest first by default. Filter with subcategoryId; search matches name.',
  })
  findAll(
    @CurrentUser() user: IAuthenticatedUser,
    @Query() query: QueryProductsDto,
  ): Promise<IPaginatedResult<ProductResponseDto>> {
    return this.productsService.findAll(user, query);
  }

  @Get(':id')
  @ResponseMessage('Product retrieved successfully')
  @ApiOperation({ summary: 'Get a product by id' })
  findOne(
    @CurrentUser() user: IAuthenticatedUser,
    @Param() params: UuidParamDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.findOne(user, params.id);
  }

  @Get(':id/price-history')
  @ResponseMessage('Product price history retrieved successfully')
  @ApiOperation({
    summary: 'List every price this product has had, most recent first',
  })
  findPriceHistory(
    @CurrentUser() user: IAuthenticatedUser,
    @Param() params: UuidParamDto,
  ): Promise<ProductPriceHistoryResponseDto[]> {
    return this.productsService.findPriceHistory(user, params.id);
  }

  @Patch(':id')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.MANAGER)
  @ResponseMessage('Product updated successfully')
  @ApiOperation({
    summary: 'Update a product',
    description:
      'Changing sellPrice or purchasePrice closes the current price-history row and opens a new one.',
  })
  update(
    @CurrentUser() user: IAuthenticatedUser,
    @Param() params: UuidParamDto,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.update(user, params.id, dto);
  }

  @Patch(':id/restore')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.MANAGER)
  @ResponseMessage('Product reactivated successfully')
  @ApiOperation({ summary: 'Set status back to active' })
  restore(
    @CurrentUser() user: IAuthenticatedUser,
    @Param() params: UuidParamDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.restore(user, params.id);
  }

  // 200, not 204 — a 204 carries no body, so the envelope would never arrive
  @Delete(':id')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Product deleted successfully')
  @ApiOperation({
    summary: 'Delete a product',
    description: 'Sets status to false.',
  })
  remove(
    @CurrentUser() user: IAuthenticatedUser,
    @Param() params: UuidParamDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.remove(user, params.id);
  }
}
