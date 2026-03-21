import type {
  Result,
  ProjectBrief,
  SitePlan,
  PageBlueprint,
  SectionContent,
  AssetManifest,
  ChatbotContext,
  RenderResult,
} from '@ubuilder/types'
import { ok, err } from '@ubuilder/types'

// ─── Helpers ─────────────────────────────────────────────────────────

const isNonEmpty = (v: unknown): v is string =>
  typeof v === 'string' && v.trim().length > 0

const isHex = (v: unknown): boolean =>
  typeof v === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(v)

const isArray = (v: unknown): v is unknown[] => Array.isArray(v)

// ─── Validators ──────────────────────────────────────────────────────

/** Validate a project_brief artifact */
export const validateProjectBrief = (data: unknown): Result<ProjectBrief> => {
  const d = data as Record<string, unknown>
  if (!d || typeof d !== 'object') return err('project_brief must be an object')
  if (!isNonEmpty(d.businessName)) return err('businessName is required')
  if (!isNonEmpty(d.description)) return err('description is required')
  if (d.locale !== 'en' && d.locale !== 'he') return err('locale must be "en" or "he"')
  if (!isNonEmpty(d.industry)) return err('industry is required')
  return ok(d as unknown as ProjectBrief)
}

/** Validate a site_plan artifact */
export const validateSitePlan = (data: unknown): Result<SitePlan> => {
  const d = data as Record<string, unknown>
  if (!d || typeof d !== 'object') return err('site_plan must be an object')
  if (!isNonEmpty(d.businessName)) return err('businessName is required')
  if (!isNonEmpty(d.industry)) return err('industry is required')
  if (!isArray(d.uniqueSellingPoints) || d.uniqueSellingPoints.length < 1)
    return err('uniqueSellingPoints must have at least 1 item')
  if (!isArray(d.conversionGoals) || d.conversionGoals.length < 1)
    return err('conversionGoals must have at least 1 item')
  return ok(d as unknown as SitePlan)
}

/** Validate a page_blueprint artifact */
export const validatePageBlueprint = (data: unknown): Result<PageBlueprint> => {
  const d = data as Record<string, unknown>
  if (!d || typeof d !== 'object') return err('page_blueprint must be an object')
  if (!isNonEmpty(d.siteName)) return err('siteName is required')

  // Validate color palette
  const palette = d.colorPalette as Record<string, unknown> | undefined
  if (!palette || typeof palette !== 'object') return err('colorPalette is required')
  const paletteKeys = ['primary', 'secondary', 'accent', 'background', 'backgroundAlt', 'text', 'textMuted', 'border']
  for (const key of paletteKeys) {
    if (!isHex(palette[key])) return err(`colorPalette.${key} must be a valid hex color`)
  }

  // Validate typography
  const typo = d.typography as Record<string, unknown> | undefined
  if (!typo || typeof typo !== 'object') return err('typography is required')
  for (const key of ['headingFont', 'bodyFont', 'headingWeight', 'bodyWeight']) {
    if (!isNonEmpty(typo[key])) return err(`typography.${key} is required`)
  }

  // Validate sections
  if (!isArray(d.sections) || d.sections.length < 5)
    return err('sections must have at least 5 entries')
  for (const s of d.sections as Record<string, unknown>[]) {
    if (!isNonEmpty(s.type)) return err('each section must have a type')
    if (!isNonEmpty(s.variantId)) return err('each section must have a variantId')
    if (typeof s.order !== 'number') return err('each section must have a numeric order')
  }

  return ok(d as unknown as PageBlueprint)
}

/** Validate a section_content artifact */
export const validateSectionContent = (data: unknown): Result<SectionContent> => {
  const d = data as Record<string, unknown>
  if (!d || typeof d !== 'object') return err('section_content must be an object')
  if (!isArray(d.sections)) return err('sections must be an array')
  for (const s of d.sections as Record<string, unknown>[]) {
    if (!isNonEmpty(s.type)) return err('each section must have a type')
    if (!isNonEmpty(s.variantId)) return err('each section must have a variantId')
    // navbar and footer sections legitimately have no headline
    const headlineOptional = s.type === 'navbar' || s.type === 'footer'
    if (!headlineOptional && !isNonEmpty(s.headline)) return err(`section ${s.type} must have a non-empty headline`)
  }
  return ok(d as unknown as SectionContent)
}

