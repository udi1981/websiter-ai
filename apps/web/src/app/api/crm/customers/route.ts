import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import type { Customer } from '@ubuilder/types'

// TODO: Replace with Drizzle ORM query when DB connected
const customersStore = new Map<string, Customer[]>()

/** Helper to get or initialize customers array for a site */
const getCustomers = (siteId: string): Customer[] => {
  if (!customersStore.has(siteId)) {
    customersStore.set(siteId, [])
  }
  return customersStore.get(siteId)!
}

/**
 * GET /api/crm/customers
 * List all customers for a site with filtering, segment queries, and pagination.
 *
 * Query params:
 *   siteId (required), tag, minOrderCount, minTotalSpent, search, page, limit
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
    let customers = [...getCustomers(siteId)]

    // Filter by tag
    const tag = searchParams.get('tag')
    if (tag) {
      customers = customers.filter(c => c.tags.includes(tag))
    }

    // Filter by minimum order count
    const minOrderCount = searchParams.get('minOrderCount')
    if (minOrderCount) {
      const min = parseInt(minOrderCount, 10)
      if (!isNaN(min)) {
        customers = customers.filter(c => c.orderCount >= min)
      }
    }

    // Filter by minimum total spent
    const minTotalSpent = searchParams.get('minTotalSpent')
    if (minTotalSpent) {
      const min = parseFloat(minTotalSpent)
      if (!isNaN(min)) {
        customers = customers.filter(c => c.totalSpent >= min)
      }
    }

    // Search by name, email, phone, or company
    const search = searchParams.get('search')
    if (search) {
      const q = search.toLowerCase()
      customers = customers.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone?.toLowerCase().includes(q) ||
          c.company?.toLowerCase().includes(q)
      )
    }

    // Sort by createdAt descending by default
    customers.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const total = customers.length
    const totalPages = Math.ceil(total / limit)
    const paginated = customers.slice((page - 1) * limit, page * limit)

    return NextResponse.json({
      ok: true,
      data: paginated,
      pagination: { page, limit, total, totalPages },
    })
  } catch (err) {
    console.error('CRM Customers GET error:', err)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/crm/customers
 * Create or update (upsert) a customer by email.
 * If a customer with the same email exists for the site, it updates that record.
 * Otherwise, creates a new customer.
 *
 * Body: { siteId, name, email, phone?, company?, leadId?, tags?, totalSpent?, orderCount?, metadata? }
 * Returns the created or updated customer.
 */
export const POST = async (request: Request) => {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const body = await request.json()
    const { siteId, name, email } = body

    if (!siteId) {
      return NextResponse.json(
        { ok: false, error: 'siteId is required' },
        { status: 400 }
      )
    }

    if (!name || !email) {
      return NextResponse.json(
        { ok: false, error: 'name and email are required' },
        { status: 400 }
      )
    }

    // TODO: Replace with Drizzle ORM upsert when DB connected
    const customers = getCustomers(siteId)
    const existingIndex = customers.findIndex(
      c => c.email.toLowerCase() === email.toLowerCase()
    )

    const now = new Date()

    if (existingIndex !== -1) {
      // Upsert: update existing customer
      const existing = customers[existingIndex]
      const updated: Customer = {
        ...existing,
        name: body.name ?? existing.name,
        phone: body.phone !== undefined ? body.phone : existing.phone,
        company: body.company !== undefined ? body.company : existing.company,
        totalSpent: body.totalSpent !== undefined ? body.totalSpent : existing.totalSpent,
        orderCount: body.orderCount !== undefined ? body.orderCount : existing.orderCount,
        tags: body.tags !== undefined ? body.tags : existing.tags,
        metadata: body.metadata !== undefined ? body.metadata : existing.metadata,
        lastActivityAt: now,
        updatedAt: now,
      }
      customers[existingIndex] = updated

      return NextResponse.json({ ok: true, data: updated })
    }

    // Create new customer
    const customer: Customer = {
      id: `cust_${crypto.randomUUID()}`,
      siteId,
      leadId: body.leadId || null,
      name,
      email,
      phone: body.phone || null,
      company: body.company || null,
      totalSpent: body.totalSpent || 0,
      orderCount: body.orderCount || 0,
      tags: body.tags || [],
      metadata: body.metadata || null,
      lastActivityAt: now,
      createdAt: now,
      updatedAt: now,
    }

    customers.push(customer)

    return NextResponse.json({ ok: true, data: customer }, { status: 201 })
  } catch (err) {
    console.error('CRM Customers POST error:', err)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
