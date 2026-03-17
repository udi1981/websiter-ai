import { NextRequest, NextResponse } from 'next/server'
import { createDb, sites, eq, desc } from '@ubuilder/db'

/** GET /api/sites — List all sites for a user */
export const GET = async (req: NextRequest) => {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const db = createDb()
    const userSites = await db
      .select({
        id: sites.id,
        name: sites.name,
        slug: sites.slug,
        status: sites.status,
        industry: sites.industry,
        primaryColor: sites.primaryColor,
        logoSvg: sites.logoSvg,
        version: sites.version,
        sourceUrl: sites.sourceUrl,
        createdAt: sites.createdAt,
        updatedAt: sites.updatedAt,
      })
      .from(sites)
      .where(eq(sites.userId, userId))
      .orderBy(desc(sites.updatedAt))

    return NextResponse.json({ ok: true, data: userSites })
  } catch (err) {
    console.error('[sites] GET error:', err)
    return NextResponse.json({ ok: false, error: 'Failed to fetch sites' }, { status: 500 })
  }
}

/** POST /api/sites — Create a new site */
export const POST = async (req: NextRequest) => {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { id, name, slug, html, buildPlan, industry, primaryColor, logoSvg, sourceUrl } = body

    if (!id || !name) {
      return NextResponse.json({ ok: false, error: 'id and name are required' }, { status: 400 })
    }

    const db = createDb()
    const siteSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const [newSite] = await db.insert(sites).values({
      id,
      userId,
      name,
      slug: siteSlug,
      html: html || null,
      buildPlan: buildPlan || null,
      industry: industry || null,
      primaryColor: primaryColor || '#7C3AED',
      logoSvg: logoSvg || null,
      sourceUrl: sourceUrl || null,
    }).returning()

    return NextResponse.json({ ok: true, data: newSite })
  } catch (err) {
    console.error('[sites] POST error:', err)
    return NextResponse.json({ ok: false, error: 'Failed to create site' }, { status: 500 })
  }
}
