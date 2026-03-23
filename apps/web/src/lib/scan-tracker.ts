/**
 * Scan Tracker — wraps generation-tracker for scan job persistence.
 *
 * Maps scanner pipeline phase callbacks to DB-backed job/step/artifact tracking.
 * Handles content extraction + catalog extraction + migration mapping for self_owned sources.
 */

import * as tracker from '@/lib/generation-tracker'
import type { GenerationStepName, ArtifactType, SourceOwnership, ScanModeV1 } from '@ubuilder/types'

/** Scanner progress status — matches ScanProgress['status'] from scanner pipeline */
type ScanPhaseStatus = 'running' | 'done' | 'error' | 'skipped'

/** Phase name from scanner → step name for DB */
const PHASE_TO_STEP: Record<string, GenerationStepName> = {
  'discovery': 'scan_discovery',
  'visual-dna': 'scan_visual_dna',
  'components': 'scan_components',
  'content': 'scan_content',
  'brand-intelligence': 'scan_brand',
  'technical': 'scan_technical',
  'strategic-insights': 'scan_strategic',
}

/** Phase name → artifact type for incremental persistence */
const PHASE_TO_ARTIFACT: Record<string, ArtifactType> = {
  'discovery': 'scan_site_map',
  'visual-dna': 'scan_visual_dna',
}

/** Create a new scan job */
export const createScanJob = async (params: {
  userId: string
  sourceUrl: string
  scanMode: ScanModeV1
  sourceOwnership: SourceOwnership
  locale?: string
}): Promise<string> => {
  const jobId = await tracker.createJob({
    userId: params.userId,
    description: `Scan: ${params.sourceUrl}`,
    locale: params.locale || 'en',
  })

  // Set scanner-specific fields via raw update
  const { db, sql } = await import('@ubuilder/db')
  await db.execute(sql`
    UPDATE generation_jobs
    SET job_type = 'scan',
        source_url = ${params.sourceUrl},
        scan_mode = ${params.scanMode},
        source_ownership = ${params.sourceOwnership}
    WHERE id = ${jobId}
  `)

  await tracker.startJob(jobId)
  return jobId
}

/** Track a scan phase start/completion/error */
export const trackScanPhase = async (
  jobId: string,
  phaseName: string,
  status: ScanPhaseStatus,
  data?: Record<string, unknown>,
): Promise<void> => {
  const stepName = PHASE_TO_STEP[phaseName]
  if (!stepName) return // unknown phase, skip

  if (status === 'running') {
    const stepId = await tracker.startStep(jobId, stepName, `@scanner/${phaseName}`)
    // Store stepId for later completion — use the job's currentStep
    await tracker.setCurrentStep(jobId, stepName)
  }

  if (status === 'done') {
    // Find the step and complete it
    const jobStatus = await tracker.getJobStatus(jobId)
    if (!jobStatus) return
    const step = jobStatus.steps.find(s => s.stepName === stepName && s.status === 'running')
    if (step) {
      await tracker.completeStep(step.id)
    }

    // Save incremental artifact if applicable
    const artifactType = PHASE_TO_ARTIFACT[phaseName]
    if (artifactType && data) {
      await tracker.saveArtifact({
        jobId,
        stepId: step?.id,
        artifactType,
        data,
      })
    }
  }

  if (status === 'error') {
    const jobStatus = await tracker.getJobStatus(jobId)
    if (!jobStatus) return
    const step = jobStatus.steps.find(s => s.stepName === stepName && s.status === 'running')
    if (step) {
      await tracker.failStep(step.id, `Phase ${phaseName} failed`)
    }
  }

  if (status === 'skipped') {
    // Create and immediately skip the step
    const stepId = await tracker.startStep(jobId, stepName, `@scanner/${phaseName}`)
    await tracker.skipStep(stepId)
  }
}

