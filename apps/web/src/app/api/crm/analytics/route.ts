import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'

/**
 * GET /api/crm/analytics
 * Analytics is not yet implemented. Returns honest "coming soon" status.
 */
export const GET = async (request: Request) => {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    return NextResponse.json({
      ok: true,
      comingSoon: true,
      message: 'Analytics is not yet implemented. Real analytics will be available in a future release.',
      data: null,
    })
  } catch (err) {
    console.error('CRM Analytics GET error:', err)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
