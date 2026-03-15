import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import * as siteService from '../services/site.service'
import * as pageService from '../services/page.service'

type Env = { Variables: { userId: string } }

export const sitesRoute = new Hono<Env>()

// All site routes require authentication
sitesRoute.use('*', authMiddleware)

/** GET /api/sites — list user's sites (paginated) */
sitesRoute.get('/', async (c) => {
  const userId = c.get('userId')
  const page = Number(c.req.query('page') ?? '1')
  const pageSize = Number(c.req.query('pageSize') ?? '20')

  const result = await siteService.getSites(userId, page, pageSize)

  if (!result.ok) {
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: result.error } }, 500)
  }

  return c.json({ success: true, data: result.data })
})

/** POST /api/sites — create new site */
sitesRoute.post('/', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json<{ name: string; locale?: string }>()

  if (!body.name) {
    return c.json({ success: false, error: { code: 'VALIDATION', message: 'Name is required' } }, 400)
  }

  const result = await siteService.createSite(userId, { name: body.name, locale: body.locale })

  if (!result.ok) {
    return c.json({ success: false, error: { code: 'CREATE_FAILED', message: result.error } }, 500)
  }

  return c.json({ success: true, data: result.data }, 201)
})

/** GET /api/sites/:id — get site details */
sitesRoute.get('/:id', async (c) => {
  const userId = c.get('userId')
  const siteId = c.req.param('id')

  const result = await siteService.getSite(siteId, userId)

  if (!result.ok) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: result.error } }, 404)
  }

  return c.json({ success: true, data: result.data })
})

/** PUT /api/sites/:id — update site */
sitesRoute.put('/:id', async (c) => {
  const userId = c.get('userId')
  const siteId = c.req.param('id')
  const body = await c.req.json()

  const result = await siteService.updateSite(siteId, userId, body)

  if (!result.ok) {
    return c.json({ success: false, error: { code: 'UPDATE_FAILED', message: result.error } }, 500)
  }

  return c.json({ success: true, data: result.data })
})

/** DELETE /api/sites/:id — soft-delete (archive) site */
sitesRoute.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const siteId = c.req.param('id')

  const result = await siteService.deleteSite(siteId, userId)

  if (!result.ok) {
    return c.json({ success: false, error: { code: 'DELETE_FAILED', message: result.error } }, 500)
  }

  return c.json({ success: true, data: result.data })
})

/** POST /api/sites/:id/publish — publish site */
sitesRoute.post('/:id/publish', async (c) => {
  const userId = c.get('userId')
  const siteId = c.req.param('id')

  const result = await siteService.publishSite(siteId, userId)

  if (!result.ok) {
    return c.json({ success: false, error: { code: 'PUBLISH_FAILED', message: result.error } }, 500)
  }

  return c.json({ success: true, data: result.data })
})

// ---- Page routes nested under sites ----

/** GET /api/sites/:id/pages — list pages for a site */
sitesRoute.get('/:id/pages', async (c) => {
  const siteId = c.req.param('id')

  const result = await pageService.getPages(siteId)

  if (!result.ok) {
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: result.error } }, 500)
  }

  return c.json({ success: true, data: result.data })
})

/** POST /api/sites/:id/pages — create page for a site */
sitesRoute.post('/:id/pages', async (c) => {
  const siteId = c.req.param('id')
  const body = await c.req.json<{ title: string; slug?: string; path?: string; blocks?: unknown[]; meta?: unknown }>()

  if (!body.title) {
    return c.json({ success: false, error: { code: 'VALIDATION', message: 'Title is required' } }, 400)
  }

  const result = await pageService.createPage(siteId, body as Parameters<typeof pageService.createPage>[1])

  if (!result.ok) {
    return c.json({ success: false, error: { code: 'CREATE_FAILED', message: result.error } }, 500)
  }

  return c.json({ success: true, data: result.data }, 201)
})

/** GET /api/sites/:id/pages/:pageId — get a single page */
sitesRoute.get('/:id/pages/:pageId', async (c) => {
  const siteId = c.req.param('id')
  const pageId = c.req.param('pageId')

  const result = await pageService.getPage(pageId, siteId)

  if (!result.ok) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: result.error } }, 404)
  }

  return c.json({ success: true, data: result.data })
})

/** PUT /api/sites/:id/pages/:pageId — update page metadata */
sitesRoute.put('/:id/pages/:pageId', async (c) => {
  const siteId = c.req.param('id')
  const pageId = c.req.param('pageId')
  const body = await c.req.json()

  const result = await pageService.updatePage(pageId, siteId, body)

  if (!result.ok) {
    return c.json({ success: false, error: { code: 'UPDATE_FAILED', message: result.error } }, 500)
  }

  return c.json({ success: true, data: result.data })
})

/** PUT /api/sites/:id/pages/:pageId/blocks — update page blocks */
sitesRoute.put('/:id/pages/:pageId/blocks', async (c) => {
  const siteId = c.req.param('id')
  const pageId = c.req.param('pageId')
  const body = await c.req.json<{ blocks: unknown[] }>()

  if (!body.blocks || !Array.isArray(body.blocks)) {
    return c.json({ success: false, error: { code: 'VALIDATION', message: 'blocks array is required' } }, 400)
  }

  const result = await pageService.updatePageBlocks(
    pageId,
    siteId,
    body.blocks as Parameters<typeof pageService.updatePageBlocks>[2]
  )

  if (!result.ok) {
    return c.json({ success: false, error: { code: 'UPDATE_FAILED', message: result.error } }, 500)
  }

  return c.json({ success: true, data: result.data })
})

/** DELETE /api/sites/:id/pages/:pageId — delete page */
sitesRoute.delete('/:id/pages/:pageId', async (c) => {
  const siteId = c.req.param('id')
  const pageId = c.req.param('pageId')

  const result = await pageService.deletePage(pageId, siteId)

  if (!result.ok) {
    return c.json({ success: false, error: { code: 'DELETE_FAILED', message: result.error } }, 500)
  }

  return c.json({ success: true, data: result.data })
})
