import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ApiError } from '@google/genai';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AiToolsService } from './ai-tools.service.js';
import { AI_PROVIDER_BUSY_MESSAGE } from './ai.constants.js';
import { AiService } from './ai.service.js';

const generateContent = vi.fn();

vi.mock('@google/genai', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@google/genai')>()),
  GoogleGenAI: class {
    models = { generateContent };
  },
}));

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
  const execute = vi.fn();
  const aiTools = {
    declarations: [{ name: 'get_lease' }],
    find: (name: string) => (name === 'get_lease' ? { declaration: { name }, execute } : undefined),
  } as unknown as AiToolsService;
  const service = new AiService({ apiKey: 'test-key', model: 'gemini-test' }, aiTools);

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

  it('turns a Gemini overload into a 503 with a retry hint', async () => {
    generateContent.mockRejectedValueOnce(new ApiError({ message: 'high demand', status: 503 }));

    await expect(service.chat('company-1', { message: 'Hi' })).rejects.toThrow(
      new ServiceUnavailableException(AI_PROVIDER_BUSY_MESSAGE),
    );
  });

  it('answers 503 when no API key is configured', async () => {
    const unconfigured = new AiService({ apiKey: undefined, model: 'gemini-test' }, aiTools);

    await expect(unconfigured.chat('company-1', { message: 'Hi' })).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
