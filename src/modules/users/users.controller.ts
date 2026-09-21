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
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UuidParamDto } from '../../common/dto/uuid-param.dto.js';
import { UserRole } from '../../common/enums/user-role.enum.js';
import type { IPaginatedResult } from '../../common/interfaces/i-paginated-result.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { QueryUsersDto } from './dto/query-users.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { UsersService } from './users.service.js';

// Every route here is super_admin only — user administration is platform-level
@ApiTags('Users')
@ApiBearerAuth()
@Roles(UserRole.SUPER_ADMIN)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ResponseMessage('User created successfully')
  @ApiOperation({ summary: 'Create a user (super_admin only)' })
  create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(dto);
  }

  @Get()
  @ResponseMessage('Users retrieved successfully')
  @ApiOperation({
    summary: 'List users, paginated and searchable (super_admin only)',
    description:
      'Newest first by default. Filter with companyId, role and status; search matches email and name.',
  })
  findAll(
    @Query() query: QueryUsersDto,
  ): Promise<IPaginatedResult<UserResponseDto>> {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ResponseMessage('User retrieved successfully')
  @ApiOperation({ summary: 'Get a user by id (super_admin only)' })
  findOne(@Param() params: UuidParamDto): Promise<UserResponseDto> {
    return this.usersService.findOne(params.id);
  }

  @Patch(':id')
  @ResponseMessage('User updated successfully')
  @ApiOperation({ summary: 'Update a user (super_admin only)' })
  update(
    @Param() params: UuidParamDto,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(params.id, dto);
  }

  @Patch(':id/restore')
  @ResponseMessage('User reactivated successfully')
  @ApiOperation({ summary: 'Set status back to active (super_admin only)' })
  restore(@Param() params: UuidParamDto): Promise<UserResponseDto> {
    return this.usersService.restore(params.id);
  }

  // 200, not 204 — a 204 carries no body, so the envelope would never arrive
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('User deleted successfully')
  @ApiOperation({
    summary: 'Delete a user (super_admin only)',
    description: 'Sets status to false. The row is kept for audit purposes.',
  })
  remove(@Param() params: UuidParamDto): Promise<UserResponseDto> {
    return this.usersService.remove(params.id);
  }
}
