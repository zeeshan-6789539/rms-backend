import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IPaginatedResult } from '../../common/interfaces/i-paginated-result.js';
import { buildPaginatedResult } from '../../common/utils/pagination.util.js';
import type { ICategoryRow } from '../../database/interfaces/i-category-row.js';
import type { IAuthenticatedUser } from '../auth/interfaces/i-authenticated-user.js';
import { CategoriesRepository } from './categories.repository.js';
import type { CategoryResponseDto } from './dto/category-response.dto.js';
import type { CategoryTreeResponseDto } from './dto/category-tree-response.dto.js';
import type { CreateCategoryDto } from './dto/create-category.dto.js';
import type { QueryCategoriesDto } from './dto/query-categories.dto.js';
import type { UpdateCategoryDto } from './dto/update-category.dto.js';
import {
  toCategoryResponse,
  toCategoryTreeResponse,
} from './mappers/category.mapper.js';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async create(
    user: IAuthenticatedUser,
    dto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const row = await this.categoriesRepository.create({
      name: dto.name.trim(),
      companyId: this.requireCompanyId(user),
    });

    return toCategoryResponse(row);
  }

  async findAll(
    user: IAuthenticatedUser,
    query: QueryCategoriesDto,
  ): Promise<IPaginatedResult<CategoryResponseDto>> {
    const { items, totalItems } = await this.categoriesRepository.findMany({
      page: query.page,
      limit: query.limit,
      search: query.search,
      companyId: this.requireCompanyId(user),
      status: query.status,
      sortOrder: query.sortOrder,
    });

    return buildPaginatedResult(
      items.map(toCategoryResponse),
      totalItems,
      query.page,
      query.limit,
    );
  }

  async findTree(
    user: IAuthenticatedUser,
  ): Promise<CategoryTreeResponseDto[]> {
    const tree = await this.categoriesRepository.findTreeForCompany(
      this.requireCompanyId(user),
    );

    return tree.map(toCategoryTreeResponse);
  }

  async findOne(
    user: IAuthenticatedUser,
    id: string,
  ): Promise<CategoryResponseDto> {
    return toCategoryResponse(await this.findOwnedRowOrFail(user, id));
  }

  async update(
    user: IAuthenticatedUser,
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    await this.findOwnedRowOrFail(user, id);

    const row = await this.categoriesRepository.update(id, {
      name: dto.name?.trim(),
      updatedAt: new Date(),
    });

    if (!row) {
      throw new NotFoundException(
        `No category was found with id ${id} — it may have been removed while you were editing it`,
      );
    }

    return toCategoryResponse(row);
  }

  // Deleting a category deactivates it: status goes false, the row is kept
  async remove(
    user: IAuthenticatedUser,
    id: string,
  ): Promise<CategoryResponseDto> {
    const current = await this.findOwnedRowOrFail(user, id);

    if (!current.status) {
      throw new ConflictException(
        `Category "${current.name}" is already deactivated`,
      );
    }

    await this.assertHasNoActiveSubcategories(current);

    const row = await this.categoriesRepository.setStatus(id, false);

    if (!row) {
      throw new NotFoundException(`No category was found with id ${id}`);
    }

    return toCategoryResponse(row);
  }

  async restore(
    user: IAuthenticatedUser,
    id: string,
  ): Promise<CategoryResponseDto> {
    const current = await this.findOwnedRowOrFail(user, id);

    if (current.status) {
      throw new ConflictException(
        `Category "${current.name}" is already active`,
      );
    }

    const row = await this.categoriesRepository.setStatus(id, true);

    if (!row) {
      throw new NotFoundException(`No category was found with id ${id}`);
    }

    return toCategoryResponse(row);
  }

  // Unscoped lookup for other modules (e.g. subcategories) that do their own
  // company check against the row they get back
  async findRowOrFail(id: string): Promise<ICategoryRow> {
    const row = await this.categoriesRepository.findById(id);

    if (!row) {
      throw new NotFoundException(`No category was found with id ${id}`);
    }

    return row;
  }

  // A category id from another company is treated the same as not found
  private async findOwnedRowOrFail(
    user: IAuthenticatedUser,
    id: string,
  ): Promise<ICategoryRow> {
    const row = await this.findRowOrFail(id);

    if (row.companyId !== user.companyId) {
      throw new NotFoundException(`No category was found with id ${id}`);
    }

    return row;
  }

  private requireCompanyId(user: IAuthenticatedUser): string {
    if (!user.companyId) {
      throw new ConflictException('Your account is not linked to a company');
    }

    return user.companyId;
  }

  // Leaving live subcategories stranded under a deactivated category would
  // hide them from every list without actually removing them
  private async assertHasNoActiveSubcategories(
    category: ICategoryRow,
  ): Promise<void> {
    const activeSubcategories =
      await this.categoriesRepository.countActiveSubcategories(category.id);

    if (activeSubcategories > 0) {
      throw new ConflictException(
        `Category "${category.name}" still has ${activeSubcategories} active subcategor${activeSubcategories === 1 ? 'y' : 'ies'}. Deactivate them first, then retry.`,
      );
    }
  }
}
