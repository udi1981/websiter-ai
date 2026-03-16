/**
 * Reusable AI client for scanner phases.
 *
 * Provides callClaude, callGemini, and callAI (with automatic fallback).
 * Handles timeouts, retries, JSON extraction from markdown-fenced output,
 * and graceful error propagation.
 */

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const CLAUDE_MODEL = 'claude-sonnet-4-20250514'

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

const DEFAULT_MAX_TOKENS = 8192
const DEFAULT_TEMPERATURE = 0.2
const DEFAULT_TIMEOUT = 45_000

// ---------------------------------------------------------------------------
// Public options type
// ---------------------------------------------------------------------------

export type AICallOptions = {
  maxTokens?: number
  temperature?: number
  timeout?: number
}

// ---------------------------------------------------------------------------
// JSON extraction helper
// ---------------------------------------------------------------------------

/**
 * Extract a JSON object or array from an AI response that may contain
 * markdown fences, preamble text, or trailing commentary.
 */
export const extractJson = (raw: string): string => {
  // Try direct parse first
  const trimmed = raw.trim()
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    return trimmed
  }

  // Strip markdown code fences
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) return fenceMatch[1].trim()

  // Find the outermost JSON object or array
  const objMatch = raw.match(/(\{[\s\S]*\})/)
  if (objMatch) return objMatch[1]

  const arrMatch = raw.match(/(\[[\s\S]*\])/)
  if (arrMatch) return arrMatch[1]

  return trimmed
}

// ---------------------------------------------------------------------------
// Claude client
// ---------------------------------------------------------------------------

/**
 * Call Claude (Sonnet 4) with a system + user prompt.
 * Returns the raw text response.
 * @throws on network error, timeout, or non-2xx status.
 */
export const callClaude = async (
  system: string,
  user: string,
  options?: AICallOptions
): Promise<string> => {
  const apiKey = process.env.CLAUDE_API_KEY
  if (!apiKey) throw new Error('CLAUDE_API_KEY is not set')

  const timeout = options?.timeout ?? DEFAULT_TIMEOUT
  const res = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: options?.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: options?.temperature ?? DEFAULT_TEMPERATURE,
      system,
      messages: [{ role: 'user', content: user }],
    }),
    signal: AbortSignal.timeout(timeout),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Claude API ${res.status}: ${body.slice(0, 200)}`)
  }

  const data = (await res.json()) as {
    content?: { type: string; text: string }[]
  }

  const text = data.content
    ?.filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')

  if (!text) throw new Error('Claude returned empty response')
  return text
}

// ---------------------------------------------------------------------------
// Gemini client
// ---------------------------------------------------------------------------

/**
 * Call Gemini 2.5 Flash with a system + user prompt.
 * Returns the raw text response.
 * @throws on network error, timeout, or non-2xx status.
 */
export const callGemini = async (
  system: string,
  user: string,
  options?: AICallOptions
): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set')

  const timeout = options?.timeout ?? DEFAULT_TIMEOUT
  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: {
        temperature: options?.temperature ?? DEFAULT_TEMPERATURE,
        maxOutputTokens: options?.maxTokens ?? DEFAULT_MAX_TOKENS,
        responseMimeType: 'application/json',
      },
    }),
    signal: AbortSignal.timeout(timeout),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Gemini API ${res.status}: ${body.slice(0, 200)}`)
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text: string }[] } }[]
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini returned empty response')
  return text
}

// ---------------------------------------------------------------------------
// Unified caller with fallback
// ---------------------------------------------------------------------------

/**
 * Call an AI model with automatic fallback: Claude -> Gemini.
 * If `preferClaude` is false, tries Gemini first then Claude.
 * Returns the raw text response.
 * @throws only when ALL providers fail.
 */
export const callAI = async (
  system: string,
  user: string,
  options?: AICallOptions & { preferClaude?: boolean }
): Promise<string> => {
  const preferClaude = options?.preferClaude ?? true
  const callOptions: AICallOptions = {
    maxTokens: options?.maxTokens,
    temperature: options?.temperature,
    timeout: options?.timeout,
  }

  const primary = preferClaude ? callClaude : callGemini
  const fallback = preferClaude ? callGemini : callClaude
  const primaryName = preferClaude ? 'Claude' : 'Gemini'
  const fallbackName = preferClaude ? 'Gemini' : 'Claude'

  let primaryError: string = 'unknown'
  try {
    return await primary(system, user, callOptions)
  } catch (err) {
    primaryError = err instanceof Error ? err.message : String(err)
    console.warn(
      `[ai-client] ${primaryName} failed, falling back to ${fallbackName}:`,
      primaryError
    )
  }

  try {
    return await fallback(system, user, callOptions)
  } catch (err) {
    const fallbackError = err instanceof Error ? err.message : String(err)
    throw new Error(
      `All AI providers failed. ${primaryName}: ${primaryError}. ${fallbackName}: ${fallbackError}`
    )
  }
}
