import { NextResponse } from 'next/server'

// Vercel: allow up to 120s for planning (Claude needs ~90s for complex build plans)
export const maxDuration = 120

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

const PLANNING_SYSTEM_PROMPT = `You are the Lead Architect of "Team 100" — a multi-agent AI system that builds world-class websites for UBuilder AI.

You receive:
1. Discovery context (business name, industry, audience, goals, features, design preferences, tone, unique value, pages needed)
2. Optionally: scan results from an existing website (design DNA, sections, colors, fonts, content, images)

Your job: Produce a detailed BUILD PLAN that the generation team will follow exactly.

## WHEN A URL WAS SCANNED
The generated site MUST closely resemble the scanned site. You are rebuilding it, not creating something new.
- Preserve the exact section order and types from the scan
- Match the color palette (use the exact hex codes from the scan)
- Match the typography (same font families or closest equivalents)
- Match the layout patterns (grid columns, spacing, hero style)
- Improve: better responsiveness, cleaner code, smoother animations, better CTAs
- Keep the same business name, content tone, and messaging style
- Upgrade weak sections (e.g., add testimonials if missing, improve CTAs)

## WHEN NO URL (from scratch)
Design a site that matches the discovery context:
- Pick industry-appropriate sections
- Choose a color palette that fits the brand personality
- Select fonts that match the tone
- Design for conversion based on the primary goal

## BUILD PLAN STRUCTURE
You MUST respond with valid JSON only. No markdown, no code fences, no explanations.

{
  "siteName": "Business Name",
  "industry": "restaurant",
  "designStyle": "modern-warm | luxury-minimal | corporate-clean | bold-creative | playful-colorful | elegant-classic",
  "colorPalette": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "backgroundAlt": "#hex",
    "text": "#hex",
    "textMuted": "#hex",
    "border": "#hex"
  },
  "typography": {
    "headingFont": "Font Name",
    "bodyFont": "Font Name",
    "accentFont": "Font Name or null",
    "headingWeight": "700",
    "bodyWeight": "400",
    "baseSize": "16px",
    "scale": "1.25"
  },
  "layout": {
    "maxWidth": "1200px",
    "headerStyle": "fixed-transparent | fixed-solid | sticky",
    "heroStyle": "full-screen | split | centered | video-bg | image-overlay",
    "gridColumns": "2 | 3 | 4",
    "sectionSpacing": "80px | 100px | 120px"
  },
## MULTI-PAGE STRUCTURE
Generate 3-5 pages depending on business needs:
- **Home** (/) — Always included. Main landing with hero, features, testimonials, CTA. 10-14 sections.
- **About** (/about) — Company story, team, mission. 4-6 sections.
- **Services** (/services) — Detailed service descriptions. 4-6 sections. (Skip for simple businesses)
- **Contact** (/contact) — Contact form, map, details. 2-3 sections.
- **Blog** (/blog) — Blog listing. 2-3 sections. (Optional)

Each page has its own sections array with appropriate variantIds.
The navbar on every page must include links to all other pages.

  "pages": [
    {
      "name": "Home",
      "slug": "/",
      "purpose": "Main landing page — convert visitors to customers",
      "sections": [
        {
          "type": "navbar",
          "variantId": "navbar-minimal | navbar-transparent | navbar-floating | navbar-split | navbar-mega-menu | navbar-hamburger | navbar-sidebar | navbar-command",
          "notes": "Any specific instructions for this section"
        },
        {
          "type": "hero",
          "variantId": "hero-gradient-mesh | hero-split-image | hero-fullscreen-video | hero-particles | hero-typewriter | hero-parallax-layers | hero-magazine | hero-product-showcase | hero-minimal-text | hero-counter-stats | hero-carousel | hero-aurora | hero-noise-gradient | hero-interactive-cards | hero-3d-globe",
          "headline": "Exact headline text",
          "subheadline": "Exact subheadline text",
          "cta": { "text": "Button text", "action": "scroll-to-contact | link | modal" },
          "notes": "Any specific instructions"
        },

## HERO VARIANT SELECTION GUIDE
Pick the hero variant based on the business industry:
- restaurant/cafe/food → hero-split-image (show food/interior photo)
- tech/saas/software → hero-gradient-mesh OR hero-aurora (abstract dynamic)
- beauty/health/spa → hero-parallax-layers (elegant layered)
- law/finance/consulting → hero-minimal-text (clean corporate)
- ecommerce/retail → hero-product-showcase OR hero-carousel
- portfolio/creative/agency → hero-magazine OR hero-interactive-cards
- real-estate → hero-split-image (property showcase)
- education → hero-typewriter (engaging text)
- fitness/gym → hero-counter-stats (impressive numbers)
NEVER use the same hero variant for every site. Match the hero to the business personality.

        {
          "type": "features | testimonials | pricing | cta | faq | footer | gallery | team | stats | contact | partners | how-it-works | blog | portfolio | comparison | newsletter | about",
          "variantId": "Pick from: features-bento-grid | features-tabs | features-accordion | features-zigzag | features-icon-grid | features-carousel | features-comparison | features-timeline | features-video-cards | features-interactive | features-stats-integrated | features-hoverable-cards | testimonials-carousel | testimonials-masonry | testimonials-featured | testimonials-video | testimonials-wall | testimonials-minimal | testimonials-star-rating | testimonials-logo-bar | testimonials-before-after | testimonials-glassmorphism | pricing-animated-cards | pricing-toggle | pricing-comparison-table | pricing-slider | pricing-minimal | pricing-gradient | pricing-enterprise | pricing-israeli | cta-gradient-banner | cta-split-image | cta-floating-card | cta-newsletter | cta-countdown | cta-sticky-bottom | cta-video-background | cta-glassmorphism | faq-accordion | faq-searchable | faq-categorized | faq-two-column | faq-chat-style | footer-multi-column | footer-minimal | footer-mega | footer-centered | footer-gradient | footer-cta-integrated | gallery-masonry | gallery-lightbox | gallery-carousel | gallery-filterable | gallery-fullscreen | gallery-before-after | team-grid | team-carousel | team-flip-cards | team-hoverable | stats-counters | stats-progress-bars | stats-dashboard | stats-radial | contact-form-map | contact-split | contact-chat-widget | contact-minimal | partners-marquee | partners-grid | partners-tiered | how-it-works-steps | how-it-works-timeline | how-it-works-interactive | how-it-works-video | blog-card-grid | blog-featured-list | blog-magazine | blog-minimal | portfolio-case-study | portfolio-filterable | portfolio-masonry | comparison-feature-matrix | comparison-before-after | newsletter-inline | newsletter-popup | newsletter-bottom-bar | about-story-timeline | about-team-mission | about-split-image",
          "title": "Section title",
          "subtitle": "Section subtitle",
          "items": [
            {
              "title": "Item title",
              "description": "Item description",
              "icon": "emoji or icon name"
            }
          ],
          "notes": "Specific instructions"
        }
      ]
    }
  ],
  "contentTone": "formal | casual | friendly | authoritative | warm | playful",
  "conversionStrategy": {
    "primaryGoal": "leads | sales | bookings | portfolio-views | information",
    "mainCTA": "Book Now | Get Started | Contact Us | Shop Now | Learn More",
    "trustElements": ["testimonials", "stats", "partner-logos", "certifications", "guarantees"],
    "urgencyTriggers": ["limited-time", "spots-remaining", "free-consultation"]
  },
  "seoStrategy": {
    "targetKeywords": ["keyword1", "keyword2"],
    "metaTitle": "SEO-optimized page title",
    "metaDescription": "SEO-optimized description"
  },
  "motionPreset": {
    "intensity": "subtle | moderate | dynamic",
    "scrollReveal": true,
    "hoverEffects": true,
    "parallax": false,
    "smoothScroll": true
  },
  "preserveFromScan": {
    "colors": true,
    "fonts": true,
    "sectionOrder": true,
    "content": true,
    "images": false,
    "notes": "What was preserved and what was improved"
  }
}

## SECTION CONTENT REQUIREMENTS
Each section's "items" array MUST contain COMPLETE, business-specific content matching the section type:

- **features/how-it-works**: items[] with { title, description, icon } — 4-6 items, each description 2-3 sentences, icons as emoji
- **testimonials**: items[] with { title: "Person Name", description: "Full testimonial quote (2-3 sentences)", icon: "Company / Role" }
- **pricing**: items[] with { title: "Plan Name", description: "$XX/mo — feature1, feature2, feature3, feature4", icon: "💼" or similar }
- **faq**: items[] with { title: "The full question?", description: "The complete, helpful answer (2-4 sentences)" } — 5-8 items
- **stats**: items[] with { title: "100+", description: "Label for this stat", icon: "📊" }
- **team**: items[] with { title: "Person Name", description: "Role — short bio (1-2 sentences)", icon: "👤" }
- **partners**: items[] with { title: "Partner Name", description: "What they do or partnership type" }
- **gallery/portfolio**: items[] with { title: "Project Name", description: "Brief description", icon: "category tag" }
- **blog**: items[] with { title: "Article Title", description: "Article excerpt (2-3 sentences)" }
- **comparison**: items[] with { title: "Feature Name", description: "us: ✓ | competitor: ✗ — explanation" }
- **contact**: items[] with { title: "Email / Phone / Address", description: "info@business.com", icon: "📧📞📍" }

## CRITICAL: variantId FORMAT
Use EXACTLY these variant IDs (with hyphens, not underscores). Examples:
- nav-transparent, nav-floating, nav-minimal, nav-split
- hero-gradient-mesh, hero-split-image, hero-aurora, hero-typewriter
- features-bento-grid, features-tabs, features-zigzag, features-icon-grid
- testimonials-carousel, testimonials-masonry, testimonials-glassmorphism
- pricing-animated-cards, pricing-toggle, pricing-comparison-table
- cta-gradient-banner, cta-glassmorphism, cta-floating-card
- faq-accordion, faq-searchable, faq-categorized
- footer-multi-column, footer-gradient, footer-cta-integrated
- stats-counters, gallery-masonry, team-grid, contact-form-map
- partners-marquee, how-it-works-steps, blog-card-grid, about-story-timeline

## RULES
1. Every section must have REAL, specific, compelling content — never placeholder text
2. Headlines must be benefit-oriented and conversion-focused, not generic
3. Include 10-14 sections per page for a comprehensive, premium feel
4. Color palette must have proper contrast (WCAG AA) and include ALL semantic colors
5. If scan data exists, the plan must CLOSELY MATCH the scanned site's structure and style
6. Items arrays should have 4-6 items each with FULL, detailed descriptions (2-3 sentences each)
7. Image descriptions should be specific enough to find the perfect Unsplash photo
8. The plan must be comprehensive enough that a developer could build the ENTIRE site from it alone
9. Include an FAQ section with 5-8 REAL, helpful questions and detailed answers
10. Include a testimonials section with 3-4 realistic testimonials (name, role, company, quote)
11. Include proper Schema.org type recommendation (Organization, LocalBusiness, Restaurant, etc.)
12. Typography: recommend specific Google Fonts that match the brand personality
13. The hero section must specify exactly: headline, subheadline, CTAs, image mood, layout style
14. Sections must vary in layout: no two sections should use the same visual pattern
15. Include conversion strategy with specific trust elements relevant to the industry
16. ALWAYS include a variantId for EVERY section — this is CRITICAL for the section composer to work
17. The hero cta object MUST have both text and action fields`

