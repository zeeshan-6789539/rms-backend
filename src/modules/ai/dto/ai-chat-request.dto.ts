import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import {
  AI_CHAT_HISTORY_MAX_ITEMS,
  AI_CHAT_MESSAGE_MAX_LENGTH,
} from '../ai.constants.js';
import { AiChatMessageDto } from './ai-chat-message.dto.js';

export class AiChatRequestDto {
  @ApiProperty({ example: 'Who still owes rent this month?' })
  @IsString({ message: 'message must be a string' })
  @IsNotEmpty({ message: 'message must not be empty — type or say a question' })
  @MaxLength(AI_CHAT_MESSAGE_MAX_LENGTH, {
    message: `message must be at most ${AI_CHAT_MESSAGE_MAX_LENGTH} characters`,
  })
  message!: string;

  @ApiPropertyOptional({
    type: [AiChatMessageDto],
    description: `Earlier turns of this conversation, oldest first (at most ${AI_CHAT_HISTORY_MAX_ITEMS})`,
  })
  @IsArray({ message: 'history must be an array of { role, text } messages' })
  @ArrayMaxSize(AI_CHAT_HISTORY_MAX_ITEMS, {
    message: `history must contain at most ${AI_CHAT_HISTORY_MAX_ITEMS} messages — drop the oldest turns and retry`,
  })
  @ValidateNested({ each: true })
  @Type(() => AiChatMessageDto)
  @IsOptional()
  history?: AiChatMessageDto[];
}
