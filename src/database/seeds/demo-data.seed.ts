import { Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { OrderStatus } from '../../common/enums/order-status.enum.js';
import { UserRole } from '../../common/enums/user-role.enum.js';
import type { IWeightedOption } from '../../common/interfaces/i-weighted-option.js';
import { hashSecret } from '../../common/utils/hash.util.js';
import {
  addDays,
  randomDate,
  randomInt,
  randomItem,
  weightedPick,
} from '../../common/utils/random.util.js';
import { uuidv7 } from '../../common/utils/uuid.util.js';
import type { INewCategoryRow } from '../interfaces/i-category-row.js';
import type { INewCompanyRow } from '../interfaces/i-company-row.js';
import type { IDrizzleDb } from '../interfaces/i-drizzle-db.js';
import type { INewOrderItemRow } from '../interfaces/i-order-item-row.js';
import type { INewOrderRow } from '../interfaces/i-order-row.js';
import type { INewProductPriceHistoryRow } from '../interfaces/i-product-price-history-row.js';
import type { INewProductRow } from '../interfaces/i-product-row.js';
import type { INewSubcategoryRow } from '../interfaces/i-subcategory-row.js';
import type { INewUserRow } from '../interfaces/i-user-row.js';
import {
  categories,
  companies,
  orderItems,
  orders,
  productPriceHistory,
  products,
  subcategories,
  users,
} from '../schema/index.js';
import type {
  IDemoCompanyBlueprint,
  IDemoProductBlueprint,
} from './interfaces/i-demo-catalog.js';

const logger = new Logger('DemoDataSeed');

// Every demo user shares this password so the seed log stays short — logged once below
const DEMO_PASSWORD = 'Demo@12345';

const ORDER_WINDOW_DAYS = 365;
const ORDERS_PER_COMPANY_MIN = 140;
const ORDERS_PER_COMPANY_MAX = 200;

const FIRST_NAMES = [
  'Ahmed', 'Ayesha', 'Bilal', 'Sara', 'Hamza', 'Fatima',
  'Usman', 'Zainab', 'Imran', 'Nadia', 'Tariq', 'Sana',
];
const LAST_NAMES = [
  'Khan', 'Ali', 'Malik', 'Sheikh', 'Raza', 'Iqbal',
  'Qureshi', 'Baig', 'Hussain', 'Farooq',
];

// A dummy business per company "perspective" — general store, wholesaler, cafe
const DEMO_CATALOG: IDemoCompanyBlueprint[] = [
  {
    name: 'Al-Noor Traders',
    email: 'contact@al-noor-traders.demo',
    phone: '+92-21-1110001',
    address: 'Shop 14, Tariq Road',
    city: 'Karachi',
    categories: [
      {
        name: 'Groceries',
        subcategories: [
          {
            name: 'Rice & Grains',
            products: [
              { name: 'Basmati Rice 5kg', sellPrice: 1450, purchasePrice: 1150, initialStock: 220 },
              { name: 'Sella Rice 5kg', sellPrice: 1250, purchasePrice: 980, initialStock: 180 },
              { name: 'Wheat Flour 10kg', sellPrice: 1600, purchasePrice: 1320, initialStock: 150 },
            ],
          },
          {
            name: 'Cooking Oil',
            products: [
              { name: 'Sunflower Oil 5L', sellPrice: 2650, purchasePrice: 2300, initialStock: 120 },
              { name: 'Canola Oil 3L', sellPrice: 1750, purchasePrice: 1500, initialStock: 140 },
              { name: 'Banaspati Ghee 1kg', sellPrice: 650, purchasePrice: 540, initialStock: 200 },
            ],
          },
        ],
      },
      {
        name: 'Electronics',
        subcategories: [
          {
            name: 'Mobile Accessories',
            products: [
              { name: 'USB-C Cable 1m', sellPrice: 450, purchasePrice: 280, initialStock: 300 },
              { name: 'Wireless Earbuds', sellPrice: 3200, purchasePrice: 2400, initialStock: 90 },
              { name: 'Power Bank 10000mAh', sellPrice: 2800, purchasePrice: 2100, initialStock: 110 },
            ],
          },
          {
            name: 'Home Appliances',
            products: [
              { name: 'Electric Kettle 1.7L', sellPrice: 2200, purchasePrice: 1700, initialStock: 70 },
              { name: 'Table Fan 16-inch', sellPrice: 3400, purchasePrice: 2700, initialStock: 60 },
              { name: 'LED Bulb 9W', sellPrice: 250, purchasePrice: 160, initialStock: 400 },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Blue Ocean Wholesale',
    email: 'sales@blue-ocean-wholesale.demo',
    phone: '+92-42-1110002',
    address: 'Plot 22, Industrial Area',
    city: 'Lahore',
    categories: [
      {
        name: 'Stationery',
        subcategories: [
          {
            name: 'Writing Supplies',
            products: [
              { name: 'Ball Pen Box (50pcs)', sellPrice: 850, purchasePrice: 620, initialStock: 250 },
              { name: 'Gel Pen Set', sellPrice: 550, purchasePrice: 390, initialStock: 260 },
              { name: 'Marker Pack (12pcs)', sellPrice: 950, purchasePrice: 700, initialStock: 180 },
            ],
          },
          {
            name: 'Paper Products',
            products: [
              { name: 'A4 Paper Ream', sellPrice: 1100, purchasePrice: 880, initialStock: 300 },
              { name: 'Notebook Pack (5pcs)', sellPrice: 750, purchasePrice: 540, initialStock: 220 },
              { name: 'Sticky Notes Pack', sellPrice: 320, purchasePrice: 210, initialStock: 260 },
            ],
          },
        ],
      },
      {
        name: 'Furniture',
        subcategories: [
          {
            name: 'Office Furniture',
            products: [
              { name: 'Office Chair', sellPrice: 12500, purchasePrice: 9800, initialStock: 40 },
              { name: 'Study Desk', sellPrice: 15800, purchasePrice: 12600, initialStock: 30 },
              { name: 'Filing Cabinet', sellPrice: 9600, purchasePrice: 7400, initialStock: 25 },
            ],
          },
          {
            name: 'Storage',
            products: [
              { name: 'Plastic Storage Box', sellPrice: 950, purchasePrice: 680, initialStock: 150 },
              { name: 'Bookshelf 5-tier', sellPrice: 8200, purchasePrice: 6300, initialStock: 35 },
              { name: 'Drawer Unit', sellPrice: 6700, purchasePrice: 5100, initialStock: 45 },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Metro Cafe & Bakery',
    email: 'hello@metro-cafe-bakery.demo',
    phone: '+92-51-1110003',
    address: 'F-7 Markaz',
    city: 'Islamabad',
    categories: [
      {
        name: 'Beverages',
        subcategories: [
          {
            name: 'Hot Drinks',
            products: [
              { name: 'Espresso', sellPrice: 380, purchasePrice: 150, initialStock: 500 },
              { name: 'Cappuccino', sellPrice: 480, purchasePrice: 190, initialStock: 500 },
              { name: 'Green Tea', sellPrice: 300, purchasePrice: 110, initialStock: 400 },
            ],
          },
          {
            name: 'Cold Drinks',
            products: [
              { name: 'Iced Latte', sellPrice: 520, purchasePrice: 220, initialStock: 400 },
              { name: 'Fresh Lemonade', sellPrice: 350, purchasePrice: 130, initialStock: 350 },
              { name: 'Chocolate Milkshake', sellPrice: 600, purchasePrice: 260, initialStock: 300 },
            ],
          },
        ],
      },
      {
        name: 'Bakery Items',
        subcategories: [
          {
            name: 'Bread',
            products: [
              { name: 'Sourdough Loaf', sellPrice: 650, purchasePrice: 320, initialStock: 150 },
              { name: 'Baguette', sellPrice: 420, purchasePrice: 200, initialStock: 180 },
              { name: 'Multigrain Bread', sellPrice: 480, purchasePrice: 240, initialStock: 160 },
            ],
          },
          {
            name: 'Pastries',
            products: [
              { name: 'Croissant', sellPrice: 320, purchasePrice: 140, initialStock: 220 },
              { name: 'Chocolate Muffin', sellPrice: 350, purchasePrice: 150, initialStock: 220 },
              { name: 'Cinnamon Roll', sellPrice: 380, purchasePrice: 170, initialStock: 200 },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Sunrise Pharmacy & General Store',
    email: 'info@sunrise-pharmacy.demo',
    phone: '+92-61-1110004',
    address: 'Block C, Satellite Town',
    city: 'Multan',
    categories: [
      {
        name: 'Health & Wellness',
        subcategories: [
          {
            name: 'Medicines',
            products: [
              { name: 'Paracetamol 500mg (Strip)', sellPrice: 90, purchasePrice: 55, initialStock: 500 },
              { name: 'Cough Syrup 100ml', sellPrice: 320, purchasePrice: 220, initialStock: 260 },
              { name: 'Multivitamin Tablets (30pcs)', sellPrice: 780, purchasePrice: 560, initialStock: 200 },
            ],
          },
          {
            name: 'Personal Care',
            products: [
              { name: 'Antiseptic Liquid 500ml', sellPrice: 480, purchasePrice: 340, initialStock: 180 },
              { name: 'Hand Sanitizer 250ml', sellPrice: 350, purchasePrice: 230, initialStock: 260 },
              { name: 'Surgical Face Mask (50pcs)', sellPrice: 600, purchasePrice: 420, initialStock: 220 },
            ],
          },
        ],
      },
      {
        name: 'Household Essentials',
        subcategories: [
          {
            name: 'Cleaning Supplies',
            products: [
              { name: 'Dishwashing Liquid 1L', sellPrice: 420, purchasePrice: 290, initialStock: 240 },
              { name: 'Floor Cleaner 1L', sellPrice: 380, purchasePrice: 260, initialStock: 220 },
              { name: 'Laundry Detergent 3kg', sellPrice: 1350, purchasePrice: 1050, initialStock: 150 },
            ],
          },
          {
            name: 'Baby Care',
            products: [
              { name: 'Baby Diapers (Pack of 40)', sellPrice: 1650, purchasePrice: 1280, initialStock: 130 },
              { name: 'Baby Wipes (80pcs)', sellPrice: 380, purchasePrice: 260, initialStock: 210 },
              { name: 'Baby Lotion 200ml', sellPrice: 620, purchasePrice: 440, initialStock: 160 },
            ],
          },
        ],
      },
    ],
  },
];

const STOCK_AFFECTING_STATUSES = new Set<OrderStatus>([OrderStatus.PAID]);

// An order still in its first 2 days is almost never resolved yet
const RECENT_STATUS_WEIGHTS: IWeightedOption<OrderStatus>[] = [
  { value: OrderStatus.PENDING, weight: 45 },
  { value: OrderStatus.PAID, weight: 45 },
  { value: OrderStatus.CANCELLED, weight: 10 },
];

// 2-7 days old: mostly settled, some still pending
const MID_STATUS_WEIGHTS: IWeightedOption<OrderStatus>[] = [
  { value: OrderStatus.PENDING, weight: 15 },
  { value: OrderStatus.PAID, weight: 75 },
  { value: OrderStatus.CANCELLED, weight: 10 },
];

// Older than a week: almost everything has reached a final state
const SETTLED_STATUS_WEIGHTS: IWeightedOption<OrderStatus>[] = [
  { value: OrderStatus.PAID, weight: 85 },
  { value: OrderStatus.CANCELLED, weight: 10 },
  { value: OrderStatus.PENDING, weight: 5 },
];

const pickOrderStatus = (ageDays: number): OrderStatus => {
  if (ageDays < 2) {
    return weightedPick(RECENT_STATUS_WEIGHTS);
  }

  if (ageDays < 7) {
    return weightedPick(MID_STATUS_WEIGHTS);
  }

  return weightedPick(SETTLED_STATUS_WEIGHTS);
};

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

interface IPricePeriod {
  sellPrice: number;
  effectiveFrom: Date;
  effectiveTo: Date | null;
}

interface IBuiltProduct {
  id: string;
  pricePeriods: IPricePeriod[];
  remainingStock: number;
}

interface IBuiltUser {
  id: string;
  createdAt: Date;
}

interface IBuiltCompany {
  id: string;
  users: IBuiltUser[];
  products: IBuiltProduct[];
}

// One client_admin, two managers, three staff, six customers — spread across the company's lifetime
const buildCompanyUsers = (
  companyId: string,
  companySlug: string,
  companyCreatedAt: Date,
  now: Date,
  passwordHash: string,
): { rows: INewUserRow[]; summaries: IBuiltUser[] } => {
  const rows: INewUserRow[] = [];
  const summaries: IBuiltUser[] = [];

  const addUser = (role: UserRole, usernameSuffix: string, createdAt: Date): void => {
    const id = uuidv7();

    rows.push({
      id,
      companyId,
      email: `${usernameSuffix}@${companySlug}.demo`,
      passwordHash,
      name: `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`,
      phone: `+92-3${randomInt(10, 99)}-${randomInt(1000000, 9999999)}`,
      role,
      status: true,
      lastLoginAt: randomDate(createdAt, now),
      createdAt,
      updatedAt: createdAt,
    });

    summaries.push({ id, createdAt });
  };

  // Created first so later steps can use it as the products' createdByUserId
  addUser(UserRole.CLIENT_ADMIN, 'admin', companyCreatedAt);

  for (let i = 1; i <= 2; i += 1) {
    addUser(UserRole.MANAGER, `manager${i}`, randomDate(companyCreatedAt, addDays(companyCreatedAt, 15)));
  }

  for (let i = 1; i <= 3; i += 1) {
    addUser(UserRole.STAFF, `staff${i}`, randomDate(companyCreatedAt, addDays(companyCreatedAt, 20)));
  }

  for (let i = 1; i <= 6; i += 1) {
    addUser(UserRole.CUSTOMER, `customer${i}`, randomDate(companyCreatedAt, now));
  }

  return { rows, summaries };
};

// Most products keep one price for their whole life; some get a single repricing
// months in, which mirrors ProductsRepository.updatePrice closing the old row
const buildPriceHistory = (
  productId: string,
  blueprint: IDemoProductBlueprint,
  productCreatedAt: Date,
  now: Date,
): { rows: INewProductPriceHistoryRow[]; periods: IPricePeriod[] } => {
  const daysSinceCreated = Math.floor(
    (now.getTime() - productCreatedAt.getTime()) / (24 * 60 * 60 * 1000),
  );
  const repriced = daysSinceCreated > 120 && Math.random() < 0.4;

  if (!repriced) {
    return {
      rows: [
        {
          id: uuidv7(),
          productId,
          sellPrice: blueprint.sellPrice.toFixed(2),
          purchasePrice: blueprint.purchasePrice.toFixed(2),
          effectiveFrom: productCreatedAt,
          effectiveTo: null,
          createdAt: productCreatedAt,
        },
      ],
      periods: [
        { sellPrice: blueprint.sellPrice, effectiveFrom: productCreatedAt, effectiveTo: null },
      ],
    };
  }

  const changeDate = randomDate(addDays(productCreatedAt, 90), addDays(now, -30));
  const shift = randomInt(-15, 20) / 100;
  const newSellPrice = Math.round(blueprint.sellPrice * (1 + shift));
  const newPurchasePrice = Math.round(blueprint.purchasePrice * (1 + shift));

  return {
    rows: [
      {
        id: uuidv7(),
        productId,
        sellPrice: blueprint.sellPrice.toFixed(2),
        purchasePrice: blueprint.purchasePrice.toFixed(2),
        effectiveFrom: productCreatedAt,
        effectiveTo: changeDate,
        createdAt: productCreatedAt,
      },
      {
        id: uuidv7(),
        productId,
        sellPrice: newSellPrice.toFixed(2),
        purchasePrice: newPurchasePrice.toFixed(2),
        effectiveFrom: changeDate,
        effectiveTo: null,
        createdAt: changeDate,
      },
    ],
    periods: [
      { sellPrice: blueprint.sellPrice, effectiveFrom: productCreatedAt, effectiveTo: changeDate },
      { sellPrice: newSellPrice, effectiveFrom: changeDate, effectiveTo: null },
    ],
  };
};

const priceAt = (periods: IPricePeriod[], date: Date): number => {
  const match = periods.find(
    (period) => period.effectiveFrom <= date && (period.effectiveTo === null || date < period.effectiveTo),
  );

  return (match ?? periods[periods.length - 1]).sellPrice;
};

const pickDistinctProducts = (pool: IBuiltProduct[], count: number): IBuiltProduct[] => {
  const remaining = [...pool];
  const picked: IBuiltProduct[] = [];

  while (picked.length < count && remaining.length > 0) {
    const index = randomInt(0, remaining.length - 1);
    picked.push(remaining[index]);
    remaining.splice(index, 1);
  }

  return picked;
};

// A year of checkouts per company: dated, priced at the time, moving stock for
// every status that implies fulfillment actually happened
const buildCompanyOrders = (
  company: IBuiltCompany,
  now: Date,
): { orderRows: INewOrderRow[]; itemRows: INewOrderItemRow[] } => {
  const orderRows: INewOrderRow[] = [];
  const itemRows: INewOrderItemRow[] = [];
  const orderCount = randomInt(ORDERS_PER_COMPANY_MIN, ORDERS_PER_COMPANY_MAX);

  const orderDates = Array.from({ length: orderCount }, () =>
    randomDate(addDays(now, -ORDER_WINDOW_DAYS), now),
  ).sort((a, b) => a.getTime() - b.getTime());

  for (const orderDate of orderDates) {
    const eligibleUsers = company.users.filter((user) => user.createdAt <= orderDate);
    const orderUser = eligibleUsers.length > 0 ? randomItem(eligibleUsers) : company.users[0];
    const ageDays = Math.floor((now.getTime() - orderDate.getTime()) / (24 * 60 * 60 * 1000));
    const status = pickOrderStatus(ageDays);
    const isStockAffecting = STOCK_AFFECTING_STATUSES.has(status);

    const orderId = uuidv7();
    const chosenProducts = pickDistinctProducts(company.products, randomInt(1, 4));
    const items: INewOrderItemRow[] = [];

    for (const product of chosenProducts) {
      let quantity = randomInt(1, 4);

      if (isStockAffecting) {
        if (product.remainingStock <= 0) {
          continue;
        }

        quantity = Math.min(quantity, product.remainingStock);
        product.remainingStock -= quantity;
      }

      items.push({
        id: uuidv7(),
        orderId,
        productId: product.id,
        quantity,
        price: priceAt(product.pricePeriods, orderDate).toFixed(2),
        createdAt: orderDate,
        updatedAt: orderDate,
      });
    }

    // Every candidate product was out of stock at this point — skip the order entirely
    if (items.length === 0) {
      continue;
    }

    orderRows.push({
      id: orderId,
      companyId: company.id,
      userId: orderUser.id,
      status,
      createdAt: orderDate,
      updatedAt: orderDate,
    });
    itemRows.push(...items);
  }

  return { orderRows, itemRows };
};

// Populates a year of realistic, cross-module history: companies, every user
// role, the category/subcategory/product catalog with price changes over time,
// and orders spanning the full status lifecycle. Gated behind SEED_DEMO_DATA
// so it never runs against a real environment by accident.
export const seedDemoData = async (db: IDrizzleDb): Promise<void> => {
  const marker = DEMO_CATALOG[0];
  const existing = await db.query.companies.findFirst({
    where: eq(companies.name, marker.name),
  });

  if (existing) {
    logger.log('Demo data already present — skipping');
    return;
  }

  const now = new Date();
  const passwordHash = await hashSecret(DEMO_PASSWORD);

  const companyRows: INewCompanyRow[] = [];
  const userRows: INewUserRow[] = [];
  const categoryRows: INewCategoryRow[] = [];
  const subcategoryRows: INewSubcategoryRow[] = [];
  const productRows: INewProductRow[] = [];
  const priceHistoryRows: INewProductPriceHistoryRow[] = [];
  const builtCompanies: IBuiltCompany[] = [];

  for (const blueprint of DEMO_CATALOG) {
    const companyId = uuidv7();
    const companySlug = slugify(blueprint.name);
    const companyCreatedAt = randomDate(addDays(now, -400), addDays(now, -370));

    companyRows.push({
      id: companyId,
      name: blueprint.name,
      email: blueprint.email,
      phone: blueprint.phone,
      address: blueprint.address,
      city: blueprint.city,
      status: true,
      createdAt: companyCreatedAt,
      updatedAt: companyCreatedAt,
    });

    const { rows: companyUserRows, summaries: companyUsers } = buildCompanyUsers(
      companyId,
      companySlug,
      companyCreatedAt,
      now,
      passwordHash,
    );
    userRows.push(...companyUserRows);

    const adminUserId = companyUsers[0].id;
    const companyProducts: IBuiltProduct[] = [];

    for (const category of blueprint.categories) {
      const categoryId = uuidv7();
      const categoryCreatedAt = randomDate(companyCreatedAt, addDays(companyCreatedAt, 5));

      categoryRows.push({
        id: categoryId,
        name: category.name,
        companyId,
        status: true,
        createdAt: categoryCreatedAt,
        updatedAt: categoryCreatedAt,
      });

      for (const subcategory of category.subcategories) {
        const subcategoryId = uuidv7();
        const subcategoryCreatedAt = randomDate(categoryCreatedAt, addDays(categoryCreatedAt, 5));

        subcategoryRows.push({
          id: subcategoryId,
          name: subcategory.name,
          categoryId,
          status: true,
          createdAt: subcategoryCreatedAt,
          updatedAt: subcategoryCreatedAt,
        });

        for (const productBlueprint of subcategory.products) {
          const productId = uuidv7();
          const productCreatedAt = randomDate(
            subcategoryCreatedAt,
            addDays(subcategoryCreatedAt, 45),
          );

          productRows.push({
            id: productId,
            name: productBlueprint.name,
            quantity: productBlueprint.initialStock,
            subcategoryId,
            companyId,
            createdByUserId: adminUserId,
            status: true,
            createdAt: productCreatedAt,
            updatedAt: productCreatedAt,
          });

          const { rows: priceRows, periods } = buildPriceHistory(
            productId,
            productBlueprint,
            productCreatedAt,
            now,
          );
          priceHistoryRows.push(...priceRows);

          companyProducts.push({
            id: productId,
            pricePeriods: periods,
            remainingStock: productBlueprint.initialStock,
          });
        }
      }
    }

    builtCompanies.push({ id: companyId, users: companyUsers, products: companyProducts });
  }

  await db.insert(companies).values(companyRows);
  await db.insert(users).values(userRows);
  await db.insert(categories).values(categoryRows);
  await db.insert(subcategories).values(subcategoryRows);
  await db.insert(products).values(productRows);
  await db.insert(productPriceHistory).values(priceHistoryRows);

  const orderRows: INewOrderRow[] = [];
  const orderItemRows: INewOrderItemRow[] = [];

  for (const company of builtCompanies) {
    const built = buildCompanyOrders(company, now);
    orderRows.push(...built.orderRows);
    orderItemRows.push(...built.itemRows);
  }

  await db.insert(orders).values(orderRows);
  await db.insert(orderItems).values(orderItemRows);

  // Reflect stock consumed by fulfilled orders back onto each product's current quantity
  for (const company of builtCompanies) {
    for (const product of company.products) {
      await db
        .update(products)
        .set({ quantity: product.remainingStock })
        .where(eq(products.id, product.id));
    }
  }

  logger.log(
    `Seeded ${companyRows.length} companies, ${userRows.length} users, ${productRows.length} products, ` +
      `${orderRows.length} orders (${orderItemRows.length} items) spanning the last ${ORDER_WINDOW_DAYS} days`,
  );
  logger.log(`Every demo user's password is "${DEMO_PASSWORD}"`);
};
