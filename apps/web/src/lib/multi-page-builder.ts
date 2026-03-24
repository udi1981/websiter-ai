/**
 * Multi-Page Builder — V1
 *
 * Generates 3-5 pages per site with shared design system.
 * Preserve-first: source content is truth, redesign is presentation layer.
 *
 * Page selection priority (deterministic):
 *   1. homepage (always)
 *   2. product-listing / collection
 *   3. about
 *   4. contact
 *   5. blog-index
 *
 * Fallback: if redesign fails for any page, wrap raw content
 * with shared navbar/footer + design tokens.
 */

import type { SectionPalette, SectionFonts, PageSection, SectionCategory } from '@ubuilder/types'
import { prefixedId } from '@ubuilder/utils'
import { composePage } from './section-composer'

// ─── Types ──────────────────────────────────────────────────────────

export type PageType = 'homepage' | 'product-listing' | 'about' | 'contact' | 'blog-index'

export type PageInventoryItem = {
  pageType: PageType
  path: string
  title: string
  sourceUrl: string
  sourceHtml?: string
  contentSummary?: string
  products?: Record<string, unknown>[]
  blogArticles?: Record<string, unknown>[]
}

export type PageMetadata = {
  id: string
  siteId: string
  pageType: PageType
  title: string
  slug: string
  path: string
  order: number
  sectionCount: number
  byteSize: number
  generatedAt: string
  source: 'redesign' | 'fallback'
}

export type GlobalDesignSystem = {
  palette: SectionPalette
  fonts: SectionFonts
  siteName: string
  locale: 'en' | 'he'
  navLinks: { label: string; href: string }[]
  footerColumns: { title: string; links: { label: string; href: string }[] }[]
  ctaText: string
  ctaLink: string
  logoUrl?: string
  contactInfo?: { phone?: string; email?: string; address?: string }
}

export type MultiPageResult = {
  pages: {
    metadata: PageMetadata
    html: string
  }[]
  designSystem: GlobalDesignSystem
}

// ─── Page Inventory Builder ─────────────────────────────────────────

/** V1 page type priority — deterministic selection */
const PAGE_TYPE_PRIORITY: PageType[] = [
  'homepage',
  'product-listing',
  'about',
  'contact',
  'blog-index',
]

/** Map scanner page types to V1 page types */
const SCANNER_TYPE_MAP: Record<string, PageType> = {
  'homepage': 'homepage',
  'product-listing': 'product-listing',
  'product-detail': 'product-listing', // Promote to listing in V1
  'about': 'about',
  'contact': 'contact',
  'blog-index': 'blog-index',
  'blog-post': 'blog-index', // Promote to index in V1
  'services': 'about', // Treat as about-like
  'service-detail': 'about',
  'faq': 'about',
  'team': 'about',
  'testimonials': 'about',
  'pricing': 'product-listing',
  'portfolio': 'product-listing',
}

/** Detect page type from path/title heuristics when scanner type is 'custom' */
const inferPageType = (path: string, title: string): PageType | null => {
  const p = path.toLowerCase()
  const t = title.toLowerCase()

  if (p === '/' || p === '') return 'homepage'

  // Product/catalog patterns
  if (/product|collection|catalog|shop|store|מוצר|קטלוג|חנות/.test(p + t)) return 'product-listing'
  if (/mewatch-|watch-|phone-|tablet-|שעון|טלפון|טאבלט/.test(p + t)) return 'product-listing'

  // About patterns
  if (/about|אודות|who-we-are|our-story|team|צוות/.test(p + t)) return 'about'

  // Contact patterns
  if (/contact|צור-קשר|יצירת-קשר|support|תמיכה/.test(p + t)) return 'contact'

  // Blog patterns
  if (/blog|news|articles|מאמר|חדשות|בלוג/.test(p + t)) return 'blog-index'

  return null
}

