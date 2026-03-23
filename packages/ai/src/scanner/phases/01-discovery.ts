/**
 * Phase 1 — Discovery & Crawl
 *
 * Discovers all pages on a website by:
 * 1. Fetching homepage HTML
 * 2. Fetching /sitemap.xml and /robots.txt in parallel
 * 3. Extracting all links from homepage (nav, footer, body)
 * 4. Parsing sitemap XML for additional URLs
 * 5. Building NavigationStructure from nav/footer elements
 * 6. Classifying each page by PageType using URL patterns
 * 7. Fetching up to maxPages in parallel batches of 5
 * 8. Returning the complete SiteMap
 *
 * @module scanner/phases/01-discovery
 */

import type { Result } from '@ubuilder/types'
import { ok, err } from '@ubuilder/types'
import type {
  SiteMap,
  DiscoveredPage,
  NavigationStructure,
  NavItem,
  FooterColumn,
  PageType,
  ScanError,
} from '@ubuilder/types'
import { fetchPage, fetchText } from '../utils/html-fetcher'
import {
  resolveUrl,
  normalizeUrl,
  isSameDomain,
  isCrawlableUrl,
  deduplicateUrls,
} from '../utils/url-resolver'
import { stripTags } from '../extractors/css-parser'

// =============================================================================
// Link extraction (regex-based, no DOM)
// =============================================================================

/** Extract all href values from anchor tags in HTML. */
const extractAllLinks = (html: string, baseOrigin: string): string[] => {
  const links: string[] = []
  const regex = /href\s*=\s*["']([^"'#]+)["']/gi
  let m: RegExpExecArray | null
  while ((m = regex.exec(html)) !== null) {
    const resolved = resolveUrl(m[1], baseOrigin)
    if (resolved) links.push(resolved)
  }
  return links
}

/** Extract navigation items from <nav> elements. */
const extractNavItems = (html: string, baseOrigin: string): NavItem[] => {
  const items: NavItem[] = []
  const navRegex = /<nav[^>]*>([\s\S]*?)<\/nav>/gi
  let navMatch: RegExpExecArray | null
  while ((navMatch = navRegex.exec(html)) !== null) {
    const navHtml = navMatch[1]
    const aRegex = /<a[^>]+href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
    let aMatch: RegExpExecArray | null
    while ((aMatch = aRegex.exec(navHtml)) !== null) {
      const href = resolveUrl(aMatch[1], baseOrigin)
      const text = stripTags(aMatch[2]).slice(0, 60)
      if (!text || !href) continue
      const isExternal = !isSameDomain(href, new URL(baseOrigin).hostname)
      const isCta = /btn|button|cta|get-started|sign-up|free|trial/i.test(aMatch[0])
      items.push({ text, href, children: [], isExternal, isCta })
    }
  }
  return items
}

/** Extract footer link columns. */
const extractFooterColumns = (html: string, baseOrigin: string): FooterColumn[] => {
  const columns: FooterColumn[] = []
  const footerRegex = /<footer[^>]*>([\s\S]*?)<\/footer>/gi
  const footerMatch = footerRegex.exec(html)
  if (!footerMatch) return columns

  const footerHtml = footerMatch[1]

  // Try to find column groupings (divs with headings + links)
  const colRegex = /<(?:div|ul|section)[^>]*>([\s\S]*?)<\/(?:div|ul|section)>/gi
  let colMatch: RegExpExecArray | null
  while ((colMatch = colRegex.exec(footerHtml)) !== null) {
    const block = colMatch[1]
    // Look for a heading
    const headingMatch = block.match(/<(?:h[2-6]|strong|b|p[^>]*class="[^"]*(?:title|heading))[^>]*>([\s\S]*?)<\/(?:h[2-6]|strong|b|p)>/i)
    const title = headingMatch ? stripTags(headingMatch[1]).slice(0, 50) : ''

    // Extract links
    const links: NavItem[] = []
    const aRegex = /<a[^>]+href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
    let aMatch: RegExpExecArray | null
    while ((aMatch = aRegex.exec(block)) !== null) {
      const text = stripTags(aMatch[2]).slice(0, 60)
      const href = resolveUrl(aMatch[1], baseOrigin)
      if (text && href) {
        links.push({
          text,
          href,
          children: [],
          isExternal: !isSameDomain(href, new URL(baseOrigin).hostname),
          isCta: false,
        })
      }
    }

    if (links.length > 0) {
      columns.push({ title, links })
    }
  }

  return columns
}

