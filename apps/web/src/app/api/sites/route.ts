import { NextRequest, NextResponse } from 'next/server'
import { createDb, sites, eq, desc, ne, and } from '@ubuilder/db'
import { requireAuth } from '@/lib/auth-middleware'

/** GET /api/sites — List all sites for a user */
export const GET = async (req: NextRequest) => {
  try {
    const authResult = await requireAuth(req)
    if (authResult instanceof Response) return authResult
    const { userId } = authResult

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
      .where(and(eq(sites.userId, userId), ne(sites.status, 'generation_failed'), ne(sites.status, 'archived')))
      .orderBy(desc(sites.updatedAt))

    return NextResponse.json({ ok: true, data: userSites })
  } catch (err) {
    console.error('[sites] GET error:', err)
    return NextResponse.json({ ok: false, error: 'Failed to fetch sites' }, { status: 500 })
  }
}

/** Generate a unique slug, appending random suffix on collision */
const generateUniqueSlug = async (db: ReturnType<typeof createDb>, baseSlug: string): Promise<string> => {
  let slug = baseSlug
  let attempts = 0
  const maxAttempts = 5

  while (attempts < maxAttempts) {
    const [existing] = await db
      .select({ id: sites.id })
      .from(sites)
      .where(eq(sites.slug, slug))
      .limit(1)

    if (!existing) return slug

    // Append random 3-char suffix
    const suffix = Math.random().toString(36).substring(2, 5)
    slug = `${baseSlug}-${suffix}`
    attempts++
  }

  // Last resort: append timestamp
  return `${baseSlug}-${Date.now().toString(36)}`
}

/** POST /api/sites — Create a new site */
export const POST = async (req: NextRequest) => {
  try {
    const authResult = await requireAuth(req)
    if (authResult instanceof Response) return authResult
    const { userId } = authResult

    const body = await req.json()
    const { id, name, slug, html, buildPlan, industry, primaryColor, logoSvg, sourceUrl } = body

    if (!id || !name) {
      return NextResponse.json({ ok: false, error: 'id and name are required' }, { status: 400 })
    }

    const db = createDb()
    const baseSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const uniqueSlug = await generateUniqueSlug(db, baseSlug)

    const [newSite] = await db.insert(sites).values({
      id,
      userId,
      name,
      slug: uniqueSlug,
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
