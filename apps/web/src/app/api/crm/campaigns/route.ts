import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { prefixedId } from '@ubuilder/utils'

/**
 * CRM Campaigns — persisted to PostgreSQL via raw SQL.
 * Uses the real DB `campaigns` table which has different column names
 * than the Drizzle schema (same mismatch pattern as leads).
 * DB columns: id, tenant_id, title, subject, content_html, channel, status, etc.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
})

/** Find or create tenant for siteId (same pattern as leads) */
const getOrCreateTenantId = async (siteId: string): Promise<string> => {
  const existing = await pool.query('SELECT id FROM tenants LIMIT 1')
  if (existing.rows.length > 0) return existing.rows[0].id
  const tenantId = prefixedId('ten')
  await pool.query(
    'INSERT INTO tenants (id, name, created_at) VALUES ($1, $2, NOW()) ON CONFLICT DO NOTHING',
    [tenantId, 'Default Tenant'],
  )
  return tenantId
}

/**
 * GET /api/crm/campaigns?siteId=xxx
 */
export const GET = async (request: Request) => {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')
    if (!siteId) {
      return NextResponse.json({ ok: false, error: 'siteId is required' }, { status: 400 })
    }

    const status = searchParams.get('status')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const offset = (page - 1) * limit

    let query = 'SELECT * FROM campaigns WHERE tenant_id = (SELECT tenant_id FROM leads WHERE site_id = $1 LIMIT 1) OR tenant_id = $1'
    const params: unknown[] = [siteId]
    let paramIdx = 2

    if (status) {
      query += ` AND status = $${paramIdx}`
      params.push(status)
      paramIdx++
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)::int as count')
    query += ` ORDER BY created_at DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`
    params.push(limit, offset)

    const [dataResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, paramIdx - 1)),
    ])

    // Map DB columns to API shape
    const campaigns = dataResult.rows.map((r: Record<string, unknown>) => ({
      id: r.id,
      siteId,
      name: r.title,
      subject: r.subject,
      type: r.channel || 'email',
      status: r.status || 'draft',
      content: r.content_html || '',
      audience: r.recipient_filter || {},
      stats: {
        sent: r.sent_count || 0,
        delivered: 0,
        opened: r.open_count || 0,
        clicked: r.click_count || 0,
        bounced: 0,
        unsubscribed: 0,
      },
      scheduledAt: r.scheduled_at,
      sentAt: r.sent_at,
      createdAt: r.created_at,
      updatedAt: r.created_at,
    }))

    return NextResponse.json({
      ok: true,
      data: campaigns,
      pagination: {
        page,
        limit,
        total: countResult.rows[0]?.count || 0,
        totalPages: Math.ceil((countResult.rows[0]?.count || 0) / limit),
      },
    })
  } catch (err) {
    console.error('CRM Campaigns GET error:', err)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/crm/campaigns
 */
export const POST = async (request: Request) => {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const body = await request.json()
    const { siteId, name, subject, type, content, audience } = body

    if (!siteId) return NextResponse.json({ ok: false, error: 'siteId is required' }, { status: 400 })
    if (!name || !subject) return NextResponse.json({ ok: false, error: 'name and subject are required' }, { status: 400 })

    const tenantId = await getOrCreateTenantId(siteId)
    const id = prefixedId('camp')

    await pool.query(
      `INSERT INTO campaigns (id, tenant_id, title, subject, content_html, channel, status, recipient_filter, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'draft', $7, NOW())`,
      [id, tenantId, name, subject, content || '', type || 'email', audience ? JSON.stringify(audience) : '{}'],
    )

    return NextResponse.json({
      ok: true,
      data: { id, siteId, name, subject, type: type || 'email', status: 'draft', content: content || '', audience: audience || {}, stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0 }, scheduledAt: null, sentAt: null, createdAt: new Date(), updatedAt: new Date() },
    }, { status: 201 })
  } catch (err) {
    console.error('CRM Campaigns POST error:', err)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/crm/campaigns — update content/schedule
 */
export const PUT = async (request: Request) => {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const body = await request.json()
    const { siteId, campaignId } = body
    if (!siteId || !campaignId) return NextResponse.json({ ok: false, error: 'siteId and campaignId required' }, { status: 400 })

    const sets: string[] = []
    const params: unknown[] = []
    let idx = 1

    if (body.name !== undefined) { sets.push(`title = $${idx}`); params.push(body.name); idx++ }
    if (body.subject !== undefined) { sets.push(`subject = $${idx}`); params.push(body.subject); idx++ }
    if (body.content !== undefined) { sets.push(`content_html = $${idx}`); params.push(body.content); idx++ }
    if (body.audience !== undefined) { sets.push(`recipient_filter = $${idx}`); params.push(JSON.stringify(body.audience)); idx++ }
    if (body.scheduledAt !== undefined) { sets.push(`scheduled_at = $${idx}`); params.push(body.scheduledAt); idx++ }

    if (sets.length === 0) return NextResponse.json({ ok: false, error: 'No fields to update' }, { status: 400 })

    params.push(campaignId)
    await pool.query(`UPDATE campaigns SET ${sets.join(', ')} WHERE id = $${idx}`, params)

    return NextResponse.json({ ok: true, data: { updated: true, campaignId } })
  } catch (err) {
    console.error('CRM Campaigns PUT error:', err)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/crm/campaigns — change status
 */
export const PATCH = async (request: Request) => {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const body = await request.json()
    const { siteId, campaignId, status } = body
    if (!siteId || !campaignId || !status) return NextResponse.json({ ok: false, error: 'siteId, campaignId, and status required' }, { status: 400 })

    const validStatuses = ['draft', 'scheduled', 'sending', 'sent', 'paused']
    if (!validStatuses.includes(status)) return NextResponse.json({ ok: false, error: 'Invalid status' }, { status: 400 })

    const extra = status === 'sending' ? ', sent_at = NOW()' : ''
    await pool.query(`UPDATE campaigns SET status = $1${extra} WHERE id = $2`, [status, campaignId])

    return NextResponse.json({ ok: true, data: { updated: true, campaignId, status } })
  } catch (err) {
    console.error('CRM Campaigns PATCH error:', err)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/crm/campaigns — only draft campaigns
 */
export const DELETE = async (request: Request) => {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const body = await request.json()
    const { campaignId } = body
    if (!campaignId) return NextResponse.json({ ok: false, error: 'campaignId required' }, { status: 400 })

    const result = await pool.query("DELETE FROM campaigns WHERE id = $1 AND status = 'draft' RETURNING id", [campaignId])
    if (result.rowCount === 0) return NextResponse.json({ ok: false, error: 'Campaign not found or not in draft status' }, { status: 404 })

    return NextResponse.json({ ok: true, data: { deleted: true, campaignId } })
  } catch (err) {
    console.error('CRM Campaigns DELETE error:', err)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}
