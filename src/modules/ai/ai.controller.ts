import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentCompanyId } from '../../common/decorators/current-company-id.decorator.js';
import { RateLimit } from '../../common/decorators/rate-limit.decorator.js';
import { RequestTimeout } from '../../common/decorators/request-timeout.decorator.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums/user-role.enum.js';
import { AiVoiceService } from './ai-voice.service.js';
import { AiService } from './ai.service.js';
import {
  AI_CHAT_RATE_LIMIT,
  AI_CHAT_RATE_LIMIT_TTL_MS,
  AI_CHAT_TIMEOUT_MS,
  AI_SPEECH_ROUTE_TIMEOUT_MS,
} from './ai.constants.js';
import { AiChatRequestDto } from './dto/ai-chat-request.dto.js';
import { AiChatResponseDto } from './dto/ai-chat-response.dto.js';
import { AiSpeechRequestDto } from './dto/ai-speech-request.dto.js';
import { AiSpeechResponseDto } from './dto/ai-speech-response.dto.js';
import { AiTranscribeRequestDto } from './dto/ai-transcribe-request.dto.js';
import { AiTranscribeResponseDto } from './dto/ai-transcribe-response.dto.js';

// client_admin only — every lookup the assistant makes is scoped to the caller's company
@ApiTags('AI Assistant')
@ApiBearerAuth()
@Roles(UserRole.CLIENT_ADMIN)
@RateLimit(AI_CHAT_RATE_LIMIT, AI_CHAT_RATE_LIMIT_TTL_MS)
@Controller({ path: 'ai', version: '1' })
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly aiVoiceService: AiVoiceService,
  ) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @RequestTimeout(AI_CHAT_TIMEOUT_MS)
  @ResponseMessage('AI reply generated successfully')
  @ApiOperation({
    summary: 'Ask the AI assistant a question about company data',
    description:
      'Stateless: send earlier turns in history. Read-only — the assistant looks up properties, tenants, leases, payments, ledger and dashboard figures. Answers in English, Urdu or Roman Urdu to match the question.',
  })
  chat(
    @CurrentCompanyId() companyId: string,
    @Body() dto: AiChatRequestDto,
  ): Promise<AiChatResponseDto> {
    return this.aiService.chat(companyId, dto);
  }

  @Post('transcribe')
  @HttpCode(HttpStatus.OK)
  @RequestTimeout(AI_CHAT_TIMEOUT_MS)
  @ResponseMessage('Speech transcribed successfully')
  @ApiOperation({
    summary: 'Turn a spoken question into text',
    description:
      'Understands Urdu, English and a mix of both. script chooses whether Urdu words come back in Urdu script or Roman Urdu.',
  })
  transcribe(@Body() dto: AiTranscribeRequestDto): Promise<AiTranscribeResponseDto> {
    return this.aiVoiceService.transcribe(dto);
  }

  @Post('speech')
  @HttpCode(HttpStatus.OK)
  @RequestTimeout(AI_SPEECH_ROUTE_TIMEOUT_MS)
  @ResponseMessage('Speech generated successfully')
  @ApiOperation({
    summary: 'Read a reply aloud with a Pakistani Urdu accent',
    description: 'Returns base64 WAV. Works for English, Urdu script and Roman Urdu text.',
  })
  speech(@Body() dto: AiSpeechRequestDto): Promise<AiSpeechResponseDto> {
    return this.aiVoiceService.speak(dto);
  }
}
