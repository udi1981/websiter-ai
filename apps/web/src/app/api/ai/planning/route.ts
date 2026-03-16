import { NextResponse } from 'next/server'

// Vercel: allow up to 30s for planning
export const maxDuration = 30
const FETCH_TIMEOUT = 25000

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
  "pages": [
    {
      "name": "Home",
      "slug": "/",
      "purpose": "Main landing page — convert visitors to customers",
      "sections": [
        {
          "type": "hero",
          "variant": "full-screen-image-overlay",
          "headline": "Exact headline text",
          "subheadline": "Exact subheadline text",
          "cta": { "text": "Button text", "action": "scroll-to-contact | link | modal" },
          "secondaryCta": { "text": "Secondary button", "action": "..." },
          "image": { "description": "What the hero image should show", "mood": "warm | professional | energetic | calm" },
          "notes": "Any specific instructions for this section"
        },
        {
          "type": "features | services | about | testimonials | pricing | gallery | team | stats | faq | contact | cta-banner | blog-preview | menu | portfolio | process | partners | newsletter",
          "variant": "grid-3col | cards | list | timeline | accordion | tabs | carousel",
          "title": "Section title",
          "subtitle": "Section subtitle",
          "items": [
            {
              "title": "Item title",
              "description": "Item description",
              "icon": "emoji or icon name",
              "image": { "description": "what image shows", "mood": "..." }
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
15. Include conversion strategy with specific trust elements relevant to the industry`

type PlanningRequest = {
  discoveryContext: Record<string, unknown>
  scanResult?: {
    colors?: { hex: string; usage: string }[]
    fonts?: { family: string; usage: string }[]
    sections?: { type: string; title?: string; content?: string; hasImages?: boolean; hasForm?: boolean; itemCount?: number }[]
    navigation?: { text: string; href: string }[]
    headings?: string[]
    paragraphs?: string[]
    images?: { src: string; alt: string; role?: string }[]
    businessType?: string
    businessName?: string
    title?: string
    description?: string
    seoMeta?: Record<string, string>
    motion?: Record<string, unknown>
    designDna?: Record<string, unknown>
    rawHtml?: string
  }
  description: string
  templateId?: string
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
      contextParts.push('\n--- SCANNED WEBSITE DATA ---')
      contextParts.push('IMPORTANT: The generated site must closely match this scanned site.')

      if (scan.businessName) contextParts.push(`Scanned business name: ${scan.businessName}`)
      if (scan.businessType) contextParts.push(`Scanned business type: ${scan.businessType}`)
      if (scan.title) contextParts.push(`Page title: ${scan.title}`)
      if (scan.description) contextParts.push(`Meta description: ${scan.description}`)

      if (scan.colors?.length) {
        contextParts.push(`\nColor palette found:`)
        scan.colors.slice(0, 10).forEach(c => {
          contextParts.push(`  ${c.hex} — ${c.usage}`)
        })
      }

      if (scan.fonts?.length) {
        contextParts.push(`\nFonts found:`)
        scan.fonts.forEach(f => {
          contextParts.push(`  ${f.family} — ${f.usage}`)
        })
      }

      if (scan.sections?.length) {
        contextParts.push(`\nSections found (${scan.sections.length}):`)
        scan.sections.forEach((s, i) => {
          contextParts.push(`  ${i + 1}. ${s.type}${s.title ? `: "${s.title}"` : ''}${s.hasForm ? ' [has form]' : ''}${s.hasImages ? ' [has images]' : ''}${s.itemCount ? ` [${s.itemCount} items]` : ''}`)
          if (s.content) contextParts.push(`     Content preview: "${s.content.slice(0, 200)}"`)
        })
      }

      if (scan.headings?.length) {
        contextParts.push(`\nHeadings found:`)
        scan.headings.slice(0, 15).forEach(h => contextParts.push(`  - ${h}`))
      }

      if (scan.navigation?.length) {
        contextParts.push(`\nNavigation links:`)
        scan.navigation.forEach(n => contextParts.push(`  - ${n.text} → ${n.href}`))
      }

      if (scan.images?.length) {
        contextParts.push(`\nImages found (${scan.images.length}):`)
        scan.images.slice(0, 10).forEach(img => {
          contextParts.push(`  - ${img.role || 'unknown'}: ${img.alt || 'no alt'}`)
        })
      }

      if (scan.motion) {
        contextParts.push(`\nMotion/animation: ${JSON.stringify(scan.motion)}`)
      }

      if (scan.designDna) {
        contextParts.push(`\nAI-analyzed design DNA: ${JSON.stringify(scan.designDna)}`)
      }

      if (scan.seoMeta) {
        contextParts.push(`\nSEO meta tags: ${JSON.stringify(scan.seoMeta)}`)
      }

      contextParts.push('--- END SCANNED DATA ---')
    }

    const userContent = `Create a comprehensive build plan for this website.\n\n${contextParts.join('\n')}\n\nRespond with the JSON build plan only.`

    let text = ''

    // Try Claude first (primary — higher quality planning)
    if (claudeKey) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
        const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': claudeKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 8192,
            temperature: 0.3,
            system: PLANNING_SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userContent }],
          }),
          signal: controller.signal,
        })
        clearTimeout(timeout)

        if (claudeRes.ok) {
          const claudeData = await claudeRes.json()
          text = claudeData.content?.[0]?.text || ''
          console.log('Planning: Claude fallback response received')
        } else {
          const errText = await claudeRes.text()
          console.error('Planning: Claude API error:', claudeRes.status, errText)
        }
      } catch (err) {
        console.error('Planning: Claude fetch error:', err)
      }
    }

    // Fallback to Gemini if Claude failed
    if (!text && geminiKey) {
      try {
        const gController = new AbortController()
        const gTimeout = setTimeout(() => gController.abort(), FETCH_TIMEOUT)
        const geminiRes = await fetch(`${GEMINI_API_URL}?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: PLANNING_SYSTEM_PROMPT }] },
            contents: [{ role: 'user', parts: [{ text: userContent }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 8192,
              responseMimeType: 'application/json',
            },
          }),
          signal: gController.signal,
        })
        clearTimeout(gTimeout)

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json()
          text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''
          console.log('Planning: Gemini fallback response received')
        } else {
          const errText = await geminiRes.text()
          console.error('Planning: Gemini API error:', geminiRes.status, errText.substring(0, 200))
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
          // Count open braces/brackets
          const openBraces = (repaired.match(/\{/g) || []).length
          const closeBraces = (repaired.match(/\}/g) || []).length
          const openBrackets = (repaired.match(/\[/g) || []).length
          const closeBrackets = (repaired.match(/\]/g) || []).length
          // Remove trailing comma or incomplete value
          repaired = repaired.replace(/,\s*$/, '')
          repaired = repaired.replace(/:\s*"[^"]*$/, ': ""')
          repaired = repaired.replace(/,\s*"[^"]*$/, '')
          // Close open structures
          for (let i = 0; i < openBrackets - closeBrackets; i++) repaired += ']'
          for (let i = 0; i < openBraces - closeBraces; i++) repaired += '}'
          plan = JSON.parse(repaired)
          console.log('Planning: JSON repaired successfully')
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
