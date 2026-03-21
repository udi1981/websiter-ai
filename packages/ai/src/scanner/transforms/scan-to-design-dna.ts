/**
 * Scan-to-Generation Bridge
 *
 * Transforms a complete ScanResult into a compact generation context
 * that can be directly consumed by site generation prompts.
 *
 * This is the CRITICAL bridge between scanning and generation phases.
 *
 * @module scanner/transforms/scan-to-design-dna
 */

import type { ScanResult, SectionType } from '@ubuilder/types'

// ── Output type ─────────────────────────────────────────────────────────────

export type ScanBasedGenerationContext = {
  designDna: {
    designStyle: string
    primaryColor: string
    secondaryColor: string
    accentColor: string
    backgroundColor: string
    textColor: string
    headingFont: string
    bodyFont: string
    borderRadius: string
    spacing: string
  }
  sectionPlan: Array<{ type: string; variant: string; order: number }>
  contentGuidelines: {
    tone: string
    formality: string
    ctaPrimary: string
    ctaSecondary: string[]
    trustElements: string[]
  }
  rebuildPlan: {
    preserve: string[]
    improve: string[]
    add: string[]
    remove: string[]
  }
  siteName: string
  businessType: string
  industry: string
}

// ── Industry section defaults ───────────────────────────────────────────────

const INDUSTRY_SECTION_ORDER: Record<string, SectionType[]> = {
  saas: ['hero', 'features', 'stats', 'testimonials', 'pricing', 'faq', 'cta', 'footer'],
  restaurant: ['hero', 'about', 'gallery', 'testimonials', 'contact', 'footer'],
  dental: ['hero', 'services', 'about', 'testimonials', 'team', 'contact', 'faq', 'footer'],
  ecommerce: ['hero', 'products', 'features', 'testimonials', 'cta', 'newsletter', 'footer'],
  agency: ['hero', 'services', 'gallery', 'about', 'testimonials', 'team', 'cta', 'contact', 'footer'],
  fitness: ['hero', 'services', 'about', 'gallery', 'pricing', 'testimonials', 'contact', 'footer'],
  healthcare: ['hero', 'services', 'about', 'team', 'testimonials', 'faq', 'contact', 'footer'],
  education: ['hero', 'features', 'about', 'testimonials', 'pricing', 'faq', 'cta', 'footer'],
  realestate: ['hero', 'features', 'gallery', 'services', 'testimonials', 'contact', 'footer'],
  business: ['hero', 'features', 'about', 'services', 'testimonials', 'cta', 'contact', 'footer'],
}

// ── Formality label ─────────────────────────────────────────────────────────

const formalityLabel = (level: number): string => {
  if (level <= 1) return 'very-casual'
  if (level <= 2) return 'casual'
  if (level <= 3) return 'neutral'
  if (level <= 4) return 'formal'
  return 'very-formal'
}

// ── Main transform ──────────────────────────────────────────────────────────

/**
 * Transform a ScanResult into a compact generation context.
 *
 * Maps visual DNA colors to simple design tokens, orders sections by
 * importance and industry standards, summarizes content guidelines from
 * brand + content analysis, and creates a clear rebuild plan.
 *
 * @param scan - Complete ScanResult from the pipeline
 * @returns ScanBasedGenerationContext ready for generation prompts
 */
export const transformScanToGenerationContext = (
  scan: ScanResult,
): ScanBasedGenerationContext => {
  return {
    designDna: extractDesignDna(scan),
    sectionPlan: buildSectionPlan(scan),
    contentGuidelines: extractContentGuidelines(scan),
    rebuildPlan: extractRebuildPlan(scan),
    siteName: extractBrandName(scan),
    businessType: scan.businessType || '',
    industry: scan.brandIntelligence?.industry?.primary || scan.businessType || 'business',
  }
}

// ── Brand name extraction (V1.1-2) ───────────────────────────────────────

/**
 * Extract brand name using priority cascade:
 * 1. og:site_name meta tag (most reliable)
 * 2. Schema.org Organization/WebSite name
 * 3. Logo alt text or nav brand text (shortest)
 * 4. Domain name (fallback)
 * 5. Page title (last resort — often SEO-stuffed)
 */
