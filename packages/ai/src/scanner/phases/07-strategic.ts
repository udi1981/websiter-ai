/**
 * Phase 7 — Strategic Insights
 *
 * The culminating AI analysis. Condenses all prior phase outputs into a
 * compact context, sends it to Claude for SWOT analysis + rebuild plan,
 * and returns structured StrategicInsights.
 */

import {
  buildStrategicAnalysisPrompt,
} from '../prompts/strategic-analysis'
import type { StrategicAnalysisContext } from '../prompts/strategic-analysis'
import { callAI, extractJson } from '../utils/ai-client'
import type {
  ComponentLibrary,
  ContentArchitecture,
  TechnicalDNA,
} from '../types/scanner'
import type { BrandIntelligence } from './05-brand'

// ---------------------------------------------------------------------------
// Output type
// ---------------------------------------------------------------------------

export type StrategicInsights = {
  strengths: {
    title: string
    evidence: string
    impact: 'high' | 'medium' | 'low'
  }[]
  weaknesses: {
    title: string
    evidence: string
    severity: 'high' | 'medium' | 'low'
    impact: 'high' | 'medium' | 'low'
    recommendation: string
  }[]
  opportunities: {
    title: string
    description: string
    effort: 'low' | 'medium' | 'high'
    impact: 'high' | 'medium' | 'low'
    priority: number
  }[]
  missingSections: {
    sectionType: string
    reason: string
    priority: 'high' | 'medium' | 'low'
    suggestedPosition: string
  }[]
  industryBenchmark: {
    designTrendAlignment: number
    bestPracticeScore: number
    recommendedSections: string[]
    recommendedFeatures: string[]
  }
  rebuildPlan: {
    preserve: { element: string; reason: string }[]
    rebuild: {
      element: string
      currentState: string
      targetState: string
      approach: string
    }[]
    improve: {
      element: string
      currentState: string
      targetState: string
      priority: 'high' | 'medium' | 'low'
    }[]
    add: {
      element: string
      reason: string
      priority: 'high' | 'medium' | 'low'
      suggestedPosition: string
    }[]
    remove: { element: string; reason: string }[]
  }
}

// ---------------------------------------------------------------------------
// Phase input — assembled from all prior phases
// ---------------------------------------------------------------------------

export type StrategicPhaseInput = {
  siteMap: { url: string; domain: string; siteName: string; pageCount: number }
  visualDna: {
    colors?: { hex: string; usage: string }[]
    fonts?: { family: string; usage: string }[]
  }
  componentLib: ComponentLibrary | null
  contentArch: ContentArchitecture | null
  brandIntel: BrandIntelligence | null
  technicalDna: TechnicalDNA | null
}

// ---------------------------------------------------------------------------
// Industry standard sections
// ---------------------------------------------------------------------------

const COMMON_SECTIONS = [
  'hero', 'features', 'about', 'testimonials', 'faq',
  'cta', 'contact', 'footer',
]

const INDUSTRY_EXTRA: Record<string, string[]> = {
  'Technology': ['integrations', 'pricing', 'process', 'comparison'],
  'SaaS': ['integrations', 'pricing', 'process', 'comparison'],
  'Healthcare': ['team', 'services', 'newsletter'],
  'Food & Beverage': ['gallery', 'newsletter'],
  'Restaurant': ['gallery', 'newsletter'],
  'E-commerce': ['products', 'newsletter'],
  'Agency': ['portfolio', 'process', 'team', 'clients'],
  'Real Estate': ['gallery', 'newsletter', 'stats'],
  'Education': ['pricing', 'team', 'stats', 'process'],
  'Fitness': ['pricing', 'team', 'gallery', 'stats'],
  'Legal': ['team', 'process', 'stats'],
}

// ---------------------------------------------------------------------------
// Main phase function
// ---------------------------------------------------------------------------

/**
 * Produce strategic insights by condensing all phase outputs and
 * sending them to Claude for expert-level SWOT + rebuild analysis.
 *
 * Falls back to basic programmatic insights if all AI providers fail.
 */
