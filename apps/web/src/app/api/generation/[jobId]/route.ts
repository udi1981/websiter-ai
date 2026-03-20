import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-middleware'
import { getJobStatus } from '@/lib/generation-tracker'

/** GET /api/generation/[jobId] — Poll generation job status */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params

  if (!jobId) {
    return NextResponse.json({ ok: false, error: 'jobId is required' }, { status: 400 })
  }

  // Auth check
  const authUser = await getAuthUser(req)
  if (!authUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const status = await getJobStatus(jobId)

    if (!status) {
      return NextResponse.json({ ok: false, error: 'Job not found' }, { status: 404 })
    }

    // Verify ownership
    if (status.job.userId !== authUser.userId) {
      return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ ok: true, data: status })
  } catch (err) {
    console.error('[generation] GET error:', err)
    return NextResponse.json({ ok: false, error: 'Failed to fetch job status' }, { status: 500 })
  }
}
