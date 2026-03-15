import type { Result } from '@ubuilder/types'
import { ok, err } from '@ubuilder/types'
import { db, sites } from '@ubuilder/db'
import { prefixedId, uniqueSlug } from '@ubuilder/utils'
import { eq, and, desc, ne } from 'drizzle-orm'

type CreateSiteInput = {
  name: string
  locale?: string
  designDna?: Record<string, unknown>
}

type UpdateSiteInput = {
  name?: string
  slug?: string
  domain?: string | null
  customDomain?: string | null
  locale?: string
  designDna?: Record<string, unknown>
}

type SiteRow = typeof sites.$inferSelect

/**
 * Create a new site for a user.
 */
export const createSite = async (
  userId: string,
  data: CreateSiteInput
): Promise<Result<SiteRow>> => {
  try {
    const id = prefixedId('site')
    const slug = uniqueSlug(data.name)

    const [site] = await db
      .insert(sites)
      .values({
        id,
        userId,
        name: data.name,
        slug,
        locale: data.locale ?? 'en',
        locales: [data.locale ?? 'en'],
        designDna: data.designDna ?? null,
      })
      .returning()

    return ok(site)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create site'
    return err(message)
  }
}

/**
 * List all non-archived sites belonging to a user, ordered by creation date (newest first).
 */
export const getSites = async (
  userId: string,
  page = 1,
  pageSize = 20
): Promise<Result<{ items: SiteRow[]; total: number; page: number; pageSize: number; hasMore: boolean }>> => {
  try {
    const offset = (page - 1) * pageSize

    const condition = and(eq(sites.userId, userId), ne(sites.status, 'archived'))

    const items = await db
      .select()
      .from(sites)
      .where(condition)
      .orderBy(desc(sites.createdAt))
      .limit(pageSize)
      .offset(offset)

    // Count total non-archived sites for pagination
    const allSites = await db
      .select()
      .from(sites)
      .where(condition)

    const total = allSites.length

    return ok({
      items,
      total,
      page,
      pageSize,
      hasMore: offset + items.length < total,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch sites'
    return err(message)
  }
}

/**
 * Get a single site by ID. Returns error if site not found or does not belong to user.
 */
export const getSite = async (
  siteId: string,
  userId: string
): Promise<Result<SiteRow>> => {
  try {
    const [site] = await db
      .select()
      .from(sites)
      .where(and(eq(sites.id, siteId), eq(sites.userId, userId)))
      .limit(1)

    if (!site) {
      return err('Site not found')
    }

    return ok(site)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch site'
    return err(message)
  }
}

/**
 * Update a site's properties.
 */
export const updateSite = async (
  siteId: string,
  userId: string,
  data: UpdateSiteInput
): Promise<Result<SiteRow>> => {
  try {
    const [site] = await db
      .update(sites)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(sites.id, siteId), eq(sites.userId, userId)))
      .returning()

    if (!site) {
      return err('Site not found')
    }

    return ok(site)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update site'
    return err(message)
  }
}

/**
 * Soft-delete a site by setting its status to 'archived'.
 */
export const deleteSite = async (
  siteId: string,
  userId: string
): Promise<Result<{ id: string }>> => {
  try {
    const [site] = await db
      .update(sites)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(and(eq(sites.id, siteId), eq(sites.userId, userId)))
      .returning()

    if (!site) {
      return err('Site not found')
    }

    return ok({ id: site.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete site'
    return err(message)
  }
}

/**
 * Publish a site by setting its status to 'published'.
 */
export const publishSite = async (
  siteId: string,
  userId: string
): Promise<Result<SiteRow>> => {
  try {
    const [site] = await db
      .update(sites)
      .set({ status: 'published', updatedAt: new Date() })
      .where(and(eq(sites.id, siteId), eq(sites.userId, userId)))
      .returning()

    if (!site) {
      return err('Site not found')
    }

    return ok(site)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to publish site'
    return err(message)
  }
}
