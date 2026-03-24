/**
 * Scanner V2 Pipeline Orchestrator
 *
 * Runs all 7 scanner phases in sequence, emitting progress events.
 * Each phase is fault-tolerant except Phase 1 (Discovery), which is fatal.
 *
 * @module scanner/pipeline
 */

import type {
  ScanResult,
  PhaseResult,
  ScanError,
  SiteMap,
  VisualDNA,
  ComponentLibrary,
  ContentArchitecture,
  BrandIntelligence,
  TechnicalDNA,
  StrategicInsights,
} from '@ubuilder/types'

// ── Types ───────────────────────────────────────────────────────────────────

export type ScanProgress = {
  phase: string
  status: 'pending' | 'running' | 'done' | 'error' | 'skipped'
  percent: number
  message: string
  data?: unknown
}

export type ScanPipelineOptions = {
  /** Maximum pages to crawl (default 30) */
  maxPages?: number
  /** Skip AI-powered phases 5 and 7 (default false) */
  skipAi?: boolean
  /** Total timeout in milliseconds (default 300000 — 5 min) */
  timeout?: number
  /** Progress callback, called after every phase event */
  onProgress?: (progress: ScanProgress) => void
}

// ── Phase definitions ───────────────────────────────────────────────────────

type PhaseName =
  | 'discovery'
  | 'visual-dna'
  | 'components'
  | 'content'
  | 'brand-intelligence'
  | 'technical'
  | 'strategic-insights'

const PHASE_ORDER: PhaseName[] = [
  'discovery',
  'visual-dna',
  'components',
  'content',
  'brand-intelligence',
  'technical',
  'strategic-insights',
]

const PHASE_LABELS: Record<PhaseName, string> = {
  'discovery': 'Discovering and crawling pages',
  'visual-dna': 'Extracting visual design system',
  'components': 'Detecting UI component patterns',
  'content': 'Mapping content architecture',
  'brand-intelligence': 'AI brand personality analysis',
  'technical': 'Analyzing technical DNA',
  'strategic-insights': 'AI strategic recommendations',
}

const PHASE_WEIGHT: Record<PhaseName, number> = {
  'discovery': 15,
  'visual-dna': 15,
  'components': 12,
  'content': 12,
  'brand-intelligence': 18,
  'technical': 12,
  'strategic-insights': 16,
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Generate a simple scan ID */
const generateScanId = (): string => {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 8)
  return `scan_${ts}_${rand}`
}

/** Calculate cumulative progress percent from completed phases */
const cumulativePercent = (completed: PhaseName[]): number => {
  let total = 0
  for (const phase of completed) {
    total += PHASE_WEIGHT[phase]
  }
  return Math.min(total, 100)
}

// ── Main Pipeline ───────────────────────────────────────────────────────────

/**
 * Run the full 7-phase scan pipeline against a URL.
 *
 * Phase 1 failure is fatal. All other phases degrade gracefully.
 * AI phases (5, 7) are skipped when `skipAi` is true.
 *
 * @param url - The website URL to scan
 * @param options - Pipeline configuration
 * @returns The complete ScanResult
 */