/** Complete the scan job — save final result + generation context */
export const completeScanJob = async (
  jobId: string,
  scanResult: Record<string, unknown>,
  generationCtx: Record<string, unknown>,
): Promise<void> => {
  // Save full result artifact
  await tracker.saveArtifact({
    jobId,
    artifactType: 'scan_full_result',
    data: scanResult,
  })

  // Save the transform bridge output
  const transformStepId = await tracker.startStep(jobId, 'scan_transform', '@scanner/transform')
  await tracker.saveArtifact({
    jobId,
    stepId: transformStepId,
    artifactType: 'scan_generation_ctx',
    data: generationCtx,
  })
  await tracker.completeStep(transformStepId)

  await tracker.completeJob(jobId)
}

/** Run content extraction for self_owned sources */
export const extractAndPersistContent = async (
  jobId: string,
  scanResult: Record<string, unknown>,
): Promise<void> => {
  // Step: content extraction
  const extractStepId = await tracker.startStep(jobId, 'scan_content_extract', '@scanner/content-extract')

  try {
    const contentModel = extractSourceContentModel(scanResult)
    await tracker.saveArtifact({
      jobId,
      stepId: extractStepId,
      artifactType: 'source_content_model',
      data: contentModel,
    })
    await tracker.completeStep(extractStepId)
  } catch (err) {
    await tracker.failStep(extractStepId, `Content extraction failed: ${err}`)
  }

  // Step: catalog extraction + V1.3 product page enrichment
  const catalogStepId = await tracker.startStep(jobId, 'scan_catalog_extract', '@scanner/catalog-extract')

  try {
    const catalog = extractContentCatalog(scanResult)

    // V1.3: Enrich products with prices/descriptions from product pages
    const products = (catalog.products as Record<string, unknown>[]) || []
    if (products.length > 0) {
      try {
        await enrichProductsFromPages(products, 3) // Limit to 3 pages to prevent OOM on dev server
        // Update extraction source if we got prices
        const enrichedCount = products.filter(p =>
          (p.price as Record<string, unknown>)?.value &&
          (p.price as Record<string, unknown>).confidence as number > 0,
        ).length
        if (enrichedCount > 0) {
          catalog.extractedFrom = `${catalog.extractedFrom}+product_pages`
          catalog.enrichedProducts = enrichedCount
        }
      } catch (enrichErr) {
        console.error('[scan-tracker] Product enrichment error (non-blocking):', enrichErr)
      }
    }

    await tracker.saveArtifact({
      jobId,
      stepId: catalogStepId,
      artifactType: 'content_catalog',
      data: catalog,
    })
    await tracker.completeStep(catalogStepId)
  } catch (err) {
    await tracker.failStep(catalogStepId, `Catalog extraction failed: ${err}`)
  }

  // Step: migration mapping
  const migrationStepId = await tracker.startStep(jobId, 'scan_migration_map', '@scanner/migration-map')

  try {
    const manifest = buildMigrationManifest(scanResult)
    await tracker.saveArtifact({
      jobId,
      stepId: migrationStepId,
      artifactType: 'content_migration_manifest',
      data: manifest,
    })
    await tracker.completeStep(migrationStepId)
  } catch (err) {
    await tracker.failStep(migrationStepId, `Migration mapping failed: ${err}`)
  }
}

/** Fail the scan job */
export const failScanJob = async (jobId: string, reason: string): Promise<void> => {
  await tracker.failJob(jobId, reason)
}

// ─── Content Extraction Helpers ──────────────────────────────────────

type ExtractedFieldData = {
  value: unknown
  sourceType: string
  sourceLocator?: string
  confidence: number
  normalizationNotes?: string
}

const field = <T>(value: T, sourceType: string, confidence: number, locator?: string): ExtractedFieldData => ({
  value,
  sourceType,
  sourceLocator: locator,
  confidence,
})

