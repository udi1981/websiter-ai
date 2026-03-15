/** GSO (Generative Search Optimization) score breakdown */
export type GSOScore = {
  overall: number
  structuredData: number
  contentAuthority: number
  questionCoverage: number
  entityClarity: number
  contentFreshness: number
  contentStructure: number
  multiFormat: number
  technical: number
}

/** Severity level for GSO recommendations */
export type GSOSeverity = 'critical' | 'warning' | 'info'

/** Recommendation category for GSO improvements */
export type GSORecommendationCategory =
  | 'structured-data'
  | 'content-authority'
  | 'question-coverage'
  | 'entity-clarity'
  | 'content-freshness'
  | 'content-structure'
  | 'multi-format'
  | 'technical'

/** A single GSO recommendation */
export type GSORecommendation = {
  id: string
  category: GSORecommendationCategory
  severity: GSOSeverity
  message: string
  autoFixable: boolean
  fix?: {
    description: string
    blockId?: string
    action: string
    data?: Record<string, unknown>
  }
}

/** Content strategy derived from GSO analysis */
export type ContentStrategy = {
  keywords: { term: string; volume: number | null; difficulty: number | null; priority: 'high' | 'medium' | 'low' }[]
  questions: { question: string; answered: boolean; source?: string }[]
  claims: { claim: string; citation: string | null; verified: boolean }[]
  entities: { name: string; type: string; description: string | null; linked: boolean }[]
  gaps: { topic: string; description: string; suggestedContent: string; priority: 'high' | 'medium' | 'low' }[]
}

/** Full GSO analysis result for a site or page */
export type GSOAnalysis = {
  id: string
  siteId: string
  pageId?: string
  score: GSOScore
  recommendations: GSORecommendation[]
  strategy: ContentStrategy
  scannedAt: Date
}