type PlanningRequest = {
  discoveryContext: Record<string, unknown>
  scanResult?: {
    _source?: 'deep-scan-v2' | 'legacy-scan'
    // Deep scan V2 fields (full intelligence)
    pages?: { url: string; path: string; title: string; purpose: string; depth: number; isNav: boolean; sectionCount: number; hasForm: boolean; hasMedia: boolean }[]
    pageCount?: number
    designTokens?: {
      colors?: { hex: string; usage: string; frequency: number; pages?: string[] }[]
      fonts?: { family: string; usage: string; weight: string; source: string }[]
      spacing?: string[]
      borderRadius?: string[]
      shadows?: string[]
      gradients?: string[]
      cssVariables?: Record<string, string>
    }
    contentMap?: {
      pagePath: string
      sections: { type: string; title: string; content: string; hasImages: boolean; hasForm: boolean; itemCount: number; order: number }[]
      headings: { level: number; text: string }[]
      ctaButtons: { text: string; href: string }[]
    }[]
    rebuildPlan?: { preserve: string[]; rebuild: string[]; improve: string[]; upgrade: string[] }
    footerLinks?: { text: string; href: string; group: string }[]
    // Shared fields
    colors?: { hex: string; usage: string; frequency?: number }[]
    fonts?: { family: string; usage: string }[]
    sections?: { type: string; title?: string; content?: string; hasImages?: boolean; hasForm?: boolean; itemCount?: number }[]
    navigation?: { text: string; href: string }[]
    headings?: string[] | { level: number; text: string }[]
    paragraphs?: string[]
    images?: { src: string; alt: string; role?: string; description?: string; page?: string }[]
    businessType?: string
    businessName?: string
    siteName?: string
    title?: string
    description?: string
    seoMeta?: Record<string, string>
    motion?: Record<string, unknown>
    designDna?: Record<string, unknown>
  }
  description: string
  templateId?: string
  locale?: 'en' | 'he'
}

