/**
 * Scanner V2 — wrapper for the packages/ai scanner pipeline.
 * Re-exports the pipeline functions for use in API routes.
 *
 * @module lib/scanner-v2
 */

export { runScanPipeline } from '../../../../packages/ai/src/scanner/pipeline'
export type { ScanProgress, ScanPipelineOptions } from '../../../../packages/ai/src/scanner/pipeline'
export { transformScanToGenerationContext } from '../../../../packages/ai/src/scanner/transforms/scan-to-design-dna'
export type { ScanBasedGenerationContext } from '../../../../packages/ai/src/scanner/transforms/scan-to-design-dna'
