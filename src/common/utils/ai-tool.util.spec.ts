import { describe, expect, it, vi } from 'vitest';
import { z, ZodError } from 'zod';
import { defineAiTool } from './ai-tool.util.js';

describe('defineAiTool', () => {
  const schema = z.object({
    leaseId: z.uuid().describe('The lease id'),
    limit: z.number().int().max(25).default(10),
  });

  it('exposes the schema as JSON Schema without the $schema key, defaults left optional', () => {
    const tool = defineAiTool('get_lease', 'One lease', schema, vi.fn());
    const parameters = tool.declaration.parametersJsonSchema as Record<string, unknown>;

    expect(tool.declaration.name).toBe('get_lease');
    expect(parameters.$schema).toBeUndefined();
    expect(parameters.required).toEqual(['leaseId']);
  });

  it('passes parsed arguments, defaults applied, to the handler', async () => {
    const run = vi.fn().mockResolvedValue('ok');
    const tool = defineAiTool('get_lease', 'One lease', schema, run);
    const leaseId = '0199c8a0-0000-7000-8000-000000000000';

    await expect(tool.execute('company-1', { leaseId })).resolves.toBe('ok');
    expect(run).toHaveBeenCalledWith('company-1', { leaseId, limit: 10 });
  });

  it('rejects arguments that break the schema without calling the handler', async () => {
    const run = vi.fn();
    const tool = defineAiTool('get_lease', 'One lease', schema, run);

    await expect(tool.execute('company-1', { leaseId: 'nope' })).rejects.toBeInstanceOf(ZodError);
    expect(run).not.toHaveBeenCalled();
  });
});
