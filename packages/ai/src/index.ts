export { aiRouter } from './router'
export type { AIRouterConfig } from './router'

// Clients
export { createMessage, createMessageStream } from './clients/claude'
export { generateContent } from './clients/gemini'

// Generators
export { generateSite } from './generators/site-generator'
export { generatePage } from './generators/page-generator'
export { generateArticle, generateFAQ, generateBlogPost } from './generators/content-generator'
export { analyzePrompt } from './generators/design-dna'

// Scanner (V1 — legacy)
export { scanUrl } from './scanner/site-scanner'

// Scanner V2 — full pipeline
export { quickScan, deepScan, runScanPipeline, transformScanToGenerationContext } from './scanner/index'
export type { ScanProgress, ScanPipelineOptions, ScanBasedGenerationContext } from './scanner/index'

// Scanner V2 — AI phases
export { extractBrandIntelligence } from './scanner/phases/05-brand'
export type { BrandIntelligence } from './scanner/phases/05-brand'
export { extractStrategicInsights } from './scanner/phases/07-strategic'
export type { StrategicInsights, StrategicPhaseInput } from './scanner/phases/07-strategic'

// Scanner V2 — AI utilities
export { callClaude, callGemini, callAI, extractJson } from './scanner/utils/ai-client'

// Scanner V2 — prompts
export { buildBrandAnalysisPrompt } from './scanner/prompts/brand-analysis'
export { buildStrategicAnalysisPrompt } from './scanner/prompts/strategic-analysis'
export { buildComponentAnalysisPrompt } from './scanner/prompts/component-analysis'

// Prompts
export {
  SITE_GENERATION_PROMPT,
  PAGE_GENERATION_PROMPT,
  CONTENT_GENERATION_PROMPT,
  DESIGN_DNA_PROMPT,
  CHAT_RESPONSE_PROMPT,
  GSO_ANALYSIS_PROMPT,
} from './prompts/system-prompts'