/** Extract non-catalog site content from scan result */
const extractSourceContentModel = (scanResult: Record<string, unknown>): Record<string, unknown> => {
  const content = scanResult.contentArchitecture as Record<string, unknown> | undefined
  const siteMap = scanResult.siteMap as Record<string, unknown> | undefined
  const contentPages = (content as Record<string, unknown>)?.pages as Record<string, unknown>[] | undefined

  const pages = ((siteMap as Record<string, unknown>)?.pages as Record<string, unknown>[]) || []

  const model: Record<string, unknown> = {
    pages: pages.map(p => ({
      url: field(p.url, 'dom', 90, 'crawl'),
      title: field(p.title || p.pageTitle, 'dom', 85, 'title'),
      pageType: field(p.pageType || 'page', 'visual_inference', 60),
    })),
  }

  // Extract hero content from homepage headings
  const homepageContent = contentPages?.find(p =>
    (p.pagePath as string) === '/' || (p.pagePath as string) === '',
  )
  const headings = (homepageContent?.headings as Record<string, unknown>[]) || []
  const h1 = headings.find(h => (h.level as number) === 1)
  if (h1) {
    model.hero = {
      headline: field(h1.text, 'dom', 85, 'h1'),
    }
  }

  // Extract CTAs from homepage
  const ctas = (homepageContent?.ctas || (content as Record<string, unknown>)?.globalCtas) as Record<string, unknown>[] | undefined
  if (ctas && ctas.length > 0) {
    model.primaryCta = field(ctas[0]?.text || '', 'dom', 80, 'a.cta')
    model.allCtas = ctas.slice(0, 10).map(c => field(c.text, 'dom', 75, c.placement as string || 'inline'))
  }

  // Extract FAQs from headings — H2 "שאלות נפוצות"/"FAQ" followed by H3 questions
  const allPageHeadings = contentPages?.flatMap(p =>
    (p.headings as Record<string, unknown>[]) || [],
  ) || []
  const faqQuestions = extractFaqsFromHeadings(allPageHeadings)
  if (faqQuestions.length > 0) {
    model.faqs = faqQuestions.map(q => field(q, 'dom', 80, 'h3'))
  }

  // Extract trust/testimonial section markers
  const trustHeadings = headings.filter(h => {
    const text = ((h.text as string) || '').toLowerCase()
    return text.includes('ממליצ') || text.includes('testimonial') || text.includes('review')
  })
  if (trustHeadings.length > 0) {
    model.testimonials = { detected: field(true, 'dom', 70, 'h2') }
  }

  // Extract navigation structure
  const nav = (siteMap as Record<string, unknown>)?.navigation as Record<string, unknown> | undefined
  if (nav) {
    const primary = nav.primary as Record<string, unknown>[] | undefined
    const footer = nav.footer as Record<string, unknown>[] | undefined
    if (primary && primary.length > 0) {
      model.navigation = primary.slice(0, 20).map(n => field(
        { text: n.text, href: n.href },
        'dom', 90, 'nav',
      ))
    }
    if (footer && footer.length > 0) {
      model.footer = footer.slice(0, 15).map(f => {
        const links = (f.links as Record<string, unknown>[]) || [f]
        return field(
          { title: f.title, links: links.map(l => ({ text: l.text, href: l.href })) },
          'dom', 85, 'footer',
        )
      })
    }
  }

  return model
}

/** Extract FAQ questions from heading hierarchy — looks for H3s after an FAQ-like H2 */
const extractFaqsFromHeadings = (headings: Record<string, unknown>[]): string[] => {
  const faqs: string[] = []
  let inFaqSection = false

  for (const h of headings) {
    const level = h.level as number
    const text = ((h.text as string) || '').trim()
    if (!text || text === '​') continue

    // Detect FAQ section header (H2 or H1)
    if (level <= 2) {
      const lower = text.toLowerCase()
      inFaqSection = lower.includes('שאלות נפוצות') || lower.includes('faq')
        || lower.includes('frequently asked') || lower.includes('שאלות ותשובות')
      continue
    }

    // Collect H3 questions inside FAQ section
    if (inFaqSection && level === 3 && text.length > 10) {
      faqs.push(text)
    }
  }
  return faqs
}

