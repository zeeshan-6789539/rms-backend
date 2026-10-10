import { ApiProperty } from '@nestjs/swagger';

export class AiTranscribeResponseDto {
  @ApiProperty({ example: 'Is mahine kis kis ka kiraya baqi hai?' })
  transcript!: string;
}
