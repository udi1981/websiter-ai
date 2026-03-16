/**
 * POST /api/scan/v2/deep
 *
 * Deep scan API — full 7-phase scan with SSE streaming progress.
 * Streams phase updates, partial results, and the final ScanResult.
 *
 * SSE Events:
 *   event: phase    — Phase status changes (running, done, error, skipped)
 *   event: progress — Numeric percent + message
 *   event: partial  — Partial data from a completed phase
 *   event: result   — Final complete ScanResult
 *   event: error    — Fatal error (scan cannot continue)
 *
 * @module api/scan/v2/deep
 */

// Vercel: deep scan can take up to 5 minutes
export const maxDuration = 300

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url, options } = body as {
      url?: string
      options?: { maxPages?: number; skipAi?: boolean }
    }

    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ ok: false, error: 'URL is required' }),
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

    const stream = new ReadableStream({
      async start(controller) {
        /** Send an SSE event */
        const send = (event: string, data: Record<string, unknown>) => {
          try {
            controller.enqueue(
              encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
            )
          } catch {
            // Stream may have been closed by the client
          }
        }

        const phaseStartTimes = new Map<string, number>()

        try {
          const { runScanPipeline } = await import('@/lib/scanner-v2')
          const deepScan = runScanPipeline

          const result = await deepScan(normalizedUrl, {
            maxPages: options?.maxPages ?? 30,
            skipAi: options?.skipAi ?? false,
            timeout: 290_000, // Leave 10s buffer before Vercel maxDuration
            onProgress: (progress) => {
              // Track phase timing
              if (progress.status === 'running') {
                phaseStartTimes.set(progress.phase, Date.now())
                send('phase', {
                  phase: progress.phase,
                  status: 'running',
                  description: progress.message,
                })
              }

              // Always send progress percent
              send('progress', {
                percent: progress.percent,
                message: progress.message,
              })

              // Send partial result data on phase completion
              if (progress.status === 'done' && progress.data) {
                const startTime = phaseStartTimes.get(progress.phase) ?? Date.now()
                const duration = Date.now() - startTime
                send('partial', {
                  phase: progress.phase,
                  result: progress.data,
                })
                send('phase', {
                  phase: progress.phase,
                  status: 'done',
                  duration,
                })
              }

              // Report phase errors
              if (progress.status === 'error') {
                send('phase', {
                  phase: progress.phase,
                  status: 'error',
                  message: progress.message,
                })
              }

              // Report skipped phases
              if (progress.status === 'skipped') {
                send('phase', {
                  phase: progress.phase,
                  status: 'skipped',
                  message: progress.message,
                })
              }
            },
          })

          // Send final result
          send('progress', { percent: 100, message: 'Deep scan complete!' })
          send('result', { ok: true, data: result })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          send('error', {
            error: `Deep scan failed: ${message}`,
            phase: 'pipeline',
          })
        }

        controller.close()
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
