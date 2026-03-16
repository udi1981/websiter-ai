/**
 * Phase 4 — Content Architecture Mapping
 *
 * Maps section order per page, extracts heading hierarchy,
 * detects CTA strategy, catalogs trust elements, analyzes forms,
 * classifies images by role, and detects basic content tone.
 */

import type {
  ContentArchitecture,
  PageContentMap,
  SectionType,
  CtaElement,
  TrustElement,
  FormInfo,
  CatalogImage,
  ImageRole,
  HeadingNode,
  ContentTone,
} from '../types/scanner'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PageInput = {
  url: string
  html: string
  path: string
}

type SectionData = {
  type: SectionType
  order: number
  [key: string]: unknown
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip HTML tags. */
const stripTags = (html: string): string =>
  html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

/** Extract attribute from tag string. */
const getAttr = (tag: string, attr: string): string => {
  const match = tag.match(new RegExp(`${attr}=["']([^"']*?)["']`, 'i'))
  return match ? match[1] : ''
}

// ---------------------------------------------------------------------------
// Heading extraction and validation
// ---------------------------------------------------------------------------

const extractHeadings = (html: string): { headings: HeadingNode[]; valid: boolean } => {
  const headings: HeadingNode[] = []
  const regex = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi
  let match: RegExpExecArray | null

  while ((match = regex.exec(html)) !== null) {
    const text = stripTags(match[2]).slice(0, 200)
    if (text) headings.push({ level: parseInt(match[1], 10), text, valid: true })
  }

  // Validate nesting
  let valid = true
  let lastLevel = 0
  for (const h of headings) {
    if (lastLevel === 0 && h.level !== 1) { h.valid = false; valid = false }
    else if (h.level > lastLevel + 1 && lastLevel > 0) { h.valid = false; valid = false }
    lastLevel = h.level
  }
  if (headings.filter(h => h.level === 1).length > 1) valid = false

  return { headings, valid }
}

// ---------------------------------------------------------------------------
// CTA Detection
// ---------------------------------------------------------------------------

const CTA_TEXT_PATTERNS =
  /get started|sign up|start|try|buy|order|subscribe|register|join|book|contact|learn more|free trial|download|demo|request|schedule|call|apply|explore|view|shop|add to cart|enroll|donate|claim|upgrade/i

const detectCtas = (html: string): CtaElement[] => {
  const ctas: CtaElement[] = []
  const seen = new Set<string>()

  // Find buttons and links with CTA text or CTA-like classes
  const regex = /<(?:a|button)\b([^>]*)>([\s\S]*?)<\/(?:a|button)>/gi
  let match: RegExpExecArray | null

  while ((match = regex.exec(html)) !== null) {
    const attrs = match[1]
    const text = stripTags(match[2]).slice(0, 80)
    if (!text) continue

    const classStr = getAttr(match[0], 'class')
    const href = getAttr(match[0], 'href')
    const isBtnClass = /btn|button|cta/i.test(classStr)
    const isCtaText = CTA_TEXT_PATTERNS.test(text)

    if (!isBtnClass && !isCtaText) continue

    const key = text.toLowerCase().trim()
    if (seen.has(key)) continue
    seen.add(key)

    // Determine placement from surrounding context
    const placement = detectCtaPlacement(match.index, html)

    // Determine priority from styling
    const priority = detectCtaPriority(classStr, attrs)

    ctas.push({ text, href, placement, priority })
  }

  return ctas
}

/** Detect CTA placement based on position in HTML. */
const detectCtaPlacement = (
  index: number,
  html: string,
): CtaElement['placement'] => {
  const before = html.slice(Math.max(0, index - 2000), index).toLowerCase()

  if (/hero|banner|masthead|jumbotron/i.test(before.slice(-500))) return 'hero'
  if (/<header|<nav/i.test(before.slice(-500))) return 'header'
  if (/<footer/i.test(before.slice(-1000))) return 'footer'

  // If near end of a section
  const afterSlice = html.slice(index, index + 500)
  if (/<\/section>|<\/div>\s*<\/section>/i.test(afterSlice.slice(0, 200))) return 'section-end'

  return 'inline'
}

/** Detect CTA priority from styling classes. */
const detectCtaPriority = (classStr: string, attrs: string): CtaElement['priority'] => {
  const c = classStr.toLowerCase()
  if (/primary|main|cta-primary|accent|bg-(?:blue|purple|green|indigo)/i.test(c)) return 'primary'
  if (/secondary|outline|bordered|ghost/i.test(c)) return 'secondary'
  if (/text-only|link|tertiary/i.test(c)) return 'tertiary'

  // Size-based: larger buttons are likely primary
  if (/lg|large|xl|px-8|py-4/i.test(c)) return 'primary'
  if (/sm|small|xs/i.test(c)) return 'tertiary'

  return 'secondary'
}

// ---------------------------------------------------------------------------
// Trust Element Detection
// ---------------------------------------------------------------------------

const detectTrustElements = (html: string): TrustElement[] => {
  const elements: TrustElement[] = []

  // Testimonials
  const testimonialCount = countPatterns(html, [
    /<blockquote/gi,
    /class=["'][^"']*testimonial/gi,
    /class=["'][^"']*review/gi,
    /class=["'][^"']*quote/gi,
  ])
  if (testimonialCount > 0) {
    elements.push({
      type: 'testimonial',
      count: testimonialCount,
      hasAvatar: /avatar|headshot|profile.*img|rounded-full/i.test(html),
      hasRating: /★|⭐|star|rating/i.test(html),
      hasCompany: /company|org|position|title|role/i.test(html),
    })
  }

  // Logo grids (client logos)
  const hasLogoGrid =
    /class=["'][^"']*(?:logo|client|partner|brand).*(?:grid|row|list|strip)/i.test(html) ||
    /class=["'][^"']*(?:grid|row|list|strip).*(?:logo|client|partner|brand)/i.test(html)
  if (hasLogoGrid) {
    const logoCount = (html.match(/<img[^>]*(?:logo|client|partner|brand)/gi) || []).length
    elements.push({
      type: 'logo-grid',
      count: Math.max(logoCount, 1),
      hasAvatar: false,
      hasRating: false,
      hasCompany: true,
    })
  }

  // Stats/counters
  const hasStats = /class=["'][^"']*(?:stat|counter|number|metric|achievement)/i.test(html)
  if (hasStats) {
    const statCount = (html.match(/(?:stat|counter|metric|number)[^"']*["'][^>]*>[\s\S]*?\d+/gi) || []).length
    elements.push({
      type: 'stat',
      count: Math.max(statCount, 1),
      hasAvatar: false,
      hasRating: false,
      hasCompany: false,
    })
  }

  // Certifications/badges
  const hasCerts = /certification|certified|accredit|award|badge.*(?:trust|secure|verify)/i.test(html)
  if (hasCerts) {
    elements.push({
      type: 'certification',
      count: 1,
      hasAvatar: false,
      hasRating: false,
      hasCompany: false,
    })
  }

  // Ratings
  const hasRatings = /(?:4|5)\.?\d?\s*(?:\/\s*5|stars?|out\s+of\s+5)/i.test(html)
  if (hasRatings && !elements.some(e => e.type === 'testimonial')) {
    elements.push({
      type: 'rating',
      count: 1,
      hasAvatar: false,
      hasRating: true,
      hasCompany: false,
    })
  }

  return elements
}

/** Count total matches across multiple patterns. */
const countPatterns = (html: string, patterns: RegExp[]): number => {
  let total = 0
  for (const p of patterns) {
    total += (html.match(p) || []).length
  }
  return total
}

// ---------------------------------------------------------------------------
// Form Analysis
// ---------------------------------------------------------------------------

const analyzeForms = (html: string): FormInfo[] => {
  const forms: FormInfo[] = []
  const formRegex = /<form\b([^>]*)>([\s\S]*?)<\/form>/gi
  let match: RegExpExecArray | null

  while ((match = formRegex.exec(html)) !== null) {
    const inner = match[2] || ''
    const action = getAttr(match[0], 'action')

    // Classify purpose
    let purpose: FormInfo['purpose'] = 'unknown'
    if (/login|sign-?in/i.test(inner)) purpose = 'login'
    else if (/register|sign-?up|create.*account/i.test(inner)) purpose = 'signup'
    else if (/search/i.test(inner) || getAttr(match[0], 'role') === 'search') purpose = 'search'
    else if (/newsletter|subscribe/i.test(inner)) purpose = 'newsletter'
    else if (/contact|message|enquir/i.test(inner)) purpose = 'contact'
    else if (/checkout|payment|billing/i.test(inner)) purpose = 'checkout'
    else if (/feedback|survey/i.test(inner)) purpose = 'feedback'

    // Extract fields
    const fields: FormInfo['fields'] = []
    const inputRegex = /<(?:input|textarea|select)\b([^>]*)>/gi
    let inputMatch: RegExpExecArray | null
    while ((inputMatch = inputRegex.exec(inner)) !== null) {
      const inputType = getAttr(inputMatch[0], 'type') || 'text'
      if (inputType === 'hidden' || inputType === 'submit') continue

      const name = getAttr(inputMatch[0], 'name')
      const placeholder = getAttr(inputMatch[0], 'placeholder')
      const label = name || placeholder || inputType
      const required = /required/i.test(inputMatch[1])

      fields.push({ type: inputType, label, required })
    }

    const hasSubmitButton =
      /<button[^>]*type=["']submit["']/i.test(inner) ||
      /<input[^>]*type=["']submit["']/i.test(inner) ||
      /<button/i.test(inner)

    forms.push({ purpose, fields, hasSubmitButton, action })
  }

  return forms
}

// ---------------------------------------------------------------------------
// Image Catalog
// ---------------------------------------------------------------------------

const catalogImages = (html: string, pagePath: string): CatalogImage[] => {
  const images: CatalogImage[] = []
  const imgRegex = /<img\b([^>]*)>/gi
  let match: RegExpExecArray | null

  while ((match = imgRegex.exec(html)) !== null) {
    const tag = match[0]
    const src = getAttr(tag, 'src')
    if (!src) continue

    const alt = getAttr(tag, 'alt')
    const width = parseInt(getAttr(tag, 'width'), 10) || 0
    const height = parseInt(getAttr(tag, 'height'), 10) || 0

    const role = classifyImageRole(tag, src, width, height, match.index, html)

    images.push({ src, alt, role, width, height, page: pagePath })
  }

  return images
}

/** Classify image role from tag, source, dimensions, and context. */
const classifyImageRole = (
  tag: string,
  src: string,
  width: number,
  height: number,
  index: number,
  html: string,
): ImageRole => {
  const combined = (tag + ' ' + src).toLowerCase()

  if (/logo/i.test(combined)) return 'logo'
  if (/avatar|profile|headshot/i.test(combined)) return 'avatar'
  if (/hero|banner/i.test(combined)) return 'hero'
  if (/product/i.test(combined)) return 'product'
  if (/gallery|portfolio/i.test(combined)) return 'gallery'
  if (/background|bg/i.test(combined)) return 'background'
  if (/icon|svg|sprite/i.test(combined)) return 'icon'
  if (/decorat|ornament|divider/i.test(combined)) return 'decorative'

  // Size-based heuristics
  if (width > 0 && width <= 32 && height > 0 && height <= 32) return 'icon'
  if (width > 0 && width <= 80 && height > 0 && height <= 80 && Math.abs(width - height) < 10) return 'avatar'

  // Context-based: check what section it's in
  const before = html.slice(Math.max(0, index - 1000), index).toLowerCase()
  if (/hero|banner|masthead/i.test(before.slice(-300))) return 'hero'
  if (/gallery|portfolio/i.test(before.slice(-300))) return 'gallery'
  if (/card|feature|service/i.test(before.slice(-200))) return 'card'

  return 'unknown'
}

// ---------------------------------------------------------------------------
// Content Tone Detection (basic)
// ---------------------------------------------------------------------------

const detectContentTone = (html: string): ContentTone => {
  // Get plain text
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 10000)

  // Formality detection
  const formalWords = (text.match(/\b(?:furthermore|moreover|consequently|nevertheless|henceforth|hereby|pursuant|therefore|accordingly|notwithstanding)\b/gi) || []).length
  const casualWords = (text.match(/\b(?:hey|awesome|cool|amazing|wow|super|gonna|wanna|gotta|y'all|folks)\b/gi) || []).length
  let formality: ContentTone['formality'] = 'neutral'
  if (formalWords > casualWords + 2) formality = 'formal'
  else if (casualWords > formalWords + 2) formality = 'casual'

  // Perspective detection
  const firstPerson = (text.match(/\b(?:we|our|us|I|my)\b/gi) || []).length
  const secondPerson = (text.match(/\b(?:you|your|you're|yours)\b/gi) || []).length
  const thirdPerson = (text.match(/\b(?:they|their|he|she|it|the company|the team)\b/gi) || []).length

  let perspective: ContentTone['perspective'] = 'mixed'
  const maxCount = Math.max(firstPerson, secondPerson, thirdPerson)
  if (maxCount === firstPerson && firstPerson > secondPerson * 1.5) perspective = 'first-person'
  else if (maxCount === secondPerson && secondPerson > firstPerson * 1.5) perspective = 'second-person'
  else if (maxCount === thirdPerson && thirdPerson > firstPerson * 1.5) perspective = 'third-person'

  // Average sentence length
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5)
  const totalWords = sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0)
  const avgSentenceLength = sentences.length > 0 ? Math.round(totalWords / sentences.length) : 0

  return { formality, perspective, avgSentenceLength }
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

/**
 * Extract the complete content architecture from all crawled pages.
 *
 * Maps section order, heading hierarchy, CTAs, trust elements,
 * forms, images, and content tone for the entire site.
 *
 * @param pages - Array of crawled pages with URL, HTML, and path
 * @param sections - Section data from Phase 3
 * @returns Complete content architecture analysis
 */
export const extractContentArchitecture = async (
  pages: PageInput[],
  sections: SectionData[],
): Promise<ContentArchitecture> => {
  const pageResults: PageContentMap[] = []
  const allCtas: CtaElement[] = []
  const allTrust: TrustElement[] = []
  let totalForms = 0
  let totalImages = 0

  // Build section order map from Phase 3 data
  const sectionsByPage = new Map<string, SectionType[]>()
  for (const section of sections) {
    // Group by approximate page (use order to determine)
    const key = 'all'
    const existing = sectionsByPage.get(key) || []
    existing.push(section.type)
    sectionsByPage.set(key, existing)
  }

  for (const page of pages) {
    const cleanHtml = page.html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')

    // Headings
    const { headings, valid: headingHierarchyValid } = extractHeadings(cleanHtml)

    // Section order for this page
    const sectionOrder = sectionsByPage.get('all') || []

    // CTAs
    const ctas = detectCtas(cleanHtml)
    allCtas.push(...ctas)

    // Trust elements
    const trustElements = detectTrustElements(cleanHtml)
    allTrust.push(...trustElements)

    // Forms
    const forms = analyzeForms(cleanHtml)
    totalForms += forms.length

    // Images
    const images = catalogImages(cleanHtml, page.path)
    totalImages += images.length

    pageResults.push({
      pagePath: page.path,
      sectionOrder,
      headings,
      headingHierarchyValid,
      ctas,
      trustElements,
      forms,
      images,
    })
  }

  // Deduplicate global CTAs
  const globalCtaMap = new Map<string, CtaElement>()
  for (const cta of allCtas) {
    const key = cta.text.toLowerCase().trim()
    if (!globalCtaMap.has(key)) globalCtaMap.set(key, cta)
  }

  // Deduplicate global trust elements
  const globalTrustMap = new Map<string, TrustElement>()
  for (const trust of allTrust) {
    const existing = globalTrustMap.get(trust.type)
    if (!existing || trust.count > existing.count) {
      globalTrustMap.set(trust.type, trust)
    }
  }

  // Content tone (aggregate across all pages)
  const allHtml = pages.map(p => p.html).join('\n')
  const tone = detectContentTone(allHtml)

  return {
    pages: pageResults,
    globalCtas: [...globalCtaMap.values()],
    globalTrustElements: [...globalTrustMap.values()],
    totalForms,
    totalImages,
    tone,
  }
}