/** Extract footer link hrefs (flat). */
const extractFooterLinks = (html: string, baseOrigin: string): Set<string> => {
  const hrefs = new Set<string>()
  const footerRegex = /<footer[^>]*>([\s\S]*?)<\/footer>/gi
  const match = footerRegex.exec(html)
  if (!match) return hrefs
  const aRegex = /href\s*=\s*["']([^"'#]+)["']/gi
  let m: RegExpExecArray | null
  while ((m = aRegex.exec(match[1])) !== null) {
    const resolved = resolveUrl(m[1], baseOrigin)
    if (resolved) hrefs.add(normalizeUrl(resolved))
  }
  return hrefs
}

// =============================================================================
// Sitemap parsing
// =============================================================================

/** Parse sitemap.xml content and return all <loc> URLs. */
const parseSitemap = (xml: string, domain: string): string[] => {
  const urls: string[] = []
  const locRegex = /<loc>([\s\S]*?)<\/loc>/gi
  let m: RegExpExecArray | null
  while ((m = locRegex.exec(xml)) !== null) {
    const url = m[1].trim()
    if (isSameDomain(url, domain)) {
      urls.push(url)
    }
  }
  return urls
}

// =============================================================================
// Page type classification
// =============================================================================

/** Classify a page by its URL path pattern. */
const classifyPageType = (path: string, title: string): PageType => {
  const p = path.toLowerCase()
  const t = title.toLowerCase()

  if (p === '/' || p === '') return 'homepage'
  if (/^\/(about|who-we-are|our-story|mission)/.test(p)) return 'about'
  if (/^\/(services?|what-we-do|offerings?)$/.test(p)) return 'services'
  if (/^\/(services?|what-we-do)\/[^/]+/.test(p)) return 'service-detail'
  if (/^\/(portfolio|work|projects?|gallery|showcase)/.test(p)) return 'portfolio'
  if (/^\/(blog|news|articles?|journal|insights?)$/.test(p)) return 'blog-index'
  if (/^\/(blog|news|articles?|journal|insights?)\/[^/]+/.test(p)) return 'blog-post'
  if (/^\/(contact|get-in-touch|reach-us)/.test(p)) return 'contact'
  if (/^\/(pricing|plans?|packages?)/.test(p)) return 'pricing'
  if (/^\/(faq|frequently-asked|help|support)/.test(p)) return 'faq'
  if (/^\/(team|staff|people|our-team)/.test(p)) return 'team'
  if (/^\/(testimonials?|reviews?|clients?)/.test(p)) return 'testimonials'
  if (/^\/(shop|store|products?|catalog)$/.test(p)) return 'product-listing'
  if (/^\/(shop|store|products?)\/[^/]+/.test(p)) return 'product-detail'
  if (/^\/(landing|lp|promo|campaign)/.test(p)) return 'landing'
  if (/^\/(privacy|terms|legal|cookie|disclaimer|imprint)/.test(p)) return 'legal'

  // Title-based fallback
  if (/about/i.test(t)) return 'about'
  if (/contact/i.test(t)) return 'contact'
  if (/pricing|plans/i.test(t)) return 'pricing'
  if (/blog|article/i.test(t)) return 'blog-index'
  if (/faq/i.test(t)) return 'faq'

  return 'custom'
}

/** Detect mobile nav type from HTML. */
const detectMobileNav = (html: string): NavigationStructure['mobileNav'] => {
  if (/hamburger|menu-toggle|mobile-menu|nav-toggle|burger/i.test(html)) return 'hamburger'
  if (/bottom-nav|tab-bar|bottom-tabs/i.test(html)) return 'bottom-tabs'
  if (/slide-out|off-canvas|drawer/i.test(html)) return 'slide-out'
  return 'unknown'
}

/** Detect mega menu from HTML. */
const detectMegaMenu = (html: string): boolean =>
  /mega-menu|megamenu|mega_menu/i.test(html)

