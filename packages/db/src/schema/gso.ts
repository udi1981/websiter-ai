import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { sites } from './sites'

export const gsoScores = pgTable('gso_scores', {
  id: text('id').primaryKey(),
  siteId: text('site_id').notNull().references(() => sites.id, { onDelete: 'cascade' }),
  pageId: text('page_id'),
  scores: jsonb('scores').notNull().default({}),
  recommendations: jsonb('recommendations').notNull().default([]),
  strategy: jsonb('strategy').notNull().default({}),
  scannedAt: timestamp('scanned_at').notNull().defaultNow(),
})

export const gsoContentCalendar = pgTable('gso_content_calendar', {
  id: text('id').primaryKey(),
  siteId: text('site_id').notNull().references(() => sites.id, { onDelete: 'cascade' }),
  topics: jsonb('topics').notNull().default([]),
  schedule: jsonb('schedule').notNull().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
