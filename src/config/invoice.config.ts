import { registerAs } from '@nestjs/config';
import { getEnv } from './env.js';
import type { IInvoiceConfig } from './interfaces/i-invoice-config.js';

export const INVOICE_CONFIG_NAMESPACE = 'invoice';

export const invoiceConfig = registerAs(INVOICE_CONFIG_NAMESPACE, (): IInvoiceConfig => {
  const env = getEnv();

  return {
    sendEnabled: env.INVOICE_SEND,
  };
});
