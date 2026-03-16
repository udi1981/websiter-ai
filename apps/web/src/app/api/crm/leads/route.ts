import { NextResponse } from 'next/server'
import type { Lead, LeadSource, LeadStatus } from '@ubuilder/types'

// TODO: Replace with Drizzle ORM query when DB connected
const leadsStore = new Map<string, Lead[]>()

/** Helper to get or initialize leads array for a site */
const getLeads = (siteId: string): Lead[] => {
  if (!leadsStore.has(siteId)) {
    leadsStore.set(siteId, [])
  }
  return leadsStore.get(siteId)!
}

/**
 * GET /api/crm/leads
 * List all leads for a site with filtering, search, sorting, and pagination.
 *
 * Query params:
 *   siteId (required), status, search, sortBy, sortOrder, page, limit
 */
export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')

    if (!siteId) {
      return NextResponse.json(
        { ok: false, error: 'siteId is required' },
        { status: 400 }
      )
    }

    // TODO: Replace with Drizzle ORM query when DB connected
    let leads = [...getLeads(siteId)]

    // Filter by status
    const status = searchParams.get('status') as LeadStatus | null
    if (status) {
      leads = leads.filter(l => l.status === status)
    }

    // Search by name, email, or phone
    const search = searchParams.get('search')
    if (search) {
      const q = search.toLowerCase()
      leads = leads.filter(
        l =>
          l.name?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.phone?.includes(q)
      )
    }

    // Sort
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    leads.sort((a, b) => {
      const aVal = a[sortBy as keyof Lead]
      const bVal = b[sortBy as keyof Lead]
      if (aVal instanceof Date && bVal instanceof Date) {
        return sortOrder === 'desc'
          ? bVal.getTime() - aVal.getTime()
          : aVal.getTime() - bVal.getTime()
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'desc' ? bVal - aVal : aVal - bVal
      }
      return 0
    })

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const total = leads.length
    const totalPages = Math.ceil(total / limit)
    const paginated = leads.slice((page - 1) * limit, page * limit)

    return NextResponse.json({
      ok: true,
      data: paginated,
      pagination: { page, limit, total, totalPages },
    })
  } catch (err) {
    console.error('CRM Leads GET error:', err)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/crm/leads
 * Create a new lead for a site.
 *
 * Body: { siteId, name?, email?, phone?, source, notes?, metadata?, assignedTo? }
 * Returns the created lead.
 */
export const POST = async (request: Request) => {
  try {
    const body = await request.json()
    const { siteId, name, email, phone, source, notes, metadata, assignedTo } = body

    if (!siteId) {
      return NextResponse.json(
        { ok: false, error: 'siteId is required' },
        { status: 400 }
      )
    }

    if (!name && !email && !phone) {
      return NextResponse.json(
        { ok: false, error: 'At least one of name, email, or phone is required' },
        { status: 400 }
      )
    }

    const validSources: LeadSource[] = ['website_form', 'chat', 'manual', 'import', 'api']
    if (source && !validSources.includes(source)) {
      return NextResponse.json(
        { ok: false, error: `Invalid source. Must be one of: ${validSources.join(', ')}` },
        { status: 400 }
      )
    }

    const now = new Date()
    const lead: Lead = {
      id: `lead_${crypto.randomUUID()}`,
      siteId,
      name: name || null,
      email: email || null,
      phone: phone || null,
      source: source || 'manual',
      status: 'new',
      score: 0,
      notes: notes || null,
      metadata: metadata || null,
      assignedTo: assignedTo || null,
      createdAt: now,
      updatedAt: now,
    }

    // TODO: Replace with Drizzle ORM insert when DB connected
    getLeads(siteId).push(lead)

    return NextResponse.json({ ok: true, data: lead }, { status: 201 })
  } catch (err) {
    console.error('CRM Leads POST error:', err)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/crm/leads
 * Update an existing lead.
 *
 * Body: { siteId, leadId, status?, score?, notes?, assignedTo?, name?, email?, phone?, metadata? }
 */
export const PUT = async (request: Request) => {
  try {
    const body = await request.json()
    const { siteId, leadId } = body

    if (!siteId || !leadId) {
      return NextResponse.json(
        { ok: false, error: 'siteId and leadId are required' },
        { status: 400 }
      )
    }

    // TODO: Replace with Drizzle ORM update when DB connected
    const leads = getLeads(siteId)
    const index = leads.findIndex(l => l.id === leadId)

    if (index === -1) {
      return NextResponse.json(
        { ok: false, error: 'Lead not found' },
        { status: 404 }
      )
    }

    const validStatuses: LeadStatus[] = ['new', 'contacted', 'qualified', 'converted', 'lost']
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { ok: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    const updated: Lead = {
      ...leads[index],
      ...(body.name !== undefined && { name: body.name }),
      ...(body.email !== undefined && { email: body.email }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.score !== undefined && { score: body.score }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.assignedTo !== undefined && { assignedTo: body.assignedTo }),
      ...(body.metadata !== undefined && { metadata: body.metadata }),
      updatedAt: new Date(),
    }

    leads[index] = updated

    return NextResponse.json({ ok: true, data: updated })
  } catch (err) {
    console.error('CRM Leads PUT error:', err)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/crm/leads
 * Soft delete a lead by setting status to 'lost'.
 *
 * Body: { siteId, leadId }
 */
export const DELETE = async (request: Request) => {
  try {
    const body = await request.json()
    const { siteId, leadId } = body

    if (!siteId || !leadId) {
      return NextResponse.json(
        { ok: false, error: 'siteId and leadId are required' },
        { status: 400 }
      )
    }

    // TODO: Replace with Drizzle ORM update when DB connected
    const leads = getLeads(siteId)
    const index = leads.findIndex(l => l.id === leadId)

    if (index === -1) {
      return NextResponse.json(
        { ok: false, error: 'Lead not found' },
        { status: 404 }
      )
    }

    // Soft delete: set status to 'lost'
    leads[index] = {
      ...leads[index],
      status: 'lost',
      updatedAt: new Date(),
    }

    return NextResponse.json({ ok: true, data: leads[index] })
  } catch (err) {
    console.error('CRM Leads DELETE error:', err)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
