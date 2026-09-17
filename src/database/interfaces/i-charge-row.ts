import type { charges } from '../schema/charges.schema.js';

export type IChargeRow = typeof charges.$inferSelect;
export type INewChargeRow = typeof charges.$inferInsert;
