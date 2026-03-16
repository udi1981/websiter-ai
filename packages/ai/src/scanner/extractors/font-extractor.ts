/**
 * Typography extraction engine — finds all font families, weights,
 * type scale, and line heights from CSS sources and HTML.
 *
 * @module scanner/extractors/font-extractor
 */

import type { TypographySystem, FontToken, TypographySpec } from '@ubuilder/types'
import { extractFontFaces, extractGoogleFontUrls, extractPropertyValues } from './css-parser'

// =============================================================================
// Constants
// =============================================================================

const SYSTEM_FONTS = new Set([
  'arial', 'helvetica', 'times new roman', 'times', 'courier new', 'courier',
  'verdana', 'georgia', 'palatino', 'garamond', 'tahoma', 'trebuchet ms',
  'impact', 'comic sans ms', 'system-ui', 'sans-serif', 'serif', 'monospace',
  'ui-sans-serif', 'ui-serif', 'ui-monospace', '-apple-system',
  'blinkmacsystemfont', 'segoe ui', 'inherit', 'initial', 'unset', 'revert',
])

const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])

// =============================================================================
// Font family extraction
// =============================================================================

type RawFontEntry = {
  family: string
  isHeading: boolean
  weight: number
  source: FontToken['source']
  url: string | null
}

/**
 * Extract all font families from Google Fonts links in HTML.
 */
const extractGoogleFonts = (htmlSources: string[]): RawFontEntry[] => {
  const entries: RawFontEntry[] = []
  for (const html of htmlSources) {
    const urls = extractGoogleFontUrls(html)
    for (const url of urls) {
      // Parse family names from URL: family=Roboto:wght@400;700&family=Open+Sans
      const familyRegex = /family=([^&:]+)/g
      let m: RegExpExecArray | null
      while ((m = familyRegex.exec(url)) !== null) {
        const name = decodeURIComponent(m[1]).replace(/\+/g, ' ').trim()
        if (!name) continue
        // Extract weights if present
        const weightMatch = url.match(new RegExp(`${m[1]}[^&]*wght@([\\d;]+)`))
        const weights = weightMatch
          ? weightMatch[1].split(';').map(Number).filter(Boolean)
          : [400]
        entries.push({
          family: name,
          isHeading: false,
          weight: weights[0] ?? 400,
          source: 'google-fonts',
          url,
        })
      }
    }
  }
  return entries
}

/**
 * Extract font families from @font-face declarations.
 */
