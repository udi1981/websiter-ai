/**
 * Phase 2 — Visual DNA Extraction
 *
 * Purely programmatic (no AI). Extracts the complete design system:
 *
 * 1.  Aggregate CSS from all pages (inline, <style>, external sheets)
 * 2.  Parse CSS variables from :root
 * 3.  Extract colors (CSS + Tailwind classes), count frequency
 * 4.  Derive semantic color roles
 * 5.  Calculate WCAG contrast ratios
 * 6.  Extract typography (@font-face, Google Fonts, font-family)
 * 7.  Derive type scale from font-size values
 * 8.  Extract spacing scale from margin/padding/gap
 * 9.  Extract border-radius by context
 * 10. Extract box-shadow by context
 * 11. Extract gradients
 * 12. Detect layout system (grid/flex, max-width, columns, breakpoints)
 * 13. Extract image treatment patterns
 * 14. Return complete VisualDNA
 *
 * @module scanner/phases/02-visual-dna
 */

import type { Result } from '@ubuilder/types'
import { ok } from '@ubuilder/types'
import type {
  VisualDNA,
  SpacingSystem,
  BorderSystem,
  ShadowSystem,
  LayoutSystem,
  ImageSystem,
  GradientInfo,
  ScanError,
} from '@ubuilder/types'
import { fetchCss } from '../utils/html-fetcher'
import { resolveUrl } from '../utils/url-resolver'
import {
  aggregateCssFromHtml,
  extractCssVariables,
  extractPropertyValues,
  extractBreakpoints,
} from '../extractors/css-parser'
import { extractColorSystem } from '../extractors/color-extractor'
import { extractTypographySystem } from '../extractors/font-extractor'

// =============================================================================
// Types for this phase
// =============================================================================

export type VisualDnaInput = {
  /** Map of page path -> raw HTML */
  pageHtmlMap: Map<string, string>
  /** Map of page path -> stylesheet URLs to fetch */
  pageCssUrls: Map<string, string[]>
  /** Base origin for resolving relative URLs */
  origin: string
}

export type VisualDnaResult = {
  visualDna: VisualDNA
  errors: ScanError[]
}

// =============================================================================
// CSS aggregation
// =============================================================================

/**
 * Fetch all external stylesheets and combine with inline/embedded CSS.
 * Returns combined CSS text keyed by page path, plus a global aggregate.
 */
const aggregateAllCss = async (
  input: VisualDnaInput,
): Promise<{ perPage: Map<string, string>; combined: string }> => {
  const perPage = new Map<string, string>()

  // Collect all unique CSS URLs across pages
  const allCssUrls = new Set<string>()
  for (const urls of input.pageCssUrls.values()) {
    for (const u of urls) allCssUrls.add(u)
  }

  // Fetch external CSS in parallel (max 15 sheets)
  const urlList = [...allCssUrls].slice(0, 15)
  const fetchResults = await Promise.allSettled(
    urlList.map(url => fetchCss(url)),
  )
  const cssCache = new Map<string, string>()
  for (let i = 0; i < urlList.length; i++) {
    const result = fetchResults[i]
    if (result.status === 'fulfilled' && result.value) {
      cssCache.set(urlList[i], result.value)
    }
  }

  // Aggregate per page
  for (const [path, html] of input.pageHtmlMap.entries()) {
    const { inlineStyles, styleBlocks, stylesheetUrls } = aggregateCssFromHtml(html)
    const externalCss = (input.pageCssUrls.get(path) ?? [])
      .map(url => cssCache.get(url) ?? '')
      .join('\n')

    perPage.set(path, [inlineStyles, styleBlocks, externalCss].join('\n'))
  }

  // Global combined CSS
  const combined = [...perPage.values()].join('\n')

  return { perPage, combined }
}

// =============================================================================
// Spacing extraction
// =============================================================================

