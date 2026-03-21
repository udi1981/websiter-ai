/**
 * Scan-to-Composition Bridge
 *
 * Maps ScanBasedGenerationContext to PageComposition (what composePage() needs).
 * Also provides synthesizeScanArtifacts() for creating canonical project_brief + site_plan
 * from scan data in copy mode.
 */

import type { ScanBasedGenerationContext } from '../../../../packages/ai/src/scanner/transforms/scan-to-design-dna'

// Re-export for consumers
export type { ScanBasedGenerationContext }
import type { PageComposition, SectionPalette, SectionFonts, SectionCategory, PageSection } from '@ubuilder/types'
import { prefixedId } from '@ubuilder/utils'
import type { ProjectBrief, SitePlan } from '@ubuilder/types'

// ─── Palette Mapping ────────────────────────────────────────────────

/** Darken a hex color by a percentage */
const darken = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, ((num >> 16) & 0xff) - Math.round(255 * percent / 100))
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(255 * percent / 100))
  const b = Math.max(0, (num & 0xff) - Math.round(255 * percent / 100))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

/** Lighten a hex color by a percentage */
const lighten = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, ((num >> 16) & 0xff) + Math.round(255 * percent / 100))
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * percent / 100))
  const b = Math.min(255, (num & 0xff) + Math.round(255 * percent / 100))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

/** Map scan designDna to section-composer SectionPalette */
export const mapScanPaletteToSectionPalette = (
  designDna: ScanBasedGenerationContext['designDna'],
): SectionPalette => ({
  primary: designDna.primaryColor || '#7C3AED',
  primaryHover: darken(designDna.primaryColor || '#7C3AED', 10),
  secondary: designDna.secondaryColor || '#06B6D4',
  accent: designDna.accentColor || '#F59E0B',
  background: designDna.backgroundColor || '#0B0F1A',
  backgroundAlt: darken(designDna.backgroundColor || '#0B0F1A', 5),
  text: designDna.textColor || '#F5F5F5',
  textMuted: lighten(designDna.textColor || '#F5F5F5', 30),
  border: lighten(designDna.backgroundColor || '#0B0F1A', 15),
})

// ─── Section Variant Mapping ────────────────────────────────────────

/** Maps common scanner variant descriptions to section-composer variant IDs */
const SCAN_VARIANT_MAP: Record<string, Record<string, string>> = {
  hero: {
    'full-width-bg-image': 'hero-fullscreen-video',
    'fullscreen': 'hero-fullscreen-video',
    '2-col-text-image': 'hero-split-image',
    'split': 'hero-split-image',
    'centered-text': 'hero-gradient-mesh',
    'gradient': 'hero-gradient-mesh',
    'video-background': 'hero-fullscreen-video',
    'default': 'hero-gradient-mesh',
  },
  features: {
    'grid': 'features-icon-grid',
    'bento': 'features-bento-grid',
    'cards': 'features-icon-grid',
    'comparison': 'features-comparison',
    'default': 'features-icon-grid',
  },
  testimonials: {
    'cards': 'testimonials-wall',
    'carousel': 'testimonials-carousel',
    'grid': 'testimonials-wall',
    'featured': 'testimonials-featured',
    'default': 'testimonials-wall',
  },
  pricing: {
    'table': 'pricing-comparison-table',
    'cards': 'pricing-animated-cards',
    '3-tier': 'pricing-animated-cards',
    'default': 'pricing-animated-cards',
  },
  cta: {
    'banner': 'cta-gradient-banner',
    'centered': 'cta-gradient-banner',
    'default': 'cta-gradient-banner',
  },
  faq: {
    'accordion': 'faq-accordion',
    'grid': 'faq-search',
    'default': 'faq-accordion',
  },
  contact: {
    'form': 'contact-split-form',
    'map': 'contact-split-form',
    'default': 'contact-split-form',
  },
  gallery: {
    'grid': 'gallery-masonry',
    'masonry': 'gallery-masonry',
    'default': 'gallery-masonry',
  },
  footer: {
    'multi-column': 'footer-multi-column',
    'mega': 'footer-mega',
    'default': 'footer-multi-column',
  },
  navbar: {
    'floating': 'navbar-floating',
    'transparent': 'navbar-transparent',
    'default': 'navbar-floating',
  },
  stats: {
    'counters': 'stats-counters',
    'default': 'stats-counters',
  },
  team: {
    'grid': 'team-cards',
    'default': 'team-cards',
  },
  'how-it-works': {
    'steps': 'how-it-works-steps',
    'default': 'how-it-works-steps',
  },
}

/** Resolve a scanner variant to a valid section-composer variant ID */
export const resolveScanVariant = (
  scanType: string,
  scanVariant: string,
  _industry: string,
): string => {
  const categoryMap = SCAN_VARIANT_MAP[scanType]
  if (!categoryMap) return `${scanType}-default` // unknown category

  // Try exact match, then partial match, then default
  if (categoryMap[scanVariant]) return categoryMap[scanVariant]

  // Partial match — check if scanVariant contains any key
  for (const [key, variantId] of Object.entries(categoryMap)) {
    if (key !== 'default' && scanVariant.toLowerCase().includes(key)) return variantId
  }

  return categoryMap['default'] || `${scanType}-default`
}

// ─── Composition Mapping ────────────────────────────────────────────

/** Map a ScanBasedGenerationContext to a PageComposition for composePage() */
export const mapScanContextToComposition = (
  ctx: ScanBasedGenerationContext,
  mode: 'copy' | 'inspiration',
  locale: 'en' | 'he',
): PageComposition => {
  const palette = mapScanPaletteToSectionPalette(ctx.designDna)
  const fonts: SectionFonts = {
    heading: ctx.designDna.headingFont || 'Inter',
    body: ctx.designDna.bodyFont || 'Inter',
    headingWeight: '700',
    bodyWeight: '400',
  }

  const sections: PageSection[] = ctx.sectionPlan.map((s, i) => ({
    id: prefixedId('sec'),
    variantId: resolveScanVariant(s.type, s.variant, ctx.industry),
    category: s.type as SectionCategory,
    content: {},
    images: {},
    order: s.order ?? i,
  }))

  return {
    id: prefixedId('page'),
    siteName: ctx.siteName,
    locale,
    palette,
    fonts,
    sections,
  }
}

// ─── Synthetic Artifacts for Copy Mode ──────────────────────────────

/** Create canonical project_brief + site_plan from scan context.
 *  These must always exist as artifacts so downstream steps don't break. */
export const synthesizeScanArtifacts = (
  ctx: ScanBasedGenerationContext,
  scanJob: { sourceUrl: string; locale: string },
): { projectBrief: ProjectBrief; sitePlan: SitePlan } => ({
  projectBrief: {
    businessName: ctx.siteName,
    description: ctx.contentGuidelines.tone || ctx.siteName,
    locale: (scanJob.locale as 'en' | 'he') || 'en',
    industry: ctx.industry,
    discoveryAnswers: {},
    sourceUrl: scanJob.sourceUrl,
  },
  sitePlan: {
    businessName: ctx.siteName,
    industry: ctx.industry,
    targetAudience: '',
    brandPersonality: ctx.contentGuidelines.tone || '',
    contentTone: ctx.contentGuidelines.formality || '',
    uniqueSellingPoints: ctx.contentGuidelines.trustElements || [],
    conversionGoals: ctx.contentGuidelines.ctaPrimary ? [ctx.contentGuidelines.ctaPrimary] : ['contact'],
    sectionPriorities: ctx.sectionPlan.map(s => s.type),
    visualKeywords: [],
  },
})
