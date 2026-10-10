import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBase64, IsEnum, IsNotEmpty, IsOptional, Matches, MaxLength } from 'class-validator';
import { AiTranscriptScript } from '../../../common/enums/ai-transcript-script.enum.js';
import { AI_AUDIO_BASE64_MAX_LENGTH, AI_AUDIO_MIME_TYPE_PATTERN } from '../ai.constants.js';

export class AiTranscribeRequestDto {
  @ApiProperty({ description: 'The recording, base64-encoded (at most about 30 seconds)' })
  @IsNotEmpty({ message: 'audioBase64 must not be empty — record a question first' })
  @IsBase64(undefined, { message: 'audioBase64 must be base64-encoded audio' })
  @MaxLength(AI_AUDIO_BASE64_MAX_LENGTH, {
    message: 'The recording is too long. Keep a spoken question under 30 seconds and try again.',
  })
  audioBase64!: string;

  @ApiProperty({ example: 'audio/wav' })
  @Matches(AI_AUDIO_MIME_TYPE_PATTERN, {
    message: 'mimeType must be an audio type: wav, mp3, aac, ogg, flac, aiff or webm',
  })
  mimeType!: string;

  @ApiPropertyOptional({
    enum: AiTranscriptScript,
    default: AiTranscriptScript.ROMAN,
    description: 'How Urdu words are written in the transcript',
  })
  @IsEnum(AiTranscriptScript, {
    message: `script must be one of: ${Object.values(AiTranscriptScript).join(', ')}`,
  })
  @IsOptional()
  script: AiTranscriptScript = AiTranscriptScript.ROMAN;
}
