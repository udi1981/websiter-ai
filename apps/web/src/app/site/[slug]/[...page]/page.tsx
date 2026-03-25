/**
 * Inner page renderer — /site/[slug]/[page-path]
 */

import { createDb, sites, eq, and, sql } from '@ubuilder/db'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ slug: string; page: string[] }>
}

const InnerPage = async ({ params }: Props) => {
  const { slug, page: pageParts } = await params
  const pagePath = pageParts.join('/')

  try {
    const db = createDb()

    const [site] = await db.select().from(sites).where(
      and(eq(sites.slug, slug), eq(sites.status, 'published'))
    ).limit(1)

    if (!site) {
      console.log(`[inner-page] Site not found: slug=${slug}`)
      return notFound()
    }

    // Query pages table — tenant_id = site.id, HTML stored in blocks jsonb
    // Try both raw and decoded path (URL may be encoded)
    const decodedPath = decodeURIComponent(pagePath)
    const result = await db.execute(sql`
      SELECT blocks->>'html' as html, title FROM pages
      WHERE tenant_id = ${site.id} AND (slug = ${pagePath} OR slug = ${decodedPath})
      LIMIT 1
    `)

    // Drizzle execute returns different shapes depending on driver
    // Try multiple access patterns
    let html: string | null = null
    let title: string = ''

    if (result && typeof result === 'object') {
      // Pattern 1: NeonHTTP returns array of rows directly
      const rows = Array.isArray(result) ? result : (result as Record<string, unknown>).rows as unknown[] | undefined
      if (rows && rows.length > 0) {
        const row = rows[0] as Record<string, unknown>
        html = (row.html as string) || null
        title = (row.title as string) || ''
      }
    }

    console.log(`[inner-page] Query result for ${slug}/${pagePath}: html=${html ? html.length + ' chars' : 'NULL'}, resultType=${typeof result}, isArray=${Array.isArray(result)}`)

    if (!html) {
      console.log(`[inner-page] No HTML found for tenant=${site.id}, slug=${pagePath}`)
      return notFound()
    }

    return (
      <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
        <iframe
          srcDoc={html}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title={title || 'Page'}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    )
  } catch (err) {
    console.error('[inner-page] Error:', err)
    return notFound()
  }
}

export default InnerPage
