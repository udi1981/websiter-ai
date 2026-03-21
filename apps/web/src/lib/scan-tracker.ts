/**
 * Scan Tracker — wraps generation-tracker for scan job persistence.
 *
 * Maps scanner pipeline phase callbacks to DB-backed job/step/artifact tracking.
 * Handles content extraction + catalog extraction + migration mapping for self_owned sources.
 */

import * as tracker from '@/lib/generation-tracker'
import type { GenerationStepName, ArtifactType, SourceOwnership, ScanModeV1 } from '@ubuilder/types'

/** Scanner progress status — matches ScanProgress['status'] from scanner pipeline */
type ScanPhaseStatus = 'running' | 'done' | 'error' | 'skipped'

/** Phase name from scanner → step name for DB */
const PHASE_TO_STEP: Record<string, GenerationStepName> = {
  'discovery': 'scan_discovery',
  'visual-dna': 'scan_visual_dna',
  'components': 'scan_components',
  'content': 'scan_content',
  'brand-intelligence': 'scan_brand',
  'technical': 'scan_technical',
  'strategic-insights': 'scan_strategic',
}

/** Phase name → artifact type for incremental persistence */
const PHASE_TO_ARTIFACT: Record<string, ArtifactType> = {
  'discovery': 'scan_site_map',
  'visual-dna': 'scan_visual_dna',
}

/** Create a new scan job */
export const createScanJob = async (params: {
  userId: string
  sourceUrl: string
  scanMode: ScanModeV1
  sourceOwnership: SourceOwnership
  locale?: string
}): Promise<string> => {
  const jobId = await tracker.createJob({
    userId: params.userId,
    description: `Scan: ${params.sourceUrl}`,
    locale: params.locale || 'en',
  })

  // Set scanner-specific fields via raw update
  const { db, sql } = await import('@ubuilder/db')
  await db.execute(sql`
    UPDATE generation_jobs
    SET job_type = 'scan',
        source_url = ${params.sourceUrl},
        scan_mode = ${params.scanMode},
        source_ownership = ${params.sourceOwnership}
    WHERE id = ${jobId}
  `)

  await tracker.startJob(jobId)
  return jobId
}

/** Track a scan phase start/completion/error */
export const trackScanPhase = async (
  jobId: string,
  phaseName: string,
  status: ScanPhaseStatus,
  data?: Record<string, unknown>,
): Promise<void> => {
  const stepName = PHASE_TO_STEP[phaseName]
  if (!stepName) return // unknown phase, skip

  if (status === 'running') {
    const stepId = await tracker.startStep(jobId, stepName, `@scanner/${phaseName}`)
    // Store stepId for later completion — use the job's currentStep
    await tracker.setCurrentStep(jobId, stepName)
  }

  if (status === 'done') {
    // Find the step and complete it
    const jobStatus = await tracker.getJobStatus(jobId)
    if (!jobStatus) return
    const step = jobStatus.steps.find(s => s.stepName === stepName && s.status === 'running')
    if (step) {
      await tracker.completeStep(step.id)
    }

    // Save incremental artifact if applicable
    const artifactType = PHASE_TO_ARTIFACT[phaseName]
    if (artifactType && data) {
      await tracker.saveArtifact({
        jobId,
        stepId: step?.id,
        artifactType,
        data,
      })
    }
  }

  if (status === 'error') {
    const jobStatus = await tracker.getJobStatus(jobId)
    if (!jobStatus) return
    const step = jobStatus.steps.find(s => s.stepName === stepName && s.status === 'running')
    if (step) {
      await tracker.failStep(step.id, `Phase ${phaseName} failed`)
    }
  }

  if (status === 'skipped') {
    // Create and immediately skip the step
    const stepId = await tracker.startStep(jobId, stepName, `@scanner/${phaseName}`)
    await tracker.skipStep(stepId)
  }
}

/** Complete the scan job — save final result + generation context */
export const completeScanJob = async (
  jobId: string,
  scanResult: Record<string, unknown>,
  generationCtx: Record<string, unknown>,
): Promise<void> => {
  // Save full result artifact
  await tracker.saveArtifact({
    jobId,
    artifactType: 'scan_full_result',
    data: scanResult,
  })

  // Save the transform bridge output
  const transformStepId = await tracker.startStep(jobId, 'scan_transform', '@scanner/transform')
  await tracker.saveArtifact({
    jobId,
    stepId: transformStepId,
    artifactType: 'scan_generation_ctx',
    data: generationCtx,
  })
  await tracker.completeStep(transformStepId)

  await tracker.completeJob(jobId)
}

