import { NextRequest, NextResponse } from 'next/server'
import { createDb, sites, eq } from '@ubuilder/db'

/** GET /api/public/site?slug=xxx — Serve published site HTML */
export const GET = async (req: NextRequest) => {
  try {
    const slug = req.nextUrl.searchParams.get('slug')
    if (!slug) {
      return NextResponse.json({ ok: false, error: 'slug is required' }, { status: 400 })
    }

    const db = createDb()
    const [site] = await db
      .select({
        id: sites.id,
        name: sites.name,
        slug: sites.slug,
        html: sites.html,
        status: sites.status,
      })
      .from(sites)
      .where(eq(sites.slug, slug))
      .limit(1)

    if (!site) {
      return new NextResponse('Site not found', { status: 404 })
    }

    if (site.status !== 'published') {
      return new NextResponse('Site is not published', { status: 403 })
    }

    if (!site.html) {
      return new NextResponse('Site has no content', { status: 404 })
    }

    // Return the HTML directly
    return new NextResponse(site.html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (err) {
    console.error('[public/site] Error:', err)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
