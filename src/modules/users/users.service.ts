import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '../../common/enums/user-role.enum.js';
import type { IPaginatedResult } from '../../common/interfaces/i-paginated-result.js';
import { hashSecret } from '../../common/utils/hash.util.js';
import { buildPaginatedResult } from '../../common/utils/pagination.util.js';
import {
  normalizeEmail,
  normalizeUsername,
} from '../../common/utils/string.util.js';
import type { IUserRow } from '../../database/interfaces/i-user-row.js';
import { MailService } from '../mail/mail.service.js';
import type { CreateUserDto } from './dto/create-user.dto.js';
import type { QueryUsersDto } from './dto/query-users.dto.js';
import type { UpdateUserDto } from './dto/update-user.dto.js';
import type { UserResponseDto } from './dto/user-response.dto.js';
import { toUserResponse } from './mappers/user.mapper.js';
import { UsersRepository } from './users.repository.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const username = normalizeUsername(dto.username);
    const role = dto.role ?? UserRole.STAFF;

    await this.assertUsernameIsAvailable(username);
    this.assertCompanyMatchesRole(role, dto.companyId);

    // The unique index is still the authority — the check above only buys a
    // friendlier message, and two concurrent creates can both pass it.
    const row = await this.usersRepository.create({
      companyId: dto.companyId,
      username,
      email: normalizeEmail(dto.email),
      passwordHash: await hashSecret(dto.password),
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      role,
      status: dto.status,
    });

    await this.mailService.sendWelcomeEmail(
      row.email,
      `${row.firstName} ${row.lastName}`,
      row.username,
      dto.password,
    );

    return toUserResponse(row);
  }

  async findAll(
    query: QueryUsersDto,
  ): Promise<IPaginatedResult<UserResponseDto>> {
    const { items, totalItems } = await this.usersRepository.findMany({
      page: query.page,
      limit: query.limit,
      search: query.search,
      companyId: query.companyId,
      role: query.role,
      status: query.status,
      sortOrder: query.sortOrder,
    });

    return buildPaginatedResult(
      items.map(toUserResponse),
      totalItems,
      query.page,
      query.limit,
    );
  }

  async findOne(id: string): Promise<UserResponseDto> {
    return toUserResponse(await this.findRowOrFail(id));
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const current = await this.findRowOrFail(id);

    const username = dto.username ? normalizeUsername(dto.username) : undefined;

    if (username && username !== current.username) {
      await this.assertUsernameIsAvailable(username, id);
    }

    this.assertCompanyMatchesRole(
      dto.role ?? current.role,
      dto.companyId ?? current.companyId ?? undefined,
    );

    // Drizzle skips undefined keys, so unset DTO fields leave the column alone
    const row = await this.usersRepository.update(id, {
      companyId: dto.companyId,
      username,
      email: dto.email ? normalizeEmail(dto.email) : undefined,
      passwordHash: dto.password ? await hashSecret(dto.password) : undefined,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      role: dto.role,
      status: dto.status,
      updatedAt: new Date(),
    });

    if (!row) {
      throw new NotFoundException(
        `No user was found with id ${id} — it may have been removed while you were editing it`,
      );
    }

    if (dto.password) {
      await this.mailService.sendPasswordChangedEmail(
        row.email,
        `${row.firstName} ${row.lastName}`,
        row.username,
        dto.password,
      );
    }

    return toUserResponse(row);
  }

  // Deleting a user deactivates it: status goes false, the row is kept
  async remove(id: string): Promise<UserResponseDto> {
    const current = await this.findRowOrFail(id);

    if (!current.status) {
      throw new ConflictException(
        `User ${current.username} is already deactivated`,
      );
    }

    const row = await this.usersRepository.setStatus(id, false);

    if (!row) {
      throw new NotFoundException(`No user was found with id ${id}`);
    }

    return toUserResponse(row);
  }

  async restore(id: string): Promise<UserResponseDto> {
    const current = await this.findRowOrFail(id);

    if (current.status) {
      throw new ConflictException(`User ${current.username} is already active`);
    }

    const row = await this.usersRepository.setStatus(id, true);

    if (!row) {
      throw new NotFoundException(`No user was found with id ${id}`);
    }

    return toUserResponse(row);
  }

  // Returns the raw row including passwordHash — for AuthService use only
  async findRowByUsername(username: string): Promise<IUserRow | undefined> {
    return this.usersRepository.findByUsername(normalizeUsername(username));
  }

  async findRowOrFail(id: string): Promise<IUserRow> {
    const row = await this.usersRepository.findById(id);

    if (!row) {
      throw new NotFoundException(`No user was found with id ${id}`);
    }

    return row;
  }

  // Used by CompaniesService to refuse deactivating a company still in use
  async countActiveByCompany(companyId: string): Promise<number> {
    return this.usersRepository.countActiveByCompany(companyId);
  }

  async touchLastLogin(id: string): Promise<void> {
    await this.usersRepository.touchLastLogin(id);
  }

  // Mirrors the users_super_admin_has_no_company check constraint
  private assertCompanyMatchesRole(
    role: UserRole | undefined,
    companyId: string | undefined,
  ): void {
    if (role === UserRole.SUPER_ADMIN && companyId) {
      throw new BadRequestException(
        'A super_admin is platform-level and cannot belong to a company — omit companyId, or choose a different role',
      );
    }
  }

  private async assertUsernameIsAvailable(
    username: string,
    ignoreUserId?: string,
  ): Promise<void> {
    const existing = await this.usersRepository.findByUsername(username);

    if (existing && existing.id !== ignoreUserId) {
      throw new ConflictException(
        `The username "${username}" is already taken`,
      );
    }
  }
}