/** Extract spacing scale from margin, padding, and gap properties. */
const extractSpacingSystem = (css: string): SpacingSystem => {
  const spacingValues = new Map<string, number>()

  const properties = ['margin', 'padding', 'gap', 'row-gap', 'column-gap',
    'margin-top', 'margin-bottom', 'margin-left', 'margin-right',
    'margin-inline', 'margin-block', 'margin-inline-start', 'margin-inline-end',
    'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
    'padding-inline', 'padding-block']

  for (const prop of properties) {
    const values = extractPropertyValues(css, prop)
    for (const { value, count } of values) {
      // Only numeric values (px, rem, em)
      const parts = value.split(/\s+/)
      for (const part of parts) {
        if (/^\d+(?:\.\d+)?(?:px|rem|em)$/.test(part) && part !== '0px') {
          spacingValues.set(part, (spacingValues.get(part) ?? 0) + count)
        }
      }
    }
  }

  const sorted = [...spacingValues.entries()]
    .sort((a, b) => {
      const numA = parseFloat(a[0])
      const numB = parseFloat(b[0])
      return numA - numB
    })

  const scale = sorted.map(([value]) => value)

  // Derive base unit (most common small value)
  const smallValues = sorted.filter(([v]) => parseFloat(v) <= 16)
  const baseUnit = smallValues.length > 0
    ? smallValues.sort((a, b) => b[1] - a[1])[0][0]
    : null

  // Section padding (largest common vertical padding)
  const sectionCandidates = extractPropertyValues(css, 'padding-top')
    .concat(extractPropertyValues(css, 'padding-block'))
    .filter(v => parseFloat(v.value) >= 40)
    .sort((a, b) => b.count - a.count)
  const sectionPadding = sectionCandidates[0]?.value ?? null

  // Container max-width
  const maxWidths = extractPropertyValues(css, 'max-width')
    .filter(v => /^\d+(?:px|rem|em)$/.test(v.value) && parseFloat(v.value) >= 900)
    .sort((a, b) => b.count - a.count)
  const containerMaxWidth = maxWidths[0]?.value ?? null

  // Content gap
  const gaps = extractPropertyValues(css, 'gap')
    .sort((a, b) => b.count - a.count)
  const contentGap = gaps[0]?.value ?? null

  return { baseUnit, scale, sectionPadding, containerMaxWidth, contentGap }
}

// =============================================================================
// Border radius extraction
// =============================================================================

/** Extract border-radius patterns grouped by context. */
const extractBorderSystem = (css: string): BorderSystem => {
  const radiiMap = new Map<string, { count: number; contexts: string[] }>()

  // Parse rules to get context (selector) + border-radius value
  const ruleRegex = /([^{}]+)\{([^}]*border-radius\s*:\s*([^;}\n]+)[^}]*)\}/gi
  let m: RegExpExecArray | null
  while ((m = ruleRegex.exec(css)) !== null) {
    const selector = m[1].trim().toLowerCase()
    const value = m[3].trim()
    const entry = radiiMap.get(value) ?? { count: 0, contexts: [] }
    entry.count++
    if (entry.contexts.length < 5) entry.contexts.push(selector)
    radiiMap.set(value, entry)
  }

  const radii = [...radiiMap.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .map(([value, { count, contexts }]) => ({
      value,
      frequency: count,
      context: contexts.join(', ').slice(0, 100),
    }))

  // Classify by context
  const findRadiusForContext = (pattern: RegExp): string | null => {
    for (const r of radii) {
      if (pattern.test(r.context)) return r.value
    }
    return null
  }

  return {
    radii,
    primaryRadius: radii[0]?.value ?? null,
    buttonRadius: findRadiusForContext(/btn|button/i),
    cardRadius: findRadiusForContext(/card/i),
    inputRadius: findRadiusForContext(/input|form|field/i),
  }
}

// =============================================================================
// Shadow extraction
// =============================================================================

