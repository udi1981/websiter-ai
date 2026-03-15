import { pgTable, text, timestamp, integer, jsonb, pgEnum } from 'drizzle-orm/pg-core'
import { sites } from './sites'

export const blogPostStatusEnum = pgEnum('blog_post_status', ['draft', 'published', 'scheduled', 'archived'])

export const blogAuthors = pgTable('blog_authors', {
  id: text('id').primaryKey(),
  siteId: text('site_id').notNull().references(() => sites.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  bio: text('bio'),
  avatar: text('avatar'),
  email: text('email'),
  social: jsonb('social').notNull().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const blogCategories = pgTable('blog_categories', {
  id: text('id').primaryKey(),
  siteId: text('site_id').notNull().references(() => sites.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  parentId: text('parent_id'),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const blogTags = pgTable('blog_tags', {
  id: text('id').primaryKey(),
  siteId: text('site_id').notNull().references(() => sites.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const blogPosts = pgTable('blog_posts', {
  id: text('id').primaryKey(),
  siteId: text('site_id').notNull().references(() => sites.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  excerpt: text('excerpt'),
  content: jsonb('content').notNull().default([]),
  authorId: text('author_id').notNull().references(() => blogAuthors.id),
  categoryId: text('category_id').references(() => blogCategories.id),
  tags: text('tags').array().notNull().default([]),
  status: blogPostStatusEnum('status').notNull().default('draft'),
  publishedAt: timestamp('published_at'),
  meta: jsonb('meta').notNull().default({}),
  gsoScore: integer('gso_score'),
  readTime: integer('read_time'),
  featuredImage: text('featured_image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
