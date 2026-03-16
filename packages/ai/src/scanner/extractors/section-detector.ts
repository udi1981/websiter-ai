/**
 * Section Detector — Pure function for section boundary detection and classification
 *
 * Uses regex-based HTML parsing (no DOM required).
 * Detects sections by semantic tags, class/id keywords, and structural heuristics.
 */

import type { SectionType, SectionTemplate } from '../types/scanner'

// ---------------------------------------------------------------------------
// Section keyword patterns with weights
// ---------------------------------------------------------------------------

const SECTION_KEYWORDS: [SectionType, RegExp][] = [
  ['hero', /hero|banner|jumbotron|masthead|splash|landing-top/i],
  ['navbar', /nav|header|topbar|menu-bar|site-header/i],
  ['features', /features?|benefits?|capabilities|highlights|advantages/i],
  ['services', /services?|offerings?|what-we-do|solutions/i],
  ['about', /about|who-we-are|our-story|mission|company/i],
  ['testimonials', /testimonial|review|feedback|client-say|quote|social-proof/i],
  ['pricing', /pricing|plans?|packages?|subscription|tier/i],
  ['faq', /faq|questions|accordion|help-center/i],
  ['contact', /contact|get-in-touch|reach-us|enquir/i],
  ['footer', /footer|bottom-bar|site-footer/i],
  ['gallery', /gallery|lightbox|carousel|slider|showcase/i],
  ['portfolio', /portfolio|work|projects?|case-stud/i],
  ['team', /team|staff|people|crew|members/i],
  ['stats', /stats?|numbers?|counter|metrics|achievements/i],
  ['cta', /cta|call-to-action|get-started|sign-up-banner/i],
  ['blog', /blog|news|articles?|posts?|insights/i],
  ['products', /products?|shop|store|catalog|merchandise/i],
  ['newsletter', /newsletter|subscribe|signup|mailing/i],
]

// ---------------------------------------------------------------------------
// Content-based detection keywords
// ---------------------------------------------------------------------------

const CONTENT_KEYWORDS: [SectionType, RegExp][] = [
  ['pricing', /\$\d|€\d|£\d|₪\d|\/mo|\/yr|per\s+month|per\s+year|billed\s+(?:monthly|annually)/i],
  ['faq', /frequently\s+asked|common\s+questions/i],
  ['testimonials', /★|⭐|rating|"[^"]{20,}"|said\s+(?:the|our)|client\s+(?:review|feedback)/i],
  ['contact', /send\s+(?:us\s+)?a?\s*message|get\s+in\s+touch|reach\s+(?:out|us)/i],
  ['stats', /\d+\s*(?:\+|k|m|%)\s/i],
  ['newsletter', /subscribe\s+(?:to\s+)?(?:our\s+)?(?:newsletter|updates)/i],
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip HTML tags from a string, collapsing whitespace. */
const stripTags = (html: string): string =>
  html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

/** Truncate and clean an HTML snippet for storage. */
const cleanSnapshot = (html: string, maxLen: number): string => {
  // Remove script/style blocks
  let clean = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
  // Collapse whitespace
  clean = clean.replace(/\s+/g, ' ').trim()
  return clean.slice(0, maxLen)
}

/** Detect background type from class string. */
const detectBackground = (
  classStr: string,
  html: string,
): SectionTemplate['layout']['background'] => {
  if (/bg-(?:black|gray-(?:8|9)|slate-(?:8|9)|dark|zinc-(?:8|9))/i.test(classStr)) return 'dark'
  if (/bg-(?:white|gray-(?:5|1)|slate-(?:5|1)|light)/i.test(classStr)) return 'light'
  if (/gradient/i.test(classStr) || /gradient/i.test(html.slice(0, 500))) return 'gradient'
  if (/bg-(?:url|image)|background-image/i.test(html.slice(0, 500))) return 'image'
  if (/bg-(?:blue|red|green|purple|indigo|teal|cyan|orange|yellow|pink|violet|emerald|amber)/i.test(classStr)) return 'colored'
  return 'transparent'
}

/** Detect column count from classes and child structure. */
const detectColumns = (html: string): number => {
  // Grid columns
  const gridMatch = html.match(/grid-cols-(\d)/i) || html.match(/columns?-(\d)/i)
  if (gridMatch) return parseInt(gridMatch[1], 10)

  // Flex/col patterns
  const colMatch = html.match(/col-(?:md-|lg-|xl-)?(\d{1,2})/g)
  if (colMatch && colMatch.length > 0) {
    // Count distinct column children
    return Math.min(colMatch.length, 6)
  }

  // Count repeated card-like children
  const cardCount = (html.match(/<(?:div|article|li)[^>]*class="[^"]*card/gi) || []).length
  if (cardCount >= 2) return Math.min(cardCount, 6)

  return 1
}

/** Detect alignment from classes. */
const detectAlignment = (classStr: string): SectionTemplate['layout']['alignment'] => {
  if (/text-center|items-center|justify-center|mx-auto/i.test(classStr)) return 'center'
  if (/text-(?:right|end)|items-end|justify-end/i.test(classStr)) return 'right'
  return 'left'
}

// ---------------------------------------------------------------------------
// Main detection function
// ---------------------------------------------------------------------------

/**
 * Detect section boundaries and classify each section in raw HTML.
 *
 * @param html - Raw HTML string of a single page
 * @param url - Page URL (used for context)
 * @returns Array of detected and classified sections
 */
