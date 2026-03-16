/**
 * POST /api/scan/v2
 *
 * Quick scan API — single page, no AI, returns JSON.
 * Runs phases 1 (homepage only), 2, 3 (programmatic), 6.
 * Designed for fast preview in under 30 seconds.
 *
 * @module api/scan/v2
 */

import { NextResponse } from 'next/server'

// Vercel: quick scan should finish within 30s
export const maxDuration = 30

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'URL is required' },
        { status: 400 },
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
      return NextResponse.json(
        { ok: false, error: 'Invalid URL format' },
        { status: 400 },
      )
    }

    // Dynamic import to avoid bundling scanner in unrelated routes
    const { runScanPipeline } = await import('@/lib/scanner-v2')
    const result = await runScanPipeline(normalizedUrl, { skipAi: true, maxPages: 1, timeout: 25_000 })

    return NextResponse.json({ ok: true, data: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Quick scan error:', message)
    return NextResponse.json(
      { ok: false, error: `Scan failed: ${message}` },
      { status: 500 },
    )
  }
}
