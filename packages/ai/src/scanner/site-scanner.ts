import type { Result } from '@ubuilder/types'
import { ok, err } from '@ubuilder/types'

type ScannedSite = {
  url: string
  title: string
  description: string
  headings: string[]
  links: Array<{ text: string; href: string }>
  images: Array<{ src: string; alt: string }>
  meta: {
    ogTitle?: string
    ogDescription?: string
    ogImage?: string
    canonical?: string
    favicon?: string
  }
  colors: string[]
  fonts: string[]
  sections: string[]
  textContent: string
}

/**
 * Scan an existing website URL and extract its structure,
 * content, metadata, images, colors, and fonts for cloning/analysis.
 */
export const scanUrl = async (url: string): Promise<Result<ScannedSite>> => {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'UBuilderBot/1.0 (website-scanner)',
        'Accept': 'text/html',
      },
    })

    if (!response.ok) {
      return err(`Failed to fetch URL (${response.status}): ${response.statusText}`)
    }

    const html = await response.text()
    const result = parseHtml(html, url)
    return ok(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error scanning URL'
    return err(message)
  }
}

/** Parse raw HTML string into structured site data */
const parseHtml = (html: string, baseUrl: string): ScannedSite => {
  const title = extractFirst(html, /<title[^>]*>(.*?)<\/title>/is) ?? ''
  const description = extractMetaContent(html, 'description') ?? ''

  const headings = extractAll(html, /<h[1-6][^>]*>(.*?)<\/h[1-6]>/gis).map(stripTags)

  const linkMatches = extractAllGroups(html, /<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis)
  const links = linkMatches.map(([href, text]) => ({
    text: stripTags(text),
    href: resolveUrl(href, baseUrl),
  }))

  const imgMatches = extractAllGroups(
    html,
    /<img[^>]+src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*>/gis
  )
  const images = imgMatches.map(([src, alt]) => ({
    src: resolveUrl(src, baseUrl),
    alt: alt ?? '',
  }))

  const meta = {
    ogTitle: extractMetaProperty(html, 'og:title'),
    ogDescription: extractMetaProperty(html, 'og:description'),
    ogImage: extractMetaProperty(html, 'og:image'),
    canonical: extractFirst(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/is),
    favicon: extractFirst(html, /<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["']([^"']+)["']/is),
  }

  const colorMatches = extractAll(html, /#[0-9a-fA-F]{3,8}/g)
  const colors = [...new Set(colorMatches)].slice(0, 20)

  const fontMatches = extractAll(html, /font-family:\s*['"]?([^;'"]+)/gi)
  const fonts = [...new Set(fontMatches.map((f) => f.trim()))].slice(0, 10)

  const sections = detectSections(html)

  const textContent = stripTags(
    html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  ).replace(/\s+/g, ' ').trim().slice(0, 5000)

  return {
    url: baseUrl,
    title,
    description,
    headings,
    links: links.slice(0, 50),
    images: images.slice(0, 30),
    meta,
    colors,
    fonts,
    sections,
    textContent,
  }
}

/** Extract the first capture group match */
const extractFirst = (html: string, regex: RegExp): string | undefined => {
  const match = regex.exec(html)
  return match?.[1]
}

/** Extract all matches (first capture group) */
const extractAll = (html: string, regex: RegExp): string[] => {
  const results: string[] = []
  let match: RegExpExecArray | null
  while ((match = regex.exec(html)) !== null) {
    if (match[1]) results.push(match[1])
    else if (match[0]) results.push(match[0])
  }
  return results
}

/** Extract all matches with multiple capture groups */
const extractAllGroups = (html: string, regex: RegExp): string[][] => {
  const results: string[][] = []
  let match: RegExpExecArray | null
  while ((match = regex.exec(html)) !== null) {
    results.push(match.slice(1))
  }
  return results
}

/** Extract meta tag content by name */
const extractMetaContent = (html: string, name: string): string | undefined => {
  const regex = new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, 'is')
  return extractFirst(html, regex)
}

/** Extract meta tag content by property (og:*) */
const extractMetaProperty = (html: string, property: string): string | undefined => {
  const regex = new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'is')
  return extractFirst(html, regex)
}

/** Strip HTML tags from a string */
const stripTags = (text: string): string => {
  return text.replace(/<[^>]+>/g, '').trim()
}

/** Resolve a relative URL against a base URL */
const resolveUrl = (href: string, base: string): string => {
  try {
    return new URL(href, base).toString()
  } catch {
    return href
  }
}

/** Detect common section types from HTML structure */
const detectSections = (html: string): string[] => {
  const sections: string[] = []
  const sectionPatterns: Array<[RegExp, string]> = [
    [/<nav/i, 'navbar'],
    [/hero|banner/i, 'hero'],
    [/about/i, 'about'],
    [/service/i, 'services'],
    [/testimonial|review/i, 'testimonials'],
    [/pricing|plans/i, 'pricing'],
    [/faq|frequently/i, 'faq'],
    [/contact/i, 'contact'],
    [/footer/i, 'footer'],
    [/gallery|portfolio/i, 'gallery'],
    [/blog|article|post/i, 'blog'],
    [/product|shop|store/i, 'products'],
    [/team|staff/i, 'team'],
    [/feature/i, 'features'],
  ]

  for (const [pattern, name] of sectionPatterns) {
    if (pattern.test(html)) {
      sections.push(name)
    }
  }
  return sections
}
