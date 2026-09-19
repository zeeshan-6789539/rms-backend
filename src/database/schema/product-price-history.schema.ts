import { relations, sql } from 'drizzle-orm';
import {
  decimal,
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { uuidv7 } from '../../common/utils/uuid.util.js';
import { products } from './products.schema.js';

export const productPriceHistory = pgTable(
  'product_price_history',
  {
    id: uuid('id').primaryKey().$defaultFn(uuidv7),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    sellPrice: decimal('sell_price', { precision: 14, scale: 2 }).notNull(),
    purchasePrice: decimal('purchase_price', {
      precision: 14,
      scale: 2,
    }).notNull(),
    effectiveFrom: timestamp('effective_from', { withTimezone: true })
      .notNull()
      .defaultNow(),
    // Null means this row is the currently active price
    effectiveTo: timestamp('effective_to', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('product_price_history_product_idx').on(table.productId),
    // Enforces "at most one current price row per product" at the DB level
    uniqueIndex('product_price_history_current_unique_idx')
      .on(table.productId)
      .where(sql`${table.effectiveTo} is null`),
  ],
);

export const productPriceHistoryRelations = relations(
  productPriceHistory,
  ({ one }) => ({
    product: one(products, {
      fields: [productPriceHistory.productId],
      references: [products.id],
    }),
  }),
);
