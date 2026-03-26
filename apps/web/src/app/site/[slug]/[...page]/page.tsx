/**
 * Inner page renderer — /site/[slug]/[page-path]
 * Debug-instrumented version: logs every step for diagnosing 404s.
 */

import { createDb, sites, eq, and, sql } from '@ubuilder/db'
import { notFound } from 'next/navigation'

// ─── Result Parser ──────────────────────────────────────────────────

const parseInnerPageQueryResult = (result: unknown): { html: string | null; title: string; debugShape: string } => {
  if (!result) return { html: null, title: '', debugShape: 'null/undefined' }

  // Shape 1: Plain array of row objects (NeonHTTP default)
  if (Array.isArray(result) && result.length > 0) {
    const row = result[0] as Record<string, unknown>
    return {
      html: (row.html as string) || null,
      title: (row.title as string) || '',
      debugShape: `array[${result.length}], keys=${Object.keys(row).join(',')}`,
    }
  }

  // Shape 2: Object with .rows array
  const obj = result as Record<string, unknown>
  if (obj.rows && Array.isArray(obj.rows) && (obj.rows as unknown[]).length > 0) {
    const row = (obj.rows as Record<string, unknown>[])[0]
    return {
      html: (row.html as string) || null,
      title: (row.title as string) || '',
      debugShape: `{rows:[${(obj.rows as unknown[]).length}]}, keys=${Object.keys(row).join(',')}`,
    }
  }

  // Shape 3: Empty array
  if (Array.isArray(result) && result.length === 0) {
    return { html: null, title: '', debugShape: 'empty_array[]' }
  }

  // Shape 4: Object with .rows but empty
  if (obj.rows && Array.isArray(obj.rows) && (obj.rows as unknown[]).length === 0) {
    return { html: null, title: '', debugShape: '{rows:[0]}' }
  }

  return {
    html: null,
    title: '',
    debugShape: `unknown:${typeof result}:${JSON.stringify(result).slice(0, 200)}`,
  }
}

// ─── Route ──────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ slug: string; page: string[] }>
}

const InnerPage = async ({ params }: Props) => {
  const { slug, page: pageParts } = await params
  const rawPagePath = pageParts.join('/')
  const pagePath = rawPagePath.replace(/^\/+|\/+$/g, '') // Strip leading/trailing slashes
  const decodedPath = decodeURIComponent(pagePath)

  console.log(`[inner-page] === START === slug=${slug} page=${JSON.stringify(pageParts)}`)
  console.log(`[inner-page] rawPagePath=${rawPagePath} pagePath=${pagePath} decodedPath=${decodedPath}`)

  try {
    const db = createDb()

    // Step 1: Find site by slug
    const siteResults = await db.select().from(sites).where(
      and(eq(sites.slug, slug), eq(sites.status, 'published'))
    ).limit(1)

    if (!siteResults || siteResults.length === 0) {
      console.log(`[inner-page] === 404: site_not_found === slug=${slug}`)
      return notFound()
    }

    const site = siteResults[0]
    console.log(`[inner-page] Site found: id=${site.id} name=${site.name} status=${site.status}`)

    // Step 2: Query pages table
    const tenantId = site.id
    console.log(`[inner-page] Query: tenant_id=${tenantId} slug=${pagePath} OR slug=${decodedPath}`)

    const result = await db.execute(sql`
      SELECT blocks->>'html' as html, title, slug as db_slug, tenant_id as db_tenant
      FROM pages
      WHERE tenant_id = ${tenantId}
        AND (slug = ${pagePath} OR slug = ${decodedPath})
      LIMIT 1
    `)

    // Step 3: Parse result
    const parsed = parseInnerPageQueryResult(result)
    console.log(`[inner-page] Result shape: ${parsed.debugShape}`)

    if (parsed.html) {
      console.log(`[inner-page] HTML found: ${parsed.html.length} chars, title="${parsed.title?.slice(0, 50)}"`)
      console.log(`[inner-page] === RENDERING ===`)

      return (
        <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
          <iframe
            srcDoc={parsed.html}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title={parsed.title || 'Page'}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        </div>
      )
    }

    // Step 4: HTML not found — debug why
    console.log(`[inner-page] === 404: page_not_found === tenant_id=${tenantId} slug=${pagePath}`)

    // Extra debug: list all pages for this tenant
    try {
      const allPages = await db.execute(sql`
        SELECT slug, page_type, length(blocks::text) as blocks_len
        FROM pages WHERE tenant_id = ${tenantId}
      `)
      console.log(`[inner-page] All pages for tenant: ${JSON.stringify(allPages)}`)
    } catch { /* debug only */ }

    return notFound()

  } catch (err) {
    console.error('[inner-page] === ERROR ===', err)
    if (process.env.NODE_ENV === 'development') {
      throw err // Show real error in dev, don't hide behind 404
    }
    return notFound()
  }
}

export default InnerPage
