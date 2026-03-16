import { pgTable, text, timestamp, integer, jsonb, pgEnum, date } from 'drizzle-orm/pg-core'
import { sites } from './sites'

export const leadSourceEnum = pgEnum('lead_source', [
  'website_form',
  'chat',
  'manual',
  'import',
  'api',
])

export const leadStatusEnum = pgEnum('lead_status', [
  'new',
  'contacted',
  'qualified',
  'converted',
  'lost',
])

export const interactionTypeEnum = pgEnum('interaction_type', [
  'page_view',
  'form_submit',
  'chat_message',
  'email_open',
  'email_click',
  'purchase',
  'phone_call',
  'note',
])

export const interactionChannelEnum = pgEnum('interaction_channel', [
  'website',
  'email',
  'phone',
  'chat',
  'social',
  'manual',
])

export const campaignTypeEnum = pgEnum('campaign_type', ['email', 'sms', 'push'])

export const campaignStatusEnum = pgEnum('campaign_status', [
  'draft',
  'scheduled',
  'sending',
  'sent',
  'paused',
])

export const leads = pgTable('leads', {
  id: text('id').primaryKey(),
  siteId: text('site_id').notNull().references(() => sites.id, { onDelete: 'cascade' }),
  name: text('name'),
  email: text('email'),
  phone: text('phone'),
  source: leadSourceEnum('source').notNull().default('website_form'),
  status: leadStatusEnum('status').notNull().default('new'),
  score: integer('score').notNull().default(0),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  assignedTo: text('assigned_to'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const customers = pgTable('customers', {
  id: text('id').primaryKey(),
  siteId: text('site_id').notNull().references(() => sites.id, { onDelete: 'cascade' }),
  leadId: text('lead_id').references(() => leads.id),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  company: text('company'),
  totalSpent: integer('total_spent').notNull().default(0),
  orderCount: integer('order_count').notNull().default(0),
  tags: text('tags').array().notNull().default([]),
  metadata: jsonb('metadata'),
  lastActivityAt: timestamp('last_activity_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const interactions = pgTable('interactions', {
  id: text('id').primaryKey(),
  siteId: text('site_id').notNull().references(() => sites.id, { onDelete: 'cascade' }),
  leadId: text('lead_id').references(() => leads.id),
  customerId: text('customer_id').references(() => customers.id),
  type: interactionTypeEnum('type').notNull(),
  channel: interactionChannelEnum('channel').notNull(),
  data: jsonb('data').notNull().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const campaigns = pgTable('campaigns', {
  id: text('id').primaryKey(),
  siteId: text('site_id').notNull().references(() => sites.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  subject: text('subject').notNull(),
  type: campaignTypeEnum('type').notNull().default('email'),
  status: campaignStatusEnum('campaign_status').notNull().default('draft'),
  content: text('content').notNull().default(''),
  audience: jsonb('audience').notNull().default({}),
  stats: jsonb('stats').notNull().default({
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    unsubscribed: 0,
  }),
  scheduledAt: timestamp('scheduled_at'),
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const analytics = pgTable('analytics', {
  id: text('id').primaryKey(),
  siteId: text('site_id').notNull().references(() => sites.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  pageViews: integer('page_views').notNull().default(0),
  uniqueVisitors: integer('unique_visitors').notNull().default(0),
  avgSessionDuration: integer('avg_session_duration').notNull().default(0),
  bounceRate: integer('bounce_rate').notNull().default(0),
  topPages: jsonb('top_pages').notNull().default([]),
  topSources: jsonb('top_sources').notNull().default([]),
  conversions: integer('conversions').notNull().default(0),
  revenue: integer('revenue').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