/** Detect breadcrumbs from HTML. */
const detectBreadcrumbs = (html: string): boolean =>
  /breadcrumb|aria-label=["']breadcrumb/i.test(html)

// =============================================================================
// Main phase
// =============================================================================

export type DiscoveryResult = {
  siteMap: SiteMap
  /** Raw HTML per page for downstream phases (keyed by path) */
  pageHtmlMap: Map<string, string>
  /** Raw CSS per page for downstream phases (keyed by path) */
  pageCssUrls: Map<string, string[]>
  /** Errors that occurred but were recoverable */
  errors: ScanError[]
}

/**
 * Execute Phase 1: Discovery & Crawl.
 *
 * Discovers all pages on the target website, builds the site map,
 * and fetches HTML for each page.
 *
 * @param url - The normalised URL to scan (must include protocol)
 * @param maxPages - Maximum pages to crawl (default 30)
 * @returns Result containing the complete SiteMap and raw HTML map
 */
export const runDiscoveryPhase = async (
  url: string,
  maxPages = 30,
): Promise<Result<DiscoveryResult>> => {
  const errors: ScanError[] = []
  const baseUrl = new URL(url)
  const domain = baseUrl.hostname
  const origin = baseUrl.origin

  // ------------------------------------------------------------------
  // 1. Fetch homepage
  // ------------------------------------------------------------------
  const homeResult = await fetchPage(url)
  if (!homeResult.ok) {
    return err(`Failed to fetch homepage: ${homeResult.error}`)
  }
  const homeHtml = homeResult.data.html

  // ------------------------------------------------------------------
  // 2. Fetch /sitemap.xml and /robots.txt in parallel
  // ------------------------------------------------------------------
  const [sitemapText, robotsText] = await Promise.all([
    fetchText(`${origin}/sitemap.xml`),
    fetchText(`${origin}/robots.txt`),
  ])

  // ------------------------------------------------------------------
  // 3. Extract links from homepage
  // ------------------------------------------------------------------
  const allLinks = extractAllLinks(homeHtml, origin)
  const internalLinks = allLinks.filter(link => isSameDomain(link, domain) && isCrawlableUrl(link))
  const externalLinks = allLinks.filter(link => !isSameDomain(link, domain))

  // ------------------------------------------------------------------
  // 4. Parse sitemap for additional URLs
  // ------------------------------------------------------------------
  const sitemapUrls = sitemapText ? parseSitemap(sitemapText, domain) : []

  // ------------------------------------------------------------------
  // 5. Build navigation structure
  // ------------------------------------------------------------------
  const navItems = extractNavItems(homeHtml, origin)
  const footerColumns = extractFooterColumns(homeHtml, origin)
  const footerLinkSet = extractFooterLinks(homeHtml, origin)
  const navLinkSet = new Set(navItems.map(n => normalizeUrl(n.href)))

  const navigation: NavigationStructure = {
    primary: navItems.filter(n => !n.isCta),
    secondary: navItems.filter(n => n.isCta),
    footer: footerColumns,
    breadcrumbs: detectBreadcrumbs(homeHtml),
    megaMenu: detectMegaMenu(homeHtml),
    mobileNav: detectMobileNav(homeHtml),
  }

  // ------------------------------------------------------------------
  // 6. Merge and deduplicate all discovered URLs
  // ------------------------------------------------------------------
  const allUrls = deduplicateUrls([
    url,
    ...internalLinks,
    ...sitemapUrls,
  ]).filter(u => isSameDomain(u, domain) && isCrawlableUrl(u))
    .slice(0, maxPages)

  // ------------------------------------------------------------------
  // 7. Fetch all pages in parallel batches of 5
  // ------------------------------------------------------------------
  const pageHtmlMap = new Map<string, string>()
  const pageCssUrls = new Map<string, string[]>()
  const pages: DiscoveredPage[] = []

  // Homepage is already fetched
  const homePath = new URL(url).pathname || '/'
  pageHtmlMap.set(homePath, homeHtml)

  // Extract CSS URLs from homepage
  const homeCssUrls = extractCssLinksFromHtml(homeHtml, origin)
  pageCssUrls.set(homePath, homeCssUrls)

  const homeTitle = extractTitle(homeHtml)
  pages.push({
    url,
    path: homePath,
    title: homeTitle,
    depth: 0,
    isInNav: true,
    isInFooter: false,
    pageType: 'homepage',
    purpose: 'Main landing page',
    hasForm: /<form/i.test(homeHtml),
    hasMedia: /<(?:video|audio|iframe|img)/i.test(homeHtml),
    statusCode: homeResult.data.statusCode,
    contentLength: homeResult.data.contentLength,
  })

  // Remaining URLs (skip homepage)
  const remaining = allUrls.filter(u => normalizeUrl(u) !== normalizeUrl(url))
  const BATCH_SIZE = 2 // Reduced from 5 to prevent OOM on dev server

  for (let i = 0; i < remaining.length; i += BATCH_SIZE) {
    const batch = remaining.slice(i, i + BATCH_SIZE)
    const results = await Promise.allSettled(
      batch.map(pageUrl => fetchPage(pageUrl)),
    )

    for (let j = 0; j < results.length; j++) {
      const result = results[j]
      const pageUrl = batch[j]

      if (result.status !== 'fulfilled' || !result.value.ok) {
        const errorMsg = result.status === 'fulfilled'
          ? result.value.ok ? '' : result.value.error
          : String(result.reason)
        errors.push({
          phase: 'discovery',
          message: `Failed to fetch ${pageUrl}: ${errorMsg}`,
          recoverable: true,
        })
        continue
      }

      const { html, statusCode, contentLength } = result.value.data
      const path = new URL(pageUrl).pathname || '/'
      const title = extractTitle(html)
      const normalizedPath = normalizeUrl(pageUrl)

      pageHtmlMap.set(path, html)
      pageCssUrls.set(path, extractCssLinksFromHtml(html, origin))

      pages.push({
        url: pageUrl,
        path,
        title,
        depth: path.split('/').filter(Boolean).length,
        isInNav: navLinkSet.has(normalizedPath),
        isInFooter: footerLinkSet.has(normalizedPath),
        pageType: classifyPageType(path, title),
        purpose: describePurpose(classifyPageType(path, title)),
        hasForm: /<form/i.test(html),
        hasMedia: /<(?:video|audio|iframe|img)/i.test(html),
        statusCode,
        contentLength,
      })
    }
  }

  return ok({
    siteMap: {
      pages,
      sitemapUrl: sitemapText ? `${origin}/sitemap.xml` : null,
      robotsTxt: robotsText,
      navigation,
      totalInternalLinks: internalLinks.length,
      totalExternalLinks: externalLinks.length,
    },
    pageHtmlMap,
    pageCssUrls,
    errors,
  })
}

// =============================================================================
// Small helpers
// =============================================================================

/** Extract <title> from HTML. */
const extractTitle = (html: string): string => {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  return m ? stripTags(m[1]).slice(0, 200) : ''
}

/** Extract stylesheet link hrefs from HTML. */
const extractCssLinksFromHtml = (html: string, origin: string): string[] => {
  const urls: string[] = []
  const regex =
    /<link[^>]+(?:rel\s*=\s*["']stylesheet["'][^>]*href\s*=\s*["']([^"']+)["']|href\s*=\s*["']([^"']+)["'][^>]*rel\s*=\s*["']stylesheet["'])[^>]*>/gi
  let m: RegExpExecArray | null
  while ((m = regex.exec(html)) !== null) {
    const href = m[1] || m[2]
    if (!href) continue
    // Skip known CDN font/icon libraries
    if (/fonts\.googleapis|cdnjs|unpkg|cdn\.jsdelivr|fontawesome/i.test(href)) continue
    urls.push(resolveUrl(href, origin))
  }
  return urls
}

/** Human-readable purpose description for a page type. */
const describePurpose = (type: PageType): string => {
  const map: Record<PageType, string> = {
    'homepage': 'Main landing page',
    'about': 'About the business / team',
    'services': 'Service offerings overview',
    'service-detail': 'Detailed service description',
    'portfolio': 'Work portfolio / case studies',
    'blog-index': 'Blog / articles listing',
    'blog-post': 'Individual blog article',
    'contact': 'Contact information / form',
    'pricing': 'Pricing plans',
    'faq': 'Frequently asked questions',
    'team': 'Team members',
    'testimonials': 'Customer testimonials / reviews',
    'product-listing': 'Product catalog',
    'product-detail': 'Individual product page',
    'landing': 'Marketing landing page',
    'legal': 'Legal / policy document',
    'custom': 'Custom page',
  }
  return map[type]
}
