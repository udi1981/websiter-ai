import type { Result } from '@ubuilder/types'
import { ok, err } from '@ubuilder/types'

type ClaudeMessage = {
  role: 'user' | 'assistant'
  content: string
}

type ClaudeResponse = {
  id: string
  type: 'message'
  role: 'assistant'
  content: Array<{ type: 'text'; text: string }>
  model: string
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

type ClaudeErrorResponse = {
  type: 'error'
  error: {
    type: string
    message: string
  }
}

type CreateMessageParams = {
  systemPrompt: string
  messages: ClaudeMessage[]
  model?: string
  maxTokens?: number
}

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const DEFAULT_MODEL = 'claude-sonnet-4-20250514'
const DEFAULT_MAX_TOKENS = 4096

/** Get the Claude API key from environment */
const getApiKey = (): string | undefined => {
  return process.env.CLAUDE_API_KEY
}

/**
 * Send a message to the Claude API and return the response.
 * Uses fetch directly — no SDK needed.
 */
export const createMessage = async (
  params: CreateMessageParams
): Promise<Result<{ text: string; tokensUsed: number }>> => {
  const apiKey = getApiKey()
  if (!apiKey) {
    return err('CLAUDE_API_KEY is not set in environment variables')
  }

  const { systemPrompt, messages, model = DEFAULT_MODEL, maxTokens = DEFAULT_MAX_TOKENS } = params

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages,
      }),
    })

    if (!response.ok) {
      const errorBody = (await response.json()) as ClaudeErrorResponse
      return err(`Claude API error (${response.status}): ${errorBody.error?.message ?? 'Unknown error'}`)
    }

    const data = (await response.json()) as ClaudeResponse

    const text = data.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('')

    return ok({
      text,
      tokensUsed: data.usage.input_tokens + data.usage.output_tokens,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error calling Claude API'
    return err(message)
  }
}

/**
 * Send a message to the Claude API and stream the response.
 * Yields text chunks as they arrive.
 */
export const createMessageStream = async function* (
  params: CreateMessageParams
): AsyncGenerator<Result<string>> {
  const apiKey = getApiKey()
  if (!apiKey) {
    yield err('CLAUDE_API_KEY is not set in environment variables')
    return
  }

  const { systemPrompt, messages, model = DEFAULT_MODEL, maxTokens = DEFAULT_MAX_TOKENS } = params

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages,
        stream: true,
      }),
    })

    if (!response.ok) {
      const errorBody = (await response.json()) as ClaudeErrorResponse
      yield err(`Claude API error (${response.status}): ${errorBody.error?.message ?? 'Unknown error'}`)
      return
    }

    const reader = response.body?.getReader()
    if (!reader) {
      yield err('No response body from Claude API')
      return
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') return

        try {
          const event = JSON.parse(data) as Record<string, unknown>
          if (event.type === 'content_block_delta') {
            const delta = event.delta as { type: string; text?: string }
            if (delta.type === 'text_delta' && delta.text) {
              yield ok(delta.text)
            }
          }
        } catch {
          // Skip malformed JSON lines in stream
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error streaming from Claude API'
    yield err(message)
  }
}
