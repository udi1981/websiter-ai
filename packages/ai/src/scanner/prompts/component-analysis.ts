/**
 * Component Analysis Prompt
 *
 * AI-enhanced classification for sections the programmatic detector
 * could not confidently identify. Receives HTML snippets and returns
 * refined section types with variant names.
 */

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

export type AmbiguousSection = {
  html: string
  currentClassification: string
  confidence: number
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

/**
 * Build a focused, efficient prompt that classifies ambiguous HTML sections.
 * Returns refined section type + variant for each input snippet.
 */
export const buildComponentAnalysisPrompt = (
  sections: AmbiguousSection[]
): { system: string; user: string } => {
  const system = `You are a web component classification expert. Given HTML snippets of website sections that an automated detector could not confidently classify, you determine the correct section type and visual variant.

## Valid Section Types
hero, features, about, services, testimonials, pricing, faq, contact, footer, gallery, team, stats, cta, blog, products, newsletter, navbar, portfolio, process, comparison, integrations, clients, case-studies, unknown

## Variant Naming Convention
Use descriptive compound names:
- hero → "full-bleed-image", "split-text-image", "gradient-abstract", "video-background", "minimal-centered"
- features → "bento-grid", "icon-cards-3col", "alternating-rows", "tabbed-showcase", "single-feature-spotlight"
- testimonials → "carousel-single", "grid-cards", "large-quote", "social-proof-row", "video-testimonial"
- pricing → "three-tier-highlight", "two-tier-simple", "toggle-monthly-annual", "comparison-table"
- cta → "full-width-gradient", "split-image-text", "minimal-inline", "floating-banner"

## Output Format
Return ONLY a JSON array. One object per input section, in the same order.

[
  {
    "index": 0,
    "type": "string — correct section type",
    "variant": "string — descriptive variant name",
    "confidence": number,
    "reasoning": "string — 1 sentence explaining the classification"
  }
]`

  const snippets = sections.map((s, i) => {
    const trimmed = s.html.length > 1500
      ? s.html.slice(0, 1500) + '... [truncated]'
      : s.html
    return `### Section ${i} (current: "${s.currentClassification}", confidence: ${s.confidence})
\`\`\`html
${trimmed}
\`\`\``
  }).join('\n\n')

  const user = `Classify these ${sections.length} ambiguous website sections. For each, determine the correct section type and a descriptive variant name.

${snippets}

Return the JSON array.`

  return { system, user }
}
