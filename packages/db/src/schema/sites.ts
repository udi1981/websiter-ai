import { pgTable, text, timestamp, pgEnum, jsonb } from 'drizzle-orm/pg-core'
import { users } from './users'

export const siteStatusEnum = pgEnum('site_status', ['draft', 'published', 'archived'])

export const sites = pgTable('sites', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  domain: text('domain').unique(),
  customDomain: text('custom_domain').unique(),
  status: siteStatusEnum('status').notNull().default('draft'),
  locale: text('locale').notNull().default('en'),
  locales: text('locales').array().notNull().default([]),
  designDna: jsonb('design_dna'),
  gsoScore: jsonb('gso_score'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
