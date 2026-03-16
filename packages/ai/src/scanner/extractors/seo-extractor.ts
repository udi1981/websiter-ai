/**
 * SEO Extractor — Extracts SEO metadata and validates heading hierarchy
 *
 * Fully programmatic, no AI required. Parses meta tags, links,
 * heading structure, and structured data indicators.
 */

import type { SeoData, HeadingNode } from '../types/scanner'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract attribute value from a meta-like tag string. */
const extractMetaContent = (html: string, nameOrProp: string): string => {
  // Try name="..." content="..."
  const nameRegex = new RegExp(
    `<meta[^>]+(?:name|property)=["']${escapeRegex(nameOrProp)}["'][^>]+content=["']([^"']*)["']`,
    'i',
  )
  const nameMatch = html.match(nameRegex)
  if (nameMatch) return nameMatch[1]

  // Try content="..." name="..." (reversed order)
  const revRegex = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${escapeRegex(nameOrProp)}["']`,
    'i',
  )
  const revMatch = html.match(revRegex)
  return revMatch ? revMatch[1] : ''
}

/** Escape special regex characters. */
const escapeRegex = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// ---------------------------------------------------------------------------
// Heading extraction
// ---------------------------------------------------------------------------

/** Extract and validate heading hierarchy. */
const extractHeadings = (html: string): { headings: HeadingNode[]; valid: boolean } => {
  const headings: HeadingNode[] = []
  const hRegex = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi
  let match: RegExpExecArray | null

  while ((match = hRegex.exec(html)) !== null) {
    const level = parseInt(match[1], 10)
    const text = match[2].replace(/<[^>]+>/g, '').trim().slice(0, 200)
    if (text) headings.push({ level, text, valid: true })
  }

  // Validate hierarchy: H1 should come first, no level skips (H1 -> H3 is bad)
  let valid = true
  let lastLevel = 0

  for (const h of headings) {
    if (lastLevel === 0 && h.level !== 1) {
      h.valid = false
      valid = false
    } else if (h.level > lastLevel + 1 && lastLevel > 0) {
      h.valid = false
      valid = false
    }
    lastLevel = h.level
  }

  // Multiple H1s is invalid
  const h1Count = headings.filter(h => h.level === 1).length
  if (h1Count > 1) valid = false

  return { headings, valid }
}

// ---------------------------------------------------------------------------
// Link counting
// ---------------------------------------------------------------------------

const countLinks = (html: string, baseHostname: string): { internal: number; external: number } => {
  let internal = 0
  let external = 0

  const linkRegex = /href=["'](https?:\/\/[^"']+)["']/gi
  let match: RegExpExecArray | null

  while ((match = linkRegex.exec(html)) !== null) {
    try {
      const url = new URL(match[1])
      if (url.hostname === baseHostname || url.hostname === `www.${baseHostname}`) {
        internal++
      } else {
        external++
      }
    } catch {
      // skip invalid URLs
    }
  }

  // Also count relative links as internal
  const relRegex = /href=["'](\/[^"']*|\.\/[^"']*|#[^"']*)["']/gi
  while (relRegex.exec(html) !== null) {
    internal++
  }

  return { internal, external }
}

// ---------------------------------------------------------------------------
// Image alt text coverage
// ---------------------------------------------------------------------------

const checkAltText = (html: string): { withAlt: number; withoutAlt: number } => {
  let withAlt = 0
  let withoutAlt = 0

  const imgRegex = /<img\b([^>]*)>/gi
  let match: RegExpExecArray | null

  while ((match = imgRegex.exec(html)) !== null) {
    const tag = match[1]
    if (/alt=["'][^"']+["']/i.test(tag)) {
      withAlt++
    } else {
      withoutAlt++
    }
  }

  return { withAlt, withoutAlt }
}

// ---------------------------------------------------------------------------
// OG and Twitter tags
// ---------------------------------------------------------------------------

const extractOgTags = (html: string): Record<string, string> => {
  const tags: Record<string, string> = {}
  const regex = /<meta[^>]+property=["'](og:[^"']+)["'][^>]+content=["']([^"']*)["'][^>]*>/gi
  let match: RegExpExecArray | null
  while ((match = regex.exec(html)) !== null) {
    tags[match[1]] = match[2]
  }
  // Also reversed attribute order
  const revRegex = /<meta[^>]+content=["']([^"']*)["'][^>]+property=["'](og:[^"']+)["'][^>]*>/gi
  while ((match = revRegex.exec(html)) !== null) {
    tags[match[2]] = match[1]
  }
  return tags
}

const extractTwitterTags = (html: string): Record<string, string> => {
  const tags: Record<string, string> = {}
  const regex = /<meta[^>]+name=["'](twitter:[^"']+)["'][^>]+content=["']([^"']*)["'][^>]*>/gi
  let match: RegExpExecArray | null
  while ((match = regex.exec(html)) !== null) {
    tags[match[1]] = match[2]
  }
  const revRegex = /<meta[^>]+content=["']([^"']*)["'][^>]+name=["'](twitter:[^"']+)["'][^>]*>/gi
  while ((match = revRegex.exec(html)) !== null) {
    tags[match[2]] = match[1]
  }
  return tags
}

// ---------------------------------------------------------------------------
// Hreflang
// ---------------------------------------------------------------------------

const extractHreflang = (html: string): { lang: string; href: string }[] => {
  const results: { lang: string; href: string }[] = []
  const regex = /<link[^>]+rel=["']alternate["'][^>]+hreflang=["']([^"']+)["'][^>]+href=["']([^"']+)["'][^>]*>/gi
  let match: RegExpExecArray | null
  while ((match = regex.exec(html)) !== null) {
    results.push({ lang: match[1], href: match[2] })
  }
  return results
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

/**
 * Extract comprehensive SEO data from a page's HTML.
 *
 * @param html - Raw HTML string
 * @param url - Page URL for hostname resolution
 * @returns Complete SEO analysis data
 */
export const extractSeo = (html: string, url: string): SeoData => {
  let hostname = ''
  try {
    hostname = new URL(url).hostname
  } catch {
    // keep empty
  }

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  const title = titleMatch ? titleMatch[1].trim() : ''

  const { headings, valid } = extractHeadings(html)
  const links = countLinks(html, hostname)
  const altText = checkAltText(html)

  const canonical =
    (html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) || [])[1] || ''

  const robots = extractMetaContent(html, 'robots')

  // Check for sitemap and robots.txt references in the HTML
  const hasSitemap = /sitemap\.xml/i.test(html)
  const hasRobotsTxt = /robots\.txt/i.test(html)

  return {
    title,
    metaDescription: extractMetaContent(html, 'description'),
    keywords: extractMetaContent(html, 'keywords'),
    canonical,
    ogTags: extractOgTags(html),
    twitterTags: extractTwitterTags(html),
    robots,
    headingHierarchy: headings,
    headingHierarchyValid: valid,
    internalLinkCount: links.internal,
    externalLinkCount: links.external,
    imagesWithAlt: altText.withAlt,
    imagesWithoutAlt: altText.withoutAlt,
    hasSitemap,
    hasRobotsTxt,
    hreflangTags: extractHreflang(html),
  }
}
