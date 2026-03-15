import { NextResponse } from 'next/server'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const GEMINI_MODEL = 'gemini-2.5-flash'

const ANALYZE_PROMPT = `You are a world-class design system analyst and brand strategist. You reverse-engineer websites to extract their complete visual DNA — every design decision that makes the site feel cohesive and premium.

Your analysis is used to rebuild the site with AI. The more precise and detailed your extraction, the more faithful and stunning the rebuild will be. Be extremely specific. Extract ACTUAL values from CSS/HTML, never guess.

Return ONLY a valid JSON object (no markdown fences, no explanation text) with this structure:

{
  "designStyle": "luxury-minimal | corporate-clean | playful-bold | editorial | tech-modern | warm-organic | dark-premium | classic-elegant | brutalist | swiss-minimal | retro-vintage | neo-glassmorphism",
  "aesthetic": "2-3 sentences describing the overall visual feel, mood, and impression the site creates",
  "mood": "The emotional response the design evokes (e.g., trust, excitement, calm, urgency, sophistication)",
  "colorSystem": {
    "primary": "#hex — the main brand color",
    "primaryDark": "#hex — darker variant for hover/active states",
    "primaryLight": "#hex — lighter variant for backgrounds",
    "secondary": "#hex — supporting color",
    "accent": "#hex — highlights, badges, CTAs",
    "background": "#hex — main page background",
    "backgroundAlt": "#hex — alternating section backgrounds",
    "surface": "#hex — card/component backgrounds",
    "text": "#hex — primary text",
    "textMuted": "#hex — secondary/muted text",
    "textInverse": "#hex — text on dark/primary backgrounds",
    "border": "#hex — borders and dividers",
    "gradient": "CSS gradient string if used (e.g., linear-gradient(135deg, #xxx, #xxx))",
    "usage": "How colors create hierarchy: what uses primary vs secondary, how contrast guides the eye"
  },
  "typography": {
    "headingFont": "exact font-family name from CSS/@import",
    "bodyFont": "exact font-family name",
    "accentFont": "optional third font for special elements",
    "headingWeight": "actual weight value (300, 400, 500, 600, 700, 800, 900)",
    "bodyWeight": "actual weight value",
    "headingTransform": "uppercase | capitalize | none",
    "bodyTransform": "none | uppercase",
    "letterSpacing": "exact value from CSS (e.g., 0.05em, -0.02em, 0.15em)",
    "headingLetterSpacing": "specific letter-spacing for headings",
    "lineHeight": "exact body line-height (e.g., 1.6, 1.8)",
    "headingLineHeight": "specific line-height for headings (e.g., 1.1, 1.2)",
    "scale": "small | medium | large | xlarge — how big headings are relative to body",
    "heroSize": "approximate hero headline size in px/rem",
    "paragraphMaxWidth": "max-width of text blocks for readability (e.g., 65ch, 600px)"
  },
  "layout": {
    "maxWidth": "exact max-width from CSS (e.g., 1200px, 1400px, 1600px, full)",
    "headerStyle": "left-logo | centered-logo | split-nav | minimal | mega-menu | hamburger-only",
    "headerBehavior": "fixed-transparent | fixed-solid | sticky | static",
    "heroStyle": "full-image-overlay | split-content-image | video-bg | carousel | minimal-text | editorial-magazine | gradient-only | animated-bg",
    "heroHeight": "100vh | 90vh | 80vh | auto",
    "gridStyle": "uniform | masonry | alternating-sides | asymmetric | single-column",
    "gridColumns": "typical number of columns in content grids (2, 3, 4)",
    "sectionSpacing": "tight (2-4rem) | normal (4-6rem) | generous (6-8rem) | dramatic (8-12rem)",
    "contentDensity": "sparse | balanced | dense",
    "containerPadding": "approximate horizontal padding (e.g., 1rem, 2rem, 5%)",
    "sectionPattern": "description of how sections alternate (e.g., white-gray-white, color accents every 3rd)"
  },
  "sections": [
    {
      "type": "announcement-bar | header | hero | features | products | categories | testimonials | about | gallery | team | stats | pricing | faq | cta | newsletter | footer | promo-banner | blog | partners | process | how-it-works | comparison | video",
      "description": "Detailed description: layout (columns, alignment), visual style, spacing, background treatment",
      "columns": "1-6",
      "hasImage": true,
      "imageStyle": "full-bleed | contained | rounded | circular | with-overlay | with-border",
      "background": "white | gray | dark | primary | gradient | image",
      "style": "Every specific visual detail: shadows, borders, special effects, decorative elements"
    }
  ],
  "components": {
    "cards": "Detailed: border style, shadow depth, radius, padding, hover effect, image treatment inside cards",
    "buttons": {
      "primary": "fill style, radius, padding, font-weight, text-transform, shadow, hover transition",
      "secondary": "outline/ghost style details",
      "size": "small | medium | large"
    },
    "navigation": "alignment, font-weight, font-size, spacing between items, text-transform, active state indicator",
    "images": "aspect ratios used, overlay style, hover effect (zoom/fade/slide), border-radius, object-fit",
    "forms": "input border style, radius, padding, focus state, label placement",
    "badges": "style of tags/badges/labels if present",
    "dividers": "how sections are separated (space only, lines, shapes, gradients)"
  },
  "effects": {
    "borderRadius": "exact values used (e.g., 0 for buttons, 12px for cards, 50% for avatars)",
    "shadows": "none | subtle (0 1px 3px) | medium (0 4px 12px) | dramatic (0 20px 60px) | colored-glow",
    "borders": "none | thin-subtle (1px light gray) | prominent | decorative",
    "gradients": "none | subtle-overlay | bold-backgrounds | text-gradient",
    "animations": "none | minimal (fade) | moderate (slide+fade) | rich (parallax+3d+stagger)",
    "hoverEffects": "detailed: what happens on card hover, button hover, link hover, image hover",
    "scrollEffects": "fade-up | slide-in | parallax | scale | none",
    "specialEffects": "glass-morphism | grain/noise texture | blob shapes | geometric patterns | none"
  },
  "businessContext": {
    "industry": "ecommerce | restaurant | saas | portfolio | dental | law | fitness | realestate | photography | blog | agency | education | healthcare | consulting | fintech | travel | beauty | automotive",
    "businessName": "Name of the business",
    "targetAudience": "Who the site is designed for — demographics, needs, expectations",
    "tone": "premium | professional | friendly | playful | authoritative | minimalist | bold | warm | clinical | luxurious",
    "keyContent": ["ordered list of main content blocks found"],
    "uniqueFeatures": ["any distinctive design elements, interactions, or content patterns that make this site stand out"],
    "conversionStrategy": "how the site drives action: CTA placement, urgency elements, trust signals"
  }
}

EXTRACTION RULES:
- For fonts: check @import, <link href*="fonts">, font-family in CSS, and inline styles
- For colors: check CSS custom properties (--color-*), background-color, color, border-color, gradient values
- For layout: check max-width, grid-template-columns, flex properties, gap, padding values
- For sections: walk the HTML top-to-bottom, identify every major block
- For effects: check transition, transform, animation, box-shadow, filter, backdrop-filter
- Include EVERY section found, even small ones like announcement bars or trust strips
- Extract the EXACT hex colors, not approximations
- If a value can't be determined, use the most likely value based on visual analysis of the HTML structure`

