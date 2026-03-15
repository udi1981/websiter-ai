import type { AIModel, AIRequest, AIResponse, AITask } from '@ubuilder/types'
import { createMessage } from './clients/claude'
import { generateContent } from './clients/gemini'

export type AIRouterConfig = {
  claudeApiKey?: string
  geminiApiKey?: string
}

/** Task complexity mapping — determines which model handles each task */
const taskModelMap: Record<AITask, AIModel> = {
  'chat-response': 'gemini-flash',
  'text-rewrite': 'gemini-flash',
  'image-search': 'gemini-flash',
  'translation': 'gemini-flash',
  'block-edit': 'gemini-flash',
  'page-generation': 'claude',
  'site-generation': 'claude',
  'site-scan': 'claude',
  'seo-analysis': 'claude',
  'gso-analysis': 'claude',
  'content-generation': 'claude',
}

/** Fallback chain — if primary model fails, try the next */
const fallbackChain: Record<AIModel, AIModel | null> = {
  'gemini-nano': 'gemini-flash',
  'gemini-flash': 'claude',
  'claude': null,
}

/**
 * Route an AI request to the appropriate model, with fallback support.
 * Picks model based on task complexity, calls the actual API client,
 * and falls back to the next model in the chain on failure.
 */
const route = async (request: AIRequest): Promise<AIResponse> => {
  const model = request.model || taskModelMap[request.task] || 'gemini-flash'
  const maxTokens = request.maxTokens ?? 4096

  const result = await callModel(model, request.prompt, request.context, maxTokens)

  if (result.ok) {
    return {
      ok: true,
      data: result.data.text,
      model,
      tokensUsed: result.data.tokensUsed,
    }
  }

  // Try fallback
  const fallback = fallbackChain[model]
  if (fallback) {
    console.warn(`[AI Router] ${model} failed, falling back to ${fallback}: ${result.error}`)
    const fallbackResult = await callModel(fallback, request.prompt, request.context, maxTokens)

    if (fallbackResult.ok) {
      return {
        ok: true,
        data: fallbackResult.data.text,
        model: fallback,
        tokensUsed: fallbackResult.data.tokensUsed,
      }
    }

    return { ok: false, error: fallbackResult.error, model: fallback }
  }

  return { ok: false, error: result.error, model }
}

/** Call the appropriate model client */
const callModel = async (
  model: AIModel,
  prompt: string,
  context: Record<string, unknown> | undefined,
  maxTokens: number
): Promise<{ ok: true; data: { text: string; tokensUsed: number } } | { ok: false; error: string }> => {
  const systemPrompt = (context?.systemPrompt as string) ?? 'You are a helpful AI assistant.'

  if (model === 'claude') {
    return createMessage({
      systemPrompt,
      messages: [{ role: 'user', content: prompt }],
      maxTokens,
    })
  }

  // gemini-flash and gemini-nano both use the Gemini API
  return generateContent({
    prompt,
    systemInstruction: systemPrompt,
    maxTokens,
    model: model === 'gemini-nano' ? 'gemini-nano' : 'gemini-2.0-flash',
  })
}

/** Get the recommended model for a task */
const getModel = (task: AITask): AIModel => {
  return taskModelMap[task] || 'gemini-flash'
}

/** AI Router — classifies task complexity and routes to the right model */
export const aiRouter = { route, getModel }
