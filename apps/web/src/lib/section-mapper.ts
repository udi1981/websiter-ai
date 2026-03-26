/**
 * Section Mapper — Maps source page sections to redesign sections
 *
 * Takes detected sections from the scanner's component library (Phase 3)
 * and maps them to section-composer generator variants, preserving
 * the original content (text, images, CTAs) while applying new design.
 *
 * This is the key piece that makes "redesign" different from "regenerate":
 * - Source section order is preserved
 * - Source content (headings, text, images) flows into new generators
 * - Only the VISUAL treatment changes, not the content
 */

import type { SectionCategory } from '@ubuilder/types'

// ─── Types ──────────────────────────────────────────────────────────

export type DetectedSection = {
  type: string
  variant: string
  order: number
  layout: {
    columns: number
    alignment: string
    background: string
  }
  content: {
    hasHeading: boolean
    hasImage: boolean
    hasForm: boolean
    hasCta: boolean
    itemCount: number
  }
  htmlSnapshot: string
  /** URL of the page this section came from */
  pageUrl?: string
}

export type MappedSection = {
  /** Section category for composer */
  category: SectionCategory
  /** Variant ID for the generator */
  variantId: string
  /** Extracted content from source section */
  extractedContent: Record<string, unknown>
  /** Original section order */
  order: number
  /** Source section type for debugging */
  sourceType: string
  /** Source variant for debugging */
  sourceVariant: string
}

// ─── Source Type → Generator Variant Mapping ────────────────────────

const TYPE_TO_VARIANT: Record<string, { category: SectionCategory; variantId: string }> = {
  'navbar': { category: 'navbar', variantId: 'navbar-floating' },
  'hero': { category: 'hero', variantId: 'hero-family-warm' },
  'features': { category: 'features', variantId: 'features-bento-grid' },
  'services': { category: 'features', variantId: 'features-icon-grid' },
  'about': { category: 'about', variantId: 'about-story-timeline' },
  'testimonials': { category: 'testimonials', variantId: 'testimonials-premium' },
  'pricing': { category: 'pricing', variantId: 'pricing-premium-showcase' },
  'products': { category: 'gallery', variantId: 'gallery-masonry' },
  'faq': { category: 'faq', variantId: 'faq-accordion' },
  'contact': { category: 'contact', variantId: 'contact-split-form' },
  'footer': { category: 'footer', variantId: 'footer-multi-column' },
  'gallery': { category: 'gallery', variantId: 'gallery-carousel' },
  'portfolio': { category: 'portfolio', variantId: 'portfolio-hover-cards' },
  'team': { category: 'team', variantId: 'team-cards' },
  'stats': { category: 'stats', variantId: 'stats-counters' },
  'cta': { category: 'cta', variantId: 'cta-premium-close' },
  'blog': { category: 'blog', variantId: 'blog-card-grid' },
  'newsletter': { category: 'newsletter', variantId: 'newsletter-inline' },
  'unknown': { category: 'features', variantId: 'features-icon-grid' },
}

// ─── Content Extraction from HTML Snapshot ───────────────────────────