const extractBrandName = (scan: ScanResult): string => {
  // 1. og:site_name — highest signal
  const ogSiteName = scan.technicalDna?.seo?.ogTags?.['og:site_name']
  if (ogSiteName && ogSiteName.length < 40) return ogSiteName

  // 2. Schema.org name
  const schemaItems = scan.technicalDna?.schemaOrg?.items ?? []
  for (const item of schemaItems) {
    if (item.type === 'Organization' || item.type === 'WebSite' || item.type === 'LocalBusiness') {
      const name = (item as Record<string, unknown>).properties as Record<string, unknown> | undefined
      const schemaName = name?.name as string | undefined
      if (schemaName && schemaName.length < 40) return schemaName
    }
  }

  // 3. Brand intelligence logo/personality
  const brandName = scan.brandIntelligence?.valueProposition?.headline
  if (brandName && brandName.length > 0 && brandName.length < 40) return brandName

  // 4. Domain name — strip www and TLD
  const domain = scan.domain || ''
  if (domain) {
    const cleaned = domain.replace(/^www\./, '').replace(/\.\w{2,4}$/, '')
    if (cleaned.length < 30) return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
  }

  // 5. Page title — last resort, take brand portion
  const title = scan.technicalDna?.seo?.title || scan.siteName || ''
  // If title contains a separator, take the shorter portion (likely brand)
  const separators = [' | ', ' - ', ' – ', ' — ', ' :: ']
  for (const sep of separators) {
    if (title.includes(sep)) {
      const parts = title.split(sep)
      const shortest = parts.reduce((a, b) => a.length <= b.length ? a : b)
      if (shortest.length >= 2 && shortest.length < 30) return shortest.trim()
    }
  }

  return title.slice(0, 40) || 'My Site'
}

// ── Design DNA extraction ───────────────────────────────────────────────────

const extractDesignDna = (scan: ScanResult): ScanBasedGenerationContext['designDna'] => {
  const cs = scan.visualDna?.colorSystem
  const ts = scan.visualDna?.typographySystem
  const bs = scan.visualDna?.borderSystem
  const ss = scan.visualDna?.spacingSystem

  // V1.1-4: Resolve CSS variables in font families
  const fonts = ts?.fonts ?? []
  const headingFont = resolveCssVar(
    fonts.find((f) => f.usage === 'heading')?.family
    ?? fonts[0]?.family
    ?? 'Inter',
    scan,
  )
  const bodyFont = resolveCssVar(
    fonts.find((f) => f.usage === 'body')?.family
    ?? fonts[1]?.family
    ?? fonts[0]?.family
    ?? 'Inter',
    scan,
  )

  // Derive design style from brand personality (null-safe)
  const personality = scan.brandIntelligence?.personality
  const designStyle = personality?.designLanguage
    || deriveDesignStyle(personality?.mood ?? '', personality?.traits ?? [])

  // V1.1-5: Improved color role assignment
  const palette = cs?.palette ?? []
  const bgColor = resolveBackgroundColor(cs, palette)
  const textColor = resolveTextColor(cs, palette, bgColor)

  // V1.1-4: Resolve CSS variables in border radius
  const rawRadius = bs?.primaryRadius || '8px'
  const borderRadius = resolveCssVar(rawRadius, scan)

  return {
    designStyle,
    primaryColor: cs?.primary || palette[0]?.hex || '#7C3AED',
    secondaryColor: cs?.secondary || palette[1]?.hex || '#06B6D4',
    accentColor: cs?.accent || palette[2]?.hex || '#F59E0B',
    backgroundColor: bgColor,
    textColor,
    headingFont,
    bodyFont,
    borderRadius: isReasonableBorderRadius(borderRadius) ? borderRadius : '8px',
    spacing: ss?.baseUnit || '4px',
  }
}

// ── V1.1-4: CSS variable resolution ────────────────────────────────────────

