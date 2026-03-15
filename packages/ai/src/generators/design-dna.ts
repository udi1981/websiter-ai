import type { Result, SiteDNA } from '@ubuilder/types'
import { ok, err } from '@ubuilder/types'
import { createMessage } from '../clients/claude'
import { DESIGN_DNA_PROMPT } from '../prompts/system-prompts'

/**
 * Analyze a user prompt and generate a SiteDNA — the visual identity
 * (colors, fonts, layout style, recommended sections) for a website.
 */
export const analyzePrompt = async (prompt: string): Promise<Result<SiteDNA>> => {
  const result = await createMessage({
    systemPrompt: DESIGN_DNA_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Generate a design DNA for this website:\n\n${prompt}`,
      },
    ],
    maxTokens: 2048,
  })

  if (!result.ok) {
    return err(result.error)
  }

  try {
    const parsed = JSON.parse(result.data.text) as SiteDNA
    return ok(parsed)
  } catch {
    return err('Failed to parse design DNA response as JSON')
  }
}
