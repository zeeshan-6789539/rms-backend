import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { AiChatRole } from '../../../common/enums/ai-chat-role.enum.js';
import { AI_CHAT_HISTORY_TEXT_MAX_LENGTH } from '../ai.constants.js';

export class AiChatMessageDto {
  @ApiProperty({ enum: AiChatRole, example: AiChatRole.USER })
  @IsEnum(AiChatRole, {
    message: `history role must be one of: ${Object.values(AiChatRole).join(', ')}`,
  })
  role!: AiChatRole;

  @ApiProperty({ example: 'How many active leases do I have?' })
  @IsString({ message: 'history text must be a string' })
  @IsNotEmpty({ message: 'history text must not be empty' })
  @MaxLength(AI_CHAT_HISTORY_TEXT_MAX_LENGTH, {
    message: `history text must be at most ${AI_CHAT_HISTORY_TEXT_MAX_LENGTH} characters`,
  })
  text!: string;
}