/** Check if border-radius is a reasonable card/button radius (not circles or pills) */
const isReasonableBorderRadius = (value: string): boolean => {
  if (!value) return false
  // Reject percentage values (50% = circle, 100% = circle)
  if (value.includes('%')) return false
  // Reject pill shapes
  if (/9999|999px/.test(value)) return false
  // Reject CSS variables
  if (/var\(/i.test(value)) return false
  // Accept numeric px/rem values
  return /^\d/.test(value) || value === '0'
}

/** Resolve CSS custom property references to actual values */
const resolveCssVar = (value: string, scan: ScanResult): string => {
  if (!value) return value

  // Check for CSS var() pattern
  const isVarRef = /var\(|Var\(|--/i.test(value) || /^Unset\)?$/i.test(value)
  if (!isVarRef) return value

  // Try to resolve from cssVariables in scan
  const cssVars = scan.visualDna?.cssVariables as Record<string, string> | undefined
  if (cssVars) {
    // Extract variable name from var(--name) or Var(--name)
    const varMatch = value.match(/var\(\s*--([^,)]+)/i)
    if (varMatch) {
      const varName = `--${varMatch[1].trim()}`
      const resolved = cssVars[varName]
      if (resolved && !resolved.includes('var(')) return resolved
    }
  }

  // Wix-specific font variable patterns → known fallbacks
  if (/wix-font.*body/i.test(value)) return 'Assistant'
  if (/wix-font.*heading/i.test(value)) return 'Heebo'
  if (/font-stack-body/i.test(value)) return 'Assistant'
  if (/font-stack-heading/i.test(value)) return 'Heebo'

  // Shopify font variable patterns
  if (/shopify.*heading/i.test(value)) return 'Inter'
  if (/shopify.*body/i.test(value)) return 'Inter'

  // Generic unresolvable → use Google Fonts from the fonts list
  const googleFont = scan.visualDna?.typographySystem?.fonts?.find(f =>
    f.source === 'google-fonts' && f.family && !f.family.includes('var('),
  )
  if (googleFont) return googleFont.family

  // If value is "Unset)" or similar garbage, fall back
  if (/^Unset|^inherit|^initial/i.test(value)) return 'Inter'

  return value
}

// ── V1.1-5: Color role heuristics ──────────────────────────────────────────

/** Resolve background color — prefer high-frequency bg-property colors over accents */
const resolveBackgroundColor = (
  cs: ScanResult['visualDna']['colorSystem'] | undefined,
  palette: Array<{ hex: string; usageRole?: string; frequency?: number; cssProperty?: string }>,
): string => {
  if (!cs) return '#ffffff'

  // If the assigned background color is very saturated/dark, it's probably wrong
  const assignedBg = cs.background || ''
  if (assignedBg && isReasonableBackground(assignedBg)) return assignedBg

  // Find the most frequent color used as actual CSS background/background-color
  const bgColors = palette.filter(c =>
    (c.cssProperty === 'background' || c.cssProperty === 'background-color')
    && c.usageRole === 'background',
  )

  // Sort by frequency descending
  const sorted = [...bgColors].sort((a, b) => (b.frequency || 0) - (a.frequency || 0))

  // Prefer light/neutral backgrounds — skip mid-grays (#aaa-#ccc range) as these are
  // usually borders/dividers styled as backgrounds, not actual page backgrounds
  for (const c of sorted) {
    if (isReasonableBackground(c.hex) && isLikelyPageBackground(c.hex)) return c.hex
  }

  // If no good background found, default to white (the most common implicit page background)
  return '#ffffff'
}

/** Resolve text color that contrasts with background */
const resolveTextColor = (
  cs: ScanResult['visualDna']['colorSystem'] | undefined,
  palette: Array<{ hex: string; usageRole?: string; frequency?: number }>,
  bgColor: string,
): string => {
  if (!cs) return '#111827'

  const assignedText = cs.text || ''
  // If the assigned text color is the same as bg (e.g., both light), override
  if (assignedText && hasContrast(assignedText, bgColor)) return assignedText

  // Find high-frequency text colors
  const textColors = palette.filter(c => c.usageRole === 'text')
  const sorted = [...textColors].sort((a, b) => (b.frequency || 0) - (a.frequency || 0))

  for (const c of sorted) {
    if (hasContrast(c.hex, bgColor)) return c.hex
  }

  // Default dark text for light bg, light text for dark bg
  return isLight(bgColor) ? '#111827' : '#f5f5f5'
}

/** Check if a color is reasonable as a page background (not too saturated, not a CTA red) */
const isReasonableBackground = (hex: string): boolean => {
  const rgb = hexToRgb(hex)
  if (!rgb) return false
  const { r, g, b } = rgb
  // Very saturated colors (bright red, green, blue) are not backgrounds
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const saturation = max > 0 ? (max - min) / max : 0
  const brightness = (r + g + b) / 3
  // Reject if highly saturated AND dark-to-mid brightness (likely CTA/accent)
  if (saturation > 0.6 && brightness < 200) return false
  return true
}

/** Check if color is likely a page background (very light or very dark) vs a mid-gray UI element */
const isLikelyPageBackground = (hex: string): boolean => {
  const rgb = hexToRgb(hex)
  if (!rgb) return false
  const brightness = (rgb.r + rgb.g + rgb.b) / 3
  // Page backgrounds are typically very light (>230) or very dark (<30)
  // Mid-range grays (100-200) are usually UI elements, not page backgrounds
  return brightness > 230 || brightness < 30
}

const isLight = (hex: string): boolean => {
  const rgb = hexToRgb(hex)
  if (!rgb) return true
  return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000 > 128
}

const hasContrast = (fg: string, bg: string): boolean => {
  const fgRgb = hexToRgb(fg)
  const bgRgb = hexToRgb(bg)
  if (!fgRgb || !bgRgb) return true
  const fgLum = (fgRgb.r * 299 + fgRgb.g * 587 + fgRgb.b * 114) / 1000
  const bgLum = (bgRgb.r * 299 + bgRgb.g * 587 + bgRgb.b * 114) / 1000
  return Math.abs(fgLum - bgLum) > 60
}

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (!match) return null
  return { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16) }
}

