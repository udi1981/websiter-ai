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

    // V1.3.1: Include scan artifacts when scan_job_id is set
    const scanJobId = (status.job as Record<string, unknown>).scanJobId as string | null
    let scanArtifacts: typeof status.artifacts = []
    if (scanJobId) {
      try {
        const scanStatus = await getJobStatus(scanJobId)
        if (scanStatus) {
          scanArtifacts = scanStatus.artifacts
        }
      } catch { /* scan job may not exist */ }
    }

    return NextResponse.json({
      ok: true,
      data: {
        ...status,
        // Canonical: all artifacts (generation + scan) in one array
        artifacts: [...status.artifacts, ...scanArtifacts],
        // Backward compat: separate keys for clarity
        generationArtifacts: status.artifacts,
        scanArtifacts,
      },
    })
  } catch (err) {
    console.error('[generation] GET error:', err)
    return NextResponse.json({ ok: false, error: 'Failed to fetch job status' }, { status: 500 })
  }
}
