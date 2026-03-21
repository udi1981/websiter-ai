/** Generation pipeline types — jobs, steps, artifacts, chatbot */

// ─── Job Status Machine ─────────────────────────────────────────────

export type GenerationJobStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'

export type GenerationStepStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped'

export type GenerationStepName =
  | 'discovery'
  | 'strategy'
  | 'design'
  | 'cross_check'
  | 'content'
  | 'images'
  | 'build'
  | 'qa'
  | 'cpo'
  // Scan phases
  | 'scan_discovery'
  | 'scan_visual_dna'
  | 'scan_components'
  | 'scan_content'
  | 'scan_brand'
  | 'scan_technical'
  | 'scan_strategic'
  | 'scan_transform'
  // Migration steps (self_owned only)
  | 'scan_content_extract'
  | 'scan_catalog_extract'
  | 'scan_migration_map'

export type ArtifactType =
  | 'project_brief'
  | 'site_plan'
  | 'page_blueprint'
  | 'section_content'
  | 'asset_manifest'
  | 'chatbot_context'
  | 'render_result'
  // Scan artifacts
  | 'scan_site_map'
  | 'scan_visual_dna'
  | 'scan_full_result'
  | 'scan_generation_ctx'
  // Migration artifacts (self_owned only)
  | 'source_content_model'
  | 'content_catalog'
  | 'content_migration_manifest'

// ─── Source Ownership + Scan Mode ────────────────────────────────────

export type SourceOwnership = 'self_owned' | 'third_party'

export type ScanMode = 'copy' | 'inspiration' | 'recreation'

/** V1 only allows copy + inspiration; recreation is deferred to V2 */
export type ScanModeV1 = 'copy' | 'inspiration'

export type JobType = 'generation' | 'scan'

// ─── Provenance for Migration Fields ─────────────────────────────────

/** Wraps an extracted value with source provenance and confidence */
export type ExtractedField<T> = {
  value: T
  sourceType: 'dom' | 'json_ld' | 'inline_script' | 'api_response' | 'visual_inference' | 'unknown'
  sourceLocator?: string
  confidence: number  // 0-100
  normalizationNotes?: string
}

// ─── Generation Job ──────────────────────────────────────────────────

export type GenerationJob = {
  id: string
  siteId: string | null
  userId: string
  description: string
  locale: string
  discoveryContext: Record<string, unknown>
  status: GenerationJobStatus
  currentStep: string | null
  fallbackUsed: boolean
  failureReason: string | null
  resumePoint: string | null
  retries: number
  startedAt: Date | null
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
  // Scanner fields
  jobType: JobType
  sourceOwnership: SourceOwnership | null
  scanMode: ScanMode | null
  sourceUrl: string | null
  scanJobId: string | null
}

// ─── Generation Step ─────────────────────────────────────────────────

export type GenerationStep = {
  id: string
  jobId: string
  stepName: GenerationStepName
  status: GenerationStepStatus
  agent: string | null
  startedAt: Date | null
  finishedAt: Date | null
  durationMs: number | null
  retries: number
  fallbackUsed: boolean
  failureReason: string | null
  promptSize: number | null
  responseSize: number | null
  createdAt: Date
}

// ─── Generation Artifact ─────────────────────────────────────────────

export type GenerationArtifact = {
  id: string
  jobId: string
  stepId: string | null
  artifactType: ArtifactType
  data: Record<string, unknown>
  version: number
  valid: boolean
  createdAt: Date
}

// ─── Chatbot Session ─────────────────────────────────────────────────

export type ChatbotSession = {
  id: string
  siteId: string
  visitorId: string | null
  leadId: string | null
  createdAt: Date
  updatedAt: Date
}

export type ChatbotMessageRole = 'visitor' | 'assistant'

export type ChatbotMessage = {
  id: string
  sessionId: string
  role: ChatbotMessageRole
  content: string
  createdAt: Date
}

// ─── Artifact Schemas ────────────────────────────────────────────────

export type ProjectBrief = {
  businessName: string
  description: string
  locale: 'en' | 'he'
  industry: string
  discoveryAnswers: Record<string, string>
  sourceUrl: string | null
}

export type SitePlan = {
  businessName: string
  industry: string
  targetAudience: string
  brandPersonality: string
  contentTone: string
  uniqueSellingPoints: string[]
  conversionGoals: string[]
  sectionPriorities: string[]
  visualKeywords: string[]
}

export type PageBlueprintSection = {
  type: string
  variantId: string
  order: number
}

export type PageBlueprintPalette = {
  primary: string
  secondary: string
  accent: string
  background: string
  backgroundAlt: string
  text: string
  textMuted: string
  border: string
}

export type PageBlueprintTypography = {
  headingFont: string
  bodyFont: string
  headingWeight: string
  bodyWeight: string
}

export type PageBlueprint = {
  siteName: string
  colorPalette: PageBlueprintPalette
  typography: PageBlueprintTypography
  sections: PageBlueprintSection[]
  backgroundEffect: string | null
  effects: string[]
}

export type SectionContentItem = {
  title?: string
  description?: string
  [key: string]: unknown
}

export type SectionContentEntry = {
  type: string
  variantId: string
  headline: string
  subheadline?: string
  cta?: { text: string; action: string }
  items: SectionContentItem[]
}

export type SectionContent = {
  sections: SectionContentEntry[]
}

export type AssetSlot = {
  sectionType: string
  role: string
  aspectRatio: string
  styleIntent: string
  required: boolean
  fallback: string
  status: 'pending' | 'generated' | 'uploaded' | 'failed'
  url: string | null
  altText: string
}

export type AssetManifest = {
  slots: AssetSlot[]
  generatedCount: number
  skippedReasons: Record<string, string>
}

export type ChatbotContext = {
  businessName: string
  industry: string
  locale: string
  description: string
  services: string[]
  uniqueSellingPoints: string[]
  contactInfo: {
    phone: string | null
    email: string | null
    address: string | null
  }
  faqs: { question: string; answer: string }[]
  leadCaptureGoals: string[]
}

export type RenderResult = {
  html: string
  sectionCount: number
  hasNavbar: boolean
  hasFooter: boolean
  hasContactSection: boolean
  locale: string
  byteSize: number
}

// ─── Job Status Response (GET /api/generation/[jobId]) ───────────────

export type GenerationJobStatusResponse = {
  job: GenerationJob
  steps: GenerationStep[]
  artifacts: {
    type: ArtifactType
    valid: boolean
    version: number
    createdAt: Date
  }[]
}