export const runScanPipeline = async (
  url: string,
  options?: ScanPipelineOptions,
): Promise<ScanResult> => {
  const maxPages = options?.maxPages ?? 30
  const skipAi = options?.skipAi ?? false
  const timeout = options?.timeout ?? 300_000
  const onProgress = options?.onProgress

  // Validate and normalize URL
  let normalizedUrl = url.trim()
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = `https://${normalizedUrl}`
  }

  let baseUrl: URL
  try {
    baseUrl = new URL(normalizedUrl)
  } catch {
    throw new Error(`Invalid URL: ${url}`)
  }

  const startTime = Date.now()
  const result = createSkeleton(normalizedUrl, baseUrl.hostname)
  const completedPhases: PhaseName[] = []

  // Timeout controller
  const timeoutController = new AbortController()
  const timeoutTimer = setTimeout(() => timeoutController.abort(), timeout)

  const emit = (phase: PhaseName, status: ScanProgress['status'], message: string, data?: unknown) => {
    onProgress?.({
      phase,
      status,
      percent: cumulativePercent(completedPhases),
      message,
      data,
    })
  }

  const setPhaseResult = (
    name: PhaseName,
    status: PhaseResult['status'],
    duration: number,
    details: Record<string, unknown> = {},
  ) => {
    const idx = PHASE_ORDER.indexOf(name)
    if (idx >= 0) {
      result.phases[idx] = { name, status, duration, details }
    }
  }

  // Shared state between phases
  let pageHtmlMap = new Map<string, string>()
  let pageCssUrls = new Map<string, string[]>()

  try {
    // ── Phase 1: Discovery & Crawl ──────────────────────────────────────
    await executePhase('discovery', result, completedPhases, emit, setPhaseResult, timeoutController, async () => {
      const { runDiscoveryPhase } = await import('./phases/01-discovery')
      const discoveryResult = await runDiscoveryPhase(normalizedUrl, maxPages)

      if (!discoveryResult.ok) {
        throw new Error(discoveryResult.error)
      }

      result.siteMap = discoveryResult.data.siteMap
      pageHtmlMap = discoveryResult.data.pageHtmlMap
      pageCssUrls = discoveryResult.data.pageCssUrls
      result.siteName = extractSiteName(result.siteMap, baseUrl.hostname)

      if (discoveryResult.data.errors.length > 0) {
        result.errors.push(...discoveryResult.data.errors)
      }

      return {
        pagesFound: result.siteMap.pages.length,
        pagesFetched: pageHtmlMap.size,
      }
    }, true) // fatal = true

    // Build pages array for downstream phases
    const pagesForPhases = buildPagesArray(pageHtmlMap, pageCssUrls, result.siteMap)

    // Memory fix: pageHtmlMap is no longer needed after pagesForPhases is built
    // (Visual DNA phase still uses it — clear after phase 2)

    // ── Phase 2: Visual DNA ─────────────────────────────────────────────
    // Phase modules define their own internal types. We cast at boundaries.
    /* eslint-disable @typescript-eslint/no-explicit-any */
    await executePhase('visual-dna', result, completedPhases, emit, setPhaseResult, timeoutController, async () => {
      try {
        const mod = await import('./phases/02-visual-dna')
        // Phase 2 expects VisualDnaInput { pageHtmlMap, pageCssUrls, origin }
        const vdnResult = await mod.runVisualDnaPhase({
          pageHtmlMap,
          pageCssUrls,
          origin: baseUrl.origin,
        })
        if (vdnResult.ok) {
          result.visualDna = vdnResult.data.visualDna as any
          if (vdnResult.data.errors?.length) {
            result.errors.push(...(vdnResult.data.errors as any))
          }
        } else {
          result.visualDna = extractBasicVisualDna(pagesForPhases)
        }
      } catch {
        result.visualDna = extractBasicVisualDna(pagesForPhases)
      }
      const colorCount = (result.visualDna as any).colorSystem?.palette?.length ?? 0
      const fontCount = (result.visualDna as any).typographySystem?.fonts?.length ?? 0
      return { colorCount, fontCount }
    })

    // Memory fix: release raw HTML maps after visual DNA is extracted (~3-6MB freed)
    pageHtmlMap.clear()
    pageCssUrls.clear()

    // ── Phase 3: Component Library ──────────────────────────────────────
    await executePhase('components', result, completedPhases, emit, setPhaseResult, timeoutController, async () => {
      const mod = await import('./phases/03-components')
      const phaseResult = await mod.extractComponentLibrary(
        pagesForPhases.map((p) => ({ url: p.url, html: p.html })),
        result.visualDna as any,
      )
      result.componentLibrary = phaseResult as any
      return {
        sectionCount: (phaseResult as any).sections?.length ?? 0,
        componentCount: (phaseResult as any).components?.length ?? 0,
      }
    })

    // ── Phase 4: Content Architecture ───────────────────────────────────
    await executePhase('content', result, completedPhases, emit, setPhaseResult, timeoutController, async () => {
      const mod = await import('./phases/04-content')
      const phaseResult = await mod.extractContentArchitecture(
        pagesForPhases.map((p) => ({ url: p.url, html: p.html, path: p.path })),
        [] as any,
      )
      result.contentArchitecture = phaseResult as any
      return { pagesMapped: (phaseResult as any).pages?.length ?? 0 }
    })

    // ── Phase 5: Brand Intelligence (AI) ────────────────────────────────
    if (skipAi) {
      setPhaseResult('brand-intelligence', 'skipped', 0, { reason: 'skipAi option' })
      completedPhases.push('brand-intelligence')
      emit('brand-intelligence', 'skipped', 'AI brand analysis skipped')
    } else {
      await executePhase('brand-intelligence', result, completedPhases, emit, setPhaseResult, timeoutController, async () => {
        const mod = await import('./phases/05-brand')
        const phaseResult = await mod.extractBrandIntelligence(
          pagesForPhases.map((p) => ({ url: p.url, html: p.html, path: p.path })),
          result.siteMap as any,
          result.visualDna as any,
          result.contentArchitecture as any,
        )
        result.brandIntelligence = phaseResult as any
        return {
          mood: (phaseResult as any).personality?.mood ?? '',
          archetype: (phaseResult as any).personality?.archetype ?? '',
        }
      })
    }

    // ── Phase 6: Technical DNA ──────────────────────────────────────────
    await executePhase('technical', result, completedPhases, emit, setPhaseResult, timeoutController, async () => {
      const mod = await import('./phases/06-technical')
      const cssStrings = collectCssStrings(pagesForPhases)
      const phaseResult = await mod.extractTechnicalDna(
        pagesForPhases.map((p) => ({ url: p.url, html: p.html })),
        cssStrings,
      )
      result.technicalDna = phaseResult as any
      return {
        a11yScore: (phaseResult as any).accessibility?.score ?? 0,
        motionLibrary: (phaseResult as any).motion?.library ?? null,
      }
    })

    // Memory fix: release pagesForPhases — phases 7+ only need extracted data (~3-6MB freed)
    pagesForPhases.length = 0

    // ── Phase 7: Strategic Insights (AI) ────────────────────────────────
    if (skipAi) {
      setPhaseResult('strategic-insights', 'skipped', 0, { reason: 'skipAi option' })
      completedPhases.push('strategic-insights')
      emit('strategic-insights', 'skipped', 'AI strategic analysis skipped')
    } else {
      await executePhase('strategic-insights', result, completedPhases, emit, setPhaseResult, timeoutController, async () => {
        const mod = await import('./phases/07-strategic')
        const phaseResult = await mod.extractStrategicInsights({
          siteMap: result.siteMap as any,
          visualDna: result.visualDna as any,
          componentLib: result.componentLibrary as any,
          contentArch: result.contentArchitecture as any,
          brandIntel: result.brandIntelligence as any,
          technicalDna: result.technicalDna as any,
        })
        result.strategicInsights = phaseResult as any
        return {
          insightCount: (phaseResult as any).insights?.length ?? (phaseResult as any).strengths?.length ?? 0,
          missingSections: (phaseResult as any).missingSections?.length ?? 0,
        }
      })
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
  } finally {
    clearTimeout(timeoutTimer)
  }

  // Calculate confidence and timing
  result.confidence = calculateConfidence(completedPhases, result.siteMap.pages.length, skipAi)
  result.scanDuration = Date.now() - startTime
  result.businessType = result.brandIntelligence?.industry?.primary || result.businessType
  result.industryCategory = result.brandIntelligence?.industry?.sub || result.industryCategory

  return result
}

