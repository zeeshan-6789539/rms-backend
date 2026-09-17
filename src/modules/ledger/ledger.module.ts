import { Module } from '@nestjs/common';
import { LeasesModule } from '../leases/leases.module.js';
import { LedgerController } from './ledger.controller.js';
import { LedgerRepository } from './ledger.repository.js';
import { LedgerService } from './ledger.service.js';

@Module({
  imports: [LeasesModule],
  controllers: [LedgerController],
  providers: [LedgerService, LedgerRepository],
  exports: [LedgerService],
})
export class LedgerModule {}