/** Extract structured content from a section's HTML snapshot */
const extractContentFromSnapshot = (snapshot: string, sectionType: string): Record<string, unknown> => {
  const content: Record<string, unknown> = {}

  // Extract headings
  const h1Match = snapshot.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  const h2Match = snapshot.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)
  const h3Matches = [...snapshot.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)]

  const headline = stripTags(h1Match?.[1] || h2Match?.[1] || '').trim()
  if (headline && headline.length > 2) {
    content.headline = headline
    content.title = headline
  }

  // Extract subtitle (first p after heading, or second heading)
  const pMatches = [...snapshot.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
  const firstP = pMatches[0] ? stripTags(pMatches[0][1]).trim() : ''
  if (firstP && firstP.length > 10) {
    content.subheadline = firstP
    content.subtitle = firstP
  }

  // Extract images
  const imgMatches = [...snapshot.matchAll(/<img[^>]*src=["']([^"']+)["'][^>]*/gi)]
  const images = imgMatches
    .map(m => {
      const src = m[1]
      const alt = (m[0].match(/alt=["']([^"']*)["']/i) || [])[1] || ''
      return { src, alt }
    })
    .filter(i => !i.src.startsWith('data:image/svg') && !i.src.includes('pixel') && !i.src.includes('spacer'))

  if (images.length > 0) {
    content.imageUrl = images[0].src
    content.images = images
  }

  // Extract links/CTAs
  const linkMatches = [...snapshot.matchAll(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
  const ctaLinks = linkMatches
    .filter(m => /btn|button|cta|primary/i.test(m[0]))
    .map(m => ({ href: m[1], text: stripTags(m[2]).trim() }))
    .filter(l => l.text.length > 1 && l.text.length < 50)

  if (ctaLinks.length > 0) {
    content.ctaText = ctaLinks[0].text
    content.ctaLink = ctaLinks[0].href
  }

  // Extract list items (for features, FAQ, etc.)
  const liMatches = [...snapshot.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
  if (liMatches.length >= 2) {
    content.listItems = liMatches
      .map(m => stripTags(m[1]).trim())
      .filter(t => t.length > 3)
      .slice(0, 12)
  }

  // Type-specific extraction
  switch (sectionType) {
    case 'faq': {
      // Extract Q&A pairs from h3 + p patterns
      const faqs: { question: string; answer: string }[] = []
      for (let i = 0; i < h3Matches.length; i++) {
        const question = stripTags(h3Matches[i][1]).trim()
        const answer = pMatches[i + 1] ? stripTags(pMatches[i + 1][1]).trim() : ''
        if (question.length > 5) {
          faqs.push({ question, answer })
        }
      }
      if (faqs.length > 0) {
        content.items = faqs.map(f => ({
          title: f.question,
          question: f.question,
          description: f.answer,
          answer: f.answer,
        }))
      }
      break
    }

    case 'features':
    case 'services': {
      // Extract feature items from repeated card/item patterns
      if (h3Matches.length >= 2) {
        content.items = h3Matches.slice(0, 6).map((m, i) => ({
          title: stripTags(m[1]).trim(),
          description: pMatches[i] ? stripTags(pMatches[i][1]).trim() : '',
          icon: '✦',
        }))
      }
      break
    }

    case 'testimonials': {
      // Extract quotes
      const quoteMatches = [...snapshot.matchAll(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi)]
      if (quoteMatches.length > 0) {
        content.items = quoteMatches.slice(0, 4).map(m => ({
          quote: stripTags(m[1]).trim(),
          author: '',
          role: '',
          rating: 5,
        }))
      }
      break
    }

    case 'pricing':
    case 'products': {
      // Extract product cards
      if (h3Matches.length >= 2) {
        content.items = h3Matches.slice(0, 4).map((m, i) => {
          const name = stripTags(m[1]).trim()
          const desc = pMatches[i] ? stripTags(pMatches[i][1]).trim() : ''
          const img = images[i]?.src || ''
          return { name, title: name, description: desc, image: img }
        })
      }
      break
    }

    case 'gallery': {
      if (images.length >= 2) {
        content.items = images.slice(0, 8).map(img => ({
          title: img.alt || '',
          image: img.src,
          description: '',
        }))
      }
      break
    }

    case 'stats': {
      // Look for number + label patterns
      const statMatches = [...snapshot.matchAll(/(\d[\d,]*\+?%?)\s*(?:<[^>]+>\s*)*([^<]{3,30})/g)]
      if (statMatches.length >= 2) {
        content.stats = statMatches.slice(0, 4).map(m => ({
          value: m[1].trim(),
          label: m[2].trim(),
        }))
      }
      break
    }

    case 'navbar': {
      // Extract nav links
      const navLinks = linkMatches
        .map(m => ({ label: stripTags(m[2]).trim(), href: m[1] }))
        .filter(l => l.label.length > 1 && l.label.length < 40 && !l.href.startsWith('javascript'))
      if (navLinks.length > 0) {
        content.links = navLinks.slice(0, 10)
      }
      break
    }

    case 'footer': {
      // Extract footer links grouped by columns
      content.items = linkMatches
        .map(m => ({
          text: stripTags(m[2]).trim(),
          href: m[1],
        }))
        .filter(l => l.text.length > 1 && l.text.length < 50)
        .slice(0, 20)
      break
    }
  }

  // Extract all paragraphs as description/body
  const allText = pMatches
    .map(m => stripTags(m[1]).trim())
    .filter(t => t.length > 20)
    .slice(0, 5)
  if (allText.length > 0) {
    content.paragraphs = allText
    if (!content.subheadline) {
      content.subheadline = allText[0]
      content.subtitle = allText[0]
    }
  }

  return content
}

// ─── Main Mapper ────────────────────────────────────────────────────

/**
 * Map detected sections from source page to redesign sections.
 *
 * Preserves: section order, content (text, images, CTAs)
 * Changes: visual treatment (variant, design system)
 *
 * @param detectedSections - Sections from scanner's component library
 * @param pageUrl - URL of the source page (for filtering)
 * @returns Array of mapped sections ready for composePage()
 */
export const mapSourceSectionsToRedesign = (
  detectedSections: DetectedSection[],
  pageUrl?: string,
): MappedSection[] => {
  // Filter to sections from this specific page if pageUrl provided
  const pageSections = pageUrl
    ? detectedSections.filter(s => s.pageUrl === pageUrl || !s.pageUrl)
    : detectedSections

  // Sort by original order
  const sorted = [...pageSections].sort((a, b) => a.order - b.order)

  // Map each source section to a redesign section
  const mapped: MappedSection[] = []
  const seenTypes = new Set<string>()

  for (const section of sorted) {
    const sourceType = section.type || 'unknown'

    // Skip duplicate section types (e.g., two hero sections)
    // Exception: features/products/gallery can appear multiple times
    if (seenTypes.has(sourceType) && !['features', 'products', 'gallery', 'unknown'].includes(sourceType)) {
      continue
    }
    seenTypes.add(sourceType)

    // Find the best generator variant for this source section type
    const mapping = TYPE_TO_VARIANT[sourceType] || TYPE_TO_VARIANT['unknown']

    // Extract content from the HTML snapshot
    const extractedContent = extractContentFromSnapshot(section.htmlSnapshot, sourceType)

    mapped.push({
      category: mapping.category,
      variantId: mapping.variantId,
      extractedContent,
      order: section.order,
      sourceType,
      sourceVariant: section.variant,
    })
  }

  return mapped
}

/**
 * Build PageSection[] from mapped sections, ready for composePage().
 * Merges extracted content with design system globals.
 */
export const buildSectionsFromMapping = (
  mapped: MappedSection[],
  globals: {
    businessName: string
    locale: string
    ctaText?: string
    ctaLink?: string
    logoUrl?: string
  },
): { category: SectionCategory; variantId: string; content: Record<string, unknown> }[] => {
  return mapped.map(m => ({
    category: m.category,
    variantId: m.variantId,
    content: {
      ...m.extractedContent,
      businessName: globals.businessName,
      brand: globals.businessName,
      locale: globals.locale,
      // Don't override extracted CTA with generic if source has one
      ctaText: m.extractedContent.ctaText || globals.ctaText || '',
      ctaLink: m.extractedContent.ctaLink || globals.ctaLink || '#',
      logoUrl: globals.logoUrl,
    },
  }))
}

// ─── Helpers ────────────────────────────────────────────────────────

const stripTags = (html: string): string =>
  html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, ' ').replace(/\s+/g, ' ')
