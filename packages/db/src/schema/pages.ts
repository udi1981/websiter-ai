import { pgTable, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core'
import { sites } from './sites'

export const pages = pgTable('pages', {
  id: text('id').primaryKey(),
  siteId: text('site_id').notNull().references(() => sites.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  path: text('path').notNull(),
  blocks: jsonb('blocks').notNull().default([]),
  meta: jsonb('meta').notNull().default({}),
  locale: text('locale').notNull().default('en'),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const versions = pgTable('versions', {
  id: text('id').primaryKey(),
  pageId: text('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
  siteId: text('site_id').notNull().references(() => sites.id, { onDelete: 'cascade' }),
  blocks: jsonb('blocks').notNull(),
  version: integer('version').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