// ── Phase executor ──────────────────────────────────────────────────────────

const executePhase = async (
  name: PhaseName,
  result: ScanResult,
  completedPhases: PhaseName[],
  emit: (phase: PhaseName, status: ScanProgress['status'], message: string, data?: unknown) => void,
  setPhaseResult: (name: PhaseName, status: PhaseResult['status'], duration: number, details?: Record<string, unknown>) => void,
  timeoutController: AbortController,
  fn: () => Promise<Record<string, unknown>>,
  fatal = false,
): Promise<void> => {
  if (timeoutController.signal.aborted) {
    setPhaseResult(name, 'skipped', 0, { reason: 'timeout' })
    result.errors.push({ phase: name, message: 'Skipped due to total timeout', recoverable: true })
    emit(name, 'skipped', `${PHASE_LABELS[name]} skipped (timeout)`)
    return
  }

  emit(name, 'running', PHASE_LABELS[name])
  const phaseStart = Date.now()

  try {
    const details = await fn()
    const duration = Date.now() - phaseStart
    setPhaseResult(name, 'done', duration, details)
    completedPhases.push(name)
    emit(name, 'done', `${PHASE_LABELS[name]} complete`, details)
  } catch (error) {
    const duration = Date.now() - phaseStart
    const message = error instanceof Error ? error.message : 'Unknown error'
    setPhaseResult(name, 'error', duration, { error: message })
    result.errors.push({ phase: name, message, recoverable: !fatal })

    if (fatal) {
      emit(name, 'error', `Fatal: ${message}`)
      throw error
    }

    emit(name, 'error', `Phase failed: ${message}, continuing...`)
  }
}

