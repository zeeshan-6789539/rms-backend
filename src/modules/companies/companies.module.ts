import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { CompaniesController } from './companies.controller.js';
import { CompaniesRepository } from './companies.repository.js';
import { CompaniesService } from './companies.service.js';

@Module({
  imports: [UsersModule],
  controllers: [CompaniesController],
  providers: [CompaniesService, CompaniesRepository],
  exports: [CompaniesService],
})
export class CompaniesModule {}