/** Extract product catalog from scan result — multi-strategy */
const extractContentCatalog = (scanResult: Record<string, unknown>): Record<string, unknown> => {
  const products: Record<string, unknown>[] = []
  let extractedFrom = 'none'

  // Strategy 1: JSON-LD Product schema (highest confidence)
  const technical = (scanResult.technicalDna || scanResult.technicalDNA) as Record<string, unknown> | undefined
  const schemaOrg = technical?.schemaOrg as Record<string, unknown> | undefined
  const schemaItems = (schemaOrg?.items || []) as Record<string, unknown>[]
  const structuredData = schemaItems.map(i => (i.properties || i) as Record<string, unknown>)

  for (const sd of structuredData) {
    if (sd['@type'] === 'Product' || sd.type === 'Product') {
      const offers = sd.offers as Record<string, unknown> | undefined
      products.push({
        name: field(sd.name, 'json_ld', 95, 'Product.name'),
        price: field(offers?.price ?? null, 'json_ld', 95, 'Product.offers.price'),
        currency: field(offers?.priceCurrency ?? null, 'json_ld', 95, 'Product.offers.priceCurrency'),
        description: field(sd.description ?? '', 'json_ld', 85, 'Product.description'),
        image: field(sd.image ?? null, 'json_ld', 90, 'Product.image'),
      })
      extractedFrom = 'json_ld'
    }
  }

  // Strategy 2: OpenGraph product meta tags
  if (products.length === 0) {
    const seo = technical?.seo as Record<string, unknown> | undefined
    const ogTags = seo?.ogTags as Record<string, string> | undefined
    if (ogTags && ogTags['og:type'] === 'product') {
      products.push({
        name: field(ogTags['og:title'] || ogTags['product:name'] || '', 'og_meta', 85, 'og:title'),
        price: field(ogTags['product:price:amount'] || null, 'og_meta', 80, 'product:price:amount'),
        currency: field(ogTags['product:price:currency'] || null, 'og_meta', 80, 'product:price:currency'),
        description: field(ogTags['og:description'] || '', 'og_meta', 75, 'og:description'),
        image: field(ogTags['og:image'] || null, 'og_meta', 85, 'og:image'),
      })
      extractedFrom = 'og_meta'
    }
  }

  // Strategy 3: DOM product pattern — extract from navigation + headings
  // Detects product model names from nav links pointing to product pages
  if (products.length === 0) {
    const siteMap = scanResult.siteMap as Record<string, unknown> | undefined
    const nav = (siteMap as Record<string, unknown>)?.navigation as Record<string, unknown> | undefined
    const navItems = (nav?.primary as Record<string, unknown>[]) || []
    const contentPages = (scanResult.contentArchitecture as Record<string, unknown>)?.pages as Record<string, unknown>[] | undefined

    // Identify product pages from nav — links to individual product/model pages
    const productNavItems = navItems.filter(n => {
      const href = (n.href as string) || ''
      const text = (n.text as string) || ''
      // Skip category/generic nav items
      if (!href || text.length < 3) return false
      // Product pages: contain model names, specific product names
      const isProductPage = /\/product|\/item|mewatch-|\/collections\/[^/]+$/.test(href)
        || /[A-Z]\d+|Ultra|Pro|Light|Prime|Basic/.test(text)
      return isProductPage && !n.isExternal
    })

    // Also look for product headings (H2 with model names) on homepage/product pages
    const allHeadings = contentPages?.flatMap(p =>
      (p.headings as Record<string, unknown>[]) || [],
    ) || []

    // Deduplicate product names
    const seenNames = new Set<string>()

    // From navigation
    for (const item of productNavItems) {
      const name = (item.text as string || '').trim()
      if (name && !seenNames.has(name)) {
        seenNames.add(name)

        // Find matching image from page images
        const matchingPage = contentPages?.find(p => {
          const headings = (p.headings as Record<string, unknown>[]) || []
          return headings.some(h => (h.text as string || '').includes(name.split(' ').pop() || ''))
        })
        const pageImages = (matchingPage?.images as Record<string, unknown>[]) || []
        const productImage = pageImages.find(img => {
          const alt = ((img.alt as string) || '').toLowerCase()
          const src = ((img.src as string) || '').toLowerCase()
          return alt.includes(name.toLowerCase().split(' ').pop() || '') || src.includes('product')
        })

        products.push({
          name: field(name, 'dom_nav', 75, 'nav link'),
          price: field(null, 'unknown', 0),
          currency: field(null, 'unknown', 0),
          description: field('', 'unknown', 0),
          image: field(productImage?.src ?? null, 'dom', productImage ? 65 : 0, 'page img'),
          productUrl: field(item.href, 'dom_nav', 90, 'nav href'),
          category: field(detectProductCategory(name), 'heuristic', 50),
        })
        extractedFrom = 'dom_nav'
      }
    }

    // From headings — look for model-name-like H2s not already captured
    for (const h of allHeadings) {
      const text = ((h.text as string) || '').trim()
      const level = h.level as number
      if (level !== 2 || text.length < 3 || text.length > 60) continue
      if (/[A-Z]\d+|Ultra|Pro|Light|Prime|Basic/.test(text) && !seenNames.has(text)) {
        // Clean product name (remove HTML entities, nbsp)
        const cleanName = text.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
        if (cleanName && !seenNames.has(cleanName)) {
          seenNames.add(cleanName)
          products.push({
            name: field(cleanName, 'dom_heading', 65, `h${level}`),
            price: field(null, 'unknown', 0),
            currency: field(null, 'unknown', 0),
            description: field('', 'unknown', 0),
            image: field(null, 'unknown', 0),
          })
          if (extractedFrom === 'none') extractedFrom = 'dom_heading'
        }
      }
    }
  }

  // Extract categories from navigation structure
  const categories = extractCategories(scanResult)

  return {
    products,
    categories,
    extractedFrom,
    productCount: products.length,
  }
}

