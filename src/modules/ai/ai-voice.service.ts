import { BadGatewayException, BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Modality, ThinkingLevel } from '@google/genai';
import { getWavPeakLevel, toWavBase64 } from '../../common/utils/audio.util.js';
import { aiConfig } from '../../config/ai.config.js';
import type { IAiConfig } from '../../config/interfaces/i-ai-config.js';
import {
  AI_NO_SPEECH_SENTINEL,
  AI_SILENCE_PEAK_LEVEL,
  AI_SPEECH_ATTEMPT_TIMEOUT_MS,
  buildAiSpeechPrompt,
  buildAiTranscriptionPrompt,
} from './ai.constants.js';
import type { AiSpeechRequestDto } from './dto/ai-speech-request.dto.js';
import type { AiSpeechResponseDto } from './dto/ai-speech-response.dto.js';
import type { AiTranscribeRequestDto } from './dto/ai-transcribe-request.dto.js';
import type { AiTranscribeResponseDto } from './dto/ai-transcribe-response.dto.js';
import { GeminiClientService } from './gemini-client.service.js';

const WAV_MIME_TYPE = 'audio/wav';
const HAS_LETTER_PATTERN = /\p{L}/u;
const NO_SPEECH_MESSAGE =
  "I couldn't hear a question in that recording. Speak a little closer to the mic and try again.";

// Gemini hears mixed Urdu-English far better than browser speech recognition, and speaks with a real Urdu accent
@Injectable()
export class AiVoiceService {
  constructor(
    @Inject(aiConfig.KEY) private readonly config: IAiConfig,
    private readonly gemini: GeminiClientService,
  ) {}

  async transcribe(dto: AiTranscribeRequestDto): Promise<AiTranscribeResponseDto> {
    // Gemini invents words for a silent clip, so a quiet WAV never reaches it
    const peakLevel = getWavPeakLevel(Buffer.from(dto.audioBase64, 'base64'));

    if (peakLevel !== null && peakLevel < AI_SILENCE_PEAK_LEVEL) {
      throw new BadRequestException(NO_SPEECH_MESSAGE);
    }

    const response = await this.gemini.generateContent({
      model: this.config.model,
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: dto.mimeType.split(';')[0], data: dto.audioBase64 } },
            { text: buildAiTranscriptionPrompt(dto.script) },
          ],
        },
      ],
      config: { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } },
    });
    const transcript = response.text?.trim() ?? '';

    // On silence the model sometimes invents a timestamp like "00:00" instead of the sentinel
    if (!HAS_LETTER_PATTERN.test(transcript) || transcript.includes(AI_NO_SPEECH_SENTINEL)) {
      throw new BadRequestException(NO_SPEECH_MESSAGE);
    }

    return { transcript };
  }

  async speak(dto: AiSpeechRequestDto): Promise<AiSpeechResponseDto> {
    const response = await this.gemini.generateContent({
      model: this.config.ttsModel,
      contents: [{ role: 'user', parts: [{ text: buildAiSpeechPrompt(dto.text) }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: this.config.ttsVoice } } },
        httpOptions: { timeout: AI_SPEECH_ATTEMPT_TIMEOUT_MS },
      },
    });
    const audio = response.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data)
      ?.inlineData;

    if (!audio?.data) {
      throw new BadGatewayException(
        'The AI voice returned no audio for this reply. The answer is still shown as text; try playing it again.',
      );
    }

    return { mimeType: WAV_MIME_TYPE, audioBase64: toWavBase64(audio.data, audio.mimeType) };
  }
}