export const POST = async (request: Request) => {
  const geminiKey = process.env.GEMINI_API_KEY
  const claudeKey = process.env.CLAUDE_API_KEY

  if (!geminiKey && !claudeKey) {
    return NextResponse.json(
      { ok: false, error: 'No AI API key configured' },
      { status: 500 }
    )
  }

  try {
    const body = (await request.json()) as PlanningRequest

    // Build comprehensive context for the planner
    const contextParts: string[] = []

    // Discovery context — supports both old and new dimension formats
    if (body.discoveryContext) {
      const dc = body.discoveryContext
      if (dc.business_name) contextParts.push(`Business name: ${dc.business_name}`)
      if (dc.industry) contextParts.push(`Industry: ${dc.industry}`)
      if (dc.brand_personality) contextParts.push(`Brand personality: ${dc.brand_personality}`)
      if (dc.target_audience) contextParts.push(`Target audience: ${dc.target_audience}`)
      if (dc.competitive_edge) contextParts.push(`Competitive edge: ${dc.competitive_edge}`)
      if (dc.competitors) contextParts.push(`Competitors: ${dc.competitors}`)
      if (dc.primary_goal) contextParts.push(`Primary goal: ${dc.primary_goal}`)
      if (dc.conversion_action) contextParts.push(`Primary conversion action: ${dc.conversion_action}`)
      if (dc.trust_factors) contextParts.push(`Trust factors: ${JSON.stringify(dc.trust_factors)}`)
      if (dc.key_services || dc.key_features) contextParts.push(`Key services/features: ${JSON.stringify(dc.key_services || dc.key_features)}`)
      if (dc.pages_needed) contextParts.push(`Pages requested: ${JSON.stringify(dc.pages_needed)}`)
      if (dc.existing_content) contextParts.push(`Existing content: ${dc.existing_content}`)
      if (dc.design_mood || dc.design_preference) contextParts.push(`Design mood: ${dc.design_mood || dc.design_preference}`)
      if (dc.color_preferences) contextParts.push(`Color preferences: ${dc.color_preferences}`)
      if (dc.inspiration_sites) contextParts.push(`Inspiration sites: ${dc.inspiration_sites}`)
      if (dc.photography_style) contextParts.push(`Photography style: ${dc.photography_style}`)
      if (dc.content_tone) contextParts.push(`Content tone: ${dc.content_tone}`)
      if (dc.special_features) contextParts.push(`Special features: ${JSON.stringify(dc.special_features)}`)
      if (dc.local_seo) contextParts.push(`Local SEO: ${dc.local_seo}`)
      if (dc.unique_value) contextParts.push(`Unique value proposition: ${dc.unique_value}`)
    }

    if (body.description) {
      contextParts.push(`\nOriginal description: "${body.description}"`)
    }

    if (body.templateId) {
      contextParts.push(`Selected template category: ${body.templateId}`)
    }

    // Scan results (when URL was provided)
    if (body.scanResult) {
      const scan = body.scanResult
      const isDeepScan = scan._source === 'deep-scan-v2'
      contextParts.push('\n--- SCANNED WEBSITE DATA ---')
      contextParts.push('IMPORTANT: The generated site must closely match this scanned site.')
      if (isDeepScan) contextParts.push('(Full deep scan — multi-page analysis with AI design DNA)')

      // Business identity
      const bizName = scan.businessName || scan.siteName
      if (bizName) contextParts.push(`Scanned business name: ${bizName}`)
      if (scan.businessType) contextParts.push(`Scanned business type: ${scan.businessType}`)
      if (scan.title) contextParts.push(`Page title: ${scan.title}`)
      if (scan.description) contextParts.push(`Meta description: ${scan.description}`)

      // Multi-page structure (deep scan only)
      if (scan.pages?.length) {
        contextParts.push(`\n📄 Site structure (${scan.pageCount || scan.pages.length} pages):`)
        scan.pages.forEach(p => {
          contextParts.push(`  - ${p.path} — "${p.title}" (${p.purpose})${p.isNav ? ' [in nav]' : ''}${p.hasForm ? ' [form]' : ''}${p.hasMedia ? ' [media]' : ''} ${p.sectionCount} sections`)
        })
      }

      // Design tokens (deep scan — full palette)
      const colors = scan.designTokens?.colors || scan.colors
      if (colors?.length) {
        contextParts.push(`\n🎨 Color palette (${colors.length} colors):`)
        colors.slice(0, 15).forEach((c: { hex: string; usage: string; frequency?: number; pages?: string[] }) => {
          const pages = (c as { pages?: string[] }).pages
          contextParts.push(`  ${c.hex} — ${c.usage} (freq: ${c.frequency || '?'})${pages?.length ? ` used on: ${pages.join(', ')}` : ''}`)
        })
      }

      const fonts = scan.designTokens?.fonts || scan.fonts
      if (fonts?.length) {
        contextParts.push(`\n🔤 Typography:`)
        fonts.forEach((f: { family: string; usage: string; weight?: string; source?: string }) => {
          contextParts.push(`  ${f.family} — ${f.usage}${f.weight ? ` (${f.weight})` : ''}${f.source ? ` [${f.source}]` : ''}`)
        })
      }

      // Design tokens extras (deep scan only)
      if (scan.designTokens) {
        const dt = scan.designTokens
        if (dt.spacing?.length) contextParts.push(`\n📏 Spacing values: ${dt.spacing.join(', ')}`)
        if (dt.borderRadius?.length) contextParts.push(`📐 Border radius: ${dt.borderRadius.join(', ')}`)
        if (dt.shadows?.length) contextParts.push(`🌑 Shadows: ${dt.shadows.slice(0, 5).join(' | ')}`)
        if (dt.gradients?.length) contextParts.push(`🌈 Gradients: ${dt.gradients.slice(0, 5).join(' | ')}`)
        if (dt.cssVariables && Object.keys(dt.cssVariables).length > 0) {
          const vars = Object.entries(dt.cssVariables).slice(0, 20)
          contextParts.push(`🔧 CSS Variables (${Object.keys(dt.cssVariables).length} total):`)
          vars.forEach(([k, v]) => contextParts.push(`  ${k}: ${v}`))
        }
      }

      // Per-page content architecture (deep scan only)
      if (scan.contentMap?.length) {
        contextParts.push(`\n📋 Content architecture per page:`)
        scan.contentMap.forEach(page => {
          contextParts.push(`\n  Page: ${page.pagePath}`)
          if (page.sections.length) {
            contextParts.push(`  Sections (${page.sections.length}):`)
            page.sections.forEach((s, i) => {
              contextParts.push(`    ${i + 1}. ${s.type}${s.title ? `: "${s.title}"` : ''}${s.hasForm ? ' [form]' : ''}${s.hasImages ? ' [images]' : ''}${s.itemCount ? ` [${s.itemCount} items]` : ''}`)
              if (s.content) contextParts.push(`       Preview: "${s.content.slice(0, 200)}"`)
            })
          }
          if (page.headings.length) {
            contextParts.push(`  Headings:`)
            page.headings.slice(0, 10).forEach(h => contextParts.push(`    H${h.level}: ${h.text}`))
          }
          if (page.ctaButtons.length) {
            contextParts.push(`  CTAs: ${page.ctaButtons.map(c => `"${c.text}"`).join(', ')}`)
          }
        })
      } else if (scan.sections?.length) {
        // Legacy scan fallback
        contextParts.push(`\nSections found (${scan.sections.length}):`)
        scan.sections.forEach((s, i) => {
          contextParts.push(`  ${i + 1}. ${s.type}${s.title ? `: "${s.title}"` : ''}${s.hasForm ? ' [form]' : ''}${s.hasImages ? ' [images]' : ''}${s.itemCount ? ` [${s.itemCount} items]` : ''}`)
          if (s.content) contextParts.push(`     Content preview: "${s.content.slice(0, 200)}"`)
        })
      }

      // Navigation
      if (scan.navigation?.length) {
        contextParts.push(`\n🧭 Navigation: ${scan.navigation.map(n => `${n.text} → ${n.href}`).join(' | ')}`)
      }
      if (scan.footerLinks?.length) {
        contextParts.push(`Footer links: ${scan.footerLinks.map(n => `${n.text} (${n.group})`).join(', ')}`)
      }

      // Images
      if (scan.images?.length) {
        contextParts.push(`\n🖼️ Images (${scan.images.length}):`)
        scan.images.slice(0, 15).forEach(img => {
          contextParts.push(`  - ${img.role || 'unknown'}: ${img.description || img.alt || 'no description'}${img.page ? ` [${img.page}]` : ''}`)
        })
      }

      // Motion & animation
      if (scan.motion) {
        contextParts.push(`\n✨ Motion/animation: ${JSON.stringify(scan.motion)}`)
      }

      // AI-analyzed design DNA (from deep scan phase 7)
      if (scan.designDna) {
        contextParts.push(`\n🧬 AI-analyzed design DNA: ${JSON.stringify(scan.designDna)}`)
      }

      // AI-generated rebuild plan (deep scan only)
      if (scan.rebuildPlan) {
        contextParts.push(`\n📋 AI Rebuild Plan:`)
        if (scan.rebuildPlan.preserve?.length) contextParts.push(`  ✅ Preserve: ${scan.rebuildPlan.preserve.join(', ')}`)
        if (scan.rebuildPlan.rebuild?.length) contextParts.push(`  🔧 Rebuild: ${scan.rebuildPlan.rebuild.join(', ')}`)
        if (scan.rebuildPlan.improve?.length) contextParts.push(`  ⬆️ Improve: ${scan.rebuildPlan.improve.join(', ')}`)
        if (scan.rebuildPlan.upgrade?.length) contextParts.push(`  🚀 Upgrade: ${scan.rebuildPlan.upgrade.join(', ')}`)
      }

      // SEO
      if (scan.seoMeta) {
        contextParts.push(`\n🔍 SEO meta: ${JSON.stringify(scan.seoMeta)}`)
      }

      // Legacy headings fallback
      if (!scan.contentMap && scan.headings?.length) {
        contextParts.push(`\nHeadings:`)
        const headings = scan.headings as (string | { level: number; text: string })[]
        headings.slice(0, 15).forEach(h => {
          if (typeof h === 'string') contextParts.push(`  - ${h}`)
          else contextParts.push(`  H${h.level}: ${h.text}`)
        })
      }

      contextParts.push('--- END SCANNED DATA ---')
    }

    // Locale awareness
    if (body.locale === 'he') {
      contextParts.push('\n--- LANGUAGE REQUIREMENT ---')
      contextParts.push('This website MUST be in HEBREW (עברית).')
      contextParts.push('All content (headlines, descriptions, CTAs, FAQ, testimonials) must be written in fluent Hebrew.')
      contextParts.push('Typography must use Hebrew-supporting fonts: Heebo, Assistant, Rubik, Frank Ruhl Libre, or Noto Sans Hebrew.')
      contextParts.push('Layout must be RTL — set dir="rtl" and use CSS logical properties.')
      contextParts.push('Phone format: 05X-XXX-XXXX | Currency: ₪ (ILS)')
      contextParts.push('--- END LANGUAGE REQUIREMENT ---')
    }

    const userContent = `Create a comprehensive build plan for this website.\n\n${contextParts.join('\n')}\n\nRespond with the JSON build plan only.`

    let text = ''

    // Try Claude first (primary — higher quality planning)
    console.log('Planning: Starting Claude request, prompt length:', userContent.length)
    if (claudeKey) {
      try {
        const startTime = Date.now()
        const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': claudeKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 16384,
            temperature: 0.3,
            system: PLANNING_SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userContent }],
          }),
        })
        console.log('Planning: Claude responded in', Date.now() - startTime, 'ms, status:', claudeRes.status)

        if (claudeRes.ok) {
          const claudeData = await claudeRes.json()
          text = claudeData.content?.[0]?.text || ''
          console.log('Planning: Claude response received,', text.length, 'chars')
        } else {
          const errText = await claudeRes.text()
          console.error('Planning: Claude API error:', claudeRes.status, errText.substring(0, 300))
        }
      } catch (err) {
        console.error('Planning: Claude fetch error:', err)
      }
    }

    // Fallback to Gemini if Claude failed
    if (!text && geminiKey) {
      try {
        const startTime = Date.now()
        const geminiRes = await fetch(`${GEMINI_API_URL}?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: PLANNING_SYSTEM_PROMPT }] },
            contents: [{ role: 'user', parts: [{ text: userContent }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 16384,
              responseMimeType: 'application/json',
            },
          }),
        })
        console.log('Planning: Gemini responded in', Date.now() - startTime, 'ms, status:', geminiRes.status)

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json()
          text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''
          console.log('Planning: Gemini response received,', text.length, 'chars')
        } else {
          const errText = await geminiRes.text()
          console.error('Planning: Gemini API error:', geminiRes.status, errText.substring(0, 300))
        }
      } catch (err) {
        console.error('Planning: Gemini fetch error:', err)
      }
    }

    if (!text) {
      return NextResponse.json(
        { ok: false, error: 'All AI providers failed for planning' },
        { status: 502 }
      )
    }

    // Parse the JSON build plan
    try {
      let plan: Record<string, unknown>
      try {
        plan = JSON.parse(text)
      } catch {
        // Try to extract and repair JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('No JSON found in planning response')
        try {
          plan = JSON.parse(jsonMatch[0])
        } catch {
          // Attempt repair: truncated JSON — close open structures
          let repaired = jsonMatch[0]

          // Remove trailing incomplete constructs (truncated mid-value)
          // Strip incomplete string value at the end
          repaired = repaired.replace(/,\s*"[^"]*"?\s*:\s*"[^"]*$/, '')
          // Strip incomplete array item
          repaired = repaired.replace(/,\s*\{[^}]*$/, '')
          // Strip trailing comma
          repaired = repaired.replace(/,\s*$/, '')
          // Strip incomplete key-value (no closing quote on value)
          repaired = repaired.replace(/:\s*"[^"]*$/, ': ""')
          // Strip incomplete key (no colon yet)
          repaired = repaired.replace(/,\s*"[^"]*$/, '')

          // Count open braces/brackets and close them
          const openBraces = (repaired.match(/\{/g) || []).length
          const closeBraces = (repaired.match(/\}/g) || []).length
          const openBrackets = (repaired.match(/\[/g) || []).length
          const closeBrackets = (repaired.match(/\]/g) || []).length
          for (let i = 0; i < openBrackets - closeBrackets; i++) repaired += ']'
          for (let i = 0; i < openBraces - closeBraces; i++) repaired += '}'

          plan = JSON.parse(repaired)
          console.log('Planning: JSON repaired successfully, keys:', Object.keys(plan).join(', '))
        }
      }

      return NextResponse.json({ ok: true, data: { plan } })
    } catch (parseErr) {
      console.error('Planning: Failed to parse JSON:', parseErr, text.substring(0, 500))
      return NextResponse.json(
        { ok: false, error: 'Failed to parse build plan' },
        { status: 500 }
      )
    }
  } catch (err) {
    console.error('Planning API error:', err)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