// ── Confidence calculation ──────────────────────────────────────────────────

const calculateConfidence = (
  completedPhases: PhaseName[],
  pageCount: number,
  skipAi: boolean,
): number => {
  let score = 0
  score += completedPhases.length * 14
  if (pageCount >= 10) score += 5
  else if (pageCount >= 5) score += 3
  else if (pageCount >= 2) score += 1
  if (!skipAi && completedPhases.includes('brand-intelligence')) score += 8
  if (!skipAi && completedPhases.includes('strategic-insights')) score += 7
  return Math.min(Math.round(score), 100)
}

// ── Data conversion helpers ─────────────────────────────────────────────────

type PipelinePage = {
  url: string
  path: string
  title: string
  html: string
  css: string
  statusCode: number
}

/** Build an array of pages from the discovery phase output maps */
const buildPagesArray = (
  htmlMap: Map<string, string>,
  cssMap: Map<string, string[]>,
  siteMap: SiteMap,
): PipelinePage[] => {
  const pages: PipelinePage[] = []
  for (const page of siteMap.pages) {
    const html = htmlMap.get(page.path) ?? htmlMap.get(page.url) ?? ''
    if (!html) continue
    pages.push({
      url: page.url,
      path: page.path,
      title: page.title,
      html,
      css: '', // CSS will be fetched lazily if needed
      statusCode: page.statusCode,
    })
  }
  return pages
}

/** Collect CSS strings from pages for technical analysis */
const collectCssStrings = (pages: PipelinePage[]): string[] => {
  const cssSet = new Set<string>()
  for (const page of pages) {
    // Extract inline styles
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi
    let match
    while ((match = styleRegex.exec(page.html)) !== null) {
      if (match[1] && match[1].length > 10) {
        cssSet.add(match[1])
      }
    }
    if (page.css) cssSet.add(page.css)
  }
  return [...cssSet]
}

/** Extract site name from the site map or homepage title */
const extractSiteName = (siteMap: SiteMap, fallbackDomain: string): string => {
  const homepage = siteMap.pages.find((p) => p.path === '/' || p.depth === 0)
  if (homepage?.title) {
    // Strip common suffixes like "| Company Name" or "- Home"
    const cleaned = homepage.title.split(/[|\-–—]/)[0]?.trim()
    if (cleaned && cleaned.length > 1 && cleaned.length < 60) return cleaned
  }
  return fallbackDomain.replace(/^www\./, '').split('.')[0] ?? fallbackDomain
}