/** Validate an asset_manifest artifact */
export const validateAssetManifest = (data: unknown): Result<AssetManifest> => {
  const d = data as Record<string, unknown>
  if (!d || typeof d !== 'object') return err('asset_manifest must be an object')
  if (!isArray(d.slots)) return err('slots must be an array')
  for (const s of d.slots as Record<string, unknown>[]) {
    if (!isNonEmpty(s.sectionType)) return err('each slot must have a sectionType')
    if (!isNonEmpty(s.role)) return err('each slot must have a role')
    if (!isNonEmpty(s.aspectRatio)) return err('each slot must have an aspectRatio')
    if (typeof s.required !== 'boolean') return err('each slot must have a boolean required field')
  }
  return ok(d as unknown as AssetManifest)
}

/** Validate a chatbot_context artifact */
export const validateChatbotContext = (data: unknown): Result<ChatbotContext> => {
  const d = data as Record<string, unknown>
  if (!d || typeof d !== 'object') return err('chatbot_context must be an object')
  if (!isNonEmpty(d.businessName)) return err('businessName is required')
  if (!isNonEmpty(d.industry)) return err('industry is required')
  if (!isNonEmpty(d.locale)) return err('locale is required')
  return ok(d as unknown as ChatbotContext)
}

/** Validate a render_result artifact */
export const validateRenderResult = (data: unknown): Result<RenderResult> => {
  const d = data as Record<string, unknown>
  if (!d || typeof d !== 'object') return err('render_result must be an object')
  if (typeof d.html !== 'string') return err('html must be a string')
  if (!d.html.includes('<!DOCTYPE')) return err('html must contain <!DOCTYPE')
  if (!d.html.includes('</html>')) return err('html must contain </html>')
  if (typeof d.byteSize !== 'number' || d.byteSize < 5000)
    return err('byteSize must be >= 5000')
  if (typeof d.sectionCount !== 'number' || d.sectionCount < 5)
    return err('sectionCount must be >= 5')
  return ok(d as unknown as RenderResult)
}

// ─── Scan Artifact Validators ────────────────────────────────────────

/** Validate a scan_site_map artifact — accepts both full shape and incremental summary */
export const validateScanSiteMap = (data: unknown): Result<Record<string, unknown>> => {
  const d = data as Record<string, unknown>
  if (!d || typeof d !== 'object') return err('scan_site_map must be an object')
  // Full shape: { pages: [{ url }] }
  if (isArray(d.pages) && d.pages.length > 0) {
    for (const p of d.pages as Record<string, unknown>[]) {
      if (!isNonEmpty(p.url)) return err('each page must have a url')
    }
    return ok(d)
  }
  // Incremental summary shape: { pagesFound: N, pagesFetched: N }
  if (typeof d.pagesFound === 'number' || typeof d.pagesFetched === 'number') {
    return ok(d)
  }
  return err('scan_site_map must have pages array or pagesFound/pagesFetched summary')
}

/** Validate a scan_visual_dna artifact */
export const validateScanVisualDna = (data: unknown): Result<Record<string, unknown>> => {
  const d = data as Record<string, unknown>
  if (!d || typeof d !== 'object') return err('scan_visual_dna must be an object')
  const colorSystem = d.colorSystem as Record<string, unknown> | undefined
  if (colorSystem && isArray(colorSystem.palette) && colorSystem.palette.length === 0)
    return err('colorSystem.palette must not be empty if present')
  return ok(d)
}

/** Validate a scan_full_result artifact */
export const validateScanFullResult = (data: unknown): Result<Record<string, unknown>> => {
  const d = data as Record<string, unknown>
  if (!d || typeof d !== 'object') return err('scan_full_result must be an object')
  if (!isNonEmpty(d.url)) return err('url is required')
  return ok(d)
}

