import type { IUserRow } from '../../../database/interfaces/i-user-row.js';

export interface IUserListResult {
  items: IUserRow[];
  totalItems: number;
}