// ─── V1.3: Product Page Enrichment ──────────────────────────────────

/** Fetch product pages and extract prices, descriptions, images (bounded) */
const enrichProductsFromPages = async (
  products: Record<string, unknown>[],
  maxFetches: number = 6,
): Promise<void> => {
  const fetchableProducts = products
    .filter(p => {
      const url = (p.productUrl as Record<string, unknown>)?.value as string | undefined
      return url && url.startsWith('http')
    })
    .slice(0, maxFetches)

  const enrichPromises = fetchableProducts.map(async (product) => {
    const url = (product.productUrl as Record<string, unknown>)?.value as string
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 8000) // 8s timeout per page

      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; UBuilder/1.0)' },
        signal: controller.signal,
        redirect: 'follow',
      })
      clearTimeout(timer)

      if (!res.ok) return

      const html = await res.text()

      // Extract price from multiple sources
      const price = extractPriceFromHtml(html)
      if (price) {
        product.price = field(price.amount, price.source, price.confidence, price.locator)
        product.currency = field(price.currency, price.source, price.confidence)
        if (price.originalAmount && price.originalAmount !== price.amount) {
          product.originalPrice = field(price.originalAmount, price.source, price.confidence - 5)
          product.onSale = field(true, price.source, price.confidence)
        }
      }

      // Extract description from product page
      const desc = extractProductDescription(html)
      if (desc) {
        product.description = field(desc, 'dom', 70, 'product page text')
      }

      // Extract product-specific images (better than homepage nav images)
      const productImages = extractProductPageImages(html, url)
      if (productImages.length > 0) {
        product.image = field(productImages[0], 'dom', 80, 'product page img')
        if (productImages.length > 1) {
          product.additionalImages = productImages.slice(1, 4).map(img =>
            field(img, 'dom', 75, 'product page img'),
          )
        }
      }
    } catch {
      // Non-blocking — product remains with nav-level data
    }
  })

  await Promise.allSettled(enrichPromises)
}

