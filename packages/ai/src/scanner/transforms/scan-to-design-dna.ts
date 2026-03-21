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
    siteName: scan.siteName || '',
    businessType: scan.businessType || '',
    industry: scan.brandIntelligence?.industry?.primary || scan.businessType || 'business',
  }
}

// ── Design DNA extraction ───────────────────────────────────────────────────

const extractDesignDna = (scan: ScanResult): ScanBasedGenerationContext['designDna'] => {
  const cs = scan.visualDna?.colorSystem
  const ts = scan.visualDna?.typographySystem
  const bs = scan.visualDna?.borderSystem
  const ss = scan.visualDna?.spacingSystem

  // Find heading and body fonts (null-safe)
  const fonts = ts?.fonts ?? []
  const headingFont = fonts.find((f) => f.usage === 'heading')?.family
    ?? fonts[0]?.family
    ?? 'Inter'
  const bodyFont = fonts.find((f) => f.usage === 'body')?.family
    ?? fonts[1]?.family
    ?? fonts[0]?.family
    ?? 'Inter'

  // Derive design style from brand personality (null-safe)
  const personality = scan.brandIntelligence?.personality
  const designStyle = personality?.designLanguage
    || deriveDesignStyle(personality?.mood ?? '', personality?.traits ?? [])

  const palette = cs?.palette ?? []

  return {
    designStyle,
    primaryColor: cs?.primary || palette[0]?.hex || '#7C3AED',
    secondaryColor: cs?.secondary || palette[1]?.hex || '#06B6D4',
    accentColor: cs?.accent || palette[2]?.hex || '#F59E0B',
    backgroundColor: cs?.background || '#ffffff',
    textColor: cs?.text || '#111827',
    headingFont,
    bodyFont,
    borderRadius: bs?.primaryRadius || '8px',
    spacing: ss?.baseUnit || '4px',
  }
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
  const cta = scan.contentArchitecture?.ctaStrategy
  const trust = scan.contentArchitecture?.trustElements

  // Build trust elements summary (null-safe)
  const trustElements: string[] = []
  if (trust?.testimonials?.length) trustElements.push(`${trust.testimonials.length} testimonials`)
  if (trust?.clientLogos?.length) trustElements.push(`${trust.clientLogos.length} client logos`)
  if (trust?.stats?.length) trustElements.push(`${trust.stats.length} stats/proof points`)
  if (trust?.certifications?.length) trustElements.push(`${trust.certifications.length} certifications`)
  if (trust?.awards?.length) trustElements.push(`${trust.awards.length} awards`)

  return {
    tone: tone?.voice?.join(', ') || 'professional',
    formality: formalityLabel(tone?.formality ?? 3),
    ctaPrimary: cta?.primaryCta?.text || 'Get Started',
    ctaSecondary: cta?.secondaryCtas?.map((c) => c.text) ?? [],
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
