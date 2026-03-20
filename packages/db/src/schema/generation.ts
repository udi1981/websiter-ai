import { pgTable, text, timestamp, integer, jsonb, boolean } from 'drizzle-orm/pg-core'
import { sites } from './sites'
import { users } from './users'
import { leads } from './crm'

// ─── generation_jobs ─────────────────────────────────────────────────

export const generationJobs = pgTable('generation_jobs', {
  id: text('id').primaryKey(),
  siteId: text('site_id').references(() => sites.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  locale: text('locale').notNull().default('he'),
  discoveryContext: jsonb('discovery_context').notNull().default({}),
  status: text('status').notNull().default('pending'),
  currentStep: text('current_step'),
  fallbackUsed: boolean('fallback_used').notNull().default(false),
  failureReason: text('failure_reason'),
  resumePoint: text('resume_point'),
  retries: integer('retries').notNull().default(0),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// ─── generation_steps ────────────────────────────────────────────────

export const generationSteps = pgTable('generation_steps', {
  id: text('id').primaryKey(),
  jobId: text('job_id').notNull().references(() => generationJobs.id, { onDelete: 'cascade' }),
  stepName: text('step_name').notNull(),
  status: text('status').notNull().default('pending'),
  agent: text('agent'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
  durationMs: integer('duration_ms'),
  retries: integer('retries').notNull().default(0),
  fallbackUsed: boolean('fallback_used').notNull().default(false),
  failureReason: text('failure_reason'),
  promptSize: integer('prompt_size'),
  responseSize: integer('response_size'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// ─── generation_artifacts ────────────────────────────────────────────

export const generationArtifacts = pgTable('generation_artifacts', {
  id: text('id').primaryKey(),
  jobId: text('job_id').notNull().references(() => generationJobs.id, { onDelete: 'cascade' }),
  stepId: text('step_id').references(() => generationSteps.id, { onDelete: 'set null' }),
  artifactType: text('artifact_type').notNull(),
  data: jsonb('data').notNull(),
  version: integer('version').notNull().default(1),
  valid: boolean('valid').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// ─── chatbot_sessions ───────────────────────────────────────────────

export const chatbotSessions = pgTable('chatbot_sessions', {
  id: text('id').primaryKey(),
  siteId: text('site_id').notNull().references(() => sites.id, { onDelete: 'cascade' }),
  visitorId: text('visitor_id'),
  leadId: text('lead_id').references(() => leads.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// ─── chatbot_messages ───────────────────────────────────────────────

export const chatbotMessages = pgTable('chatbot_messages', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => chatbotSessions.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})