const deriveDesignStyle = (mood: string, traits: string[]): string => {
  const combined = [mood, ...traits].join(' ').toLowerCase()
  if (/luxury|premium|elegant/i.test(combined)) return 'luxury-minimal'
  if (/bold|edgy|creative/i.test(combined)) return 'bold-creative'
  if (/playful|fun|friendly/i.test(combined)) return 'playful-modern'
  if (/clean|corporate|professional/i.test(combined)) return 'corporate-clean'
  if (/warm|inviting|cozy/i.test(combined)) return 'warm-organic'
  if (/tech|modern|sleek/i.test(combined)) return 'tech-modern'
  return 'modern-professional'
}

// ── Section plan builder ────────────────────────────────────────────────────

const buildSectionPlan = (scan: ScanResult): ScanBasedGenerationContext['sectionPlan'] => {
  // Collect section types from the scanned site (preserving order from homepage)
  const pages = scan.contentArchitecture?.pages ?? []
  const homepageSections = pages
    .find((p) => p.path === '/' || p.path === '')
    ?.sectionOrder ?? []

  // Merge with industry defaults to fill gaps
  const industry = scan.brandIntelligence?.industry?.primary || scan.businessType || 'business'
  const defaults = INDUSTRY_SECTION_ORDER[industry] ?? INDUSTRY_SECTION_ORDER['business']!

  // Use scanned sections if available, otherwise fall back to industry defaults
  const sectionOrder: SectionType[] = homepageSections.length >= 3
    ? homepageSections
    : defaults

  // Add missing recommended sections from strategic insights (null-safe)
  const missing = (scan.strategicInsights?.missingSections ?? [])
    .filter((m) => m.priority === 'high')
    .map((m) => m.sectionType)

  const allSections = [...sectionOrder]
  for (const ms of missing) {
    if (!allSections.includes(ms)) {
      const footerIdx = allSections.indexOf('footer')
      if (footerIdx >= 0) {
        allSections.splice(footerIdx, 0, ms)
      } else {
        allSections.push(ms)
      }
    }
  }

  // Map section templates to find variant names (null-safe)
  const templateMap = new Map<string, string>()
  for (const sec of scan.componentLibrary?.sections ?? []) {
    if (!templateMap.has(sec.type)) {
      templateMap.set(sec.type, sec.variant)
    }
  }

  return allSections.map((type, idx) => ({
    type,
    variant: templateMap.get(type) || 'default',
    order: idx,
  }))
}

