import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import * as aiService from '../services/ai.service'

type Env = { Variables: { userId: string } }

export const aiRoute = new Hono<Env>()

// All AI routes require authentication
aiRoute.use('*', authMiddleware)

/** POST /api/ai/generate — generate a complete site from prompt */
aiRoute.post('/generate', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json<{
    prompt: string
    locale?: string
    pageCount?: number
    includeCommerce?: boolean
    includeBlog?: boolean
  }>()

  if (!body.prompt) {
    return c.json(
      { success: false, error: { code: 'VALIDATION', message: 'prompt is required' } },
      400
    )
  }

  const result = await aiService.generateSite(userId, body.prompt, {
    locale: body.locale,
    pageCount: body.pageCount,
    includeCommerce: body.includeCommerce,
    includeBlog: body.includeBlog,
  })

  if (!result.ok) {
    return c.json(
      { success: false, error: { code: 'GENERATION_FAILED', message: result.error } },
      500
    )
  }

  return c.json({ success: true, data: result.data }, 201)
})

/** POST /api/ai/edit — AI edit a specific block */
aiRoute.post('/edit', async (c) => {
  const body = await c.req.json<{
    siteId: string
    pageId: string
    blockId: string
    instruction: string
  }>()

  if (!body.siteId || !body.pageId || !body.blockId || !body.instruction) {
    return c.json(
      { success: false, error: { code: 'VALIDATION', message: 'siteId, pageId, blockId, and instruction are required' } },
      400
    )
  }

  const result = await aiService.editBlock(body.siteId, body.pageId, body.blockId, body.instruction)

  if (!result.ok) {
    return c.json(
      { success: false, error: { code: 'EDIT_FAILED', message: result.error } },
      500
    )
  }

  return c.json({ success: true, data: result.data })
})

/** POST /api/ai/chat — chat with AI in editor context */
aiRoute.post('/chat', async (c) => {
  const body = await c.req.json<{
    siteId: string
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
  }>()

  if (!body.siteId || !body.messages?.length) {
    return c.json(
      { success: false, error: { code: 'VALIDATION', message: 'siteId and messages are required' } },
      400
    )
  }

  const result = await aiService.chatResponse(body.siteId, body.messages)

  if (!result.ok) {
    return c.json(
      { success: false, error: { code: 'CHAT_FAILED', message: result.error } },
      500
    )
  }

  return c.json({ success: true, data: { message: result.data } })
})

/** POST /api/ai/content — generate content (article, blog post, FAQ) */
aiRoute.post('/content', async (c) => {
  const body = await c.req.json<{
    siteId: string
    type: 'article' | 'blog-post' | 'faq'
    topic: string
    tone?: 'professional' | 'casual' | 'friendly' | 'authoritative'
    length?: 'short' | 'medium' | 'long'
  }>()

  if (!body.siteId || !body.type || !body.topic) {
    return c.json(
      { success: false, error: { code: 'VALIDATION', message: 'siteId, type, and topic are required' } },
      400
    )
  }

  const result = await aiService.generateContent(body.siteId, body.type, body.topic, {
    tone: body.tone,
    length: body.length,
  })

  if (!result.ok) {
    return c.json(
      { success: false, error: { code: 'CONTENT_FAILED', message: result.error } },
      500
    )
  }

  return c.json({ success: true, data: result.data })
})

/** POST /api/ai/scan — scan an external URL */
aiRoute.post('/scan', async (c) => {
  const body = await c.req.json<{ url: string }>()

  if (!body.url) {
    return c.json(
      { success: false, error: { code: 'VALIDATION', message: 'url is required' } },
      400
    )
  }

  const result = await aiService.scanSite(body.url)

  if (!result.ok) {
    return c.json(
      { success: false, error: { code: 'SCAN_FAILED', message: result.error } },
      500
    )
  }

  return c.json({ success: true, data: result.data })
})
