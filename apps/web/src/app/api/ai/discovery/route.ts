import { NextResponse } from 'next/server'

// Vercel: allow up to 30s for discovery
export const maxDuration = 30

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const CLAUDE_MODEL = 'claude-sonnet-4-20250514'
const FETCH_TIMEOUT = 25000

/** Maximum number of user messages before forcing readyToGenerate */
const MAX_QUESTIONS = 6
/** Minimum filled dimensions before allowing readyToGenerate */
const MIN_DIMENSIONS_FOR_READY = 4

const DISCOVERY_SYSTEM_PROMPT = `You are the Lead Discovery Strategist for "Team 100" — the most advanced AI website builder on the planet. Your conversations result in websites that make people's jaws drop. Every question you ask is strategic — designed to extract the exact information needed to build a $10,000+ quality website.

You are NOT a form. You are a senior creative director having a real conversation with a client. You understand business, branding, psychology, and design at an elite level.

## YOUR MISSION
Extract deep, actionable intelligence about the client's business so Team 100 can generate a website that:
- Feels custom-built by a premium agency
- Converts visitors into customers
- Tells a compelling brand story
- Looks visually stunning and unique

## KNOWLEDGE DIMENSIONS (track ALL of these)

### Core Identity
1. **business_name** — The exact name of the business
2. **industry** — Specific niche (not just "restaurant" but "upscale Mediterranean bistro" or "farm-to-table brunch cafe")
3. **brand_personality** — How the brand feels: luxurious, warm, edgy, playful, corporate, artisanal, tech-forward, etc.

### Audience & Market
4. **target_audience** — WHO are the ideal customers? Age, income level, lifestyle, pain points, what they care about
5. **competitive_edge** — What makes this business DIFFERENT from competitors? The "why us" factor

### Business Goals
6. **primary_goal** — What should the website ACHIEVE? (generate leads, sell products, book appointments, build credibility, get phone calls, drive foot traffic)
7. **conversion_action** — What is the ONE thing a visitor should DO on the site? (call now, fill form, buy product, book appointment, request quote)

### Content & Structure
8. **key_services** — What are the main services/products? With enough detail to write compelling descriptions
9. **pages_needed** — Which pages (Home, About, Services, Portfolio, Contact, Blog, FAQ, Pricing, Team, Testimonials)

### Visual & Design
10. **design_mood** — Show me 3 adjectives: e.g., "clean, bold, luxurious" or "warm, organic, friendly"
11. **color_preferences** — Any brand colors? Colors they love or hate?
12. **photography_style** — What kind of imagery? (professional photos, lifestyle, abstract, illustrations, minimal)

### Advanced
13. **content_tone** — How should the text sound? (formal, casual, witty, authoritative, empathetic, inspirational)
14. **special_features** — Any specific features? (booking system, price calculator, before/after gallery, video background)
15. **local_seo** — Is this a local business? What city/area?

## QUESTION STRATEGY

### Phase 1: Foundation (Questions 1-2)
Start with the BIG picture. Understand what we're building and for whom.
- Business identity & niche
- Who they serve & what makes them special

### Phase 2: Deep Dive (Questions 3-5)
Go DEEP into what matters for an amazing site.
- Detailed services/products
- Brand personality & visual mood
- Goals and conversion strategy

### Phase 3: Design & Polish (Questions 6-8)
Nail the visual direction and special requirements.
- Color & typography preferences
- Special features or interactions
- Any must-have elements

## QUESTION RULES

1. **Ask ONE question at a time** — but make it count. Each question should unlock 2-3 dimensions.
2. **Be specific, not generic.** Reference what you already know from context.
3. **Reference scan results** if available — mention specific findings.
4. **Adapt to their industry.** For a restaurant, ask about ambiance. For a law firm, ask about practice areas.
5. **Maximum 6 questions total.** You MUST set readyToGenerate=true after question 6 at the latest. This is ENFORCED server-side.
6. **Set readyToGenerate=true** when at least 4 dimensions are well-filled OR after 5+ questions.
7. **If the user gives rich, detailed answers**, you can finish earlier (as few as 3 questions).
8. **Acknowledge & build** — Start each response by briefly acknowledging their previous answer.
9. **Never ask about things already clear from context** — If a URL scan reveals colors, sections, business type — skip those.
10. **If the user says they want to skip or build now**, immediately set readyToGenerate=true.
11. **Support Hebrew** — If the user writes in Hebrew, respond in Hebrew.

## DOCUMENT CONTEXT
If documents were uploaded (PDF, DOCX, etc.), their extracted text will be provided. Use this content to:
- Pre-fill dimensions automatically (business name, services, brand info)
- Skip questions that are already answered by the document
- Reference specific content from the documents

## RESPONSE FORMAT
You MUST respond with valid JSON only. No markdown, no explanations, no code fences. Just the raw JSON object:
{
  "question": "Your next question here — make it engaging and specific",
  "suggestions": ["Smart option 1", "Smart option 2", "Smart option 3", "Smart option 4"],
  "context": {
    "business_name": "extracted or null",
    "industry": "specific niche extracted or null",
    "brand_personality": "extracted or null",
    "target_audience": "extracted or null",
    "competitive_edge": "extracted or null",
    "primary_goal": "extracted or null",
    "conversion_action": "extracted or null",
    "key_services": ["service1", "service2"],
    "pages_needed": ["page1", "page2"],
    "design_mood": "3 adjectives or null",
    "color_preferences": "extracted or null",
    "content_tone": "extracted or null",
    "special_features": ["feature1"],
    "local_seo": "city/area or null",
    "photography_style": "extracted or null"
  },
  "progress": {"current": 1, "total": 6},
  "readyToGenerate": false,
  "dimensionsFilled": 3
}`