export const extractStrategicInsights = async (
  scanData: StrategicPhaseInput
): Promise<StrategicInsights> => {
  const { siteMap, visualDna, componentLib, contentArch, brandIntel, technicalDna } = scanData

  // Determine found section types
  const foundSections = collectSectionTypes(componentLib)
  const industry = brandIntel?.industry?.primary || 'Business'
  const missing = determineMissingSections(foundSections, industry)

  // Build condensed context
  const context = buildContext(
    siteMap, visualDna, componentLib, contentArch,
    brandIntel, technicalDna, foundSections, missing
  )

  const { system, user } = buildStrategicAnalysisPrompt(context)

  try {
    const raw = await callAI(system, user, { maxTokens: 6144 })
    const json = extractJson(raw)
    const parsed = JSON.parse(json) as StrategicInsights
    return validateInsights(parsed)
  } catch (err) {
    console.error('[Phase 7] AI strategic analysis failed:', err)
    return fallbackInsights(foundSections, missing, technicalDna)
  }
}

// ---------------------------------------------------------------------------
// Context builder
// ---------------------------------------------------------------------------

const buildContext = (
  siteMap: StrategicPhaseInput['siteMap'],
  visualDna: StrategicPhaseInput['visualDna'],
  componentLib: ComponentLibrary | null,
  contentArch: ContentArchitecture | null,
  brandIntel: BrandIntelligence | null,
  technicalDna: TechnicalDNA | null,
  foundSections: { type: string; page: string; variant: string }[],
  missing: string[]
): StrategicAnalysisContext => {
  const colors = visualDna.colors || []
  const fonts = visualDna.fonts || []

  const primaryCta = contentArch?.globalCtas?.[0]?.text || ''
  const ctaPlacements = contentArch?.globalCtas?.map((c) => c.placement) || []

  const trustElements = {
    testimonialCount: 0,
    logoCount: 0,
    statsCount: 0,
  }
  if (contentArch?.globalTrustElements) {
    for (const te of contentArch.globalTrustElements) {
      if (te.type === 'testimonial') trustElements.testimonialCount += te.count
      else if (te.type === 'logo-grid') trustElements.logoCount += te.count
      else if (te.type === 'stat') trustElements.statsCount += te.count
    }
  }

  const seo = technicalDna?.seo
  const seoScore = {
    hasTitle: !!seo?.title,
    hasDescription: !!seo?.metaDescription,
    hasSchema: (technicalDna?.schemaOrg?.types?.length ?? 0) > 0,
    hasCanonical: !!seo?.canonical,
    altTextCoverage: seo
      ? seo.imagesWithAlt / Math.max(seo.imagesWithAlt + seo.imagesWithoutAlt, 1)
      : 0,
  }

  const entryPoints = contentArch?.globalCtas
    ?.filter((c) => c.priority === 'primary')
    .map((c) => c.text) || []

  return {
    siteName: siteMap.siteName,
    domain: siteMap.domain,
    businessType: brandIntel?.industry?.subCategory || 'business',
    industry: brandIntel?.industry?.primary || 'Business',
    pageCount: siteMap.pageCount,
    sectionTypes: foundSections,
    colorSystem: {
      primary: colors.find((c) => c.usage === 'primary')?.hex || '#000000',
      secondary: colors.find((c) => c.usage === 'secondary')?.hex || '#666666',
      accent: colors.find((c) => c.usage === 'accent')?.hex || '#0066cc',
      background: '#ffffff',
    },
    typography: {
      headingFont: fonts.find((f) => f.usage === 'heading')?.family || 'unknown',
      bodyFont: fonts.find((f) => f.usage === 'body')?.family || 'unknown',
    },
    ctaStrategy: {
      primaryCta,
      placement: [...new Set(ctaPlacements)],
    },
    trustElements,
    seoScore,
    accessibilityScore: technicalDna?.accessibility?.score ?? 0,
    motionIntensity: technicalDna?.motion?.intensity || 'none',
    responsiveApproach: 'mobile-first', // default assumption
    techStack: {
      framework: technicalDna?.techStack?.framework ?? null,
      cssFramework: technicalDna?.techStack?.cssFramework ?? null,
    },
    brandPersonality: brandIntel?.personality?.traits || [],
    targetAudience: brandIntel?.targetAudience?.demographics || 'general',
    missingCommonSections: missing,
    conversionFunnel: {
      entryPoints,
      primaryConversion: primaryCta || 'unknown',
    },
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const collectSectionTypes = (
  lib: ComponentLibrary | null
): { type: string; page: string; variant: string }[] => {
  if (!lib?.sections) return []
  return lib.sections.map((s) => ({
    type: s.type,
    page: '/', // simplified — sections don't store page path
    variant: s.variant,
  }))
}

const determineMissingSections = (
  found: { type: string }[],
  industry: string
): string[] => {
  const foundTypes = new Set(found.map((s) => s.type))
  const expected = [
    ...COMMON_SECTIONS,
    ...(INDUSTRY_EXTRA[industry] || []),
  ]
  return [...new Set(expected)].filter((s) => !foundTypes.has(s))
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const validateInsights = (raw: Partial<StrategicInsights>): StrategicInsights => ({
  strengths: (raw.strengths || []).slice(0, 10),
  weaknesses: (raw.weaknesses || []).slice(0, 10),
  opportunities: (raw.opportunities || []).slice(0, 8),
  missingSections: raw.missingSections || [],
  industryBenchmark: {
    designTrendAlignment: raw.industryBenchmark?.designTrendAlignment ?? 50,
    bestPracticeScore: raw.industryBenchmark?.bestPracticeScore ?? 50,
    recommendedSections: raw.industryBenchmark?.recommendedSections || [],
    recommendedFeatures: raw.industryBenchmark?.recommendedFeatures || [],
  },
  rebuildPlan: {
    preserve: raw.rebuildPlan?.preserve || [],
    rebuild: raw.rebuildPlan?.rebuild || [],
    improve: raw.rebuildPlan?.improve || [],
    add: raw.rebuildPlan?.add || [],
    remove: raw.rebuildPlan?.remove || [],
  },
})

// ---------------------------------------------------------------------------
// Fallback — programmatic insights when AI is unavailable
// ---------------------------------------------------------------------------

const fallbackInsights = (
  found: { type: string; page: string; variant: string }[],
  missing: string[],
  tech: TechnicalDNA | null
): StrategicInsights => {
  const weaknesses: StrategicInsights['weaknesses'] = []
  const adds: StrategicInsights['rebuildPlan']['add'] = []

  // Missing sections
  for (const sec of missing) {
    weaknesses.push({
      title: `Missing ${sec} section`,
      evidence: `No ${sec} section detected across any page`,
      severity: COMMON_SECTIONS.includes(sec) ? 'high' : 'medium',
      impact: 'medium',
      recommendation: `Add a ${sec} section to improve completeness`,
    })
    adds.push({
      element: `${sec} section`,
      reason: `Standard section for this industry, currently absent`,
      priority: COMMON_SECTIONS.includes(sec) ? 'high' : 'medium',
      suggestedPosition: sec === 'faq' ? 'before footer' : 'main content area',
    })
  }

  // SEO checks
  if (!tech?.seo?.title) {
    weaknesses.push({
      title: 'Missing page title',
      evidence: 'No <title> tag found',
      severity: 'high',
      impact: 'high',
      recommendation: 'Add a descriptive <title> tag with primary keyword',
    })
  }
  if (!tech?.seo?.metaDescription) {
    weaknesses.push({
      title: 'Missing meta description',
      evidence: 'No meta description tag found',
      severity: 'high',
      impact: 'high',
      recommendation: 'Add a 150-160 char meta description with benefit + CTA',
    })
  }
  if (!tech?.schemaOrg?.types?.length) {
    weaknesses.push({
      title: 'No Schema.org structured data',
      evidence: 'No JSON-LD or microdata detected',
      severity: 'medium',
      impact: 'medium',
      recommendation: 'Add Organization + FAQPage Schema.org markup',
    })
  }

  return {
    strengths: found.length > 0
      ? [{ title: `${found.length} sections detected`, evidence: `Site has ${found.length} distinct sections`, impact: 'medium' as const }]
      : [],
    weaknesses,
    opportunities: [],
    missingSections: missing.map((s) => ({
      sectionType: s,
      reason: 'Standard for this industry',
      priority: 'medium' as const,
      suggestedPosition: 'main content area',
    })),
    industryBenchmark: {
      designTrendAlignment: 50,
      bestPracticeScore: 40,
      recommendedSections: [...COMMON_SECTIONS],
      recommendedFeatures: [],
    },
    rebuildPlan: {
      preserve: [],
      rebuild: [],
      improve: [],
      add: adds,
      remove: [],
    },
  }
}