// ── Content guidelines extraction ───────────────────────────────────────────

const extractContentGuidelines = (scan: ScanResult): ScanBasedGenerationContext['contentGuidelines'] => {
  const tone = scan.contentArchitecture?.contentTone
  const trust = scan.contentArchitecture?.trustElements

  // V1.1-3: Extract real CTAs from scan data — never fall back to generic when real ones exist
  const cta = scan.contentArchitecture?.ctaStrategy
  const pages = scan.contentArchitecture?.pages ?? []
  // Runtime scan data uses pagePath (not path) and puts CTAs in pages[].ctas
  const homepage = pages.find(p => {
    const pg = p as Record<string, unknown>
    return pg.path === '/' || pg.path === '' || pg.pagePath === '/' || pg.pagePath === ''
  }) as Record<string, unknown> | undefined
  const homepageCtas = (homepage?.ctas as Array<Record<string, unknown>>) ?? []
  // Also collect from ctaStrategy
  const strategyCtas: Array<Record<string, unknown>> = []
  if (cta?.primaryCta) strategyCtas.push(cta.primaryCta as Record<string, unknown>)
  if (cta?.secondaryCtas) strategyCtas.push(...cta.secondaryCtas as Array<Record<string, unknown>>)
  const allCtas = homepageCtas.length > 0 ? homepageCtas : strategyCtas

  // Find the best primary CTA (prefer "secondary" priority = stronger visual weight, skip generic "שלח"/"Submit")
  const meaningfulCtas = allCtas.filter((c: Record<string, unknown>) => {
    const text = ((c.text as string) || '').trim()
    return text.length > 1 && !/^(שלח|submit|send|close|סגור)$/i.test(text)
  })

  const primaryCta = meaningfulCtas[0]?.text as string || ''
  const secondaryCtas = meaningfulCtas.slice(1, 5).map((c: Record<string, unknown>) => c.text as string)

  // Build trust elements summary (null-safe) + look for trust headings
  const trustElements: string[] = []
  if (trust?.testimonials?.length) trustElements.push(`${trust.testimonials.length} testimonials`)
  if (trust?.clientLogos?.length) trustElements.push(`${trust.clientLogos.length} client logos`)
  if (trust?.stats?.length) trustElements.push(`${trust.stats.length} stats/proof points`)
  if (trust?.certifications?.length) trustElements.push(`${trust.certifications.length} certifications`)
  if (trust?.awards?.length) trustElements.push(`${trust.awards.length} awards`)

  // Also detect trust from homepage headings
  const homepageForTrust = pages.find(p => {
    const pg = p as Record<string, unknown>
    return pg.path === '/' || pg.path === '' || pg.pagePath === '/' || pg.pagePath === ''
  }) as Record<string, unknown> | undefined
  const homepageHeadings = (homepageForTrust?.headings ?? []) as Array<Record<string, unknown>>
  for (const h of homepageHeadings) {
    const text = ((h as Record<string, unknown>).text as string || '').toLowerCase()
    if (text.includes('ממליצ') || text.includes('testimonial') || text.includes('review')) {
      if (!trustElements.some(t => t.includes('testimonial'))) {
        trustElements.push('parent/customer testimonials section detected')
      }
    }
  }

  return {
    tone: tone?.voice?.join(', ') || 'professional',
    formality: formalityLabel(tone?.formality ?? 3),
    ctaPrimary: primaryCta || 'Get Started',
    ctaSecondary: secondaryCtas,
    trustElements,
  }
}

// ── Rebuild plan extraction ─────────────────────────────────────────────────

const extractRebuildPlan = (scan: ScanResult): ScanBasedGenerationContext['rebuildPlan'] => {
  const plan = scan.strategicInsights?.rebuildPlan

  return {
    preserve: plan?.preserve?.map((p) => p.element) ?? [],
    improve: plan?.improve?.map((p) => p.element) ?? [],
    add: plan?.add?.map((p) => p.element) ?? [],
    remove: plan?.remove?.map((p) => p.element) ?? [],
  }
}
