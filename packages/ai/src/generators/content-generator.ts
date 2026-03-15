import type { Result } from '@ubuilder/types'
import { ok, err } from '@ubuilder/types'
import { createMessage } from '../clients/claude'
import { CONTENT_GENERATION_PROMPT } from '../prompts/system-prompts'

type ArticleResult = {
  title: string
  content: string
  excerpt: string
  tags: string[]
  meta: {
    title: string
    description: string
  }
}

type FAQResult = {
  items: Array<{ question: string; answer: string }>
}

type GSOOptions = {
  targetKeywords?: string[]
  targetQuestions?: string[]
  locale?: string
}

type BusinessContext = {
  name: string
  type: string
  description?: string
  locale?: string
}

/**
 * Generate a full article optimized for GSO (Generative Search Optimization).
 */
export const generateArticle = async (
  topic: string,
  businessContext: BusinessContext,
  gsoOptions: GSOOptions = {}
): Promise<Result<ArticleResult>> => {
  const contextParts: string[] = [
    `Content type: article`,
    `Topic: ${topic}`,
    `Business: ${businessContext.name} (${businessContext.type})`,
  ]

  if (businessContext.description) {
    contextParts.push(`Business description: ${businessContext.description}`)
  }
  if (gsoOptions.targetKeywords?.length) {
    contextParts.push(`Target keywords: ${gsoOptions.targetKeywords.join(', ')}`)
  }
  if (gsoOptions.targetQuestions?.length) {
    contextParts.push(`Target questions to answer: ${gsoOptions.targetQuestions.join('; ')}`)
  }
  if (gsoOptions.locale) {
    contextParts.push(`Write in locale: ${gsoOptions.locale}`)
  }

  const result = await createMessage({
    systemPrompt: CONTENT_GENERATION_PROMPT,
    messages: [{ role: 'user', content: contextParts.join('\n') }],
    maxTokens: 4096,
  })

  if (!result.ok) {
    return err(`Failed to generate article: ${result.error}`)
  }

  try {
    const parsed = JSON.parse(result.data.text) as ArticleResult
    return ok(parsed)
  } catch {
    return err('Failed to parse article response as JSON')
  }
}

/**
 * Generate a FAQ section for a given business type.
 */
export const generateFAQ = async (
  businessType: string,
  questions: string[] = []
): Promise<Result<FAQResult>> => {
  const contextParts: string[] = [
    `Content type: faq`,
    `Business type: ${businessType}`,
  ]

  if (questions.length > 0) {
    contextParts.push(`Suggested questions to include: ${questions.join('; ')}`)
  } else {
    contextParts.push('Generate 8-12 common questions for this business type')
  }

  const result = await createMessage({
    systemPrompt: CONTENT_GENERATION_PROMPT,
    messages: [{ role: 'user', content: contextParts.join('\n') }],
    maxTokens: 4096,
  })

  if (!result.ok) {
    return err(`Failed to generate FAQ: ${result.error}`)
  }

  try {
    const parsed = JSON.parse(result.data.text) as FAQResult
    return ok(parsed)
  } catch {
    return err('Failed to parse FAQ response as JSON')
  }
}

/**
 * Generate a blog post with specified tone and length.
 */
export const generateBlogPost = async (
  topic: string,
  tone: 'professional' | 'casual' | 'friendly' | 'authoritative' = 'professional',
  length: 'short' | 'medium' | 'long' = 'medium'
): Promise<Result<ArticleResult>> => {
  const wordCounts = { short: 400, medium: 800, long: 1500 }

  const contextParts: string[] = [
    `Content type: blog-post`,
    `Topic: ${topic}`,
    `Tone: ${tone}`,
    `Target length: approximately ${wordCounts[length]} words`,
  ]

  const result = await createMessage({
    systemPrompt: CONTENT_GENERATION_PROMPT,
    messages: [{ role: 'user', content: contextParts.join('\n') }],
    maxTokens: 4096,
  })

  if (!result.ok) {
    return err(`Failed to generate blog post: ${result.error}`)
  }

  try {
    const parsed = JSON.parse(result.data.text) as ArticleResult
    return ok(parsed)
  } catch {
    return err('Failed to parse blog post response as JSON')
  }
}
