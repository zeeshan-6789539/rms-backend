import { Module } from '@nestjs/common';
import { PropertiesModule } from '../properties/properties.module.js';
import { TenantsModule } from '../tenants/tenants.module.js';
import { LeasesController } from './leases.controller.js';
import { LeasesRepository } from './leases.repository.js';
import { LeasesService } from './leases.service.js';

@Module({
  imports: [PropertiesModule, TenantsModule],
  controllers: [LeasesController],
  providers: [LeasesService, LeasesRepository],
  exports: [LeasesService],
})
export class LeasesModule {}
