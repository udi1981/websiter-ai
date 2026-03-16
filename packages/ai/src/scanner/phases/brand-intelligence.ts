/**
 * Phase 5 adapter — Brand Intelligence
 *
 * Bridges the pipeline's expected `runBrandPhase` signature to the
 * actual `extractBrandIntelligence` implementation in `./05-brand`.
 * Maps the rich AI output to the @ubuilder/types BrandIntelligence shape.
 */

import { extractBrandIntelligence } from './05-brand'
import type { BrandIntelligence as RichBrand } from './05-brand'
import type {
  BrandIntelligence,
  ContentArchitecture,
  VisualDNA,
} from '@ubuilder/types'

export type { RichBrand }

type FetchedPage = {
  url: string
  path: string
  title: string
  html: string
  css: string
  statusCode: number
}

/**
 * Run the brand intelligence phase.
 * Adapts the pipeline's call signature to the core implementation,
 * then maps the rich output to the @ubuilder/types shape.
 */
export const runBrandPhase = async (
  pages: FetchedPage[],
  visualDna: VisualDNA,
  content: ContentArchitecture
): Promise<BrandIntelligence> => {
  const pagesForAnalysis = pages.map((p) => ({
    url: p.url,
    html: p.html,
    path: p.path,
  }))

  // Convert VisualDNA to the shape expected by extractBrandIntelligence
  const simplifiedVisual = {
    colors: visualDna.colorSystem.palette.map((c) => ({
      hex: c.hex,
      usage: c.usageRole,
    })),
    fonts: visualDna.typographySystem.fonts.map((f) => ({
      family: f.family,
      usage: f.usage,
    })),
  }

  const rich = await extractBrandIntelligence(
    pagesForAnalysis,
    null,
    simplifiedVisual,
    null // content architecture is used internally
  )

  return mapToTypesBrand(rich)
}

/** Map the rich AI brand output to @ubuilder/types BrandIntelligence. */
const mapToTypesBrand = (rich: RichBrand): BrandIntelligence => ({
  logo: null, // logo detection is handled by the visual phase
  personality: {
    traits: rich.personality.traits,
    mood: rich.personality.mood,
    archetype: rich.personality.archetype,
    designLanguage: rich.personality.designLanguage,
  },
  targetAudience: {
    demographics: [rich.targetAudience.demographics],
    painPoints: rich.targetAudience.painPoints,
    desires: rich.targetAudience.desires,
    sophistication: Math.min(5, Math.ceil(rich.targetAudience.sophisticationLevel / 2)),
  },
  industry: {
    primary: rich.industry.primary,
    sub: rich.industry.subCategory,
    niche: rich.industry.niche,
    competitors: rich.industry.inferredCompetitors,
  },
  valueProposition: {
    headline: rich.valueProposition.headline,
    subheadline: rich.valueProposition.subheadline,
    benefits: rich.valueProposition.benefits,
    differentiators: rich.valueProposition.differentiators,
    proofPoints: rich.valueProposition.proofPoints,
  },
})
