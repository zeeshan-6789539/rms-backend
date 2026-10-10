import { HttpStatus, ServiceUnavailableException } from '@nestjs/common';
import { ApiError } from '@google/genai';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AI_PROVIDER_BUSY_MESSAGE } from './ai.constants.js';
import { GeminiClientService } from './gemini-client.service.js';

const generateContent = vi.fn();

vi.mock('@google/genai', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@google/genai')>()),
  GoogleGenAI: class {
    models = { generateContent };
  },
}));

describe('GeminiClientService', () => {
  const config = { apiKey: 'test-key', model: 'gemini-test', ttsModel: 'tts-test', ttsVoice: 'Kore' };
  const service = new GeminiClientService(config);
  const params = { model: 'gemini-test', contents: 'Hi' };

  beforeEach(() => generateContent.mockReset());

  it('returns the Gemini response untouched', async () => {
    generateContent.mockResolvedValueOnce({ text: 'Hello' });

    await expect(service.generateContent(params)).resolves.toEqual({ text: 'Hello' });
  });

  it('turns a Gemini overload into a 503 with a retry hint', async () => {
    generateContent.mockRejectedValueOnce(new ApiError({ message: 'high demand', status: 503 }));

    await expect(service.generateContent(params)).rejects.toThrow(
      new ServiceUnavailableException(AI_PROVIDER_BUSY_MESSAGE),
    );
  });

  it('turns a Gemini quota error into a 429', async () => {
    generateContent.mockRejectedValueOnce(new ApiError({ message: 'quota', status: 429 }));

    await expect(service.generateContent(params)).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
    });
  });

  it('turns an aborted attempt into a 503', async () => {
    generateContent.mockRejectedValueOnce(new DOMException('timed out', 'TimeoutError'));

    await expect(service.generateContent(params)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('turns a network failure reaching Google into a 503', async () => {
    generateContent.mockRejectedValueOnce(new TypeError('fetch failed'));

    await expect(service.generateContent(params)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('answers 503 when no API key is configured', async () => {
    const unconfigured = new GeminiClientService({ ...config, apiKey: undefined });

    await expect(unconfigured.generateContent(params)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
