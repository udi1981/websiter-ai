import { NextRequest, NextResponse } from 'next/server'
import { createDb, sites, eq, and } from '@ubuilder/db'

type RouteParams = { params: Promise<{ siteId: string }> }

/** GET /api/sites/[siteId] — Get a single site with HTML */
export const GET = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { siteId } = await params
    const userId = req.headers.get('x-user-id')

    const db = createDb()
    const [site] = await db
      .select()
      .from(sites)
      .where(userId ? and(eq(sites.id, siteId), eq(sites.userId, userId)) : eq(sites.id, siteId))
      .limit(1)

    if (!site) {
      return NextResponse.json({ ok: false, error: 'Site not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, data: site })
  } catch (err) {
    console.error('[sites] GET by id error:', err)
    return NextResponse.json({ ok: false, error: 'Failed to fetch site' }, { status: 500 })
  }
}

/** PATCH /api/sites/[siteId] — Update a site */
export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { siteId } = await params
    const body = await req.json()

    const db = createDb()

    // Build update object with only provided fields
    const updates: Record<string, unknown> = { updatedAt: new Date() }
    const allowedFields = ['name', 'slug', 'html', 'buildPlan', 'logoSvg', 'industry', 'primaryColor', 'designDna', 'gsoScore', 'version', 'status', 'sourceUrl']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    const [updated] = await db
      .update(sites)
      .set(updates)
      .where(eq(sites.id, siteId))
      .returning()

    if (!updated) {
      return NextResponse.json({ ok: false, error: 'Site not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, data: updated })
  } catch (err) {
    console.error('[sites] PATCH error:', err)
    return NextResponse.json({ ok: false, error: 'Failed to update site' }, { status: 500 })
  }
}

/** DELETE /api/sites/[siteId] — Soft delete (archive) a site */
export const DELETE = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { siteId } = await params

    const db = createDb()
    const [archived] = await db
      .update(sites)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(eq(sites.id, siteId))
      .returning({ id: sites.id })

    if (!archived) {
      return NextResponse.json({ ok: false, error: 'Site not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, data: { id: archived.id } })
  } catch (err) {
    console.error('[sites] DELETE error:', err)
    return NextResponse.json({ ok: false, error: 'Failed to archive site' }, { status: 500 })
  }
}
