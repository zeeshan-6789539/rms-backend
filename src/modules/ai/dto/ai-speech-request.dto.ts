import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { AI_SPEECH_TEXT_MAX_LENGTH } from '../ai.constants.js';

export class AiSpeechRequestDto {
  @ApiProperty({ example: 'Mehwish Aslam ke zimme ek lakh baanve hazaar rupay baqaya hain.' })
  @IsString({ message: 'text must be a string' })
  @IsNotEmpty({ message: 'text must not be empty — pass the reply to read aloud' })
  @MaxLength(AI_SPEECH_TEXT_MAX_LENGTH, {
    message: `text must be at most ${AI_SPEECH_TEXT_MAX_LENGTH} characters — read a shorter reply aloud`,
  })
  text!: string;
}
