import { pgTable, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core'
import { sites } from './sites'

export const media = pgTable('media', {
  id: text('id').primaryKey(),
  siteId: text('site_id').notNull().references(() => sites.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  originalPrompt: text('original_prompt'),
  currentPrompt: text('current_prompt'),
  source: text('source').notNull().default('ai-generated'),
  placement: text('placement'),
  width: integer('width'),
  height: integer('height'),
  alt: text('alt'),
  history: jsonb('history').notNull().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