/** Extract box-shadow patterns grouped by context. */
const extractShadowSystem = (css: string): ShadowSystem => {
  const shadowMap = new Map<string, { count: number; contexts: string[] }>()

  const ruleRegex = /([^{}]+)\{([^}]*box-shadow\s*:\s*([^;}\n]+)[^}]*)\}/gi
  let m: RegExpExecArray | null
  while ((m = ruleRegex.exec(css)) !== null) {
    const selector = m[1].trim().toLowerCase()
    const value = m[3].trim().slice(0, 120)
    if (value === 'none' || value === 'initial') continue
    const entry = shadowMap.get(value) ?? { count: 0, contexts: [] }
    entry.count++
    if (entry.contexts.length < 5) entry.contexts.push(selector)
    shadowMap.set(value, entry)
  }

  const shadows = [...shadowMap.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .map(([value, { count, contexts }]) => ({
      value,
      frequency: count,
      context: contexts.join(', ').slice(0, 100),
    }))

  const findShadowForContext = (pattern: RegExp): string | null => {
    for (const s of shadows) {
      if (pattern.test(s.context)) return s.value
    }
    return null
  }

  // Build elevation scale by shadow size (crude heuristic: sort by blur radius)
  const elevationScale = shadows
    .map(s => s.value)
    .sort((a, b) => {
      const blurA = parseFloat(a.match(/\d+px\s+(\d+)px/)?.[1] ?? '0')
      const blurB = parseFloat(b.match(/\d+px\s+(\d+)px/)?.[1] ?? '0')
      return blurA - blurB
    })
    .slice(0, 5)

  return {
    shadows,
    cardShadow: findShadowForContext(/card/i),
    navShadow: findShadowForContext(/nav|header|sticky/i),
    elevationScale,
  }
}

// =============================================================================
// Gradient extraction
// =============================================================================

/** Extract gradient patterns. */
const extractGradients = (css: string): GradientInfo[] => {
  const gradients: GradientInfo[] = []
  const seen = new Set<string>()

  const ruleRegex = /([^{}]+)\{([^}]*(?:linear|radial|conic)-gradient\([^)]+\)[^}]*)\}/gi
  let m: RegExpExecArray | null
  while ((m = ruleRegex.exec(css)) !== null) {
    const selector = m[1].trim().toLowerCase()
    const gradientMatch = m[2].match(/((?:linear|radial|conic)-gradient\([^)]+\))/i)
    if (!gradientMatch) continue

    const value = gradientMatch[1].slice(0, 200)
    if (seen.has(value)) continue
    seen.add(value)

    const type = value.startsWith('radial') ? 'radial'
      : value.startsWith('conic') ? 'conic'
      : 'linear'

    gradients.push({ value, type, context: selector.slice(0, 80) })
  }

  return gradients.slice(0, 10)
}

// =============================================================================
// Layout system detection
// =============================================================================