/** Validate a scan_generation_ctx artifact */
export const validateScanGenerationCtx = (data: unknown): Result<Record<string, unknown>> => {
  const d = data as Record<string, unknown>
  if (!d || typeof d !== 'object') return err('scan_generation_ctx must be an object')
  if (!isNonEmpty(d.siteName)) return err('siteName is required')
  const designDna = d.designDna as Record<string, unknown> | undefined
  if (!designDna || typeof designDna !== 'object') return err('designDna is required')
  if (!isNonEmpty(designDna.primaryColor)) return err('designDna.primaryColor is required')
  if (!isArray(d.sectionPlan) || d.sectionPlan.length === 0)
    return err('sectionPlan must be a non-empty array')
  return ok(d)
}

// ─── Migration Artifact Validators (self_owned only) ────────────────

/** Validate extracted field provenance */
const hasProvenance = (field: unknown): boolean => {
  if (!field || typeof field !== 'object') return false
  const f = field as Record<string, unknown>
  return 'value' in f && 'sourceType' in f && typeof f.confidence === 'number'
}

/** Validate a source_content_model artifact */
export const validateSourceContentModel = (data: unknown): Result<Record<string, unknown>> => {
  const d = data as Record<string, unknown>
  if (!d || typeof d !== 'object') return err('source_content_model must be an object')
  // Must have at least one content section with provenance
  const sections = ['hero', 'navigation', 'footer', 'faqs', 'contact', 'about', 'policies']
  let hasContent = false
  for (const key of sections) {
    if (d[key] !== undefined && d[key] !== null) {
      hasContent = true
      break
    }
  }
  if (!hasContent && !isArray(d.pages)) return err('source_content_model must have at least one content section or pages array')
  return ok(d)
}

/** Validate a content_catalog artifact */
export const validateContentCatalog = (data: unknown): Result<Record<string, unknown>> => {
  const d = data as Record<string, unknown>
  if (!d || typeof d !== 'object') return err('content_catalog must be an object')
  if (!isArray(d.products)) return err('products must be an array')
  for (const p of d.products as Record<string, unknown>[]) {
    if (!p.name || !hasProvenance(p.name)) return err('each product.name must have provenance (value, sourceType, confidence)')
  }
  return ok(d)
}

/** Validate a content_migration_manifest artifact */
export const validateContentMigrationManifest = (data: unknown): Result<Record<string, unknown>> => {
  const d = data as Record<string, unknown>
  if (!d || typeof d !== 'object') return err('content_migration_manifest must be an object')
  if (!isArray(d.mappings)) return err('mappings must be an array')
  for (const m of d.mappings as Record<string, unknown>[]) {
    if (!isNonEmpty(m.sourceField)) return err('each mapping must have a sourceField')
    if (!isNonEmpty(m.targetSlot)) return err('each mapping must have a targetSlot')
    if (!isNonEmpty(m.action)) return err('each mapping must have an action')
    if (typeof m.confidence !== 'number') return err('each mapping must have a numeric confidence')
  }
  return ok(d)
}

// ─── Dispatch by artifact type ───────────────────────────────────────

/** Validate any artifact by its type key */
export const validateArtifact = (type: string, data: unknown): Result<unknown> => {
  switch (type) {
    case 'project_brief': return validateProjectBrief(data)
    case 'site_plan': return validateSitePlan(data)
    case 'page_blueprint': return validatePageBlueprint(data)
    case 'section_content': return validateSectionContent(data)
    case 'asset_manifest': return validateAssetManifest(data)
    case 'chatbot_context': return validateChatbotContext(data)
    case 'render_result': return validateRenderResult(data)
    // Scan artifacts
    case 'scan_site_map': return validateScanSiteMap(data)
    case 'scan_visual_dna': return validateScanVisualDna(data)
    case 'scan_full_result': return validateScanFullResult(data)
    case 'scan_generation_ctx': return validateScanGenerationCtx(data)
    // Migration artifacts
    case 'source_content_model': return validateSourceContentModel(data)
    case 'content_catalog': return validateContentCatalog(data)
    case 'content_migration_manifest': return validateContentMigrationManifest(data)
    default: return err(`Unknown artifact type: ${type}`)
  }
}
