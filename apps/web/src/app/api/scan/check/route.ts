/**
 * GET /api/scan/check?url=...
 * Check if a recent completed scan exists for the given URL.
 * Returns the scanJobId if found, so the frontend can skip re-scanning.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-middleware'

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req)
  const userId = authUser?.userId || req.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const url = req.nextUrl.searchParams.get('url')
  if (!url) {
    return NextResponse.json({ ok: false, error: 'url parameter required' }, { status: 400 })
  }

  // Normalize URL for comparison
  let normalizedUrl = url.trim()
  if (!normalizedUrl.startsWith('http')) normalizedUrl = `https://${normalizedUrl}`
  // Extract domain for flexible matching
  let domain: string
  try {
    domain = new URL(normalizedUrl).hostname
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid URL' }, { status: 400 })
  }

  try {
    const { db, sql } = await import('@ubuilder/db')
    // Find most recent completed scan for this domain (within last 7 days)
    const result = await db.execute(sql`
      SELECT id, source_url, created_at
      FROM generation_jobs
      WHERE job_type = 'scan'
        AND status = 'completed'
        AND source_url LIKE ${'%' + domain + '%'}
        AND created_at > NOW() - INTERVAL '7 days'
      ORDER BY created_at DESC
      LIMIT 1
    `)

    const rows = result.rows || result
    if (Array.isArray(rows) && rows.length > 0) {
      const row = rows[0] as { id: string; source_url: string; created_at: string }
      return NextResponse.json({
        ok: true,
        scanJobId: row.id,
        sourceUrl: row.source_url,
        scannedAt: row.created_at,
      })
    }

    return NextResponse.json({ ok: true, scanJobId: null })
  } catch (err) {
    console.error('[scan/check] Error:', err)
    return NextResponse.json({ ok: false, error: 'Check failed' }, { status: 500 })
  }
}