/** Run content extraction for self_owned sources */
export const extractAndPersistContent = async (
  jobId: string,
  scanResult: Record<string, unknown>,
): Promise<void> => {
  // Step: content extraction
  const extractStepId = await tracker.startStep(jobId, 'scan_content_extract', '@scanner/content-extract')

  try {
    const contentModel = extractSourceContentModel(scanResult)
    await tracker.saveArtifact({
      jobId,
      stepId: extractStepId,
      artifactType: 'source_content_model',
      data: contentModel,
    })
    await tracker.completeStep(extractStepId)
  } catch (err) {
    await tracker.failStep(extractStepId, `Content extraction failed: ${err}`)
  }

  // Step: catalog extraction
  const catalogStepId = await tracker.startStep(jobId, 'scan_catalog_extract', '@scanner/catalog-extract')

  try {
    const catalog = extractContentCatalog(scanResult)
    await tracker.saveArtifact({
      jobId,
      stepId: catalogStepId,
      artifactType: 'content_catalog',
      data: catalog,
    })
    await tracker.completeStep(catalogStepId)
  } catch (err) {
    await tracker.failStep(catalogStepId, `Catalog extraction failed: ${err}`)
  }

  // Step: migration mapping
  const migrationStepId = await tracker.startStep(jobId, 'scan_migration_map', '@scanner/migration-map')

  try {
    const manifest = buildMigrationManifest(scanResult)
    await tracker.saveArtifact({
      jobId,
      stepId: migrationStepId,
      artifactType: 'content_migration_manifest',
      data: manifest,
    })
    await tracker.completeStep(migrationStepId)
  } catch (err) {
    await tracker.failStep(migrationStepId, `Migration mapping failed: ${err}`)
  }
}

/** Fail the scan job */
export const failScanJob = async (jobId: string, reason: string): Promise<void> => {
  await tracker.failJob(jobId, reason)
}

// ─── Content Extraction Helpers ──────────────────────────────────────

type ExtractedFieldData = {
  value: unknown
  sourceType: string
  sourceLocator?: string
  confidence: number
  normalizationNotes?: string
}

const field = <T>(value: T, sourceType: string, confidence: number, locator?: string): ExtractedFieldData => ({
  value,
  sourceType,
  sourceLocator: locator,
  confidence,
})

/** Extract non-catalog site content from scan result */
const extractSourceContentModel = (scanResult: Record<string, unknown>): Record<string, unknown> => {
  const content = scanResult.contentArchitecture as Record<string, unknown> | undefined
  const siteMap = scanResult.siteMap as Record<string, unknown> | undefined

  const pages = ((siteMap as Record<string, unknown>)?.pages as Record<string, unknown>[]) || []

  const model: Record<string, unknown> = {
    pages: pages.map(p => ({
      url: field(p.url, 'dom', 90, 'crawl'),
      title: field(p.title || p.pageTitle, 'dom', 85, 'title'),
      pageType: field(p.pageType || 'page', 'visual_inference', 60),
    })),
  }

  // Extract hero content if available
  if (content) {
    const headings = content.headings as Record<string, unknown>[] | undefined
    if (headings && headings.length > 0) {
      model.hero = {
        headline: field(headings[0]?.text || '', 'dom', 80, 'h1'),
      }
    }

    const ctas = content.ctas as Record<string, unknown>[] | undefined
    if (ctas && ctas.length > 0) {
      model.primaryCta = field(ctas[0]?.text || '', 'dom', 75, 'a.cta, button.cta')
    }
  }

  return model
}

/** Extract product catalog from scan result */
const extractContentCatalog = (scanResult: Record<string, unknown>): Record<string, unknown> => {
  // Look for JSON-LD Product data first (highest confidence)
  const technical = scanResult.technicalDNA as Record<string, unknown> | undefined
  const structuredData = (technical?.structuredData || technical?.jsonLd) as Record<string, unknown>[] | undefined

  const products: Record<string, unknown>[] = []

  if (structuredData) {
    for (const sd of structuredData) {
      if (sd['@type'] === 'Product' || sd.type === 'Product') {
        const offers = sd.offers as Record<string, unknown> | undefined
        products.push({
          name: field(sd.name, 'json_ld', 95, 'Product.name'),
          price: field(offers?.price ?? null, 'json_ld', 95, 'Product.offers.price'),
          currency: field(offers?.priceCurrency ?? null, 'json_ld', 95, 'Product.offers.priceCurrency'),
          description: field(sd.description ?? '', 'json_ld', 85, 'Product.description'),
          image: field(sd.image ?? null, 'json_ld', 90, 'Product.image'),
        })
      }
    }
  }

  return {
    products,
    extractedFrom: products.length > 0 ? 'json_ld' : 'none',
    productCount: products.length,
  }
}

/** Build migration manifest mapping source content to builder sections */
const buildMigrationManifest = (scanResult: Record<string, unknown>): Record<string, unknown> => {
  const content = scanResult.contentArchitecture as Record<string, unknown> | undefined
  const mappings: Record<string, unknown>[] = []
  const excluded: Record<string, unknown>[] = []
  const flagged: Record<string, unknown>[] = []

  // Map detected sections to builder section types
  const sections = (content?.sections || content?.detectedSections) as Record<string, unknown>[] | undefined
  if (sections) {
    for (const s of sections) {
      const type = (s.type || s.sectionType) as string
      const confidence = (s.confidence as number) || 50

      if (confidence >= 70) {
        mappings.push({
          sourceField: `section.${type}`,
          targetSlot: `section_content.${type}`,
          action: 'preserve',
          confidence,
          notes: `High confidence extraction from ${s.sourceType || 'dom'}`,
        })
      } else if (confidence >= 40) {
        flagged.push({
          field: `section.${type}`,
          reason: `Low confidence (${confidence}%) — may need manual review`,
        })
      } else {
        excluded.push({
          field: `section.${type}`,
          reason: `Very low confidence (${confidence}%) — excluded from migration`,
        })
      }
    }
  }

  // Always exclude UI chrome
  excluded.push(
    { field: 'cookie_banner', reason: 'Not content — UI chrome' },
    { field: 'popup_modals', reason: 'Not content — UI chrome' },
  )

  return { mappings, excluded, flagged }
}
