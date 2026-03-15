export type AIModel = 'claude' | 'gemini-flash' | 'gemini-nano'

export type AITask =
  | 'site-generation'
  | 'page-generation'
  | 'block-edit'
  | 'text-rewrite'
  | 'image-search'
  | 'site-scan'
  | 'seo-analysis'
  | 'gso-analysis'
  | 'content-generation'
  | 'translation'
  | 'chat-response'

export type AIRequest = {
  task: AITask
  prompt: string
  context?: Record<string, unknown>
  model?: AIModel
  maxTokens?: number
}

export type AIResponse = {
  ok: true
  data: unknown
  model: AIModel
  tokensUsed: number
} | {
  ok: false
  error: string
  model: AIModel
}

export type SiteDNA = {
  siteType: string
  designStyle: string
  colorPalette: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    muted: string
  }
  fonts: {
    heading: string
    body: string
    mono?: string
  }
  sections: string[]
  layout: {
    maxWidth: string
    grid: string
    spacingBase: number
  }
  strengths: string[]
  weaknesses: string[]
  improvements: string[]
}

export type ImageMeta = {
  imageId: string
  currentUrl: string
  originalPrompt: string
  currentPrompt: string
  history: {
    url: string
    prompt: string
    timestamp: string
  }[]
  source: 'ai-generated' | 'user-uploaded' | 'stock-photo'
  placement: string
}
