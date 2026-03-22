import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import type { Campaign, CampaignStatus, CampaignType, CampaignStats } from '@ubuilder/types'

// TODO: Replace with Drizzle ORM query when DB connected
const campaignsStore = new Map<string, Campaign[]>()

/** Helper to get or initialize campaigns array for a site */
const getCampaigns = (siteId: string): Campaign[] => {
  if (!campaignsStore.has(siteId)) {
    campaignsStore.set(siteId, [])
  }
  return campaignsStore.get(siteId)!
}

/** Empty stats for a new campaign */
const emptyStats: CampaignStats = {
  sent: 0,
  delivered: 0,
  opened: 0,
  clicked: 0,
  bounced: 0,
  unsubscribed: 0,
}

// TODO: Replace with Drizzle ORM count query when DB connected
/** Calculate estimated audience size based on audience filters */
const calculateAudienceSize = (
  _siteId: string,
  audience: Record<string, unknown>
): number => {
  // Mock: estimate based on filter restrictiveness
  let base = 500
  if (audience.tags && Array.isArray(audience.tags) && audience.tags.length > 0) {
    base = Math.floor(base * 0.4)
  }
  if (audience.minOrderCount && typeof audience.minOrderCount === 'number') {
    base = Math.floor(base * 0.6)
  }
  if (audience.minTotalSpent && typeof audience.minTotalSpent === 'number') {
    base = Math.floor(base * 0.5)
  }
  if (audience.status && typeof audience.status === 'string') {
    base = Math.floor(base * 0.7)
  }
  return Math.max(base, 1)
}

/**
 * GET /api/crm/campaigns
 * List all campaigns for a site with optional status filter and pagination.
 *
 * Query params:
 *   siteId (required), status, page, limit
 */
