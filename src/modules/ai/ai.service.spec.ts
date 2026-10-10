import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AiToolsService } from './ai-tools.service.js';
import { AiService } from './ai.service.js';
import type { GeminiClientService } from './gemini-client.service.js';

const textResponse = (text: string): Record<string, unknown> => ({
  text,
  functionCalls: undefined,
  candidates: [{ content: { role: 'model', parts: [{ text }] } }],
});

const callResponse = (name: string, args: Record<string, unknown>): Record<string, unknown> => {
  const functionCall = { id: 'call-1', name, args };

  return {
    text: undefined,
    functionCalls: [functionCall],
    candidates: [{ content: { role: 'model', parts: [{ functionCall }] } }],
  };
};

describe('AiService', () => {
  const generateContent = vi.fn();
  const execute = vi.fn();
  const gemini = { generateContent } as unknown as GeminiClientService;
  const aiTools = {
    declarations: [{ name: 'get_lease' }],
    find: (name: string) => (name === 'get_lease' ? { declaration: { name }, execute } : undefined),
  } as unknown as AiToolsService;
  const config = { apiKey: 'test-key', model: 'gemini-test', ttsModel: 'tts-test', ttsVoice: 'Kore' };
  const service = new AiService(config, gemini, aiTools);

  beforeEach(() => {
    generateContent.mockReset();
    execute.mockReset();
  });

  it('answers directly when Gemini needs no tool', async () => {
    generateContent.mockResolvedValueOnce(textResponse('You have 4 active leases.'));

    await expect(service.chat('company-1', { message: 'How many leases?' })).resolves.toEqual({
      reply: 'You have 4 active leases.',
      toolsUsed: [],
    });
    expect(generateContent.mock.calls[0][0].model).toBe('gemini-test');
  });

  it('runs the requested tool for the caller company and returns the follow-up answer', async () => {
    generateContent
      .mockResolvedValueOnce(callResponse('get_lease', { leaseId: 'lease-1' }))
      .mockResolvedValueOnce(textResponse('Rent is 50,000.'));
    execute.mockResolvedValueOnce({ monthlyRent: '50000.00' });

    const result = await service.chat('company-1', { message: 'Rent on that lease?' });

    expect(result).toEqual({ reply: 'Rent is 50,000.', toolsUsed: ['get_lease'] });
    expect(execute).toHaveBeenCalledWith('company-1', { leaseId: 'lease-1' });
    expect(generateContent.mock.calls[1][0].contents.at(-1).parts[0].functionResponse).toEqual({
      id: 'call-1',
      name: 'get_lease',
      response: { result: { monthlyRent: '50000.00' } },
    });
  });

  it('hands a lookup failure back to Gemini instead of failing the request', async () => {
    generateContent
      .mockResolvedValueOnce(callResponse('get_lease', { leaseId: 'gone' }))
      .mockResolvedValueOnce(textResponse('I could not find that lease.'));
    execute.mockRejectedValueOnce(new NotFoundException('Lease "gone" was not found'));

    await service.chat('company-1', { message: 'Show lease gone' });

    expect(generateContent.mock.calls[1][0].contents.at(-1).parts[0].functionResponse.response).toEqual({
      error: 'Lease "gone" was not found',
    });
  });

  it('lets unexpected tool errors reach the exception filter', async () => {
    generateContent.mockResolvedValueOnce(callResponse('get_lease', { leaseId: 'lease-1' }));
    execute.mockRejectedValueOnce(new Error('connection reset'));

    await expect(service.chat('company-1', { message: 'Show lease' })).rejects.toThrow('connection reset');
  });
});
