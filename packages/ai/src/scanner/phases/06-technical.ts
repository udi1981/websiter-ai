/**
 * Phase 6 — Technical DNA Extraction
 *
 * All programmatic, no AI required.
 * Aggregates SEO, motion, tech stack, accessibility, and schema.org data
 * from all crawled pages and CSS.
 */

import type { TechnicalDNA } from '../types/scanner'
import { extractSeo } from '../extractors/seo-extractor'
import { extractMotion } from '../extractors/motion-detector'
import { extractTechStack } from '../extractors/tech-stack-detector'
import { checkAccessibility } from '../extractors/accessibility-checker'
import { extractSchemaOrg } from '../extractors/schema-extractor'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PageInput = {
  url: string
  html: string
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

/**
 * Extract the complete technical DNA from all crawled pages and CSS.
 *
 * Runs SEO analysis, motion detection, tech stack identification,
 * accessibility audit, and schema.org extraction.
 *
 * @param pages - Array of crawled pages with URL and HTML
 * @param css - Array of CSS strings collected from the site
 * @returns Complete technical DNA analysis
 */
export const extractTechnicalDna = async (
  pages: PageInput[],
  css: string[],
): Promise<TechnicalDNA> => {
  // Aggregate all HTML and CSS for site-wide analysis
  const allHtml = pages.map(p => p.html).join('\n')
  const allCss = css.join('\n')

  // Use homepage (first page) for primary SEO analysis
  const homePage = pages[0]
  const homeUrl = homePage?.url || ''
  const homeHtml = homePage?.html || ''

  // Run all extractors
  const seo = extractSeo(homeHtml, homeUrl)
  const motion = extractMotion(allHtml, allCss)
  const techStack = extractTechStack(allHtml, allCss)
  const accessibility = checkAccessibility(allHtml, allCss)
  const schemaOrg = extractSchemaOrg(allHtml)

  // Enrich SEO with multi-page data
  const enrichedSeo = enrichSeoWithMultiPage(seo, pages)

  return {
    seo: enrichedSeo,
    motion,
    techStack,
    accessibility,
    schemaOrg,
  }
}

// ---------------------------------------------------------------------------
// Multi-page SEO enrichment
// ---------------------------------------------------------------------------

/**
 * Enrich homepage SEO data with insights from all pages.
 * Checks sitemap references, robots.txt, and aggregates link counts.
 */
const enrichSeoWithMultiPage = (
  baseSeo: TechnicalDNA['seo'],
  pages: PageInput[],
): TechnicalDNA['seo'] => {
  let totalInternalLinks = baseSeo.internalLinkCount
  let totalExternalLinks = baseSeo.externalLinkCount
  let totalImagesWithAlt = baseSeo.imagesWithAlt
  let totalImagesWithoutAlt = baseSeo.imagesWithoutAlt

  // Aggregate from additional pages
  for (let i = 1; i < pages.length; i++) {
    const page = pages[i]
    const pageSeo = extractSeo(page.html, page.url)

    totalInternalLinks += pageSeo.internalLinkCount
    totalExternalLinks += pageSeo.externalLinkCount
    totalImagesWithAlt += pageSeo.imagesWithAlt
    totalImagesWithoutAlt += pageSeo.imagesWithoutAlt

    // Check if any page references sitemap/robots
    if (pageSeo.hasSitemap) baseSeo.hasSitemap = true
    if (pageSeo.hasRobotsTxt) baseSeo.hasRobotsTxt = true

    // Merge hreflang tags
    for (const tag of pageSeo.hreflangTags) {
      if (!baseSeo.hreflangTags.some(t => t.lang === tag.lang)) {
        baseSeo.hreflangTags.push(tag)
      }
    }
  }

  return {
    ...baseSeo,
    internalLinkCount: totalInternalLinks,
    externalLinkCount: totalExternalLinks,
    imagesWithAlt: totalImagesWithAlt,
    imagesWithoutAlt: totalImagesWithoutAlt,
  }
}
