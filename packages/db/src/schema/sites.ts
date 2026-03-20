import { pgTable, text, timestamp, pgEnum, jsonb, integer } from 'drizzle-orm/pg-core'
import { users } from './users'

export const siteStatusEnum = pgEnum('site_status', ['draft', 'published', 'archived', 'generation_failed'])

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
  /** Full HTML of the generated site */
  html: text('html'),
  /** AI generation build plan / prompt context */
  buildPlan: jsonb('build_plan'),
  /** SVG logo markup */
  logoSvg: text('logo_svg'),
  /** Business industry for AI context */
  industry: text('industry'),
  /** Primary brand color hex */
  primaryColor: text('primary_color').default('#7C3AED'),
  designDna: jsonb('design_dna'),
  gsoScore: jsonb('gso_score'),
  /** Current version number */
  version: integer('version').notNull().default(1),
  /** Source URL if created from scanner */
  sourceUrl: text('source_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})