/** Basic visual DNA extraction when Phase 2 module is not available */
const extractBasicVisualDna = (pages: PipelinePage[]): VisualDNA => {
  const allHtml = pages.map((p) => p.html).join('\n')

  // Extract hex colors
  const colorMap = new Map<string, number>()
  const hexRegex = /#(?:[0-9a-fA-F]{3}){1,2}\b/g
  let match
  while ((match = hexRegex.exec(allHtml)) !== null) {
    const hex = match[0].toLowerCase()
    if (hex === '#ffffff' || hex === '#000000' || hex === '#fff' || hex === '#000') continue
    colorMap.set(hex, (colorMap.get(hex) ?? 0) + 1)
  }

  const palette = [...colorMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([hex, frequency]) => ({
      hex,
      usageRole: 'unknown' as const,
      frequency,
      pagesUsedOn: [] as string[],
      cssProperty: '',
    }))

  // Extract fonts
  const fontMap = new Map<string, number>()
  const fontRegex = /font-family:\s*["']?([^"';},]+)/gi
  while ((match = fontRegex.exec(allHtml)) !== null) {
    const name = match[1].split(',')[0].trim().replace(/["']/g, '').toLowerCase()
    const skip = ['inherit', 'initial', 'unset', 'system-ui', 'sans-serif', 'serif', 'monospace']
    if (skip.includes(name)) continue
    fontMap.set(name, (fontMap.get(name) ?? 0) + 1)
  }

  const fonts = [...fontMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([family], i) => ({
      family,
      usage: (i === 0 ? 'heading' : i === 1 ? 'body' : 'unknown') as 'heading' | 'body' | 'accent' | 'code' | 'unknown',
      weights: [400],
      source: 'unknown' as const,
      url: null,
    }))

  return {
    colorSystem: {
      palette,
      primary: palette[0]?.hex ?? null,
      secondary: palette[1]?.hex ?? null,
      accent: palette[2]?.hex ?? null,
      background: null,
      surface: null,
      text: null,
      textSecondary: null,
      border: null,
      darkMode: false,
      contrastPairs: [],
    },
    typographySystem: {
      fonts,
      scale: { h1: null, h2: null, h3: null, h4: null, h5: null, h6: null, body: null, small: null, caption: null },
      lineHeights: [],
      letterSpacings: [],
    },
    spacingSystem: { baseUnit: null, scale: [], sectionPadding: null, containerMaxWidth: null, contentGap: null },
    borderSystem: { radii: [], primaryRadius: null, buttonRadius: null, cardRadius: null, inputRadius: null },
    shadowSystem: { shadows: [], cardShadow: null, navShadow: null, elevationScale: [] },
    layoutSystem: { maxWidth: null, gridSystem: 'unknown', columnCount: null, gutterWidth: null, breakpoints: [], containerStrategy: 'unknown' },
    imageSystem: { treatment: [], commonAspectRatios: [], heroImageStyle: null, lazyLoading: false, webpSupport: false, responsiveImages: false },
    gradients: [],
    cssVariables: {},
  }
}

// ── Skeleton factory ────────────────────────────────────────────────────────

const createSkeleton = (url: string, domain: string): ScanResult => ({
  id: generateScanId(),
  url,
  domain,
  siteName: domain,
  businessType: 'business',
  industryCategory: 'general',
  locale: 'en-US',
  scanDate: new Date().toISOString(),
  scanDuration: 0,
  version: '2.0.0',
  siteMap: {
    pages: [],
    sitemapUrl: null,
    robotsTxt: null,
    navigation: { primary: [], secondary: [], footer: [], breadcrumbs: false, megaMenu: false, mobileNav: 'unknown' },
    totalInternalLinks: 0,
    totalExternalLinks: 0,
  },
  visualDna: extractBasicVisualDna([]),
  componentLibrary: { components: [], sections: [] },
  contentArchitecture: {
    pages: [],
    ctaStrategy: { primaryCta: null, secondaryCtas: [], ctaPlacement: [], ctaStyle: '' },
    trustElements: { testimonials: [], clientLogos: [], stats: [], certifications: [], awards: [], socialProof: [] },
    conversionFunnel: { entryPoints: [], microConversions: [], primaryConversion: null, steps: [] },
    contentTone: { formality: 3, voice: [], perspective: 'second-person', sentenceLength: 15, jargonLevel: 2, samplePhrases: [] },
  },
  brandIntelligence: {
    logo: null,
    personality: { traits: [], mood: '', archetype: '', designLanguage: '' },
    targetAudience: { demographics: [], painPoints: [], desires: [], sophistication: 3 },
    industry: { primary: 'general', sub: '', niche: '', competitors: [] },
    valueProposition: { headline: '', subheadline: '', benefits: [], differentiators: [], proofPoints: [] },
  },
  technicalDna: {
    seo: {
      meta: { title: '', description: '', keywords: '', ogTitle: '', ogDescription: '', ogImage: '' },
      headingStructure: { h1Count: 0, h2Count: 0, h3Count: 0, hasProperHierarchy: false },
      links: { internal: 0, external: 0, nofollow: 0, broken: 0 },
      altTextCoverage: 0,
      canonical: null,
      sitemap: false,
      hreflang: [],
    },
    performance: { imageCount: 0, lazyLoading: false, modernImageFormats: false, preloads: [], minification: false },
    motion: { library: null, scrollAnimations: false, parallax: false, stickyHeader: false, hoverEffects: [], scrollReveals: [], suggestedIntensity: 'none' },
    responsive: { approach: 'unknown', breakpoints: [], mobileNavType: 'unknown', stackingBehavior: '', typographyScaling: false },
    accessibility: { score: 0, ariaLabels: false, skipLink: false, focusStyles: false, colorContrast: false, issues: [] },
    techStack: { framework: null, cssFramework: null, cms: null, analytics: [], cdn: null, hosting: null },
    structuredData: [],
  },
  strategicInsights: {
    insights: [],
    missingSections: [],
    industryBenchmark: { designTrendAlignment: 0, bestPracticeScore: 0, recommendedSections: [], recommendedFeatures: [] },
    rebuildPlan: { preserve: [], rebuild: [], improve: [], add: [], remove: [] },
  },
  phases: PHASE_ORDER.map((name) => ({
    name,
    status: 'pending' as const,
    duration: 0,
    details: {},
  })),
  errors: [],
  confidence: 0,
})
