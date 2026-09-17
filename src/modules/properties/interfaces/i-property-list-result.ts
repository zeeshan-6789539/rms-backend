import type { IPropertyRow } from '../../../database/interfaces/i-property-row.js';

export interface IPropertyListResult {
  items: IPropertyRow[];
  totalItems: number;
}
