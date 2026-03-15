import type { Result, Block, SiteDNA, PageMeta } from '@ubuilder/types'
import { ok, err } from '@ubuilder/types'
import { createMessage } from '../clients/claude'
import { PAGE_GENERATION_PROMPT } from '../prompts/system-prompts'

type SiteContext = {
  siteName: string
  siteType: string
  designDna: SiteDNA
}

type ExistingPage = {
  title: string
  slug: string
  path: string
}

type GeneratedPage = {
  title: string
  slug: string
  path: string
  blocks: Block[]
  meta: PageMeta
}

/**
 * Generate a single page with blocks, given the site context
 * and list of existing pages for consistency.
 */
export const generatePage = async (
  prompt: string,
  siteContext: SiteContext,
  existingPages: ExistingPage[] = []
): Promise<Result<GeneratedPage>> => {
  const contextParts: string[] = [
    `Site: ${siteContext.siteName} (${siteContext.siteType})`,
    `Design style: ${siteContext.designDna.designStyle}`,
    `Primary color: ${siteContext.designDna.colorPalette.primary}`,
    `Fonts: ${siteContext.designDna.fonts.heading} / ${siteContext.designDna.fonts.body}`,
  ]

  if (existingPages.length > 0) {
    contextParts.push(`\nExisting pages: ${existingPages.map((p) => `${p.title} (${p.path})`).join(', ')}`)
  }

  contextParts.push(`\nUser request: ${prompt}`)

  const result = await createMessage({
    systemPrompt: PAGE_GENERATION_PROMPT,
    messages: [
      {
        role: 'user',
        content: contextParts.join('\n'),
      },
    ],
    maxTokens: 4096,
  })

  if (!result.ok) {
    return err(`Failed to generate page: ${result.error}`)
  }

  try {
    const parsed = JSON.parse(result.data.text) as GeneratedPage
    return ok(parsed)
  } catch {
    return err('Failed to parse page generation response as JSON')
  }
}
