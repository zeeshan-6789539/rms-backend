import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UuidParamDto } from '../../common/dto/uuid-param.dto.js';
import { UserRole } from '../../common/enums/user-role.enum.js';
import type { IPaginatedResult } from '../../common/interfaces/i-paginated-result.js';
import type { IAuthenticatedUser } from '../auth/interfaces/i-authenticated-user.js';
import { CheckoutOrderDto } from './dto/checkout-order.dto.js';
import { OrderResponseDto } from './dto/order-response.dto.js';
import { QueryOrdersDto } from './dto/query-orders.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { OrdersService } from './orders.service.js';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller({ path: 'orders', version: '1' })
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ResponseMessage('Order placed successfully')
  @ApiOperation({
    summary: 'Check out a set of cart items into a new order',
    description:
      'Validates current price and stock server-side, decrements stock, and creates the order atomically.',
  })
  checkout(
    @CurrentUser() user: IAuthenticatedUser,
    @Body() dto: CheckoutOrderDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.checkout(user, dto);
  }

  @Get()
  @Roles(UserRole.CLIENT_ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ResponseMessage('Orders retrieved successfully')
  @ApiOperation({
    summary: 'List orders for your company, paginated and searchable',
    description:
      'Newest first by default. Filter with status and a from/to created-at range; search matches order id.',
  })
  findAll(
    @CurrentUser() user: IAuthenticatedUser,
    @Query() query: QueryOrdersDto,
  ): Promise<IPaginatedResult<OrderResponseDto>> {
    return this.ordersService.findAll(user, query);
  }

  @Get(':id')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ResponseMessage('Order retrieved successfully')
  @ApiOperation({ summary: 'Get an order by id, with its line items' })
  findOne(
    @CurrentUser() user: IAuthenticatedUser,
    @Param() params: UuidParamDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.findOne(user, params.id);
  }

  @Patch(':id/status')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.MANAGER)
  @ResponseMessage('Order status updated successfully')
  @ApiOperation({
    summary: 'Move an order to its next status',
    description:
      'Only the transitions defined in ORDER_STATUS_TRANSITIONS are allowed.',
  })
  updateStatus(
    @CurrentUser() user: IAuthenticatedUser,
    @Param() params: UuidParamDto,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.updateStatus(user, params.id, dto);
  }
}
