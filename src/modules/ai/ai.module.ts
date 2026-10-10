import { Module } from '@nestjs/common';
import { DashboardModule } from '../dashboard/dashboard.module.js';
import { LeasesModule } from '../leases/leases.module.js';
import { LedgerModule } from '../ledger/ledger.module.js';
import { PaymentsModule } from '../payments/payments.module.js';
import { PropertiesModule } from '../properties/properties.module.js';
import { TenantsModule } from '../tenants/tenants.module.js';
import { AiToolsService } from './ai-tools.service.js';
import { AiVoiceService } from './ai-voice.service.js';
import { AiController } from './ai.controller.js';
import { AiService } from './ai.service.js';
import { GeminiClientService } from './gemini-client.service.js';

@Module({
  imports: [
    DashboardModule,
    PropertiesModule,
    TenantsModule,
    LeasesModule,
    PaymentsModule,
    LedgerModule,
  ],
  controllers: [AiController],
  providers: [AiService, AiToolsService, AiVoiceService, GeminiClientService],
})
export class AiModule {}
