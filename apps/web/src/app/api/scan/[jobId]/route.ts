/**
 * GET /api/scan/[jobId]
 * Poll scan job status — reuses getJobStatus from generation-tracker.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-middleware'
import { getJobStatus } from '@/lib/generation-tracker'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params

  if (!jobId) {
    return NextResponse.json({ ok: false, error: 'jobId is required' }, { status: 400 })
  }

  const authUser = await getAuthUser(req)
  if (!authUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const status = await getJobStatus(jobId)

    if (!status) {
      return NextResponse.json({ ok: false, error: 'Scan job not found' }, { status: 404 })
    }

    // Verify ownership
    if (status.job.userId !== authUser.userId) {
      return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
    }

    // Verify this is a scan job
    const jobType = (status.job as Record<string, unknown>).jobType
    if (jobType !== 'scan') {
      return NextResponse.json({ ok: false, error: 'Not a scan job' }, { status: 400 })
    }

    return NextResponse.json({ ok: true, data: status })
  } catch (err) {
    console.error('[scan] GET error:', err)
    return NextResponse.json({ ok: false, error: 'Failed to fetch scan status' }, { status: 500 })
  }
}
