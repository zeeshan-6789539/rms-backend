import { Module } from '@nestjs/common';
import { CategoriesModule } from '../categories/categories.module.js';
import { SubcategoriesController } from './subcategories.controller.js';
import { SubcategoriesRepository } from './subcategories.repository.js';
import { SubcategoriesService } from './subcategories.service.js';

@Module({
  imports: [CategoriesModule],
  controllers: [SubcategoriesController],
  providers: [SubcategoriesService, SubcategoriesRepository],
  exports: [SubcategoriesService],
})
export class SubcategoriesModule {}