/** Build page inventory from scan data — selects up to 5 pages deterministically */
export const buildPageInventory = (
  scanResult: Record<string, unknown>,
  contentCatalog?: Record<string, unknown>,
  sourceContentModel?: Record<string, unknown>,
): PageInventoryItem[] => {
  const siteMap = scanResult.siteMap as Record<string, unknown>
  const pages = (siteMap?.pages as Record<string, unknown>[]) || []
  const baseUrl = (scanResult.url as string) || ''

  // Classify all scanned pages
  const classified: { page: Record<string, unknown>; type: PageType }[] = []

  for (const page of pages) {
    const scannerType = page.pageType as string
    const path = (page.path as string) || '/'
    const title = (page.title as string) || ''

    // Try scanner classification first, then heuristic inference
    let pageType = SCANNER_TYPE_MAP[scannerType] || inferPageType(path, title)
    if (!pageType && path === '/') pageType = 'homepage'
    if (!pageType) continue // Skip unclassifiable pages

    classified.push({ page, type: pageType })
  }

  // Select one page per type, in priority order
  const inventory: PageInventoryItem[] = []
  const selectedTypes = new Set<PageType>()

  for (const targetType of PAGE_TYPE_PRIORITY) {
    if (selectedTypes.has(targetType)) continue

    const candidates = classified.filter(c => c.type === targetType)
    if (candidates.length === 0) continue

    // Pick the best candidate: prefer homepage for /, longest content otherwise
    const best = candidates.sort((a, b) => {
      const aLen = (a.page.contentLength as number) || 0
      const bLen = (b.page.contentLength as number) || 0
      return bLen - aLen
    })[0]

    const path = (best.page.path as string) || '/'
    const title = (best.page.title as string) || ''

    const item: PageInventoryItem = {
      pageType: targetType,
      path,
      title: cleanPageTitle(title),
      sourceUrl: path === '/' ? baseUrl : `${baseUrl}${path}`,
    }

    // Attach products for product-listing pages
    if (targetType === 'product-listing' && contentCatalog) {
      item.products = (contentCatalog.products as Record<string, unknown>[]) || []
    }

    inventory.push(item)
    selectedTypes.add(targetType)
  }

  // Always ensure homepage is first
  inventory.sort((a, b) => {
    const aIdx = PAGE_TYPE_PRIORITY.indexOf(a.pageType)
    const bIdx = PAGE_TYPE_PRIORITY.indexOf(b.pageType)
    return aIdx - bIdx
  })

  return inventory
}

/** Clean page title — remove SEO suffix, truncate */
const cleanPageTitle = (title: string): string => {
  // Remove common SEO suffixes like "| MeWatch" or "- Brand Name"
  const cleaned = title
    .replace(/\s*[|–—-]\s*[^|–—-]+$/, '')
    .replace(/&ndash;.*$/, '')
    .trim()
  return cleaned.length > 60 ? cleaned.slice(0, 57) + '...' : cleaned
}

// ─── Global Design System Builder ───────────────────────────────────

/** Build a global design system from pipeline outputs */
export const buildGlobalDesignSystem = (params: {
  palette: SectionPalette
  fonts: SectionFonts
  siteName: string
  locale: 'en' | 'he'
  pageInventory: PageInventoryItem[]
  scanNav?: Record<string, unknown>[]
  scanFooter?: Record<string, unknown>[]
  ctaText?: string
  logoUrl?: string
  contactInfo?: { phone?: string; email?: string; address?: string }
}): GlobalDesignSystem => {
  // Build nav links from page inventory + scan nav
  const navLinks: { label: string; href: string }[] = []

  // Add inventory pages as nav links
  for (const page of params.pageInventory) {
    if (page.pageType === 'homepage') continue // Homepage is logo click
    navLinks.push({
      label: pageTypeToNavLabel(page.pageType, params.locale),
      href: page.path,
    })
  }

  // Add scan nav items that aren't already covered
  if (params.scanNav) {
    const existingHrefs = new Set(navLinks.map(l => l.href))
    for (const item of params.scanNav.slice(0, 8)) {
      const val = (item as Record<string, unknown>).value as Record<string, unknown>
      const href = (val?.href as string) || ''
      const text = (val?.text as string) || ''
      if (href && text && !existingHrefs.has(href)) {
        navLinks.push({ label: text, href })
        existingHrefs.add(href)
      }
    }
  }

  // Build footer columns
  const footerColumns: { title: string; links: { label: string; href: string }[] }[] = []

  if (params.scanFooter && params.scanFooter.length > 0) {
    for (const col of params.scanFooter.slice(0, 4)) {
      const val = (col as Record<string, unknown>).value as Record<string, unknown>
      if (!val) continue
      const colTitle = (val.title as string) || ''
      const links = ((val.links as Record<string, unknown>[]) || []).map(l => ({
        label: (l.text as string) || '',
        href: (l.href as string) || '#',
      }))
      if (colTitle || links.length > 0) {
        footerColumns.push({ title: colTitle, links })
      }
    }
  }

  // Default footer if none from scan
  if (footerColumns.length === 0) {
    footerColumns.push({
      title: params.locale === 'he' ? 'ניווט' : 'Navigation',
      links: navLinks.slice(0, 5),
    })
  }

  return {
    palette: params.palette,
    fonts: params.fonts,
    siteName: params.siteName,
    locale: params.locale,
    navLinks,
    footerColumns,
    ctaText: params.ctaText || (params.locale === 'he' ? 'צרו קשר' : 'Get Started'),
    ctaLink: '#contact',
    logoUrl: params.logoUrl,
    contactInfo: params.contactInfo,
  }
}

