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

    if (!site) return notFound()

    const result = await db.execute(sql`
      SELECT blocks->>'html' as html, title FROM pages
      WHERE tenant_id = ${site.id} AND slug = ${pagePath}
      LIMIT 1
    `)

    const rows = Array.isArray(result) ? result : []
    const pageRow = rows[0] as { html?: string; title?: string } | undefined

    if (!pageRow?.html) return notFound()

    return (
      <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
        <iframe
          srcDoc={pageRow.html}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title={pageRow.title || 'Page'}
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
