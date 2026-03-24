import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
})

/**
 * GET /api/crm/leads?siteId=xxx
 * List leads for a site with optional filtering.
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
    const search = searchParams.get('search')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const offset = (page - 1) * limit

    let query = 'SELECT * FROM leads WHERE site_id = $1'
    const params: unknown[] = [siteId]
    let paramIdx = 2

    if (status) {
      query += ` AND status_id = $${paramIdx}`
      params.push(status)
      paramIdx++
    }

    if (search) {
      query += ` AND (name ILIKE $${paramIdx} OR email ILIKE $${paramIdx} OR phone ILIKE $${paramIdx})`
      params.push(`%${search}%`)
      paramIdx++
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)::int as count')
    query += ` ORDER BY created_at DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`
    params.push(limit, offset)

    const [dataResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, paramIdx - 1)),
    ])

    const total = countResult.rows[0]?.count || 0

    return NextResponse.json({
      ok: true,
      data: dataResult.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) {
    console.error('CRM Leads GET error:', err)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/crm/leads
 * Create a new lead. Used by chatbot widget (public) and dashboard (authenticated).
 */
export const POST = async (request: Request) => {
  try {
    const body = await request.json()
    const { siteId, name, email, phone, source, message } = body

    if (!siteId) {
      return NextResponse.json({ ok: false, error: 'siteId is required' }, { status: 400 })
    }

    if (!name && !email && !phone) {
      return NextResponse.json({ ok: false, error: 'At least one of name, email, or phone is required' }, { status: 400 })
    }

    const id = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    // Get default status_id — use 'new' or find first status
    let statusId = 'new'
    try {
      const statusRes = await pool.query(
        "SELECT id FROM lead_statuses WHERE tenant_id = (SELECT tenant_id FROM sites WHERE id = $1 LIMIT 1) LIMIT 1",
        [siteId]
      )
      if (statusRes.rows[0]) statusId = statusRes.rows[0].id
    } catch { /* use default */ }

    // Get tenant_id — find first tenant (or create from site's user)
    let tenantId = ''
    try {
      const tenantRes = await pool.query("SELECT id FROM tenants LIMIT 1")
      if (tenantRes.rows[0]) {
        tenantId = tenantRes.rows[0].id
      } else {
        // No tenant exists — create one
        tenantId = `tenant_${Date.now()}`
        await pool.query("INSERT INTO tenants (id, name, created_at, updated_at) VALUES ($1, 'Default', NOW(), NOW())", [tenantId])
      }
    } catch { /* fallback */ }

    const result = await pool.query(
      `INSERT INTO leads (id, tenant_id, site_id, name, email, phone, status_id, source, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [id, tenantId, siteId, name || null, email || null, phone || null, statusId, source || 'website', message ? JSON.stringify([{ text: message, date: new Date().toISOString() }]) : '[]']
    )

    return NextResponse.json({ ok: true, data: result.rows[0] }, { status: 201 })
  } catch (err) {
    console.error('CRM Leads POST error:', err)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/crm/leads
 * Update a lead's status or fields.
 */
export const PATCH = async (request: Request) => {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const body = await request.json()
    const { siteId, leadId, status, name, email, phone } = body

    if (!siteId || !leadId) {
      return NextResponse.json({ ok: false, error: 'siteId and leadId are required' }, { status: 400 })
    }

    const sets: string[] = ['updated_at = NOW()']
    const params: unknown[] = []
    let idx = 1

    if (status) { sets.push(`status_id = $${idx}`); params.push(status); idx++ }
    if (name) { sets.push(`name = $${idx}`); params.push(name); idx++ }
    if (email) { sets.push(`email = $${idx}`); params.push(email); idx++ }
    if (phone) { sets.push(`phone = $${idx}`); params.push(phone); idx++ }

    params.push(leadId, siteId)

    const result = await pool.query(
      `UPDATE leads SET ${sets.join(', ')} WHERE id = $${idx} AND site_id = $${idx + 1} RETURNING *`,
      params
    )

    if (!result.rows[0]) {
      return NextResponse.json({ ok: false, error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, data: result.rows[0] })
  } catch (err) {
    console.error('CRM Leads PATCH error:', err)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}

/** PUT delegates to PATCH for backward compatibility */
export const PUT = async (request: Request) => PATCH(request)
