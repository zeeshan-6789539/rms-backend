import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { mailConfig } from '../../config/mail.config.js';
import { MailRepository } from './mail.repository.js';
import { MailService } from './mail.service.js';

@Module({
  imports: [ConfigModule.forFeature(mailConfig)],
  providers: [MailService, MailRepository],
  exports: [MailService],
})
export class MailModule {}