const pageTypeToNavLabel = (type: PageType, locale: string): string => {
  const labels: Record<PageType, { he: string; en: string }> = {
    'homepage': { he: 'בית', en: 'Home' },
    'product-listing': { he: 'מוצרים', en: 'Products' },
    'about': { he: 'אודות', en: 'About' },
    'contact': { he: 'צור קשר', en: 'Contact' },
    'blog-index': { he: 'בלוג', en: 'Blog' },
  }
  return locale === 'he' ? labels[type].he : labels[type].en
}

// ─── Per-Page Section Templates ─────────────────────────────────────

/** Section template per page type — defines what sections each page gets */
const PAGE_SECTION_TEMPLATES: Record<PageType, { category: SectionCategory; variantId: string }[]> = {
  'homepage': [
    // Homepage uses the full premium section set from the existing pipeline
    // This template is a fallback only — homepage normally uses AI-designed sections
    { category: 'navbar', variantId: 'navbar-floating' },
    { category: 'hero', variantId: 'hero-family-warm' },
    { category: 'features', variantId: 'features-bento-grid' },
    { category: 'pricing', variantId: 'pricing-premium-showcase' },
    { category: 'testimonials', variantId: 'testimonials-premium' },
    { category: 'faq', variantId: 'faq-accordion' },
    { category: 'cta', variantId: 'cta-premium-close' },
    { category: 'contact', variantId: 'contact-split-form' },
    { category: 'footer', variantId: 'footer-multi-column' },
  ],
  'product-listing': [
    { category: 'navbar', variantId: 'navbar-floating' },
    { category: 'hero', variantId: 'hero-minimal-text' },
    { category: 'gallery', variantId: 'gallery-masonry' },
    { category: 'pricing', variantId: 'pricing-premium-showcase' },
    { category: 'cta', variantId: 'cta-premium-close' },
    { category: 'footer', variantId: 'footer-multi-column' },
  ],
  'about': [
    { category: 'navbar', variantId: 'navbar-floating' },
    { category: 'hero', variantId: 'hero-minimal-text' },
    { category: 'about', variantId: 'about-story-timeline' },
    { category: 'team', variantId: 'team-cards' },
    { category: 'stats', variantId: 'stats-counters' },
    { category: 'cta', variantId: 'cta-premium-close' },
    { category: 'footer', variantId: 'footer-multi-column' },
  ],
  'contact': [
    { category: 'navbar', variantId: 'navbar-floating' },
    { category: 'hero', variantId: 'hero-minimal-text' },
    { category: 'contact', variantId: 'contact-split-form' },
    { category: 'faq', variantId: 'faq-accordion' },
    { category: 'footer', variantId: 'footer-multi-column' },
  ],
  'blog-index': [
    { category: 'navbar', variantId: 'navbar-floating' },
    { category: 'hero', variantId: 'hero-minimal-text' },
    { category: 'blog', variantId: 'blog-card-grid' },
    { category: 'newsletter', variantId: 'newsletter-inline' },
    { category: 'footer', variantId: 'footer-multi-column' },
  ],
}

// ─── Per-Page Composer ──────────────────────────────────────────────

/** Compose a single inner page using shared design system + page template */
export const composeInnerPage = (
  page: PageInventoryItem,
  designSystem: GlobalDesignSystem,
  homepageSections?: Record<string, unknown>[],
): { html: string; metadata: PageMetadata; source: 'redesign' | 'fallback' } => {
  const pageId = prefixedId('page')
  const template = PAGE_SECTION_TEMPLATES[page.pageType] || PAGE_SECTION_TEMPLATES.about

  try {
    // Build sections with shared design system
    const sections: PageSection[] = template.map((t, i) => {
      const content = buildSectionContent(t.category, page, designSystem, homepageSections)
      return {
        id: `${pageId}-s${i}`,
        category: t.category,
        variantId: t.variantId,
        order: i,
        content,
        images: {},
      }
    })

    const html = composePage({
      id: pageId,
      siteName: designSystem.siteName,
      locale: designSystem.locale,
      palette: designSystem.palette,
      fonts: designSystem.fonts,
      sections,
    })

    return {
      html,
      metadata: {
        id: pageId,
        siteId: '', // Filled by caller
        pageType: page.pageType,
        title: page.title,
        slug: pageTypeToSlug(page.pageType),
        path: pageTypeToSlug(page.pageType),
        order: PAGE_TYPE_PRIORITY.indexOf(page.pageType),
        sectionCount: sections.length,
        byteSize: Buffer.byteLength(html, 'utf8'),
        generatedAt: new Date().toISOString(),
        source: 'redesign',
      },
      source: 'redesign',
    }
  } catch (err) {
    console.error(`[multi-page] Redesign failed for ${page.pageType}, using fallback:`, err)
    return composeFallbackPage(page, designSystem)
  }
}

