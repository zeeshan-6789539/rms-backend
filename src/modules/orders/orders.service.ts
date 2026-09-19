import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '../../common/enums/order-status.enum.js';
import type { IPaginatedResult } from '../../common/interfaces/i-paginated-result.js';
import { buildPaginatedResult } from '../../common/utils/pagination.util.js';
import type { IAuthenticatedUser } from '../auth/interfaces/i-authenticated-user.js';
import { ProductsService } from '../products/products.service.js';
import type {
  CheckoutOrderDto,
  CheckoutOrderItemDto,
} from './dto/checkout-order.dto.js';
import type { OrderResponseDto } from './dto/order-response.dto.js';
import type { QueryOrdersDto } from './dto/query-orders.dto.js';
import type { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import type { IOrderWithItems } from './interfaces/i-order-with-items.js';
import { toOrderResponse } from './mappers/order.mapper.js';
import { ORDER_STATUS_TRANSITIONS } from './orders.constants.js';
import { OrdersRepository } from './orders.repository.js';

interface IAggregatedItem {
  quantity: number;
  price: number;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly productsService: ProductsService,
  ) {}

  async checkout(
    user: IAuthenticatedUser,
    dto: CheckoutOrderDto,
  ): Promise<OrderResponseDto> {
    const companyId = this.requireCompanyId(user);
    const aggregated = this.aggregateItems(dto.items);
    const productIds = [...aggregated.keys()];

    const availableProducts = await this.productsService.findManyForCheckout(
      companyId,
      productIds,
    );
    const productsById = new Map(
      availableProducts.map((product) => [product.id, product]),
    );

    if (productsById.size !== productIds.length) {
      throw new NotFoundException('One or more products were not found');
    }

    for (const [productId, item] of aggregated) {
      // Guaranteed present — sizes matched above
      const product = productsById.get(productId);

      if (!product) {
        continue;
      }

      const currentSellPrice = Number(product.sellPrice).toFixed(2);
      const submittedPrice = item.price.toFixed(2);

      if (currentSellPrice !== submittedPrice) {
        throw new ConflictException(
          `The price for "${product.name}" has changed. Refresh your cart and try again.`,
        );
      }

      if (product.quantity < item.quantity) {
        throw new ConflictException(
          `Only ${product.quantity} unit(s) of "${product.name}" are left in stock.`,
        );
      }
    }

    const order = await this.ordersRepository.runInTransaction(async (tx) => {
      const createdOrder = await this.ordersRepository.createOrder(tx, {
        companyId,
        userId: user.id,
        status: OrderStatus.PENDING,
      });

      await this.ordersRepository.createOrderItems(
        tx,
        [...aggregated.entries()].map(([productId, item]) => ({
          orderId: createdOrder.id,
          productId,
          quantity: item.quantity,
          price: item.price.toFixed(2),
        })),
      );

      for (const [productId, item] of aggregated) {
        const decremented =
          await this.productsService.decrementStockInTransaction(
            tx,
            productId,
            item.quantity,
          );

        if (!decremented) {
          const product = productsById.get(productId);
          throw new ConflictException(
            `Stock for "${product?.name ?? productId}" changed while checking out. Please retry.`,
          );
        }
      }

      return createdOrder;
    });

    return toOrderResponse(await this.findOwnedRowWithItemsOrFail(companyId, order.id));
  }

  async findAll(
    user: IAuthenticatedUser,
    query: QueryOrdersDto,
  ): Promise<IPaginatedResult<OrderResponseDto>> {
    const companyId = this.requireCompanyId(user);
    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;

    if (from && to && from > to) {
      throw new BadRequestException('from must be before to');
    }

    const { items, totalItems } = await this.ordersRepository.findMany({
      page: query.page,
      limit: query.limit,
      search: query.search,
      companyId,
      status: query.status,
      from,
      to,
      sortOrder: query.sortOrder,
    });

    return buildPaginatedResult(
      items.map(toOrderResponse),
      totalItems,
      query.page,
      query.limit,
    );
  }

  async findOne(
    user: IAuthenticatedUser,
    id: string,
  ): Promise<OrderResponseDto> {
    return toOrderResponse(
      await this.findOwnedRowWithItemsOrFail(this.requireCompanyId(user), id),
    );
  }

  async updateStatus(
    user: IAuthenticatedUser,
    id: string,
    dto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    const companyId = this.requireCompanyId(user);
    const current = await this.findOwnedRowWithItemsOrFail(companyId, id);

    const allowedNext = ORDER_STATUS_TRANSITIONS[current.status];

    if (!allowedNext.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot move an order from "${current.status}" to "${dto.status}"`,
      );
    }

    const updated = await this.ordersRepository.updateStatus(id, dto.status);

    if (!updated) {
      throw new NotFoundException(
        `No order was found with id ${id} — it may have been removed while you were editing it`,
      );
    }

    return toOrderResponse(await this.findOwnedRowWithItemsOrFail(companyId, id));
  }

  private async findOwnedRowWithItemsOrFail(
    companyId: string,
    id: string,
  ): Promise<IOrderWithItems> {
    const row = await this.ordersRepository.findByIdWithItems(id);

    if (!row || row.companyId !== companyId) {
      throw new NotFoundException(`No order was found with id ${id}`);
    }

    return row;
  }

  private requireCompanyId(user: IAuthenticatedUser): string {
    if (!user.companyId) {
      throw new ConflictException('Your account is not linked to a company');
    }

    return user.companyId;
  }

  // Duplicate productId lines are summed; the same product at two different
  // client-submitted prices means the client's cart state is inconsistent
  private aggregateItems(
    items: CheckoutOrderItemDto[],
  ): Map<string, IAggregatedItem> {
    const aggregated = new Map<string, IAggregatedItem>();

    for (const item of items) {
      const existing = aggregated.get(item.productId);

      if (!existing) {
        aggregated.set(item.productId, {
          quantity: item.quantity,
          price: item.price,
        });

        continue;
      }

      if (existing.price.toFixed(2) !== item.price.toFixed(2)) {
        throw new BadRequestException(
          `productId ${item.productId} was submitted twice with different prices`,
        );
      }

      existing.quantity += item.quantity;
    }

    return aggregated;
  }
}
