import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IPaginatedResult } from '../../common/interfaces/i-paginated-result.js';
import { buildPaginatedResult } from '../../common/utils/pagination.util.js';
import type { ISubcategoryRow } from '../../database/interfaces/i-subcategory-row.js';
import type { IAuthenticatedUser } from '../auth/interfaces/i-authenticated-user.js';
import { CategoriesService } from '../categories/categories.service.js';
import type { CreateSubcategoryDto } from './dto/create-subcategory.dto.js';
import type { QuerySubcategoriesDto } from './dto/query-subcategories.dto.js';
import type { SubcategoryResponseDto } from './dto/subcategory-response.dto.js';
import type { UpdateSubcategoryDto } from './dto/update-subcategory.dto.js';
import { toSubcategoryResponse } from './mappers/subcategory.mapper.js';
import { SubcategoriesRepository } from './subcategories.repository.js';

@Injectable()
export class SubcategoriesService {
  constructor(
    private readonly subcategoriesRepository: SubcategoriesRepository,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(
    user: IAuthenticatedUser,
    dto: CreateSubcategoryDto,
  ): Promise<SubcategoryResponseDto> {
    await this.assertCategoryUsable(user, dto.categoryId);

    const row = await this.subcategoriesRepository.create({
      name: dto.name.trim(),
      categoryId: dto.categoryId,
    });

    return toSubcategoryResponse(row);
  }

  async findAll(
    user: IAuthenticatedUser,
    query: QuerySubcategoriesDto,
  ): Promise<IPaginatedResult<SubcategoryResponseDto>> {
    const { items, totalItems } = await this.subcategoriesRepository.findMany(
      {
        page: query.page,
        limit: query.limit,
        search: query.search,
        companyId: this.requireCompanyId(user),
        categoryId: query.categoryId,
        status: query.status,
        sortOrder: query.sortOrder,
      },
    );

    return buildPaginatedResult(
      items.map(toSubcategoryResponse),
      totalItems,
      query.page,
      query.limit,
    );
  }

  async findOne(
    user: IAuthenticatedUser,
    id: string,
  ): Promise<SubcategoryResponseDto> {
    return toSubcategoryResponse(await this.findOwnedRowOrFail(user, id));
  }

  async update(
    user: IAuthenticatedUser,
    id: string,
    dto: UpdateSubcategoryDto,
  ): Promise<SubcategoryResponseDto> {
    await this.findOwnedRowOrFail(user, id);

    if (dto.categoryId) {
      await this.assertCategoryUsable(user, dto.categoryId);
    }

    const row = await this.subcategoriesRepository.update(id, {
      name: dto.name?.trim(),
      categoryId: dto.categoryId,
      updatedAt: new Date(),
    });

    if (!row) {
      throw new NotFoundException(
        `No subcategory was found with id ${id} — it may have been removed while you were editing it`,
      );
    }

    return toSubcategoryResponse(row);
  }

  async remove(
    user: IAuthenticatedUser,
    id: string,
  ): Promise<SubcategoryResponseDto> {
    const current = await this.findOwnedRowOrFail(user, id);

    if (!current.status) {
      throw new ConflictException(
        `Subcategory "${current.name}" is already deactivated`,
      );
    }

    await this.assertHasNoActiveProducts(current);

    const row = await this.subcategoriesRepository.setStatus(id, false);

    if (!row) {
      throw new NotFoundException(`No subcategory was found with id ${id}`);
    }

    return toSubcategoryResponse(row);
  }

  async restore(
    user: IAuthenticatedUser,
    id: string,
  ): Promise<SubcategoryResponseDto> {
    const current = await this.findOwnedRowOrFail(user, id);

    if (current.status) {
      throw new ConflictException(
        `Subcategory "${current.name}" is already active`,
      );
    }

    const row = await this.subcategoriesRepository.setStatus(id, true);

    if (!row) {
      throw new NotFoundException(`No subcategory was found with id ${id}`);
    }

    return toSubcategoryResponse(row);
  }

  // Used by other modules (e.g. products) to validate a subcategoryId is
  // both owned by the caller's company and currently active
  async getUsableForCompany(
    companyId: string,
    subcategoryId: string,
  ): Promise<ISubcategoryRow> {
    const row = await this.findRowOrFail(subcategoryId);
    const category = await this.categoriesService.findRowOrFail(
      row.categoryId,
    );

    if (category.companyId !== companyId) {
      throw new NotFoundException(
        `No subcategory was found with id ${subcategoryId}`,
      );
    }

    if (!row.status) {
      throw new ConflictException(
        `Subcategory "${row.name}" is deactivated. Reactivate it first, then retry.`,
      );
    }

    return row;
  }

  // Unscoped lookup for other modules that do their own company check
  // against the row they get back
  async findRowOrFail(id: string): Promise<ISubcategoryRow> {
    const row = await this.subcategoriesRepository.findById(id);

    if (!row) {
      throw new NotFoundException(`No subcategory was found with id ${id}`);
    }

    return row;
  }

  private async findOwnedRowOrFail(
    user: IAuthenticatedUser,
    id: string,
  ): Promise<ISubcategoryRow> {
    const row = await this.findRowOrFail(id);
    await this.assertBelongsToCompany(user, row.categoryId);

    return row;
  }

  // A subcategory only carries a categoryId — company ownership is always
  // checked by resolving the parent category
  private async assertCategoryUsable(
    user: IAuthenticatedUser,
    categoryId: string,
  ): Promise<void> {
    const category = await this.categoriesService.findRowOrFail(categoryId);

    if (category.companyId !== user.companyId) {
      throw new NotFoundException(`No category was found with id ${categoryId}`);
    }

    if (!category.status) {
      throw new ConflictException(
        `Category "${category.name}" is deactivated. Reactivate it first, then retry.`,
      );
    }
  }

  private async assertBelongsToCompany(
    user: IAuthenticatedUser,
    categoryId: string,
  ): Promise<void> {
    const category = await this.categoriesService.findRowOrFail(categoryId);

    if (category.companyId !== user.companyId) {
      throw new NotFoundException('No subcategory was found');
    }
  }

  private requireCompanyId(user: IAuthenticatedUser): string {
    if (!user.companyId) {
      throw new ConflictException('Your account is not linked to a company');
    }

    return user.companyId;
  }

  // products.subcategory_id is ON DELETE RESTRICT, but leaving live products
  // stranded under a deactivated subcategory would hide them from every list
  private async assertHasNoActiveProducts(
    subcategory: ISubcategoryRow,
  ): Promise<void> {
    const activeProducts =
      await this.subcategoriesRepository.countActiveProducts(subcategory.id);

    if (activeProducts > 0) {
      throw new ConflictException(
        `Subcategory "${subcategory.name}" still has ${activeProducts} active product(s). Deactivate them first, then retry.`,
      );
    }
  }
}
