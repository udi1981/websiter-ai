/**
 * CSS parser for server-side extraction of design tokens from raw CSS text.
 *
 * Uses regex-based parsing (no external dependencies) to extract:
 * - CSS custom properties
 * - Property values grouped by property name
 * - @font-face declarations
 * - @media breakpoints
 * - @keyframes names
 *
 * @module scanner/extractors/css-parser
 */

/** A single CSS declaration (property: value). */
export type CssDeclaration = {
  property: string
  value: string
}

/** Aggregated CSS from all sources for a single page. */
export type AggregatedCss = {
  /** Concatenated inline styles from style attributes */
  inlineStyles: string
  /** Concatenated <style> block contents */
  styleBlocks: string
  /** Concatenated external stylesheet contents */
  externalSheets: string
}

/**
 * Extract all CSS custom properties (--*) from :root or * selectors.
 * Returns a map of variable name -> value.
 */
export const extractCssVariables = (css: string): Record<string, string> => {
  const vars: Record<string, string> = {}
  const regex = /(--[\w-]+)\s*:\s*([^;}\n]+)/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(css)) !== null) {
    const name = match[1].trim()
    const value = match[2].trim()
    if (name && value) {
      vars[name] = value
    }
  }
  return vars
}

/**
 * Extract all values for a specific CSS property across the stylesheet.
 * Returns an array of values with occurrence counts.
 */
export const extractPropertyValues = (
  css: string,
  property: string,
): Array<{ value: string; count: number }> => {
  const counts = new Map<string, number>()
  // Match the property with optional vendor prefix
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(?:^|[;{\\s])${escaped}\\s*:\\s*([^;}\n]+)`, 'gi')
  let match: RegExpExecArray | null
  while ((match = regex.exec(css)) !== null) {
    const value = match[1].trim()
    if (value && value !== 'inherit' && value !== 'initial' && value !== 'unset') {
      counts.set(value, (counts.get(value) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Extract @font-face declarations, returning family name and src URL.
 */
export const extractFontFaces = (
  css: string,
): Array<{ family: string; src: string; weight: string; style: string }> => {
  const results: Array<{ family: string; src: string; weight: string; style: string }> = []
  const blockRegex = /@font-face\s*\{([^}]+)\}/gi
  let block: RegExpExecArray | null
  while ((block = blockRegex.exec(css)) !== null) {
    const body = block[1]
    const familyMatch = body.match(/font-family\s*:\s*['"]?([^'";}\n]+)/)
    const srcMatch = body.match(/src\s*:\s*([^;}\n]+)/)
    const weightMatch = body.match(/font-weight\s*:\s*([^;}\n]+)/)
    const styleMatch = body.match(/font-style\s*:\s*([^;}\n]+)/)

    if (familyMatch) {
      results.push({
        family: familyMatch[1].trim(),
        src: srcMatch?.[1]?.trim() ?? '',
        weight: weightMatch?.[1]?.trim() ?? '400',
        style: styleMatch?.[1]?.trim() ?? 'normal',
      })
    }
  }
  return results
}

/**
 * Extract all @media breakpoints from the CSS.
 */
export const extractBreakpoints = (css: string): string[] => {
  const bps = new Set<string>()
  const regex = /@media[^{]*(?:min-width|max-width)\s*:\s*(\d+(?:px|em|rem))/gi
  let match: RegExpExecArray | null
  while ((match = regex.exec(css)) !== null) {
    bps.add(match[1])
  }
  return [...bps].sort((a, b) => {
    const numA = parseFloat(a)
    const numB = parseFloat(b)
    return numA - numB
  })
}

/**
 * Extract @keyframes animation names.
 */
export const extractKeyframeNames = (css: string): string[] => {
  const names = new Set<string>()
  const regex = /@keyframes\s+([\w-]+)/gi
  let match: RegExpExecArray | null
  while ((match = regex.exec(css)) !== null) {
    names.add(match[1])
  }
  return [...names]
}

/**
 * Aggregate all CSS from a page's HTML: inline styles, <style> blocks,
 * and extract stylesheet link URLs for external fetching.
 */
export const aggregateCssFromHtml = (html: string): {
  inlineStyles: string
  styleBlocks: string
  stylesheetUrls: string[]
} => {
  // Inline styles from style="..."
  const inlineStyles: string[] = []
  const styleAttrRegex = /style\s*=\s*["']([^"']+)["']/gi
  let m: RegExpExecArray | null
  while ((m = styleAttrRegex.exec(html)) !== null) {
    inlineStyles.push(m[1])
  }

  // <style> blocks
  const styleBlocks: string[] = []
  const styleTagRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi
  while ((m = styleTagRegex.exec(html)) !== null) {
    styleBlocks.push(m[1])
  }

  // Stylesheet URLs
  const stylesheetUrls: string[] = []
  const linkRegex =
    /<link[^>]+(?:rel\s*=\s*["']stylesheet["'][^>]*href\s*=\s*["']([^"']+)["']|href\s*=\s*["']([^"']+)["'][^>]*rel\s*=\s*["']stylesheet["'])[^>]*>/gi
  while ((m = linkRegex.exec(html)) !== null) {
    const href = m[1] || m[2]
    if (href) {
      // Skip known CDN fonts / icon libraries (we handle Google Fonts separately)
      if (!/fonts\.googleapis|cdnjs|unpkg|cdn\.jsdelivr|fontawesome/i.test(href)) {
        stylesheetUrls.push(href)
      }
    }
  }

  return {
    inlineStyles: inlineStyles.join('\n'),
    styleBlocks: styleBlocks.join('\n'),
    stylesheetUrls,
  }
}

/**
 * Extract Google Fonts URLs from HTML link tags.
 */
export const extractGoogleFontUrls = (html: string): string[] => {
  const urls: string[] = []
  const regex = /<link[^>]+href\s*=\s*["'](https?:\/\/fonts\.googleapis\.com\/css2?[^"']+)["']/gi
  let m: RegExpExecArray | null
  while ((m = regex.exec(html)) !== null) {
    urls.push(m[1])
  }
  return urls
}

/**
 * Strip HTML tags from a string, leaving only text content.
 */
export const stripTags = (html: string): string =>
  html.replace(/<[^>]+>/g, '').trim()