/** Fallback: wrap raw content with shared navbar/footer + design tokens */
const composeFallbackPage = (
  page: PageInventoryItem,
  ds: GlobalDesignSystem,
): { html: string; metadata: PageMetadata; source: 'fallback' } => {
  const pageId = prefixedId('page')

  // Minimal page with shared chrome
  const navLinksHtml = ds.navLinks.map(l =>
    `<a href="${l.href}" style="color:${ds.palette.textMuted};text-decoration:none;font-size:0.9rem;transition:color 0.3s" onmouseenter="this.style.color='${ds.palette.primary}'" onmouseleave="this.style.color='${ds.palette.textMuted}'">${l.label}</a>`
  ).join('')

  const html = `<!DOCTYPE html>
<html lang="${ds.locale}" dir="${ds.locale === 'he' ? 'rtl' : 'ltr'}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${page.title} | ${ds.siteName}</title>
<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(ds.fonts.heading)}:wght@400;700&family=${encodeURIComponent(ds.fonts.body)}:wght@400;500&display=swap" rel="stylesheet">
</head>
<body style="margin:0;background:${ds.palette.background};color:${ds.palette.text};font-family:'${ds.fonts.body}',sans-serif">
<nav style="position:sticky;top:0;z-index:100;background:${ds.palette.background};border-bottom:1px solid ${ds.palette.border};padding:16px 24px;display:flex;align-items:center;justify-content:space-between;backdrop-filter:blur(10px)">
  <a href="/" style="font-family:'${ds.fonts.heading}',sans-serif;font-weight:700;font-size:1.2rem;color:${ds.palette.text};text-decoration:none">${ds.siteName}</a>
  <div style="display:flex;gap:24px;align-items:center">${navLinksHtml}</div>
</nav>
<main style="max-width:1200px;margin:0 auto;padding:clamp(2rem,4vw,4rem) 24px;min-height:60vh">
  <h1 style="font-family:'${ds.fonts.heading}',sans-serif;font-weight:700;font-size:clamp(1.8rem,4vw,2.5rem);color:${ds.palette.text};margin:0 0 24px">${page.title}</h1>
  <div style="color:${ds.palette.textMuted};line-height:1.8;font-size:1rem">
    ${page.contentSummary || `<p>${ds.locale === 'he' ? 'תוכן העמוד בטעינה...' : 'Page content loading...'}</p>`}
  </div>
</main>
<footer style="background:${ds.palette.backgroundAlt};padding:48px 24px;border-top:1px solid ${ds.palette.border}">
  <div style="max-width:1200px;margin:0 auto;text-align:center">
    <p style="font-family:'${ds.fonts.heading}',sans-serif;font-weight:700;color:${ds.palette.text};margin:0 0 8px">${ds.siteName}</p>
    <p style="color:${ds.palette.textMuted};font-size:0.85rem;margin:0">© ${new Date().getFullYear()} ${ds.siteName}</p>
  </div>
</footer>
</body></html>`

  return {
    html,
    metadata: {
      id: pageId,
      siteId: '',
      pageType: page.pageType,
      title: page.title,
      slug: pageTypeToSlug(page.pageType),
      path: pageTypeToSlug(page.pageType),
      order: PAGE_TYPE_PRIORITY.indexOf(page.pageType),
      sectionCount: 3, // nav + main + footer
      byteSize: Buffer.byteLength(html, 'utf8'),
      generatedAt: new Date().toISOString(),
      source: 'fallback',
    },
    source: 'fallback',
  }
}

// ─── Section Content Builder ────────────────────────────────────────

