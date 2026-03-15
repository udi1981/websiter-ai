import type { Block } from './block'
import type { PageMeta } from './site'

/** Blog post status */
export type BlogPostStatus = 'draft' | 'published' | 'scheduled' | 'archived'

/** Blog post author */
export type BlogAuthor = {
  id: string
  siteId: string
  name: string
  slug: string
  bio: string | null
  avatar: string | null
  email: string | null
  social: { platform: string; url: string }[]
  createdAt: Date
  updatedAt: Date
}

/** Blog category */
export type BlogCategory = {
  id: string
  siteId: string
  name: string
  slug: string
  description: string | null
  parentId: string | null
  order: number
  createdAt: Date
  updatedAt: Date
}

/** Blog tag */
export type BlogTag = {
  id: string
  siteId: string
  name: string
  slug: string
  createdAt: Date
}

/** Blog post */
export type BlogPost = {
  id: string
  siteId: string
  title: string
  slug: string
  excerpt: string | null
  content: Block[]
  authorId: string
  categoryId: string | null
  tags: string[]
  status: BlogPostStatus
  publishedAt: Date | null
  meta: PageMeta
  gsoScore: number | null
  readTime: number | null
  featuredImage: string | null
  createdAt: Date
  updatedAt: Date
}

/** Content calendar entry for planning blog content */
export type ContentCalendarEntry = {
  id: string
  title: string
  topic: string
  targetKeywords: string[]
  status: 'idea' | 'planned' | 'writing' | 'review' | 'scheduled' | 'published'
  assignedTo: string | null
  scheduledDate: Date | null
  notes: string | null
}

/** Content calendar for a site */
export type ContentCalendar = {
  id: string
  siteId: string
  entries: ContentCalendarEntry[]
  createdAt: Date
  updatedAt: Date
}