/**
 * POST /api/ai/analyze-design
 * Receives HTML + CSS from client scanner, returns deep design DNA via AI
 */
export async function POST(request: Request) {
  try {
    const { html, css, url } = await request.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      )
    }

    // Truncate content to fit within token limits
    const htmlContent = (html || '').slice(0, 60000)
    const cssContent = (css || '').slice(0, 30000)

    const userPrompt = `Analyze this website's design DNA.

URL: ${url}

=== HTML (truncated) ===
${htmlContent}

=== CSS (truncated) ===
${cssContent}`

    const response = await fetch(
      `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: ANALYZE_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 16384,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}))
      const errorMsg = (errorBody as Record<string, Record<string, string>>)?.error?.message || 'Unknown error'
      return NextResponse.json(
        { ok: false, error: `Gemini API error (${response.status}): ${errorMsg}` },
        { status: 502 }
      )
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      return NextResponse.json(
        { ok: false, error: 'No response from AI' },
        { status: 502 }
      )
    }

    // Parse JSON from response (strip markdown fences if present)
    const jsonStr = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const designDna = JSON.parse(jsonStr)

    return NextResponse.json({ ok: true, data: designDna })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { ok: false, error: `Design analysis failed: ${message}` },
      { status: 500 }
    )
  }
}
