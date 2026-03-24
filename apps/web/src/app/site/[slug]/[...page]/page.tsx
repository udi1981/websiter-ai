/**
 * Inner page renderer — /site/[slug]/[page-path]
 * Serves inner pages (about, products, contact, blog) from the pages table.
 * HTML is stored in blocks->html (jsonb) because the real DB has no html column.
 */

import { createDb } from '@ubuilder/db'
import { sites } from '@ubuilder/db/schema'
import { eq, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { sql } from 'drizzle-orm'

type Props = {
  params: Promise<{ slug: string; page: string[] }>
}

const InnerPage = async ({ params }: Props) => {
  const { slug, page: pageParts } = await params
  const pagePath = pageParts.join('/')
  const db = createDb()

  // Find the site by slug
  const [site] = await db.select().from(sites).where(
    and(eq(sites.slug, slug), eq(sites.status, 'published'))
  ).limit(1)

  if (!site) return notFound()

  // Find the inner page — tenant_id = site.id, HTML stored in blocks->'html'
  const result = await db.execute(sql`
    SELECT blocks->>'html' as html, title FROM pages
    WHERE tenant_id = ${site.id}
      AND slug = ${pagePath}
    LIMIT 1
  `)

  const pageRow = (result as unknown as { rows: { html: string; title: string }[] }).rows?.[0]
    || (result as { html: string; title: string }[])?.[0]

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
}

export default InnerPage
