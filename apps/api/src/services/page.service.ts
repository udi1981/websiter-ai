import type { Result, Block, PageMeta } from '@ubuilder/types'
import { ok, err } from '@ubuilder/types'
import { db, pages } from '@ubuilder/db'
import { prefixedId, slugify } from '@ubuilder/utils'
import { eq, and, asc } from 'drizzle-orm'

type CreatePageInput = {
  title: string
  slug?: string
  path?: string
  blocks?: Block[]
  meta?: PageMeta
  locale?: string
  order?: number
}

type UpdatePageInput = {
  title?: string
  slug?: string
  path?: string
  meta?: PageMeta
  locale?: string
  order?: number
}

type PageRow = typeof pages.$inferSelect

/**
 * Create a new page for a site.
 */
export const createPage = async (
  siteId: string,
  data: CreatePageInput
): Promise<Result<PageRow>> => {
  try {
    const id = prefixedId('page')
    const slug = data.slug ?? slugify(data.title)
    const path = data.path ?? `/${slug}`

    // Determine order: place at end by default
    const existingPages = await db
      .select()
      .from(pages)
      .where(eq(pages.siteId, siteId))
      .orderBy(asc(pages.order))

    const order = data.order ?? existingPages.length

    const defaultMeta: PageMeta = {
      title: data.title,
      description: '',
    }

    const [page] = await db
      .insert(pages)
      .values({
        id,
        siteId,
        title: data.title,
        slug,
        path,
        blocks: data.blocks ?? [],
        meta: data.meta ?? defaultMeta,
        locale: data.locale ?? 'en',
        order,
      })
      .returning()

    return ok(page)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create page'
    return err(message)
  }
}

/**
 * Get all pages for a site, ordered by their position.
 */
export const getPages = async (siteId: string): Promise<Result<PageRow[]>> => {
  try {
    const result = await db
      .select()
      .from(pages)
      .where(eq(pages.siteId, siteId))
      .orderBy(asc(pages.order))

    return ok(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch pages'
    return err(message)
  }
}

/**
 * Get a single page by ID.
 */
export const getPage = async (
  pageId: string,
  siteId: string
): Promise<Result<PageRow>> => {
  try {
    const [page] = await db
      .select()
      .from(pages)
      .where(and(eq(pages.id, pageId), eq(pages.siteId, siteId)))
      .limit(1)

    if (!page) {
      return err('Page not found')
    }

    return ok(page)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch page'
    return err(message)
  }
}

/**
 * Update a page's metadata (title, slug, path, meta, locale, order).
 */
export const updatePage = async (
  pageId: string,
  siteId: string,
  data: UpdatePageInput
): Promise<Result<PageRow>> => {
  try {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }

    if (data.title !== undefined) updateData.title = data.title
    if (data.slug !== undefined) updateData.slug = data.slug
    if (data.path !== undefined) updateData.path = data.path
    if (data.meta !== undefined) updateData.meta = data.meta
    if (data.locale !== undefined) updateData.locale = data.locale
    if (data.order !== undefined) updateData.order = data.order

    const [page] = await db
      .update(pages)
      .set(updateData)
      .where(and(eq(pages.id, pageId), eq(pages.siteId, siteId)))
      .returning()

    if (!page) {
      return err('Page not found')
    }

    return ok(page)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update page'
    return err(message)
  }
}

/**
 * Update only the blocks array of a page.
 */
export const updatePageBlocks = async (
  pageId: string,
  siteId: string,
  blocks: Block[]
): Promise<Result<PageRow>> => {
  try {
    const [page] = await db
      .update(pages)
      .set({ blocks, updatedAt: new Date() })
      .where(and(eq(pages.id, pageId), eq(pages.siteId, siteId)))
      .returning()

    if (!page) {
      return err('Page not found')
    }

    return ok(page)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update page blocks'
    return err(message)
  }
}

/**
 * Delete a page by ID.
 */
export const deletePage = async (
  pageId: string,
  siteId: string
): Promise<Result<{ id: string }>> => {
  try {
    const [page] = await db
      .delete(pages)
      .where(and(eq(pages.id, pageId), eq(pages.siteId, siteId)))
      .returning()

    if (!page) {
      return err('Page not found')
    }

    return ok({ id: page.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete page'
    return err(message)
  }
}

/**
 * Reorder pages by updating their order values.
 * The pageIds array represents the desired order.
 */
export const reorderPages = async (
  siteId: string,
  pageIds: string[]
): Promise<Result<PageRow[]>> => {
  try {
    const updatedPages: PageRow[] = []

    for (let i = 0; i < pageIds.length; i++) {
      const [page] = await db
        .update(pages)
        .set({ order: i, updatedAt: new Date() })
        .where(and(eq(pages.id, pageIds[i]), eq(pages.siteId, siteId)))
        .returning()

      if (page) {
        updatedPages.push(page)
      }
    }

    return ok(updatedPages)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reorder pages'
    return err(message)
  }
}
