/**
 * Scanner V2 — Public API
 *
 * Entry point for the website DNA scanner. Exposes quick and deep scan
 * functions, plus re-exports of key types and the transform bridge.
 *
 * @module scanner
 */

import type { ScanResult } from '@ubuilder/types'
import { runScanPipeline } from './pipeline'
import type { ScanProgress, ScanPipelineOptions } from './pipeline'

// ── Re-exports ──────────────────────────────────────────────────────────────

export type { ScanProgress, ScanPipelineOptions } from './pipeline'
export { runScanPipeline } from './pipeline'
export { transformScanToGenerationContext } from './transforms/scan-to-design-dna'
export type { ScanBasedGenerationContext } from './transforms/scan-to-design-dna'

// ── Quick Scan ──────────────────────────────────────────────────────────────

/**
 * Quick single-page scan with no AI analysis.
 * Runs phases 1 (homepage only), 2, 3 (programmatic), and 6.
 * Completes in under 30 seconds.
 *
 * @param url - The website URL to scan
 * @returns Partial ScanResult with design, components, and technical data
 */
export const quickScan = async (url: string): Promise<Partial<ScanResult>> => {
  const result = await runScanPipeline(url, {
    maxPages: 1,
    skipAi: true,
    timeout: 30_000,
  })

  return result
}

/**
 * Full deep scan with all 7 phases including AI analysis.
 * Typically takes 1-5 minutes depending on site size and AI response times.
 *
 * @param url - The website URL to scan
 * @param options - Pipeline configuration (maxPages, skipAi, timeout, onProgress)
 * @returns Complete ScanResult with all phases
 */
export const deepScan = async (
  url: string,
  options?: ScanPipelineOptions,
): Promise<ScanResult> => {
  return runScanPipeline(url, {
    maxPages: 30,
    timeout: 300_000,
    ...options,
  })
}
