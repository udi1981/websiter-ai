import { NextRequest, NextResponse } from 'next/server'
import { createDb, sites, eq } from '@ubuilder/db'

type RouteParams = { params: Promise<{ siteId: string }> }

/** POST /api/sites/[siteId]/publish — Publish a site */
export const POST = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { siteId } = await params

    const db = createDb()

    // Get the site
    const [site] = await db
      .select()
      .from(sites)
      .where(eq(sites.id, siteId))
      .limit(1)

    if (!site) {
      return NextResponse.json({ ok: false, error: 'Site not found' }, { status: 404 })
    }

    if (!site.html) {
      return NextResponse.json({ ok: false, error: 'Site has no content to publish' }, { status: 400 })
    }

    // Update status to published
    const [updated] = await db
      .update(sites)
      .set({
        status: 'published',
        updatedAt: new Date(),
      })
      .where(eq(sites.id, siteId))
      .returning({
        id: sites.id,
        slug: sites.slug,
        domain: sites.domain,
        status: sites.status,
      })

    const publishedUrl = `https://${updated.slug}.ubuilder.co`

    return NextResponse.json({
      ok: true,
      data: {
        ...updated,
        url: publishedUrl,
      },
    })
  } catch (err) {
    console.error('[publish] Error:', err)
    return NextResponse.json({ ok: false, error: 'Failed to publish site' }, { status: 500 })
  }
}
