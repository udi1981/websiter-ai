/**
 * Brand Intelligence Analysis Prompt
 *
 * Builds the system + user prompt pair for Phase 5 of the scanner.
 * Claude acts as a world-class brand strategist analyzing a website's
 * brand DNA for faithful, upgraded reconstruction.
 */

// ---------------------------------------------------------------------------
// Context type — everything the prompt needs from prior phases
// ---------------------------------------------------------------------------

export type BrandAnalysisContext = {
  homepageText: string
  allPageTexts: { path: string; title: string; text: string }[]
  navigationStructure: {
    primary: { text: string; href: string }[]
    footer: { title: string; links: { text: string }[] }[]
  }
  sectionTypes: string[]
  colorPalette: { hex: string; usage: string }[]
  typography: { headingFont: string; bodyFont: string }
  ctaTexts: string[]
  heroContent: { heading: string; subheading: string; ctaText: string } | null
  domain: string
  pageCount: number
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

/**
 * Build the system + user prompt pair for brand intelligence extraction.
 * The system prompt establishes Claude as a senior brand strategist;
 * the user prompt presents all extracted site data and requests
 * structured JSON output matching BrandIntelligence + ContentTone types.
 */
export const buildBrandAnalysisPrompt = (
  context: BrandAnalysisContext
): { system: string; user: string } => {
  const system = `You are a world-class brand strategist and design psychologist who has personally audited more than 10,000 websites for Fortune 500 companies, Y Combinator startups, and leading agencies. Your brand audits rival McKinsey and Interbrand in depth and precision.

You are analyzing a website's complete brand DNA so that a rebuild engine can reconstruct it faithfully while upgrading weak areas. Your analysis must be:
- SPECIFIC — reference actual colors, words, and patterns from the data, never vague
- EXPERT — use professional branding, UX, and psychology terminology
- ACTIONABLE — every insight should directly inform the rebuild
- CALIBRATED — scores and ratings follow the rubrics below

## Scoring Rubrics
- Sophistication level (1-10): 1 = amateur one-page site, 5 = competent small-business site, 8 = polished agency-quality, 10 = Apple / Stripe tier
- Formality (1-10): 1 = slang-heavy casual, 5 = conversational professional, 10 = corporate / legal
- Jargon level (1-10): 1 = no industry terms, 5 = moderate domain vocabulary, 10 = dense specialist language

## Jungian Archetypes Reference
Innocent, Explorer, Sage, Hero, Outlaw, Magician, Regular Guy, Lover, Jester, Caregiver, Creator, Ruler

## Output Format
Return ONLY valid JSON matching the schema below. No markdown fences, no explanations outside the JSON.

{
  "brandName": "string — extracted or best-guess brand name",
  "tagline": "string | null — extracted tagline or null if none found",

  "personality": {
    "traits": ["string x5 — e.g. 'innovative', 'trustworthy', 'warm', 'bold', 'approachable'"],
    "mood": "string — overall emotional mood (e.g. 'confident and inspiring')",
    "archetype": "string — one of the 12 Jungian archetypes",
    "archetypeRationale": "string — 1-2 sentences explaining why this archetype fits",
    "designLanguage": "string — label like 'luxury-minimal', 'bold-creative', 'corporate-clean', 'warm-organic'"
  },

  "targetAudience": {
    "demographics": "string — age range, gender skew, income level, location hints",
    "psychographics": "string — values, lifestyle, aspirations",
    "painPoints": ["string x2-4 — problems the audience faces"],
    "desires": ["string x2-4 — outcomes the audience wants"],
    "sophisticationLevel": number
  },

  "industry": {
    "primary": "string — e.g. 'Technology', 'Healthcare', 'Food & Beverage'",
    "subCategory": "string — e.g. 'SaaS Project Management', 'Cosmetic Dentistry'",
    "niche": "string — e.g. 'AI-powered sales automation for mid-market B2B'",
    "inferredCompetitors": ["string x2-4 — likely competitors based on positioning"]
  },

  "valueProposition": {
    "headline": "string — the core value proposition in one sentence",
    "subheadline": "string — supporting sentence that expands on it",
    "benefits": ["string x3-5 — specific benefits communicated"],
    "differentiators": ["string x2-3 — what sets them apart"],
    "proofPoints": ["string x1-3 — evidence: stats, awards, logos, testimonials"]
  },

  "positioning": {
    "marketPosition": "string — where they sit: premium, mid-market, budget, niche specialist",
    "competitiveAngle": "string — how they differentiate from competitors",
    "pricingSignal": "string — luxury, premium, accessible, budget, unclear"
  },

  "contentTone": {
    "formality": number,
    "voice": "string — e.g. 'authoritative expert', 'friendly guide', 'bold provocateur'",
    "perspective": "first-person | second-person | third-person | mixed",
    "sentenceStyle": "string — e.g. 'short punchy fragments', 'flowing narrative', 'technical precision'",
    "jargonLevel": number,
    "samplePhrases": ["string x5 — actual phrases from the site that capture the voice"]
  },

  "designPsychology": {
    "colorEmotions": "string — what the color palette communicates emotionally",
    "typographyMessage": "string — what the font choices signal about the brand",
    "layoutPriority": "string — what the layout structure prioritizes (trust, conversion, storytelling, etc.)",
    "overallImpression": "string — the feeling a first-time visitor gets within 3 seconds"
  }
}`

  const colorList = context.colorPalette
    .map((c) => `${c.hex} (${c.usage})`)
    .join(', ')

  const ctaList = context.ctaTexts.length > 0
    ? context.ctaTexts.slice(0, 15).join(' | ')
    : 'none found'

  const heroBlock = context.heroContent
    ? `Heading: "${context.heroContent.heading}"\nSubheading: "${context.heroContent.subheading}"\nCTA: "${context.heroContent.ctaText}"`
    : 'No hero content extracted'

  const navItems = context.navigationStructure.primary
    .map((n) => n.text)
    .join(', ')

  const footerGroups = context.navigationStructure.footer
    .map((g) => `${g.title}: ${g.links.map((l) => l.text).join(', ')}`)
    .join('\n')

  const pageTexts = context.allPageTexts
    .map((p) => `--- ${p.path} (${p.title}) ---\n${p.text}`)
    .join('\n\n')

  const user = `Analyze the following website and return the brand intelligence JSON.

## Site Metadata
- Domain: ${context.domain}
- Pages found: ${context.pageCount}
- Section types detected: ${context.sectionTypes.join(', ')}

## Color Palette
${colorList || 'No colors extracted'}

## Typography
- Heading font: ${context.typography.headingFont || 'unknown'}
- Body font: ${context.typography.bodyFont || 'unknown'}

## Navigation Structure
Primary nav: ${navItems || 'none'}
Footer groups:
${footerGroups || 'none'}

## Hero Section
${heroBlock}

## CTA Texts Found Across Site
${ctaList}

## Homepage Content
${context.homepageText.slice(0, 6000)}

## Key Page Content
${pageTexts.slice(0, 12000)}

Based on ALL of the above data, produce the complete brand intelligence JSON. Every field must be filled — infer from available signals when explicit data is missing. Be specific, not generic.`

  return { system, user }
}