type DiscoveryRequest = {
  initialInput: {
    description: string
    templateId?: string
    scanResult?: Record<string, unknown>
    hasUploadedImage: boolean
    documentText?: string
  }
  messages: { role: 'user' | 'assistant'; content: string }[]
  context: Record<string, unknown>
}

/** Count how many dimensions in the context have meaningful values */
const countFilledDimensions = (context: Record<string, unknown>): number => {
  return Object.entries(context).filter(([, v]) => {
    if (v === null || v === undefined || v === '') return false
    if (Array.isArray(v) && v.length === 0) return false
    if (typeof v === 'string' && v.trim() === '') return false
    return true
  }).length
}

/** Count how many user messages are in the conversation */
const countUserMessages = (messages: { role: string }[]): number => {
  return messages.filter(m => m.role === 'user').length
}

export const POST = async (request: Request) => {
  const claudeKey = process.env.CLAUDE_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY

  if (!claudeKey && !geminiKey) {
    return NextResponse.json(
      { ok: false, error: 'No AI API key configured' },
      { status: 500 }
    )
  }

  try {
    const body = (await request.json()) as DiscoveryRequest

    // ─── Server-side question limit enforcement ──────────────────────
    const userMessageCount = countUserMessages(body.messages)
    const filledDimensions = countFilledDimensions(body.context)

    // Force readyToGenerate if we've hit the limit
    if (userMessageCount >= MAX_QUESTIONS) {
      console.log(`Discovery: Forcing readyToGenerate after ${userMessageCount} user messages`)
      return NextResponse.json({
        ok: true,
        data: {
          question: userMessageCount >= MAX_QUESTIONS
            ? 'Perfect! I have everything I need to create an amazing website for you. Let\'s build it! 🚀'
            : '',
          suggestions: [],
          context: body.context,
          progress: { current: MAX_QUESTIONS, total: MAX_QUESTIONS },
          readyToGenerate: true,
          dimensionsFilled: filledDimensions,
        },
      })
    }

    // Also force if enough dimensions are filled and we've asked at least 3 questions
    if (filledDimensions >= 8 && userMessageCount >= 3) {
      console.log(`Discovery: Auto-ready with ${filledDimensions} dimensions filled after ${userMessageCount} questions`)
      return NextResponse.json({
        ok: true,
        data: {
          question: 'Excellent! I have a very clear picture of what you need. I\'m confident I can build something phenomenal. Let\'s go! ✨',
          suggestions: [],
          context: body.context,
          progress: { current: userMessageCount + 1, total: userMessageCount + 1 },
          readyToGenerate: true,
          dimensionsFilled: filledDimensions,
        },
      })
    }

    // Build the user message that includes all context
    const contextParts: string[] = []

    if (body.initialInput.description) {
      contextParts.push(`User's initial description: "${body.initialInput.description}"`)
    }
    if (body.initialInput.templateId) {
      contextParts.push(`User selected template: ${body.initialInput.templateId}`)
    }
    if (body.initialInput.documentText) {
      const docText = body.initialInput.documentText.slice(0, 8000)
      contextParts.push(`\n--- UPLOADED DOCUMENT CONTENT ---\n${docText}\n--- END DOCUMENT ---\nIMPORTANT: Use this document content to pre-fill business information. Skip questions for things already answered in the document.`)
    }
    if (body.initialInput.scanResult) {
      const scan = body.initialInput.scanResult
      const scanDetails: string[] = []
      scanDetails.push(`Business type: "${scan.businessType}"`)
      scanDetails.push(`Business name: "${scan.businessName}"`)
      if (scan.sections) scanDetails.push(`Sections found: ${JSON.stringify(scan.sections)}`)
      if (scan.colors) scanDetails.push(`Color palette: ${JSON.stringify(scan.colors)}`)
      if (scan.fonts) scanDetails.push(`Typography: ${JSON.stringify(scan.fonts)}`)
      if (scan.navigation) scanDetails.push(`Navigation: ${JSON.stringify(scan.navigation)}`)
      if (scan.headings) scanDetails.push(`Key headings: ${JSON.stringify((scan.headings as string[]).slice(0, 10))}`)
      if (scan.ctaButtons) scanDetails.push(`CTAs found: ${JSON.stringify(scan.ctaButtons)}`)
      if (scan.seoMeta) scanDetails.push(`SEO meta: ${JSON.stringify(scan.seoMeta)}`)
      if (scan.images) scanDetails.push(`Images: ${(scan.images as unknown[]).length} found`)
      contextParts.push(`\n--- URL SCAN RESULTS ---\n${scanDetails.join('\n')}\n--- END SCAN ---\nIMPORTANT: Use these scan results to inform your questions. Reference specific findings.`)
    }
    if (body.initialInput.hasUploadedImage) {
      contextParts.push('User has uploaded a logo/brand image — they have existing branding.')
    }
    if (Object.keys(body.context).length > 0) {
      contextParts.push(`Current accumulated context: ${JSON.stringify(body.context)}`)
    }

    if (filledDimensions > 0) {
      contextParts.push(`\nDimensions filled so far: ${filledDimensions}/15. Focus on unfilled dimensions.`)
    }

    // Add question count context to help AI know when to stop
    contextParts.push(`\nThis is question ${userMessageCount + 1} of maximum ${MAX_QUESTIONS}. ${userMessageCount >= 5 ? 'You should wrap up soon — set readyToGenerate=true if you have enough.' : ''}`)

    let userContent: string
    if (body.messages.length === 0) {
      userContent = `New discovery session started.\n\n${contextParts.join('\n')}\n\nGenerate your first discovery question. Be specific based on what you already know from the context. Skip dimensions that are already clear.`
    } else {
      userContent = `Discovery session context:\n${contextParts.join('\n')}\n\nConversation so far:\n${body.messages.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nGenerate your next question. Build on what the user just told you.`
    }

    let text = ''

    // Try Claude first (primary)
    if (claudeKey) {
      try {
        const claudeMessages: { role: 'user' | 'assistant'; content: string }[] = []

        if (body.messages.length === 0) {
          claudeMessages.push({ role: 'user', content: userContent })
        } else {
          claudeMessages.push({
            role: 'user',
            content: `Discovery session context:\n${contextParts.join('\n')}`,
          })
          for (const msg of body.messages) {
            claudeMessages.push({ role: msg.role, content: msg.content })
          }
        }

        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
        const claudeRes = await fetch(CLAUDE_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': claudeKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: CLAUDE_MODEL,
            max_tokens: 2048,
            temperature: 0.5,
            system: DISCOVERY_SYSTEM_PROMPT,
            messages: claudeMessages,
          }),
          signal: controller.signal,
        })
        clearTimeout(timeout)

        if (claudeRes.ok) {
          const claudeData = await claudeRes.json()
          text = claudeData.content?.[0]?.text || ''
          console.log('Discovery: Claude response received')
        } else {
          const errText = await claudeRes.text()
          console.error('Discovery: Claude API error:', claudeRes.status, errText.substring(0, 200))
        }
      } catch (err) {
        console.error('Discovery: Claude fetch error:', err)
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
            system_instruction: { parts: [{ text: DISCOVERY_SYSTEM_PROMPT }] },
            contents: [{ role: 'user', parts: [{ text: userContent }] }],
            generationConfig: {
              temperature: 0.5,
              maxOutputTokens: 2048,
              responseMimeType: 'application/json',
            },
          }),
          signal: gController.signal,
        })
        clearTimeout(gTimeout)

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json()
          text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''
          console.log('Discovery: Gemini fallback response received')
        } else {
          const errText = await geminiRes.text()
          console.error('Discovery: Gemini API error:', geminiRes.status, errText.substring(0, 200))
        }
      } catch (err) {
        console.error('Discovery: Gemini fetch error:', err)
      }
    }

    if (!text) {
      return NextResponse.json(
        { ok: false, error: 'All AI providers failed' },
        { status: 502 }
      )
    }

    // Parse the JSON response
    try {
      let parsed: Record<string, unknown>
      try {
        parsed = JSON.parse(text)
      } catch {
        // Try to extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('No JSON found in response')
        parsed = JSON.parse(jsonMatch[0])
      }

      console.log('Discovery parsed OK, question:', (parsed.question as string)?.substring(0, 80))

      // Server-side override: if AI says readyToGenerate but we haven't asked enough, keep going
      let aiReady = (parsed.readyToGenerate as boolean) || false

      // Server-side override: force ready if AI doesn't comply with limits
      const questionsSoFar = userMessageCount + 1
      if (questionsSoFar >= MAX_QUESTIONS) {
        aiReady = true
      }

      // If AI says not ready but we're at question 5+ with enough dimensions, force it
      if (!aiReady && questionsSoFar >= 5 && filledDimensions >= MIN_DIMENSIONS_FOR_READY) {
        aiReady = true
      }

      return NextResponse.json({
        ok: true,
        data: {
          question: parsed.question || '',
          suggestions: parsed.suggestions || [],
          context: parsed.context || body.context,
          progress: { current: questionsSoFar, total: MAX_QUESTIONS },
          readyToGenerate: aiReady,
          dimensionsFilled: (parsed.dimensionsFilled as number) || filledDimensions,
        },
      })
    } catch (parseErr) {
      console.error('Discovery JSON parse failed:', parseErr, 'Text start:', text.substring(0, 200))

      // On parse error — check if we should force ready
      const shouldForceReady = userMessageCount >= 4

      return NextResponse.json({
        ok: true,
        data: {
          question: shouldForceReady
            ? 'I have enough information. Let\'s build your website! 🚀'
            : text.replace(/[{}"\[\]]/g, '').trim().slice(0, 500),
          suggestions: shouldForceReady ? [] : ['Tell me more', 'Skip to build'],
          context: body.context,
          progress: { current: userMessageCount + 1, total: MAX_QUESTIONS },
          readyToGenerate: shouldForceReady,
        },
      })
    }
  } catch (err) {
    console.error('Discovery API error:', err)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
