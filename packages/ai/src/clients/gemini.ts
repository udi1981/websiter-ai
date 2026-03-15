import type { Result } from '@ubuilder/types'
import { ok, err } from '@ubuilder/types'

type GeminiContent = {
  role: 'user' | 'model'
  parts: Array<{ text: string }>
}

type GeminiResponse = {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>
      role: string
    }
    finishReason: string
  }>
  usageMetadata: {
    promptTokenCount: number
    candidatesTokenCount: number
    totalTokenCount: number
  }
}

type GenerateContentParams = {
  prompt: string
  systemInstruction?: string
  history?: GeminiContent[]
  model?: string
  maxTokens?: number
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const DEFAULT_MODEL = 'gemini-2.0-flash'
const DEFAULT_MAX_TOKENS = 4096

/** Get the Gemini API key from environment */
const getApiKey = (): string | undefined => {
  return process.env.GEMINI_API_KEY
}

/**
 * Generate content using the Gemini API.
 * Uses fetch directly — no SDK needed.
 */
export const generateContent = async (
  params: GenerateContentParams
): Promise<Result<{ text: string; tokensUsed: number }>> => {
  const apiKey = getApiKey()
  if (!apiKey) {
    return err('GEMINI_API_KEY is not set in environment variables')
  }

  const {
    prompt,
    systemInstruction,
    history = [],
    model = DEFAULT_MODEL,
    maxTokens = DEFAULT_MAX_TOKENS,
  } = params

  const url = `${GEMINI_API_URL}/${model}:generateContent?key=${apiKey}`

  const contents: GeminiContent[] = [
    ...history,
    { role: 'user', parts: [{ text: prompt }] },
  ]

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.7,
    },
  }

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }],
    }
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorBody = (await response.json()) as { error?: { message?: string } }
      return err(`Gemini API error (${response.status}): ${errorBody.error?.message ?? 'Unknown error'}`)
    }

    const data = (await response.json()) as GeminiResponse

    if (!data.candidates?.length) {
      return err('Gemini API returned no candidates')
    }

    const text = data.candidates[0].content.parts
      .map((part) => part.text)
      .join('')

    return ok({
      text,
      tokensUsed: data.usageMetadata?.totalTokenCount ?? 0,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error calling Gemini API'
    return err(message)
  }
}
