import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentCompanyId } from '../../common/decorators/current-company-id.decorator.js';
import { RateLimit } from '../../common/decorators/rate-limit.decorator.js';
import { RequestTimeout } from '../../common/decorators/request-timeout.decorator.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums/user-role.enum.js';
import { AiService } from './ai.service.js';
import {
  AI_CHAT_RATE_LIMIT,
  AI_CHAT_RATE_LIMIT_TTL_MS,
  AI_CHAT_TIMEOUT_MS,
} from './ai.constants.js';
import { AiChatRequestDto } from './dto/ai-chat-request.dto.js';
import { AiChatResponseDto } from './dto/ai-chat-response.dto.js';

// client_admin only — every lookup the assistant makes is scoped to the caller's company
@ApiTags('AI Assistant')
@ApiBearerAuth()
@Roles(UserRole.CLIENT_ADMIN)
@Controller({ path: 'ai', version: '1' })
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @RateLimit(AI_CHAT_RATE_LIMIT, AI_CHAT_RATE_LIMIT_TTL_MS)
  @RequestTimeout(AI_CHAT_TIMEOUT_MS)
  @ResponseMessage('AI reply generated successfully')
  @ApiOperation({
    summary: 'Ask the AI assistant a question about company data',
    description:
      'Stateless: send earlier turns in history. Read-only — the assistant looks up properties, tenants, leases, payments, ledger and dashboard figures.',
  })
  chat(
    @CurrentCompanyId() companyId: string,
    @Body() dto: AiChatRequestDto,
  ): Promise<AiChatResponseDto> {
    return this.aiService.chat(companyId, dto);
  }
}