/** Build section content for a specific page type + section category */
const buildSectionContent = (
  category: SectionCategory,
  page: PageInventoryItem,
  ds: GlobalDesignSystem,
  homepageSections?: Record<string, unknown>[],
): Record<string, unknown> => {
  const base: Record<string, unknown> = {
    businessName: ds.siteName,
    locale: ds.locale,
    brand: ds.siteName,
  }

  switch (category) {
    case 'navbar':
      return {
        ...base,
        links: ds.navLinks,
        ctaText: ds.ctaText,
        ctaLink: ds.ctaLink,
        logoUrl: ds.logoUrl,
      }

    case 'footer':
      return {
        ...base,
        items: ds.footerColumns.map(col => ({
          title: col.title,
          links: col.links,
        })),
        contact: ds.contactInfo,
      }

    case 'hero':
      return {
        ...base,
        headline: page.title,
        subheadline: page.contentSummary || '',
        ctaText: ds.ctaText,
        ctaLink: ds.ctaLink,
      }

    case 'pricing':
      if (page.products && page.products.length > 0) {
        return {
          ...base,
          headline: ds.locale === 'he' ? 'המוצרים שלנו' : 'Our Products',
          subheadline: '',
          items: page.products.slice(0, 4).map(p => {
            const name = (p.name as Record<string, unknown>)?.value as string || ''
            const price = (p.price as Record<string, unknown>)?.value
            const originalPrice = (p.originalPrice as Record<string, unknown>)?.value
            const desc = (p.description as Record<string, unknown>)?.value as string || ''
            return {
              name,
              price: price ? String(price) : '',
              originalPrice: originalPrice ? String(originalPrice) : undefined,
              currency: '₪',
              description: desc,
              features: [],
              cta: ds.locale === 'he' ? 'לפרטים' : 'Details',
              popular: false,
            }
          }),
        }
      }
      return { ...base, headline: ds.locale === 'he' ? 'מחירים' : 'Pricing' }

    case 'gallery':
      if (page.products && page.products.length > 0) {
        return {
          ...base,
          headline: ds.locale === 'he' ? 'המוצרים שלנו' : 'Our Products',
          items: page.products.slice(0, 8).map(p => ({
            title: (p.name as Record<string, unknown>)?.value || '',
            image: (p.image as Record<string, unknown>)?.value || '',
            description: (p.category as Record<string, unknown>)?.value || '',
          })),
        }
      }
      return { ...base, headline: ds.locale === 'he' ? 'גלריה' : 'Gallery' }

    case 'faq': {
      // Reuse homepage FAQ items if available
      const homeFaq = homepageSections?.find(s => (s as Record<string, unknown>).type === 'faq')
      if (homeFaq) {
        return { ...base, ...(homeFaq as Record<string, unknown>) }
      }
      return { ...base, headline: ds.locale === 'he' ? 'שאלות נפוצות' : 'FAQ' }
    }

    case 'contact':
      return {
        ...base,
        headline: ds.locale === 'he' ? 'צרו קשר' : 'Contact Us',
        subheadline: ds.locale === 'he' ? 'נשמח לשמוע מכם' : "We'd love to hear from you",
        phone: ds.contactInfo?.phone,
        email: ds.contactInfo?.email,
        address: ds.contactInfo?.address,
      }

    case 'cta':
      return {
        ...base,
        headline: ds.locale === 'he' ? 'מוכנים להתחיל?' : 'Ready to get started?',
        subheadline: '',
        ctaText: ds.ctaText,
        ctaLink: ds.ctaLink,
      }

    default:
      return base
  }
}

const pageTypeToSlug = (type: PageType): string => {
  switch (type) {
    case 'homepage': return ''
    case 'product-listing': return 'products'
    case 'about': return 'about'
    case 'contact': return 'contact'
    case 'blog-index': return 'blog'
    default: return type
  }
}

// ─── Multi-Page Generation Orchestrator ─────────────────────────────

/** Generate all inner pages for a site — called after homepage is built */
export const generateInnerPages = async (
  siteId: string,
  pageInventory: PageInventoryItem[],
  designSystem: GlobalDesignSystem,
  homepageSections?: Record<string, unknown>[],
): Promise<{ pages: { metadata: PageMetadata; html: string }[] }> => {
  const results: { metadata: PageMetadata; html: string }[] = []

  // Skip homepage — it's already built by the main pipeline
  const innerPages = pageInventory.filter(p => p.pageType !== 'homepage')

  for (const page of innerPages) {
    try {
      const result = composeInnerPage(page, designSystem, homepageSections)
      result.metadata.siteId = siteId
      results.push({ metadata: result.metadata, html: result.html })
      console.log(`[multi-page] Generated ${page.pageType}: ${result.metadata.slug} (${result.source}, ${result.metadata.byteSize} bytes)`)
    } catch (err) {
      console.error(`[multi-page] Failed to generate ${page.pageType}:`, err)
    }
  }

  return { pages: results }
}
