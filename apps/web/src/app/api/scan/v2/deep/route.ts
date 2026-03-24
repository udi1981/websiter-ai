/**
 * POST /api/scan/v2/deep
 *
 * Deep scan API — full 7-phase scan with SSE streaming progress.
 * Now persists scan jobs, steps, and artifacts to DB via scan-tracker.
 *
 * SSE Events:
 *   event: phase    — Phase status changes (running, done, error, skipped)
 *   event: progress — Numeric percent + message
 *   event: partial  — Partial data from a completed phase
 *   event: result   — Final complete ScanResult + scanJobId
 *   event: error    — Fatal error (scan cannot continue)
 *
 * Request body:
 *   url (required), sourceOwnership ('self_owned' | 'third_party'),
 *   scanMode ('copy' | 'inspiration'), options ({ maxPages?, skipAi? })
 */

import { getAuthUser } from '@/lib/auth-middleware'
import type { SourceOwnership, ScanModeV1 } from '@ubuilder/types'

export const maxDuration = 300

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      url,
      sourceOwnership = 'third_party',
      scanMode = 'inspiration',
      options,
    } = body as {
      url?: string
      sourceOwnership?: SourceOwnership
      scanMode?: ScanModeV1 | 'recreation'
      options?: { maxPages?: number; skipAi?: boolean }
    }

    // Auth — require authenticated user (dev bypass via DEV_ONLY_AUTH_BYPASS + localhost)
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      )
    }
    const userId = authUser.userId

    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ ok: false, error: 'URL is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // V1: reject recreation mode
    if (scanMode === 'recreation') {
      return new Response(
        JSON.stringify({ ok: false, error: 'recreation mode is not available yet (V2)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Validate URL format
    let normalizedUrl = url.trim()
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`
    }

    try {
      new URL(normalizedUrl)
    } catch {
      return new Response(
        JSON.stringify({ ok: false, error: 'Invalid URL format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )
    }

    const encoder = new TextEncoder()
    let streamClosed = false

    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: Record<string, unknown>) => {
          if (streamClosed) return
          try {
            controller.enqueue(
              encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
            )
          } catch {
            streamClosed = true
          }
        }

        let scanJobId: string | undefined

        try {
          // Create persisted scan job
          const { createScanJob, trackScanPhase, completeScanJob, extractAndPersistContent, failScanJob } =
            await import('@/lib/scan-tracker')

          scanJobId = await createScanJob({
            userId,
            sourceUrl: normalizedUrl,
            scanMode: scanMode as ScanModeV1,
            sourceOwnership: sourceOwnership as SourceOwnership,
          })

          send('phase', { phase: 'init', status: 'done', scanJobId })

          const { runScanPipeline } = await import('@/lib/scanner-v2')

          // V1 crawl-scope discipline
          // Dev: 8 pages prevents OOM. Production (Vercel): can increase via options.maxPages
          const maxPages = Math.min(options?.maxPages ?? 8, options?.maxPages ?? 8)

          const result = await runScanPipeline(normalizedUrl, {
            maxPages,
            skipAi: options?.skipAi ?? false,
            timeout: 290_000,
            onProgress: async (progress) => {
              // Track phase in DB
              try {
                await trackScanPhase(
                  scanJobId!,
                  progress.phase,
                  progress.status,
                  progress.data as Record<string, unknown> | undefined,
                )
              } catch (dbErr) {
                console.error('[deep-scan] DB tracking error (non-blocking):', dbErr)
              }

              // Stream SSE events
              if (progress.status === 'running') {
                send('phase', { phase: progress.phase, status: 'running', description: progress.message })
              }
              send('progress', { percent: progress.percent, message: progress.message })

              if (progress.status === 'done' && progress.data) {
                send('partial', { phase: progress.phase, result: progress.data })
                send('phase', { phase: progress.phase, status: 'done' })
              }
              if (progress.status === 'error') {
                send('phase', { phase: progress.phase, status: 'error', message: progress.message })
              }
              if (progress.status === 'skipped') {
                send('phase', { phase: progress.phase, status: 'skipped', message: progress.message })
              }
            },
          })

          // Run content extraction for self_owned sources
          if (sourceOwnership === 'self_owned') {
            try {
              await extractAndPersistContent(scanJobId, result as Record<string, unknown>)
              send('phase', { phase: 'content-extraction', status: 'done' })
            } catch (extErr) {
              console.error('[deep-scan] Content extraction error (non-blocking):', extErr)
              send('phase', { phase: 'content-extraction', status: 'error', message: String(extErr) })
            }
          }

          // Transform scan result to generation context
          const { transformScanToGenerationContext } = await import('@/lib/scanner-v2')
          const generationCtx = transformScanToGenerationContext(result)

          // Complete scan job with final artifacts
          await completeScanJob(scanJobId, result as Record<string, unknown>, generationCtx)

          send('progress', { percent: 100, message: 'Deep scan complete!' })
          send('result', { ok: true, data: result, scanJobId })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'

          if (scanJobId) {
            try {
              const { failScanJob } = await import('@/lib/scan-tracker')
              await failScanJob(scanJobId, message)
            } catch { /* best effort */ }
          }

          send('error', { error: `Deep scan failed: ${message}`, phase: 'pipeline' })
        }

        if (!streamClosed) {
          try { controller.close() } catch { /* already closed */ }
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Content-Type-Options': 'nosniff',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ ok: false, error: `Stream setup failed: ${message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
}