/** Extract price from HTML using multiple strategies */
const extractPriceFromHtml = (html: string): {
  amount: number
  originalAmount?: number
  currency: string
  source: string
  confidence: number
  locator: string
} | null => {
  // Strategy 1: Wix data attributes (highest confidence for Wix sites)
  const wixPrice = html.match(/data-wix-price="([0-9,.]+)\s*(₪|ILS|NIS)?"/i)
  const wixOriginal = html.match(/data-wix-original-price="([0-9,.]+)\s*(₪|ILS|NIS)?"/i)
  if (wixPrice) {
    return {
      amount: parseFloat(wixPrice[1].replace(',', '')),
      originalAmount: wixOriginal ? parseFloat(wixOriginal[1].replace(',', '')) : undefined,
      currency: '₪',
      source: 'wix_data_attr',
      confidence: 90,
      locator: 'data-wix-price',
    }
  }

  // Strategy 2: JSON price in script tags (Wix/Shopify store data)
  const jsonPrice = html.match(/"price"\s*:\s*([0-9.]+)/i)
  const jsonCurrency = html.match(/"currency"\s*:\s*"([A-Z]{3})"/i)
  if (jsonPrice) {
    return {
      amount: parseFloat(jsonPrice[1]),
      currency: jsonCurrency ? jsonCurrency[1] : '₪',
      source: 'json_script',
      confidence: 85,
      locator: 'script JSON',
    }
  }

  // Strategy 3: OpenGraph / meta price tags
  const ogPrice = html.match(/<meta[^>]*property="product:price:amount"[^>]*content="([^"]+)"/i)
    || html.match(/<meta[^>]*content="([^"]+)"[^>]*property="product:price:amount"/i)
  const ogCurrency = html.match(/<meta[^>]*property="product:price:currency"[^>]*content="([^"]+)"/i)
  if (ogPrice) {
    return {
      amount: parseFloat(ogPrice[1]),
      currency: ogCurrency ? ogCurrency[1] : '₪',
      source: 'og_meta',
      confidence: 88,
      locator: 'product:price:amount',
    }
  }

  // Strategy 4: Visible text price patterns (₪ NNN or NNN ₪)
  const textPrices = html.match(/(\d{2,5}(?:[.,]\d{2})?)\s*₪/g)
  if (textPrices && textPrices.length > 0) {
    // Take the most common price (likely the current/sale price)
    const prices = textPrices.map(p => parseFloat(p.replace(/[₪\s,]/g, '')))
    const priceFreq = new Map<number, number>()
    for (const p of prices) {
      priceFreq.set(p, (priceFreq.get(p) || 0) + 1)
    }
    const sorted = [...priceFreq.entries()].sort((a, b) => b[1] - a[1])
    const mostCommon = sorted[0][0]
    const secondMostCommon = sorted.length > 1 ? sorted[1][0] : undefined

    return {
      amount: mostCommon,
      originalAmount: secondMostCommon && secondMostCommon > mostCommon ? secondMostCommon : undefined,
      currency: '₪',
      source: 'dom_text',
      confidence: 70,
      locator: 'NNN ₪ pattern',
    }
  }

  return null
}

/** Extract product description from page HTML */
const extractProductDescription = (html: string): string | null => {
  // Look for meta description first
  const metaDesc = html.match(/<meta[^>]*name="description"[^>]*content="([^"]{20,200})"/i)
  if (metaDesc) return metaDesc[1].replace(/&[^;]+;/g, ' ').trim()

  // Look for og:description
  const ogDesc = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]{20,200})"/i)
  if (ogDesc) return ogDesc[1].replace(/&[^;]+;/g, ' ').trim()

  // Look for first substantial paragraph after an H1/H2
  const afterHeading = html.match(/<h[12][^>]*>[^<]+<\/h[12]>\s*(?:<[^p][^>]*>)*\s*<p[^>]*>([^<]{30,200})<\/p>/i)
  if (afterHeading) return afterHeading[1].replace(/&[^;]+;/g, ' ').trim()

  return null
}