/** Detect the layout system characteristics. */
const extractLayoutSystem = (css: string): LayoutSystem => {
  // Max-width
  const maxWidths = extractPropertyValues(css, 'max-width')
    .filter(v => /^\d+(?:px|rem)$/.test(v.value) && parseFloat(v.value) >= 900)
    .sort((a, b) => b.count - a.count)
  const maxWidth = maxWidths[0]?.value ?? null

  // Grid vs flexbox detection
  const gridCount = (css.match(/display\s*:\s*grid/gi) ?? []).length
  const flexCount = (css.match(/display\s*:\s*flex/gi) ?? []).length
  const floatCount = (css.match(/float\s*:\s*(?:left|right)/gi) ?? []).length

  let gridSystem: LayoutSystem['gridSystem'] = 'unknown'
  if (gridCount > 0 && flexCount > 0) gridSystem = 'mixed'
  else if (gridCount > flexCount) gridSystem = 'css-grid'
  else if (flexCount > 0) gridSystem = 'flexbox'
  else if (floatCount > 0) gridSystem = 'float'

  // Column count (from grid-template-columns)
  const colValues = extractPropertyValues(css, 'grid-template-columns')
  let columnCount: number | null = null
  if (colValues.length > 0) {
    // Count repeat() or space-separated values
    const top = colValues[0].value
    const repeatMatch = top.match(/repeat\(\s*(\d+)/)
    if (repeatMatch) {
      columnCount = parseInt(repeatMatch[1])
    } else {
      columnCount = top.split(/\s+/).filter(v => v !== '').length
    }
  }

  // Gutter width
  const gapValues = extractPropertyValues(css, 'gap')
    .concat(extractPropertyValues(css, 'column-gap'))
    .sort((a, b) => b.count - a.count)
  const gutterWidth = gapValues[0]?.value ?? null

  // Breakpoints
  const breakpoints = extractBreakpoints(css)

  // Container strategy
  let containerStrategy: LayoutSystem['containerStrategy'] = 'unknown'
  if (maxWidth && /margin\s*:\s*[^;]*auto/i.test(css)) containerStrategy = 'max-width-center'
  else if (/padding-(?:left|right|inline)\s*:/i.test(css) && !maxWidth) containerStrategy = 'padding'
  else if (/width\s*:\s*100/i.test(css)) containerStrategy = 'fluid'

  return {
    maxWidth,
    gridSystem,
    columnCount,
    gutterWidth,
    breakpoints,
    containerStrategy,
  }
}

// =============================================================================
// Image system detection
// =============================================================================

/** Detect image treatment patterns from HTML and CSS. */
const extractImageSystem = (
  htmlSources: string[],
  css: string,
): ImageSystem => {
  const allHtml = htmlSources.join('\n')

  // Treatments
  const treatment: string[] = []
  if (/border-radius.*(?:50%|9999)/i.test(css) && /img/i.test(css)) treatment.push('circular-crop')
  if (/object-fit\s*:\s*cover/i.test(css)) treatment.push('object-fit-cover')
  if (/filter\s*:/i.test(css) && /img/i.test(css)) treatment.push('css-filter')
  if (/mix-blend-mode/i.test(css)) treatment.push('blend-mode')
  if (/overlay|gradient.*rgba/i.test(css)) treatment.push('overlay')

  // Aspect ratios
  const ratios = new Set<string>()
  const arRegex = /aspect-ratio\s*:\s*([^;}\n]+)/gi
  let m: RegExpExecArray | null
  while ((m = arRegex.exec(css)) !== null) {
    ratios.add(m[1].trim())
  }

  // Hero image style
  let heroImageStyle: string | null = null
  if (/hero[^}]*background-image/i.test(css)) heroImageStyle = 'background-image'
  else if (/hero[^}]*<img/i.test(allHtml)) heroImageStyle = 'inline-img'

  // Loading patterns
  const lazyLoading = /loading\s*=\s*["']lazy["']/i.test(allHtml)
  const webpSupport = /\.webp/i.test(allHtml)
  const responsiveImages = /srcset\s*=/i.test(allHtml) || /<picture/i.test(allHtml)

  return {
    treatment,
    commonAspectRatios: [...ratios],
    heroImageStyle,
    lazyLoading,
    webpSupport,
    responsiveImages,
  }
}

// =============================================================================
// Main phase entry
// =============================================================================

/**
 * Execute Phase 2: Visual DNA Extraction.
 *
 * Extracts the complete design system from all pages' HTML and CSS.
 * This is purely programmatic — no AI calls.
 *
 * @param input - Page HTML map, CSS URLs, and origin from Phase 1
 * @returns Result containing the complete VisualDNA
 */
export const runVisualDnaPhase = async (
  input: VisualDnaInput,
): Promise<Result<VisualDnaResult>> => {
  const errors: ScanError[] = []

  // 1. Aggregate all CSS
  const { perPage, combined } = await aggregateAllCss(input)

  // 2. CSS variables
  const cssVariables = extractCssVariables(combined)

  // 3-5. Color system (includes semantic roles + WCAG contrast)
  const cssSources = [...perPage.entries()].map(([path, css]) => ({ css, pagePath: path }))
  const htmlSources = [...input.pageHtmlMap.entries()].map(([path, html]) => ({ html, pagePath: path }))
  const colorSystem = extractColorSystem(cssSources, htmlSources)

  // 6-7. Typography system
  const typographySystem = extractTypographySystem(
    [...perPage.values()],
    [...input.pageHtmlMap.values()],
  )

  // 8. Spacing system
  const spacingSystem = extractSpacingSystem(combined)

  // 9. Border system
  const borderSystem = extractBorderSystem(combined)

  // 10. Shadow system
  const shadowSystem = extractShadowSystem(combined)

  // 11. Gradients
  const gradients = extractGradients(combined)

  // 12. Layout system
  const layoutSystem = extractLayoutSystem(combined)

  // 13. Image system
  const imageSystem = extractImageSystem(
    [...input.pageHtmlMap.values()],
    combined,
  )

  const visualDna: VisualDNA = {
    colorSystem,
    typographySystem,
    spacingSystem,
    borderSystem,
    shadowSystem,
    layoutSystem,
    imageSystem,
    gradients,
    cssVariables,
  }

  return ok({ visualDna, errors })
}
