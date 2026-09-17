import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtConfig } from '../../config/jwt.config.js';
import { CompaniesModule } from '../companies/companies.module.js';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { RefreshTokensRepository } from './refresh-tokens.repository.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.register({}),
    UsersModule,
    CompaniesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokensRepository, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
