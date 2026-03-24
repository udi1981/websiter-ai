import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { createDb, eq, and } from '@ubuilder/db'
import { customers } from '@ubuilder/db'
import { prefixedId } from '@ubuilder/utils'

/**
 * CRM Customers — persisted to PostgreSQL via Drizzle ORM.
 * Table created via targeted SQL migration (not db:push).
 */

/**
 * GET /api/crm/customers?siteId=xxx
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

    const db = createDb()
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const offset = (page - 1) * limit

    const results = await db
      .select()
      .from(customers)
      .where(eq(customers.siteId, siteId))
      .orderBy(customers.createdAt)
      .limit(limit)
      .offset(offset)

    return NextResponse.json({
      ok: true,
      data: results,
      pagination: { page, limit, total: results.length },
    })
  } catch (err) {
    console.error('CRM Customers GET error:', err)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/crm/customers — create or upsert by email
 */
export const POST = async (request: Request) => {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const body = await request.json()
    const { siteId, name, email, phone, company, tags } = body

    if (!siteId || !name || !email) {
      return NextResponse.json({ ok: false, error: 'siteId, name, and email are required' }, { status: 400 })
    }

    const db = createDb()

    // Upsert: check if customer with this email already exists for this site
    const [existing] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.siteId, siteId), eq(customers.email, email)))
      .limit(1)

    if (existing) {
      const [updated] = await db
        .update(customers)
        .set({
          name,
          phone: phone || existing.phone,
          company: company || existing.company,
          tags: tags || existing.tags,
          updatedAt: new Date(),
        })
        .where(eq(customers.id, existing.id))
        .returning()

      return NextResponse.json({ ok: true, data: updated })
    }

    const id = prefixedId('cust')
    const [created] = await db
      .insert(customers)
      .values({
        id,
        siteId,
        name,
        email,
        phone: phone || null,
        company: company || null,
        tags: tags || [],
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return NextResponse.json({ ok: true, data: created }, { status: 201 })
  } catch (err) {
    console.error('CRM Customers POST error:', err)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/crm/customers — update fields
 */
export const PATCH = async (request: Request) => {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const body = await request.json()
    const { siteId, customerId } = body
    if (!siteId || !customerId) {
      return NextResponse.json({ ok: false, error: 'siteId and customerId required' }, { status: 400 })
    }

    const db = createDb()
    const updates: Record<string, unknown> = { updatedAt: new Date() }
    if (body.name !== undefined) updates.name = body.name
    if (body.email !== undefined) updates.email = body.email
    if (body.phone !== undefined) updates.phone = body.phone
    if (body.company !== undefined) updates.company = body.company
    if (body.tags !== undefined) updates.tags = body.tags
    if (body.totalSpent !== undefined) updates.totalSpent = body.totalSpent
    if (body.orderCount !== undefined) updates.orderCount = body.orderCount

    const [updated] = await db
      .update(customers)
      .set(updates)
      .where(and(eq(customers.id, customerId), eq(customers.siteId, siteId)))
      .returning()

    if (!updated) return NextResponse.json({ ok: false, error: 'Customer not found' }, { status: 404 })

    return NextResponse.json({ ok: true, data: updated })
  } catch (err) {
    console.error('CRM Customers PATCH error:', err)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/crm/customers
 */
export const DELETE = async (request: Request) => {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const body = await request.json()
    const { siteId, customerId } = body
    if (!siteId || !customerId) {
      return NextResponse.json({ ok: false, error: 'siteId and customerId required' }, { status: 400 })
    }

    const db = createDb()
    const [deleted] = await db
      .delete(customers)
      .where(and(eq(customers.id, customerId), eq(customers.siteId, siteId)))
      .returning()

    if (!deleted) return NextResponse.json({ ok: false, error: 'Customer not found' }, { status: 404 })

    return NextResponse.json({ ok: true, data: { deleted: true, customerId } })
  } catch (err) {
    console.error('CRM Customers DELETE error:', err)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}
