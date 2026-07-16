import 'server-only';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  pgTable,
  text,
  numeric,
  integer,
  timestamp,
  pgEnum,
  serial,
  boolean
} from 'drizzle-orm/pg-core';
import { count, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

export const db = drizzle(neon(process.env.POSTGRES_URL ?? 'postgres://user:password@localhost:5432/cobros_latam'));

export const customerStatusEnum = pgEnum('customer_status', [
  'active',
  'paused',
  'delinquent'
]);
export const invoiceStatusEnum = pgEnum('invoice_status', [
  'draft',
  'pending',
  'paid',
  'overdue',
  'cancelled'
]);
export const paymentProviderEnum = pgEnum('payment_provider', [
  'mercado_pago_mx',
  'cash',
  'bank_transfer'
]);

export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  businessName: text('business_name').notNull(),
  contactName: text('contact_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  rfc: text('rfc'),
  country: text('country').notNull().default('MX'),
  status: customerStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id')
    .notNull()
    .references(() => customers.id),
  folio: text('folio').notNull(),
  concept: text('concept').notNull(),
  currency: text('currency').notNull().default('MXN'),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
  tax: numeric('tax', { precision: 12, scale: 2 }).notNull(),
  total: numeric('total', { precision: 12, scale: 2 }).notNull(),
  status: invoiceStatusEnum('status').notNull().default('pending'),
  dueAt: timestamp('due_at').notNull(),
  paidAt: timestamp('paid_at'),
  mercadoPagoPreferenceId: text('mercado_pago_preference_id'),
  mercadoPagoInitPoint: text('mercado_pago_init_point'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  invoiceId: integer('invoice_id')
    .notNull()
    .references(() => invoices.id),
  provider: paymentProviderEnum('provider').notNull(),
  providerPaymentId: text('provider_payment_id'),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('MXN'),
  status: text('status').notNull(),
  liveMode: boolean('live_mode').notNull().default(false),
  rawPayload: text('raw_payload'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export type SelectCustomer = typeof customers.$inferSelect;
export type SelectInvoice = typeof invoices.$inferSelect;
export type SelectPayment = typeof payments.$inferSelect;

export type InvoiceWithCustomer = SelectInvoice & {
  customerName: string;
  customerEmail: string;
};

export const insertCustomerSchema = createInsertSchema(customers);
export const insertInvoiceSchema = createInsertSchema(invoices);
export const insertPaymentSchema = createInsertSchema(payments);

export async function getDashboardMetrics() {
  const [metrics] = await db
    .select({
      totalRevenue: sql<string>`coalesce(sum(case when ${invoices.status} = 'paid' then ${invoices.total} else 0 end), 0)`,
      pendingRevenue: sql<string>`coalesce(sum(case when ${invoices.status} in ('pending', 'overdue') then ${invoices.total} else 0 end), 0)`,
      totalInvoices: count(invoices.id),
      activeCustomers: sql<number>`count(distinct case when ${customers.status} = 'active' then ${customers.id} end)`
    })
    .from(invoices)
    .innerJoin(customers, eq(invoices.customerId, customers.id));

  return metrics ?? {
    totalRevenue: '0',
    pendingRevenue: '0',
    totalInvoices: 0,
    activeCustomers: 0
  };
}

export async function getInvoices(search: string, offset: number) {
  const pageSize = 6;
  const base = db
    .select({
      id: invoices.id,
      customerId: invoices.customerId,
      folio: invoices.folio,
      concept: invoices.concept,
      currency: invoices.currency,
      subtotal: invoices.subtotal,
      tax: invoices.tax,
      total: invoices.total,
      status: invoices.status,
      dueAt: invoices.dueAt,
      paidAt: invoices.paidAt,
      mercadoPagoPreferenceId: invoices.mercadoPagoPreferenceId,
      mercadoPagoInitPoint: invoices.mercadoPagoInitPoint,
      createdAt: invoices.createdAt,
      customerName: customers.businessName,
      customerEmail: customers.email
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id));

  if (search) {
    const rows = await base
      .where(
        or(
          ilike(invoices.folio, `%${search}%`),
          ilike(invoices.concept, `%${search}%`),
          ilike(customers.businessName, `%${search}%`)
        )
      )
      .orderBy(desc(invoices.createdAt))
      .limit(100);

    return { invoices: rows, newOffset: null, totalInvoices: rows.length };
  }

  const [total] = await db.select({ count: count() }).from(invoices);
  const rows = await base
    .orderBy(desc(invoices.createdAt))
    .limit(pageSize)
    .offset(offset);

  return {
    invoices: rows,
    newOffset: rows.length >= pageSize ? offset + pageSize : null,
    totalInvoices: total.count
  };
}

export async function getCustomers(search = '') {
  if (search) {
    return db
      .select()
      .from(customers)
      .where(
        or(
          ilike(customers.businessName, `%${search}%`),
          ilike(customers.contactName, `%${search}%`),
          ilike(customers.email, `%${search}%`)
        )
      )
      .orderBy(desc(customers.createdAt));
  }

  return db.select().from(customers).orderBy(desc(customers.createdAt));
}

export async function getInvoiceById(id: number) {
  const [invoice] = await db
    .select({
      id: invoices.id,
      customerId: invoices.customerId,
      folio: invoices.folio,
      concept: invoices.concept,
      currency: invoices.currency,
      subtotal: invoices.subtotal,
      tax: invoices.tax,
      total: invoices.total,
      status: invoices.status,
      dueAt: invoices.dueAt,
      paidAt: invoices.paidAt,
      mercadoPagoPreferenceId: invoices.mercadoPagoPreferenceId,
      mercadoPagoInitPoint: invoices.mercadoPagoInitPoint,
      createdAt: invoices.createdAt,
      customerName: customers.businessName,
      customerEmail: customers.email
    })
    .from(invoices)
    .innerJoin(customers, eq(invoices.customerId, customers.id))
    .where(eq(invoices.id, id));

  return invoice;
}

export async function deleteInvoiceById(id: number) {
  await db.delete(invoices).where(eq(invoices.id, id));
}

// Backward-compatible exports for template components that are no longer linked in navigation.
export type SelectProduct = {
  id: number;
  imageUrl: string;
  name: string;
  status: string;
  price: string;
  stock: number;
  availableAt: Date;
};

export async function getProducts() {
  return { products: [] as SelectProduct[], newOffset: null, totalProducts: 0 };
}

export async function deleteProductById(_id: number) {
  return;
}
