import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { invoiceConfig } from '../../config/invoice.config.js';
import { LeasesModule } from '../leases/leases.module.js';
import { MailModule } from '../mail/mail.module.js';
import { LedgerController } from './ledger.controller.js';
import { LedgerRepository } from './ledger.repository.js';
import { LedgerService } from './ledger.service.js';

@Module({
  imports: [LeasesModule, MailModule, ConfigModule.forFeature(invoiceConfig)],
  controllers: [LedgerController],
  providers: [LedgerService, LedgerRepository],
  exports: [LedgerService],
})
export class LedgerModule {}
