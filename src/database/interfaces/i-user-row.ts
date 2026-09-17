import type { users } from '../schema/users.schema.js';

export type IUserRow = typeof users.$inferSelect;
export type INewUserRow = typeof users.$inferInsert;
