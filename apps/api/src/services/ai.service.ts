import type { Result, Block, SiteDNA } from '@ubuilder/types'
import { ok, err } from '@ubuilder/types'
import {
  generateSite as aiGenerateSite,
  generatePage as aiGeneratePage,
  generateArticle,
  generateFAQ,
  generateBlogPost,
  scanUrl,
  aiRouter,
} from '@ubuilder/ai'
import { CHAT_RESPONSE_PROMPT } from '@ubuilder/ai'
import * as siteService from './site.service'
import * as pageService from './page.service'

type GenerateSiteOptions = {
  locale?: string
  pageCount?: number
  includeCommerce?: boolean
  includeBlog?: boolean
}

type GenerateSiteResult = {
  siteId: string
  siteName: string
  siteType: string
  designDna: SiteDNA
  pageIds: string[]
}

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type ContentType = 'article' | 'blog-post' | 'faq'

/**
 * Generate a complete site from a prompt: creates the site record,
 * generates pages via AI, and stores them in the database.
 */
export const generateSite = async (
  userId: string,
  prompt: string,
  options: GenerateSiteOptions = {}
): Promise<Result<GenerateSiteResult>> => {
  // Step 1: Generate site via AI
  const genResult = await aiGenerateSite(prompt, options)
  if (!genResult.ok) {
    return err(genResult.error)
  }

  const generated = genResult.data

  // Step 2: Create site in DB
  const siteResult = await siteService.createSite(userId, {
    name: generated.siteName,
    locale: options.locale ?? 'en',
    designDna: generated.designDna as unknown as Record<string, unknown>,
  })

  if (!siteResult.ok) {
    return err(siteResult.error)
  }

  const site = siteResult.data

  // Step 3: Create pages in DB
  const pageIds: string[] = []

  for (let i = 0; i < generated.pages.length; i++) {
    const genPage = generated.pages[i]
    const pageResult = await pageService.createPage(site.id, {
      title: genPage.title,
      slug: genPage.slug,
      path: genPage.path,
      blocks: genPage.blocks,
      meta: genPage.meta,
      locale: options.locale ?? 'en',
      order: i,
    })

    if (pageResult.ok) {
      pageIds.push(pageResult.data.id)
    }
  }

  return ok({
    siteId: site.id,
    siteName: generated.siteName,
    siteType: generated.siteType,
    designDna: generated.designDna,
    pageIds,
  })
}

/**
 * AI-edit a specific block within a page.
 * Sends the block's current state plus the user instruction to the AI,
 * and returns the updated block.
 */
export const editBlock = async (
  siteId: string,
  pageId: string,
  blockId: string,
  instruction: string
): Promise<Result<Block>> => {
  // Fetch the page to get current blocks
  const pageResult = await pageService.getPage(pageId, siteId)
  if (!pageResult.ok) {
    return err(pageResult.error)
  }

  const pageBlocks = pageResult.data.blocks as Block[]
  const block = findBlock(pageBlocks, blockId)

  if (!block) {
    return err('Block not found')
  }

  const prompt = `Edit this block according to the instruction.

Current block:
${JSON.stringify(block, null, 2)}

Instruction: ${instruction}

Return ONLY the updated block as JSON. Keep the same id and type. No markdown fences.`

  const result = await aiRouter.route({
    task: 'block-edit',
    prompt,
    context: {
      systemPrompt: 'You are a website block editor. Return only the updated JSON block object.',
    },
  })

  if (!result.ok) {
    return err(result.error)
  }

  try {
    const updatedBlock = JSON.parse(result.data as string) as Block

    // Replace the block in the page
    const updatedBlocks = replaceBlock(pageBlocks, blockId, updatedBlock)
    await pageService.updatePageBlocks(pageId, siteId, updatedBlocks)

    return ok(updatedBlock)
  } catch {
    return err('Failed to parse AI response as block JSON')
  }
}

/**
 * Chat with the AI in the editor context.
 * Returns a text response based on the conversation and site context.
 */
export const chatResponse = async (
  siteId: string,
  messages: ChatMessage[]
): Promise<Result<string>> => {
  const lastMessage = messages[messages.length - 1]
  if (!lastMessage) {
    return err('No messages provided')
  }

  const result = await aiRouter.route({
    task: 'chat-response',
    prompt: lastMessage.content,
    context: {
      systemPrompt: CHAT_RESPONSE_PROMPT,
      siteId,
      history: messages.slice(0, -1),
    },
  })

  if (!result.ok) {
    return err(result.error)
  }

  return ok(result.data as string)
}

/**
 * Generate content (article, blog post, FAQ) for a site.
 */
export const generateContent = async (
  siteId: string,
  contentType: ContentType,
  topic: string,
  options: { tone?: 'professional' | 'casual' | 'friendly' | 'authoritative'; length?: 'short' | 'medium' | 'long' } = {}
): Promise<Result<unknown>> => {
  switch (contentType) {
    case 'article':
      return generateArticle(topic, {
        name: 'Site',
        type: 'general',
        description: `Content for site ${siteId}`,
      })

    case 'blog-post':
      return generateBlogPost(
        topic,
        options.tone ?? 'professional',
        options.length ?? 'medium'
      )

    case 'faq':
      return generateFAQ(topic)

    default:
      return err(`Unknown content type: ${contentType}`)
  }
}

/**
 * Scan an external URL and return the analysis.
 */
export const scanSite = async (url: string): Promise<Result<unknown>> => {
  return scanUrl(url)
}

/** Recursively find a block by ID in a block tree */
const findBlock = (blocks: Block[], blockId: string): Block | undefined => {
  for (const block of blocks) {
    if (block.id === blockId) return block
    const found = findBlock(block.children, blockId)
    if (found) return found
  }
  return undefined
}

/** Recursively replace a block by ID in a block tree */
const replaceBlock = (blocks: Block[], blockId: string, newBlock: Block): Block[] => {
  return blocks.map((block) => {
    if (block.id === blockId) return newBlock
    return {
      ...block,
      children: replaceBlock(block.children, blockId, newBlock),
    }
  })
}
