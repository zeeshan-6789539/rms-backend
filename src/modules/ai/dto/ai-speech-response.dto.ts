import { ApiProperty } from '@nestjs/swagger';

export class AiSpeechResponseDto {
  @ApiProperty({ example: 'audio/wav' })
  mimeType!: string;

  @ApiProperty({ description: 'The spoken reply as base64-encoded WAV' })
  audioBase64!: string;
}