/** Extract product-specific images from a product page */
const extractProductPageImages = (html: string, pageUrl: string): string[] => {
  const images: string[] = []
  const seen = new Set<string>()

  // Wix image pattern — high-res product images from wixstatic
  const wixImgRegex = /src="(https:\/\/static\.wixstatic\.com\/media\/[^"]+)"/g
  let match: RegExpExecArray | null
  while ((match = wixImgRegex.exec(html)) !== null) {
    const src = match[1]
    // Skip tiny icons (< 100px), CSS sprites, and duplicate variants
    if (src.includes('/w_') || src.includes('/fill/')) {
      const sizeMatch = src.match(/w_(\d+)/)
      if (sizeMatch && parseInt(sizeMatch[1]) < 100) continue
    }
    const baseKey = src.split('~mv2')[0] // Dedupe by base image
    if (!seen.has(baseKey) && images.length < 6) {
      seen.add(baseKey)
      images.push(src)
    }
  }

  // Shopify image pattern
  const shopifyImgRegex = /src="(https:\/\/cdn\.shopify\.com\/s\/files\/[^"]+)"/g
  while ((match = shopifyImgRegex.exec(html)) !== null) {
    const src = match[1]
    if (!seen.has(src) && images.length < 6) {
      seen.add(src)
      images.push(src)
    }
  }

  // General high-res images (> 300px)
  const imgRegex = /src="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp|avif)[^"]*)"/gi
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1]
    const sizeMatch = src.match(/[wW]_?(\d+)/)
    if (sizeMatch && parseInt(sizeMatch[1]) >= 300) {
      if (!seen.has(src) && images.length < 6) {
        seen.add(src)
        images.push(src)
      }
    }
  }

  return images
}

/** Detect product category from name heuristics */
const detectProductCategory = (name: string): string => {
  const lower = name.toLowerCase()
  if (lower.includes('tab') || lower.includes('טאבלט')) return 'tablet'
  if (lower.includes('phone') || lower.includes('טלפון')) return 'phone'
  if (lower.includes('watch') || lower.includes('שעון')) return 'watch'
  if (lower.includes('glass') || lower.includes('משקפ')) return 'glasses'
  return 'product'
}

/** Extract product categories from navigation */
const extractCategories = (scanResult: Record<string, unknown>): Record<string, unknown>[] => {
  const siteMap = scanResult.siteMap as Record<string, unknown> | undefined
  const nav = (siteMap as Record<string, unknown>)?.navigation as Record<string, unknown> | undefined
  const navItems = (nav?.primary as Record<string, unknown>[]) || []

  const categories: Record<string, unknown>[] = []
  const seen = new Set<string>()

  for (const item of navItems) {
    const href = (item.href as string) || ''
    const text = (item.text as string) || ''
    // Category pages: broad category nav items (not individual products)
    const isCategory = /collection|category|קטגור|מוצר/.test(href)
      || (text.length > 3 && text.length < 40 && !/[A-Z]\d+|Ultra|Pro|Light|Prime|Basic/.test(text)
        && /שעון|טאבלט|משקפ|phone|watch|tablet/.test(text.toLowerCase()))
    if (isCategory && !seen.has(text)) {
      seen.add(text)
      categories.push({
        name: field(text, 'dom_nav', 80, 'nav link'),
        url: field(href, 'dom_nav', 90, 'nav href'),
      })
    }
  }

  return categories
}

/** Build migration manifest mapping source content to builder sections */
const buildMigrationManifest = (scanResult: Record<string, unknown>): Record<string, unknown> => {
  const content = scanResult.contentArchitecture as Record<string, unknown> | undefined
  const mappings: Record<string, unknown>[] = []
  const excluded: Record<string, unknown>[] = []
  const flagged: Record<string, unknown>[] = []

  // Map detected sections to builder section types
  const sections = (content?.sections || content?.detectedSections) as Record<string, unknown>[] | undefined
  if (sections) {
    for (const s of sections) {
      const type = (s.type || s.sectionType) as string
      const confidence = (s.confidence as number) || 50

      if (confidence >= 70) {
        mappings.push({
          sourceField: `section.${type}`,
          targetSlot: `section_content.${type}`,
          action: 'preserve',
          confidence,
          notes: `High confidence extraction from ${s.sourceType || 'dom'}`,
        })
      } else if (confidence >= 40) {
        flagged.push({
          field: `section.${type}`,
          reason: `Low confidence (${confidence}%) — may need manual review`,
        })
      } else {
        excluded.push({
          field: `section.${type}`,
          reason: `Very low confidence (${confidence}%) — excluded from migration`,
        })
      }
    }
  }

  // Always exclude UI chrome
  excluded.push(
    { field: 'cookie_banner', reason: 'Not content — UI chrome' },
    { field: 'popup_modals', reason: 'Not content — UI chrome' },
  )

  return { mappings, excluded, flagged }
}
