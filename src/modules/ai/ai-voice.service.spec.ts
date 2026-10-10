import { BadGatewayException, BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AiTranscriptScript } from '../../common/enums/ai-transcript-script.enum.js';
import { buildWavHeader } from '../../common/utils/audio.util.js';
import { AiVoiceService } from './ai-voice.service.js';
import type { GeminiClientService } from './gemini-client.service.js';

describe('AiVoiceService', () => {
  const generateContent = vi.fn();
  const gemini = { generateContent } as unknown as GeminiClientService;
  const config = { apiKey: 'test-key', model: 'gemini-test', ttsModel: 'tts-test', ttsVoice: 'Kore' };
  const service = new AiVoiceService(config, gemini);
  const recording = {
    audioBase64: 'UklGRg==',
    mimeType: 'audio/webm;codecs=opus',
    script: AiTranscriptScript.ROMAN,
  };

  beforeEach(() => generateContent.mockReset());

  it('sends the recording without codec parameters and returns the transcript', async () => {
    generateContent.mockResolvedValueOnce({ text: ' Kis ka kiraya baqi hai? ' });

    await expect(service.transcribe(recording)).resolves.toEqual({
      transcript: 'Kis ka kiraya baqi hai?',
    });

    const [audioPart, promptPart] = generateContent.mock.calls[0][0].contents[0].parts;
    expect(audioPart.inlineData).toEqual({ mimeType: 'audio/webm', data: 'UklGRg==' });
    expect(promptPart.text).toContain('Roman Urdu');
  });

  it('rejects a near-silent WAV without calling Gemini', async () => {
    const silentWav = Buffer.concat([buildWavHeader(3200, 16000), Buffer.alloc(3200)]);

    await expect(
      service.transcribe({ ...recording, audioBase64: silentWav.toString('base64'), mimeType: 'audio/wav' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(generateContent).not.toHaveBeenCalled();
  });

  it.each(['NO_SPEECH', '00:00', ''])(
    'rejects a silent recording (%j) with a hint instead of an invented transcript',
    async (text) => {
      generateContent.mockResolvedValueOnce({ text });

      await expect(service.transcribe(recording)).rejects.toBeInstanceOf(BadRequestException);
    },
  );

  it('speaks with the configured TTS model and voice and returns WAV', async () => {
    generateContent.mockResolvedValueOnce({
      candidates: [{ content: { parts: [{ inlineData: { mimeType: 'audio/wav', data: 'UklGRg==' } }] } }],
    });

    await expect(service.speak({ text: 'Salam' })).resolves.toEqual({
      mimeType: 'audio/wav',
      audioBase64: 'UklGRg==',
    });

    const params = generateContent.mock.calls[0][0];
    expect(params.model).toBe('tts-test');
    expect(params.config.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName).toBe('Kore');
    expect(params.contents[0].parts[0].text).toContain('Pakistani Urdu accent');
  });

  it('fails clearly when the TTS model returns no audio', async () => {
    generateContent.mockResolvedValueOnce({ candidates: [{ content: { parts: [] } }] });

    await expect(service.speak({ text: 'Salam' })).rejects.toBeInstanceOf(BadGatewayException);
  });
});
