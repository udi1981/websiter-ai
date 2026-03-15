import type { Block } from './block'

export type Site = {
  id: string
  userId: string
  name: string
  slug: string
  domain: string | null
  customDomain: string | null
  status: 'draft' | 'published' | 'archived'
  locale: string
  locales: string[]
  createdAt: Date
  updatedAt: Date
}

export type Page = {
  id: string
  siteId: string
  title: string
  slug: string
  path: string
  blocks: Block[]
  meta: PageMeta
  locale: string
  order: number
  createdAt: Date
  updatedAt: Date
}

export type PageMeta = {
  title: string
  description: string
  ogImage?: string
  noIndex?: boolean
  canonicalUrl?: string
  structuredData?: Record<string, unknown>
}
