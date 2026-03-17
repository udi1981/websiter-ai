import { notFound } from 'next/navigation'
import { createDb, sites, eq } from '@ubuilder/db'

type Props = {
  params: Promise<{ slug: string }>
}

/** Public site page — renders published site HTML */
const PublicSitePage = async ({ params }: Props) => {
  const { slug } = await params

  let site
  try {
    const db = createDb()
    const [result] = await db
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

    site = result
  } catch (err) {
    console.error('[site] DB error:', err)
    notFound()
  }

  if (!site || site.status !== 'published' || !site.html) {
    notFound()
  }

  return (
    <iframe
      srcDoc={site.html}
      className="h-screen w-screen border-0"
      title={site.name}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    />
  )
}

export default PublicSitePage