const extractCustomFonts = (css: string): RawFontEntry[] => {
  const faces = extractFontFaces(css)
  return faces.map(f => ({
    family: f.family.replace(/["']/g, ''),
    isHeading: false,
    weight: parseInt(f.weight) || 400,
    source: 'custom' as const,
    url: null,
  }))
}

/**
 * Extract font families from font-family declarations in CSS.
 */
const extractCssFontFamilies = (css: string): RawFontEntry[] => {
  const entries: RawFontEntry[] = []
  // Match font-family in rule contexts to detect heading usage
  const ruleRegex = /([^{}]+)\{([^}]*font-family\s*:\s*([^;}"]+)[^}]*)\}/gi
  let m: RegExpExecArray | null
  while ((m = ruleRegex.exec(css)) !== null) {
    const selector = m[1].trim().toLowerCase()
    const families = m[3].split(',').map(f => f.trim().replace(/["']/g, ''))
    const isHeading = HEADING_TAGS.has(selector) ||
      /^h[1-6]\b/.test(selector) ||
      /\.heading|\.title|\.headline/i.test(selector)

    for (const family of families) {
      if (!family || SYSTEM_FONTS.has(family.toLowerCase())) continue
      entries.push({
        family,
        isHeading,
        weight: 400,
        source: 'unknown',
        url: null,
      })
    }
  }
  return entries
}

// =============================================================================
// Type scale extraction
// =============================================================================

/**
 * Extract the type scale by finding font-size values applied to h1-h6, body, etc.
 */
const extractTypeScale = (css: string): TypographySystem['scale'] => {
  const scale: TypographySystem['scale'] = {
    h1: null, h2: null, h3: null, h4: null, h5: null, h6: null,
    body: null, small: null, caption: null,
  }

  const selectors: Array<{ key: keyof typeof scale; patterns: RegExp[] }> = [
    { key: 'h1', patterns: [/\bh1\b/i] },
    { key: 'h2', patterns: [/\bh2\b/i] },
    { key: 'h3', patterns: [/\bh3\b/i] },
    { key: 'h4', patterns: [/\bh4\b/i] },
    { key: 'h5', patterns: [/\bh5\b/i] },
    { key: 'h6', patterns: [/\bh6\b/i] },
    { key: 'body', patterns: [/\bbody\b/i, /\bp\b(?!\w)/i] },
    { key: 'small', patterns: [/\bsmall\b/i, /\.text-sm\b/i] },
    { key: 'caption', patterns: [/\.caption\b/i, /\.text-xs\b/i, /figcaption/i] },
  ]

  // Parse all rules for their selector + declarations
  const ruleRegex = /([^{}]+)\{([^}]+)\}/g
  let m: RegExpExecArray | null
  while ((m = ruleRegex.exec(css)) !== null) {
    const selector = m[1].trim()
    const body = m[2]

    for (const { key, patterns } of selectors) {
      if (scale[key]) continue // already found
      const matches = patterns.some(p => p.test(selector))
      if (!matches) continue

      const fontSize = body.match(/font-size\s*:\s*([^;}\n]+)/)?.[1]?.trim()
      const fontWeight = body.match(/font-weight\s*:\s*([^;}\n]+)/)?.[1]?.trim()
      const lineHeight = body.match(/line-height\s*:\s*([^;}\n]+)/)?.[1]?.trim()
      const letterSpacing = body.match(/letter-spacing\s*:\s*([^;}\n]+)/)?.[1]?.trim()
      const fontFamily = body.match(/font-family\s*:\s*([^;}"]+)/)?.[1]?.trim()

      if (fontSize) {
        scale[key] = {
          fontSize,
          fontWeight: fontWeight ?? (key.startsWith('h') ? '700' : '400'),
          lineHeight: lineHeight ?? '1.5',
          letterSpacing: letterSpacing ?? 'normal',
          fontFamily: fontFamily?.split(',')[0]?.replace(/["']/g, '') ?? '',
        }
      }
    }
  }

  return scale
}

// =============================================================================
// Main extraction
// =============================================================================

/**
 * Extract the complete typography system from all CSS and HTML sources.
 *
 * @param cssSources - Combined CSS text from all pages
 * @param htmlSources - Raw HTML from all pages (for Google Fonts link extraction)
 * @returns Complete TypographySystem
 */
export const extractTypographySystem = (
  cssSources: string[],
  htmlSources: string[],
): TypographySystem => {
  const allCss = cssSources.join('\n')
  const allEntries: RawFontEntry[] = []

  // 1. Google Fonts
  allEntries.push(...extractGoogleFonts(htmlSources))

  // 2. @font-face
  allEntries.push(...extractCustomFonts(allCss))

  // 3. font-family declarations
  allEntries.push(...extractCssFontFamilies(allCss))

  // Aggregate by family name
  const familyMap = new Map<string, {
    isHeading: boolean
    weights: Set<number>
    source: FontToken['source']
    url: string | null
    count: number
  }>()

  for (const entry of allEntries) {
    const key = entry.family.toLowerCase()
    const existing = familyMap.get(key)
    if (existing) {
      existing.count++
      existing.weights.add(entry.weight)
      if (entry.isHeading) existing.isHeading = true
      // Prefer more specific sources
      if (entry.source !== 'unknown') existing.source = entry.source
      if (entry.url) existing.url = entry.url
    } else {
      familyMap.set(key, {
        isHeading: entry.isHeading,
        weights: new Set([entry.weight]),
        source: entry.source,
        url: entry.url,
        count: 1,
      })
    }
  }

  // Build font tokens sorted by frequency
  const fonts: FontToken[] = [...familyMap.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .map(([key, data]) => {
      // Determine usage: if only 1-2 fonts, first is heading, second is body
      let usage: FontToken['usage'] = 'unknown'
      if (data.isHeading) usage = 'heading'
      return {
        family: key.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        usage,
        weights: [...data.weights].sort((a, b) => a - b),
        source: data.source,
        url: data.url,
      }
    })

  // If no heading font was explicitly detected, assign by order
  const hasHeading = fonts.some(f => f.usage === 'heading')
  if (!hasHeading && fonts.length >= 1) {
    fonts[0].usage = 'heading'
  }
  if (fonts.length >= 2 && fonts[1].usage === 'unknown') {
    fonts[1].usage = 'body'
  }
  if (fonts.length === 1 && fonts[0].usage === 'heading') {
    // Single font used for everything
    fonts[0].usage = 'body'
  }

  // 4. Type scale
  const scale = extractTypeScale(allCss)

  // 5. Line heights and letter spacings
  const lineHeights = extractPropertyValues(allCss, 'line-height')
    .slice(0, 10)
    .map(v => v.value)

  const letterSpacings = extractPropertyValues(allCss, 'letter-spacing')
    .slice(0, 10)
    .map(v => v.value)

  return {
    fonts,
    scale,
    lineHeights,
    letterSpacings,
  }
}
