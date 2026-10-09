import { z } from 'zod';
import type { IAiTool } from '../interfaces/i-ai-tool.js';

// One zod schema gives Gemini its parameter schema and validates the arguments it sends back
export const defineAiTool = <TSchema extends z.ZodType>(
  name: string,
  description: string,
  schema: TSchema,
  run: (companyId: string, args: z.output<TSchema>) => Promise<unknown>,
): IAiTool => {
  const parametersJsonSchema: Record<string, unknown> = {
    ...z.toJSONSchema(schema, { io: 'input' }),
  };
  delete parametersJsonSchema.$schema;

  return {
    declaration: { name, description, parametersJsonSchema },
    execute: async (companyId, args) => run(companyId, schema.parse(args)),
  };
};