export const detectSections = (html: string, url: string): SectionTemplate[] => {
  const sections: SectionTemplate[] = []
  let order = 0
  let hasH1 = false

  // Match semantic section-like elements with class or id attributes
  const sectionRegex =
    /<(section|header|footer|nav|main|article|div)\b([^>]*?)>([\s\S]*?)(?=<\/\1>)/gi

  const processed = new Set<number>()
  let match: RegExpExecArray | null

  while ((match = sectionRegex.exec(html)) !== null) {
    const startIdx = match.index
    // Skip if we already processed a parent that contains this
    if ([...processed].some(idx => idx < startIdx && startIdx < idx + 5000)) continue

    const tagName = match[1].toLowerCase()
    const attrs = match[2] || ''
    const innerHtml = match[3] || ''

    // Skip tiny sections (likely wrappers)
    const textContent = stripTags(innerHtml)
    if (textContent.length < 30 && tagName === 'div') continue

    // Extract class and id
    const classMatch = attrs.match(/class=["']([^"']+)["']/i)
    const idMatch = attrs.match(/id=["']([^"']+)["']/i)
    const classStr = classMatch ? classMatch[1] : ''
    const idStr = idMatch ? idMatch[1] : ''
    const classIdCombined = `${classStr} ${idStr}`.toLowerCase()

    // Only process div elements if they have semantic class/id or are large
    if (tagName === 'div') {
      const hasSemantic = SECTION_KEYWORDS.some(([, pattern]) => pattern.test(classIdCombined))
      if (!hasSemantic && textContent.length < 200) continue
    }

    // Classify section type
    let sectionType: SectionType = 'unknown'
    let bestWeight = 0

    // Tag-based classification (weight 1)
    if (tagName === 'nav' || tagName === 'header') {
      if (/nav/i.test(tagName)) { sectionType = 'navbar'; bestWeight = 1 }
    }
    if (tagName === 'footer') { sectionType = 'footer'; bestWeight = 1 }

    // Class/id keyword matching (weight 3)
    for (const [type, pattern] of SECTION_KEYWORDS) {
      if (pattern.test(classIdCombined)) {
        if (3 > bestWeight) {
          sectionType = type
          bestWeight = 3
        }
        break
      }
    }

    // Content keyword matching (weight 2)
    if (bestWeight < 2) {
      const contentSlice = textContent.slice(0, 500)
      for (const [type, pattern] of CONTENT_KEYWORDS) {
        if (pattern.test(contentSlice)) {
          if (2 > bestWeight) {
            sectionType = type
            bestWeight = 2
          }
          break
        }
      }
    }

    // Structural heuristics (weight 1)
    if (bestWeight < 1) {
      const hasH1Tag = /<h1[\s>]/i.test(innerHtml)
      const hasForm = /<form[\s>]/i.test(innerHtml)
      const hasGrid = /grid|flex.*gap|col-/i.test(classStr)

      if (hasH1Tag && !hasH1) {
        sectionType = 'hero'
        bestWeight = 1
      } else if (hasForm) {
        sectionType = 'contact'
        bestWeight = 1
      } else if (hasGrid) {
        sectionType = 'features'
        bestWeight = 1
      }
    }

    // Position heuristic (weight 0.5 — only if still unknown)
    if (sectionType === 'unknown') {
      if (order === 0 && tagName !== 'div') sectionType = 'hero'
    }

    // Track H1 presence
    if (/<h1[\s>]/i.test(innerHtml)) hasH1 = true

    // Detect variant description
    const variant = detectVariant(sectionType, classStr, innerHtml)

    // Content flags
    const hasHeading = /<h[1-6][\s>]/i.test(innerHtml)
    const hasImage = /<img[\s>]/i.test(innerHtml)
    const hasFormTag = /<form[\s>]/i.test(innerHtml)
    const hasCta = /<(?:button|a)[^>]*(?:class="[^"]*(?:btn|button|cta)|role="button")/i.test(innerHtml)
    const itemCount = (innerHtml.match(/<(?:li|article)[^>]*>|class="[^"]*card/gi) || []).length

    processed.add(startIdx)

    sections.push({
      type: sectionType,
      variant,
      order: order++,
      layout: {
        columns: detectColumns(innerHtml),
        alignment: detectAlignment(classStr),
        background: detectBackground(classStr, innerHtml),
      },
      content: {
        hasHeading,
        hasImage,
        hasForm: hasFormTag,
        hasCta,
        itemCount,
      },
      htmlSnapshot: cleanSnapshot(innerHtml, 2000),
    })
  }

  return sections
}

/** Detect a descriptive variant string for a section. */
const detectVariant = (type: SectionType, classStr: string, html: string): string => {
  const parts: string[] = []

  // Layout direction
  if (/flex.*row|inline-flex|side-by-side/i.test(classStr)) parts.push('split')
  else if (/text-center|mx-auto/i.test(classStr)) parts.push('centered')

  // Image position
  if (/<img/i.test(html)) {
    const imgIdx = html.search(/<img/i)
    const headingIdx = html.search(/<h[1-3]/i)
    if (imgIdx >= 0 && headingIdx >= 0) {
      parts.push(imgIdx < headingIdx ? 'image-left' : 'image-right')
    }
  }

  // Column count
  const cols = detectColumns(html)
  if (cols > 1) parts.push(`${cols}-column`)

  // Grid
  if (/grid/i.test(classStr)) parts.push('grid')
  if (/masonry/i.test(classStr)) parts.push('masonry')

  if (parts.length === 0) {
    if (type === 'hero') return 'full-width'
    if (type === 'footer') return 'multi-column'
    return 'default'
  }

  return parts.join('-')
}
