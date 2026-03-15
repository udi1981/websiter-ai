import type { Result, Block, SiteDNA, PageMeta } from '@ubuilder/types'
import { ok, err } from '@ubuilder/types'
import { createMessage } from '../clients/claude'
import { SITE_GENERATION_PROMPT } from '../prompts/system-prompts'
import { analyzePrompt } from './design-dna'

type GeneratedPage = {
  title: string
  slug: string
  path: string
  blocks: Block[]
  meta: PageMeta
}

type GeneratedSite = {
  siteName: string
  siteType: string
  pages: GeneratedPage[]
  designDna: SiteDNA
}

type GenerateSiteOptions = {
  locale?: string
  pageCount?: number
  includeCommerce?: boolean
  includeBlog?: boolean
}

/**
 * Generate a complete website from a user prompt.
 *
 * Pipeline:
 * 1. Analyze prompt to extract design DNA (colors, fonts, layout)
 * 2. Generate full site structure with pages and blocks via Claude
 * 3. Return the combined result
 */
export const generateSite = async (
  prompt: string,
  options: GenerateSiteOptions = {}
): Promise<Result<GeneratedSite>> => {
  // Step 1: Generate design DNA
  const dnaResult = await analyzePrompt(prompt)
  if (!dnaResult.ok) {
    return err(`Failed to analyze prompt: ${dnaResult.error}`)
  }
  const designDna = dnaResult.data

  // Step 2: Build the generation prompt with context
  const contextParts: string[] = [
    `User request: ${prompt}`,
    `\nDesign DNA determined:`,
    `- Site type: ${designDna.siteType}`,
    `- Design style: ${designDna.designStyle}`,
    `- Primary color: ${designDna.colorPalette.primary}`,
    `- Heading font: ${designDna.fonts.heading}`,
    `- Body font: ${designDna.fonts.body}`,
    `- Recommended sections: ${designDna.sections.join(', ')}`,
  ]

  if (options.locale) {
    contextParts.push(`\nGenerate all content in locale: ${options.locale}`)
  }
  if (options.pageCount) {
    contextParts.push(`\nGenerate exactly ${options.pageCount} pages`)
  }
  if (options.includeCommerce) {
    contextParts.push('\nInclude e-commerce pages (shop, product grid, cart)')
  }
  if (options.includeBlog) {
    contextParts.push('\nInclude a blog section with sample posts')
  }

  const result = await createMessage({
    systemPrompt: SITE_GENERATION_PROMPT,
    messages: [
      {
        role: 'user',
        content: contextParts.join('\n'),
      },
    ],
    maxTokens: 8192,
  })

  if (!result.ok) {
    return err(`Failed to generate site: ${result.error}`)
  }

  // Step 3: Parse the response
  try {
    const parsed = JSON.parse(result.data.text) as {
      siteName: string
      siteType: string
      pages: GeneratedPage[]
      designDna?: SiteDNA
    }

    return ok({
      siteName: parsed.siteName,
      siteType: parsed.siteType,
      pages: parsed.pages,
      designDna: parsed.designDna ?? designDna,
    })
  } catch {
    return err('Failed to parse site generation response as JSON')
  }
}
