import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IPaginatedResult } from '../../common/interfaces/i-paginated-result.js';
import { buildPaginatedResult } from '../../common/utils/pagination.util.js';
import type { IDrizzleTransaction } from '../../database/interfaces/i-drizzle-db.js';
import type { IAuthenticatedUser } from '../auth/interfaces/i-authenticated-user.js';
import { SubcategoriesService } from '../subcategories/subcategories.service.js';
import type { CreateProductDto } from './dto/create-product.dto.js';
import type { ProductPriceHistoryResponseDto } from './dto/product-price-history-response.dto.js';
import type { ProductResponseDto } from './dto/product-response.dto.js';
import type { QueryProductsDto } from './dto/query-products.dto.js';
import type { UpdateProductDto } from './dto/update-product.dto.js';
import type { IProductWithPrice } from './interfaces/i-product-with-price.js';
import {
  toProductPriceHistoryResponse,
  toProductResponse,
} from './mappers/product.mapper.js';
import { ProductsRepository } from './products.repository.js';

const toMoneyString = (value: number): string => value.toFixed(2);

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly subcategoriesService: SubcategoriesService,
  ) {}

  async create(
    user: IAuthenticatedUser,
    dto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    const companyId = this.requireCompanyId(user);
    await this.subcategoriesService.getUsableForCompany(
      companyId,
      dto.subcategoryId,
    );

    const row = await this.productsRepository.create(
      {
        name: dto.name.trim(),
        quantity: dto.quantity ?? 0,
        subcategoryId: dto.subcategoryId,
        companyId,
        createdByUserId: user.id,
      },
      {
        sellPrice: toMoneyString(dto.sellPrice),
        purchasePrice: toMoneyString(dto.purchasePrice),
      },
    );

    return toProductResponse(row);
  }

  async findAll(
    user: IAuthenticatedUser,
    query: QueryProductsDto,
  ): Promise<IPaginatedResult<ProductResponseDto>> {
    const { items, totalItems } = await this.productsRepository.findMany({
      page: query.page,
      limit: query.limit,
      search: query.search,
      companyId: this.requireCompanyId(user),
      subcategoryId: query.subcategoryId,
      status: query.status,
      sortOrder: query.sortOrder,
    });

    return buildPaginatedResult(
      items.map(toProductResponse),
      totalItems,
      query.page,
      query.limit,
    );
  }

  async findOne(
    user: IAuthenticatedUser,
    id: string,
  ): Promise<ProductResponseDto> {
    return toProductResponse(await this.findOwnedRowOrFail(user, id));
  }

  async findPriceHistory(
    user: IAuthenticatedUser,
    id: string,
  ): Promise<ProductPriceHistoryResponseDto[]> {
    await this.findOwnedRowOrFail(user, id);

    const rows = await this.productsRepository.findPriceHistory(id);

    return rows.map(toProductPriceHistoryResponse);
  }

  async update(
    user: IAuthenticatedUser,
    id: string,
    dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const current = await this.findOwnedRowOrFail(user, id);

    if (dto.subcategoryId && dto.subcategoryId !== current.subcategoryId) {
      await this.subcategoriesService.getUsableForCompany(
        current.companyId,
        dto.subcategoryId,
      );
    }

    const updated = await this.productsRepository.updateFields(id, {
      name: dto.name?.trim(),
      quantity: dto.quantity,
      subcategoryId: dto.subcategoryId,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException(
        `No product was found with id ${id} — it may have been removed while you were editing it`,
      );
    }

    const nextSellPrice =
      dto.sellPrice !== undefined
        ? toMoneyString(dto.sellPrice)
        : current.sellPrice;
    const nextPurchasePrice =
      dto.purchasePrice !== undefined
        ? toMoneyString(dto.purchasePrice)
        : current.purchasePrice;

    if (
      nextSellPrice !== current.sellPrice ||
      nextPurchasePrice !== current.purchasePrice
    ) {
      await this.productsRepository.updatePrice(id, {
        sellPrice: nextSellPrice,
        purchasePrice: nextPurchasePrice,
      });
    }

    return toProductResponse({
      ...updated,
      sellPrice: nextSellPrice,
      purchasePrice: nextPurchasePrice,
    });
  }

  // Deleting a product deactivates it: status goes false, the row is kept
  async remove(
    user: IAuthenticatedUser,
    id: string,
  ): Promise<ProductResponseDto> {
    const current = await this.findOwnedRowOrFail(user, id);

    if (!current.status) {
      throw new ConflictException(
        `Product "${current.name}" is already deactivated`,
      );
    }

    const updated = await this.productsRepository.setStatus(id, false);

    if (!updated) {
      throw new NotFoundException(`No product was found with id ${id}`);
    }

    return toProductResponse({
      ...updated,
      sellPrice: current.sellPrice,
      purchasePrice: current.purchasePrice,
    });
  }

  async restore(
    user: IAuthenticatedUser,
    id: string,
  ): Promise<ProductResponseDto> {
    const current = await this.findOwnedRowOrFail(user, id);

    if (current.status) {
      throw new ConflictException(
        `Product "${current.name}" is already active`,
      );
    }

    const updated = await this.productsRepository.setStatus(id, true);

    if (!updated) {
      throw new NotFoundException(`No product was found with id ${id}`);
    }

    return toProductResponse({
      ...updated,
      sellPrice: current.sellPrice,
      purchasePrice: current.purchasePrice,
    });
  }

  // Used by orders.checkout — current price + stock, scoped to the company
  async findManyForCheckout(
    companyId: string,
    ids: string[],
  ): Promise<IProductWithPrice[]> {
    return this.productsRepository.findManyWithPriceByIds(ids, companyId);
  }

  // Runs inside the orders module's checkout transaction — see orders.repository.ts
  async decrementStockInTransaction(
    tx: IDrizzleTransaction,
    productId: string,
    quantity: number,
  ): Promise<boolean> {
    return this.productsRepository.decrementStock(tx, productId, quantity);
  }

  private async findOwnedRowOrFail(
    user: IAuthenticatedUser,
    id: string,
  ): Promise<IProductWithPrice> {
    const row = await this.productsRepository.findByIdWithPrice(id);

    if (!row || row.companyId !== user.companyId) {
      throw new NotFoundException(`No product was found with id ${id}`);
    }

    return row;
  }

  private requireCompanyId(user: IAuthenticatedUser): string {
    if (!user.companyId) {
      throw new ConflictException('Your account is not linked to a company');
    }

    return user.companyId;
  }
}
