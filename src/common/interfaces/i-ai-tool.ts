import type { FunctionDeclaration } from '@google/genai';

export interface IAiTool {
  declaration: FunctionDeclaration;
  execute: (companyId: string, args: Record<string, unknown>) => Promise<unknown>;
}
