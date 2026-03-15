import { pgTable, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core'
import { sites } from './sites'

export const forms = pgTable('forms', {
  id: text('id').primaryKey(),
  siteId: text('site_id').notNull().references(() => sites.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  fields: jsonb('fields').notNull().default([]),
  submissions: integer('submissions').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const formSubmissions = pgTable('form_submissions', {
  id: text('id').primaryKey(),
  formId: text('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
  data: jsonb('data').notNull().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