export const GET = async (request: Request) => {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')

    if (!siteId) {
      return NextResponse.json(
        { ok: false, error: 'siteId is required' },
        { status: 400 }
      )
    }

    // TODO: Replace with Drizzle ORM query when DB connected
    let campaigns = [...getCampaigns(siteId)]

    // Filter by status
    const status = searchParams.get('status') as CampaignStatus | null
    if (status) {
      campaigns = campaigns.filter(c => c.status === status)
    }

    // Sort by createdAt descending
    campaigns.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const total = campaigns.length
    const totalPages = Math.ceil(total / limit)
    const paginated = campaigns.slice((page - 1) * limit, page * limit)

    return NextResponse.json({
      ok: true,
      data: paginated,
      pagination: { page, limit, total, totalPages },
    })
  } catch (err) {
    console.error('CRM Campaigns GET error:', err)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/crm/campaigns
 * Create a new campaign in draft status.
 *
 * Body: { siteId, name, subject, type, content?, audience? }
 * Returns the created campaign with estimated audience size.
 */
export const POST = async (request: Request) => {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const body = await request.json()
    const { siteId, name, subject, type } = body

    if (!siteId) {
      return NextResponse.json(
        { ok: false, error: 'siteId is required' },
        { status: 400 }
      )
    }

    if (!name || !subject) {
      return NextResponse.json(
        { ok: false, error: 'name and subject are required' },
        { status: 400 }
      )
    }

    const validTypes: CampaignType[] = ['email', 'sms', 'push']
    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        { ok: false, error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const audience = body.audience || {}
    const now = new Date()

    const campaign: Campaign = {
      id: `camp_${crypto.randomUUID()}`,
      siteId,
      name,
      subject,
      type: type || 'email',
      status: 'draft',
      content: body.content || '',
      audience,
      stats: { ...emptyStats },
      scheduledAt: null,
      sentAt: null,
      createdAt: now,
      updatedAt: now,
    }

    // TODO: Replace with Drizzle ORM insert when DB connected
    getCampaigns(siteId).push(campaign)

    const estimatedAudience = calculateAudienceSize(siteId, audience)

    return NextResponse.json(
      { ok: true, data: campaign, estimatedAudience },
      { status: 201 }
    )
  } catch (err) {
    console.error('CRM Campaigns POST error:', err)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/crm/campaigns
 * Update campaign content, audience, or schedule.
 *
 * Body: { siteId, campaignId, name?, subject?, content?, audience?, scheduledAt? }
 */
export const PUT = async (request: Request) => {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const body = await request.json()
    const { siteId, campaignId } = body

    if (!siteId || !campaignId) {
      return NextResponse.json(
        { ok: false, error: 'siteId and campaignId are required' },
        { status: 400 }
      )
    }

    // TODO: Replace with Drizzle ORM update when DB connected
    const campaigns = getCampaigns(siteId)
    const index = campaigns.findIndex(c => c.id === campaignId)

    if (index === -1) {
      return NextResponse.json(
        { ok: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    const campaign = campaigns[index]

    // Only allow editing draft or scheduled campaigns
    if (campaign.status === 'sending' || campaign.status === 'sent') {
      return NextResponse.json(
        { ok: false, error: 'Cannot edit a campaign that is sending or already sent' },
        { status: 400 }
      )
    }

    const updated: Campaign = {
      ...campaign,
      ...(body.name !== undefined && { name: body.name }),
      ...(body.subject !== undefined && { subject: body.subject }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.audience !== undefined && { audience: body.audience }),
      ...(body.scheduledAt !== undefined && { scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null }),
      updatedAt: new Date(),
    }

    campaigns[index] = updated

    const estimatedAudience = calculateAudienceSize(siteId, updated.audience)

    return NextResponse.json({ ok: true, data: updated, estimatedAudience })
  } catch (err) {
    console.error('CRM Campaigns PUT error:', err)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/crm/campaigns
 * Change campaign status through the lifecycle: draft -> scheduled -> sending -> sent.
 * Also supports pausing: sending -> paused, paused -> sending.
 *
 * Body: { siteId, campaignId, status }
 */
export const PATCH = async (request: Request) => {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const body = await request.json()
    const { siteId, campaignId, status } = body

    if (!siteId || !campaignId || !status) {
      return NextResponse.json(
        { ok: false, error: 'siteId, campaignId, and status are required' },
        { status: 400 }
      )
    }

    const validStatuses: CampaignStatus[] = ['draft', 'scheduled', 'sending', 'sent', 'paused']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { ok: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // TODO: Replace with Drizzle ORM update when DB connected
    const campaigns = getCampaigns(siteId)
    const index = campaigns.findIndex(c => c.id === campaignId)

    if (index === -1) {
      return NextResponse.json(
        { ok: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    const campaign = campaigns[index]

    // Validate status transitions
    const validTransitions: Record<CampaignStatus, CampaignStatus[]> = {
      draft: ['scheduled', 'sending'],
      scheduled: ['sending', 'draft'],
      sending: ['sent', 'paused'],
      paused: ['sending', 'draft'],
      sent: [], // Terminal state
    }

    if (!validTransitions[campaign.status].includes(status)) {
      return NextResponse.json(
        {
          ok: false,
          error: `Cannot transition from '${campaign.status}' to '${status}'. Valid transitions: ${validTransitions[campaign.status].join(', ') || 'none'}`,
        },
        { status: 400 }
      )
    }

    const now = new Date()
    const updated: Campaign = {
      ...campaign,
      status,
      ...(status === 'sending' && !campaign.sentAt && { sentAt: now }),
      ...(status === 'scheduled' && campaign.scheduledAt === null && { scheduledAt: now }),
      updatedAt: now,
    }

    campaigns[index] = updated

    return NextResponse.json({ ok: true, data: updated })
  } catch (err) {
    console.error('CRM Campaigns PATCH error:', err)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/crm/campaigns
 * Delete a campaign. Only draft campaigns can be deleted.
 *
 * Body: { siteId, campaignId }
 */
export const DELETE = async (request: Request) => {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const body = await request.json()
    const { siteId, campaignId } = body

    if (!siteId || !campaignId) {
      return NextResponse.json(
        { ok: false, error: 'siteId and campaignId are required' },
        { status: 400 }
      )
    }

    // TODO: Replace with Drizzle ORM delete when DB connected
    const campaigns = getCampaigns(siteId)
    const index = campaigns.findIndex(c => c.id === campaignId)

    if (index === -1) {
      return NextResponse.json(
        { ok: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaigns[index].status !== 'draft') {
      return NextResponse.json(
        { ok: false, error: 'Only draft campaigns can be deleted' },
        { status: 400 }
      )
    }

    campaigns.splice(index, 1)

    return NextResponse.json({ ok: true, data: { deleted: true, campaignId } })
  } catch (err) {
    console.error('CRM Campaigns DELETE error:', err)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
