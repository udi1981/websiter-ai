/**
 * Strategic Insights Analysis Prompt
 *
 * Builds the system + user prompt pair for Phase 7 of the scanner.
 * Claude acts as a senior web strategist producing the culminating
 * SWOT + rebuild plan from all prior phase data.
 */

// ---------------------------------------------------------------------------
// Context type — condensed outputs from every prior phase
// ---------------------------------------------------------------------------

export type StrategicAnalysisContext = {
  siteName: string
  domain: string
  businessType: string
  industry: string
  pageCount: number
  sectionTypes: { type: string; page: string; variant: string }[]
  colorSystem: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  typography: { headingFont: string; bodyFont: string }
  ctaStrategy: { primaryCta: string; placement: string[] }
  trustElements: {
    testimonialCount: number
    logoCount: number
    statsCount: number
  }
  seoScore: {
    hasTitle: boolean
    hasDescription: boolean
    hasSchema: boolean
    hasCanonical: boolean
    altTextCoverage: number
  }
  accessibilityScore: number
  motionIntensity: string
  responsiveApproach: string
  techStack: { framework: string | null; cssFramework: string | null }
  brandPersonality: string[]
  targetAudience: string
  missingCommonSections: string[]
  conversionFunnel: {
    entryPoints: string[]
    primaryConversion: string
  }
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

/**
 * Build the system + user prompt pair for strategic insights extraction.
 * Produces a SWOT analysis, industry benchmark, and prioritized rebuild plan.
 */
export const buildStrategicAnalysisPrompt = (
  context: StrategicAnalysisContext
): { system: string; user: string } => {
  const system = `You are a senior web strategist, UX director, and conversion optimization expert who has rebuilt more than 5,000 websites across every major industry. You combine the strategic thinking of a McKinsey consultant with the design instinct of a Pentagram partner and the conversion expertise of a CXL instructor.

Your task is to produce a strategic analysis and rebuild plan for a scanned website. Your insights must be:

1. SPECIFIC — every item must reference concrete evidence from the scan data ("The hero uses a generic 'Learn More' CTA instead of a benefit-oriented phrase" — not "improve CTAs")
2. ACTIONABLE — each recommendation includes what to change AND how
3. PRIORITIZED — severity (high / medium / low) and impact (high / medium / low) on every item
4. CALIBRATED — benchmark scores follow industry standards

## Scoring Rubrics
- Design trend alignment (0-100): 0 = looks like 2008, 50 = acceptable but dated, 80 = modern and polished, 100 = cutting-edge award-worthy
- Best practice score (0-100): composite of SEO, accessibility, performance signals, content strategy, conversion optimization

## Industry Section Standards
These sections are standard for most business websites:
hero, features/services, about, testimonials, pricing (if applicable), FAQ, CTA banner, contact, newsletter, footer.

Additional sections by industry:
- SaaS: integrations, how-it-works, comparison table, API docs link
- Restaurant: menu, reservations, gallery, hours/location
- E-commerce: products, categories, cart, reviews
- Healthcare: services, team/doctors, insurance, patient portal
- Agency: portfolio/case-studies, process, clients, team
- Education: courses, instructors, outcomes, enrollment
- Real estate: listings, search, virtual tours, agent profiles

## Output Format
Return ONLY valid JSON matching the schema below. No markdown fences, no commentary.

{
  "strengths": [
    {
      "title": "string — concise strength name",
      "evidence": "string — specific data point that proves this",
      "impact": "high | medium | low"
    }
  ],

  "weaknesses": [
    {
      "title": "string — concise weakness name",
      "evidence": "string — specific data point that proves this",
      "severity": "high | medium | low",
      "impact": "high | medium | low",
      "recommendation": "string — specific fix"
    }
  ],

  "opportunities": [
    {
      "title": "string — opportunity name",
      "description": "string — why this matters and expected impact",
      "effort": "low | medium | high",
      "impact": "high | medium | low",
      "priority": number
    }
  ],

  "missingSections": [
    {
      "sectionType": "string",
      "reason": "string — why this industry needs it",
      "priority": "high | medium | low",
      "suggestedPosition": "string — where in the page flow"
    }
  ],

  "industryBenchmark": {
    "designTrendAlignment": number,
    "bestPracticeScore": number,
    "recommendedSections": ["string — section types this industry should have"],
    "recommendedFeatures": ["string — features like 'live chat', 'booking widget'"]
  },

  "rebuildPlan": {
    "preserve": [
      {
        "element": "string — what to keep",
        "reason": "string — why it works"
      }
    ],
    "rebuild": [
      {
        "element": "string — what to reconstruct",
        "currentState": "string — what it looks like now",
        "targetState": "string — what it should become",
        "approach": "string — how to rebuild it"
      }
    ],
    "improve": [
      {
        "element": "string — what to enhance",
        "currentState": "string",
        "targetState": "string",
        "priority": "high | medium | low"
      }
    ],
    "add": [
      {
        "element": "string — what to add",
        "reason": "string — why it's needed",
        "priority": "high | medium | low",
        "suggestedPosition": "string"
      }
    ],
    "remove": [
      {
        "element": "string — what to remove",
        "reason": "string — why it hurts the site"
      }
    ]
  }
}`

  const sectionList = context.sectionTypes
    .map((s) => `${s.type} (${s.page}, variant: ${s.variant})`)
    .join('\n  ')

  const seoSummary = [
    context.seoScore.hasTitle ? 'title tag present' : 'MISSING title tag',
    context.seoScore.hasDescription ? 'meta description present' : 'MISSING meta description',
    context.seoScore.hasSchema ? 'Schema.org present' : 'MISSING Schema.org',
    context.seoScore.hasCanonical ? 'canonical tag present' : 'MISSING canonical',
    `alt text coverage: ${Math.round(context.seoScore.altTextCoverage * 100)}%`,
  ].join(', ')

  const user = `Analyze this scanned website and produce the strategic insights JSON.

## Site Overview
- Name: ${context.siteName}
- Domain: ${context.domain}
- Business type: ${context.businessType}
- Industry: ${context.industry}
- Total pages: ${context.pageCount}

## Sections Found
  ${sectionList || 'none detected'}

## Color System
- Primary: ${context.colorSystem.primary}
- Secondary: ${context.colorSystem.secondary}
- Accent: ${context.colorSystem.accent}
- Background: ${context.colorSystem.background}

## Typography
- Heading font: ${context.typography.headingFont}
- Body font: ${context.typography.bodyFont}

## CTA Strategy
- Primary CTA text: "${context.ctaStrategy.primaryCta}"
- CTA placements: ${context.ctaStrategy.placement.join(', ') || 'none detected'}

## Trust Elements
- Testimonials: ${context.trustElements.testimonialCount}
- Client logos: ${context.trustElements.logoCount}
- Stats/counters: ${context.trustElements.statsCount}

## SEO Score
${seoSummary}

## Accessibility Score
${context.accessibilityScore}/100

## Motion & Animation
Intensity: ${context.motionIntensity}

## Responsive Approach
${context.responsiveApproach}

## Tech Stack
- Framework: ${context.techStack.framework || 'unknown'}
- CSS framework: ${context.techStack.cssFramework || 'unknown'}

## Brand Personality (from Phase 5)
${context.brandPersonality.join(', ')}

## Target Audience (from Phase 5)
${context.targetAudience}

## Sections Missing (compared to industry standard)
${context.missingCommonSections.length > 0 ? context.missingCommonSections.join(', ') : 'none — all standard sections present'}

## Conversion Funnel
- Entry points: ${context.conversionFunnel.entryPoints.join(', ')}
- Primary conversion action: ${context.conversionFunnel.primaryConversion}

Produce the complete strategic insights JSON. Every strength and weakness MUST cite specific evidence from the data above. Every rebuild recommendation must be concrete and actionable — no generic advice.`

  return { system, user }
}
