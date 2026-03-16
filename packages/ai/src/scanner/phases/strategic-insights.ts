/**
 * Phase 7 adapter — Strategic Insights
 *
 * Bridges the pipeline's expected `runStrategicPhase` signature to the
 * actual `extractStrategicInsights` implementation in `./07-strategic`.
 * Maps the rich AI output to the @ubuilder/types StrategicInsights shape.
 */

import { extractStrategicInsights } from './07-strategic'
import type { StrategicInsights as RichInsights } from './07-strategic'
import type {
  ScanResult,
  StrategicInsights,
  Insight,
} from '@ubuilder/types'

export type { RichInsights }

/**
 * Run the strategic insights phase.
 * Adapts the pipeline's ScanResult to the core implementation,
 * then maps the rich output to the @ubuilder/types shape.
 */
export const runStrategicPhase = async (
  scanResult: ScanResult
): Promise<StrategicInsights> => {
  const colors = scanResult.visualDna.colorSystem
  const fonts = scanResult.visualDna.typographySystem.fonts

  const rich = await extractStrategicInsights({
    siteMap: {
      url: scanResult.url,
      domain: scanResult.domain,
      siteName: scanResult.siteName,
      pageCount: scanResult.siteMap.pages.length,
    },
    visualDna: {
      colors: colors.palette.map((c) => ({ hex: c.hex, usage: c.usageRole })),
      fonts: fonts.map((f) => ({ family: f.family, usage: f.usage })),
    },
    componentLib: scanResult.componentLibrary as unknown as Parameters<typeof extractStrategicInsights>[0]['componentLib'],
    contentArch: scanResult.contentArchitecture as unknown as Parameters<typeof extractStrategicInsights>[0]['contentArch'],
    brandIntel: mapBrandForStrategic(scanResult.brandIntelligence),
    technicalDna: scanResult.technicalDna as unknown as Parameters<typeof extractStrategicInsights>[0]['technicalDna'],
  })

  return mapToTypesInsights(rich)
}

/** Map BrandIntelligence from @ubuilder/types to the Phase 5 shape. */
const mapBrandForStrategic = (
  brand: ScanResult['brandIntelligence']
): Parameters<typeof extractStrategicInsights>[0]['brandIntel'] => ({
  brandName: '',
  tagline: null,
  personality: {
    traits: brand.personality.traits,
    mood: brand.personality.mood,
    archetype: brand.personality.archetype,
    archetypeRationale: '',
    designLanguage: brand.personality.designLanguage,
  },
  targetAudience: {
    demographics: brand.targetAudience.demographics.join(', '),
    psychographics: '',
    painPoints: brand.targetAudience.painPoints,
    desires: brand.targetAudience.desires,
    sophisticationLevel: brand.targetAudience.sophistication * 2,
  },
  industry: {
    primary: brand.industry.primary,
    subCategory: brand.industry.sub,
    niche: brand.industry.niche,
    inferredCompetitors: brand.industry.competitors,
  },
  valueProposition: brand.valueProposition,
  positioning: {
    marketPosition: 'mid-market',
    competitiveAngle: '',
    pricingSignal: 'unclear',
  },
  contentTone: {
    formality: 5,
    voice: 'professional',
    perspective: 'mixed',
    sentenceStyle: 'standard',
    jargonLevel: 3,
    samplePhrases: [],
  },
  designPsychology: {
    colorEmotions: '',
    typographyMessage: '',
    layoutPriority: '',
    overallImpression: '',
  },
})

/** Map the rich AI strategic output to @ubuilder/types StrategicInsights. */
const mapToTypesInsights = (rich: RichInsights): StrategicInsights => {
  // Merge strengths + weaknesses + opportunities into flat Insight[]
  const insights: Insight[] = [
    ...rich.strengths.map((s) => ({
      category: 'design' as const,
      title: s.title,
      description: s.evidence,
      impact: s.impact,
      actionable: false,
    })),
    ...rich.weaknesses.map((w) => ({
      category: 'ux' as const,
      title: w.title,
      description: `${w.evidence}. Recommendation: ${w.recommendation}`,
      impact: w.severity,
      actionable: true,
    })),
    ...rich.opportunities.map((o) => ({
      category: 'conversion' as const,
      title: o.title,
      description: o.description,
      impact: o.impact,
      actionable: true,
    })),
  ]

  return {
    insights,
    missingSections: rich.missingSections.map((m) => ({
      sectionType: m.sectionType as StrategicInsights['missingSections'][number]['sectionType'],
      reason: m.reason,
      priority: m.priority,
      industryStandard: true,
    })),
    industryBenchmark: {
      designTrendAlignment: rich.industryBenchmark.designTrendAlignment,
      bestPracticeScore: rich.industryBenchmark.bestPracticeScore,
      recommendedSections: rich.industryBenchmark.recommendedSections as StrategicInsights['industryBenchmark']['recommendedSections'],
      recommendedFeatures: rich.industryBenchmark.recommendedFeatures,
    },
    rebuildPlan: {
      preserve: rich.rebuildPlan.preserve,
      rebuild: rich.rebuildPlan.rebuild.map((r) => ({
        element: r.element,
        reason: `Current: ${r.currentState}. Target: ${r.targetState}. Approach: ${r.approach}`,
      })),
      improve: rich.rebuildPlan.improve.map((i) => ({
        element: i.element,
        reason: `Current: ${i.currentState}. Target: ${i.targetState} (${i.priority} priority)`,
      })),
      add: rich.rebuildPlan.add.map((a) => ({
        element: a.element,
        reason: a.reason,
      })),
      remove: rich.rebuildPlan.remove,
    },
  }
}
