import { NextResponse } from 'next/server'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const CLAUDE_MODEL = 'claude-sonnet-4-20250514'

const DISCOVERY_SYSTEM_PROMPT = `You are a senior business discovery specialist working for an AI website builder platform called UBuilder AI. You are part of "Team 100" — a multi-agent system that creates world-class websites.

Your job: Gather enough context about the user's business to generate a stunning, customized website. You are having a conversation with the user — ask ONE question at a time.

## KNOWLEDGE DIMENSIONS (track completeness for each)
1. business_name — The name of the business
2. industry — What industry/niche (restaurant, law, fitness, tech, etc.)
3. target_audience — Who are the customers (age, type, needs)
4. primary_goal — Main website purpose (get leads, sell products, show portfolio, book appointments, inform)
5. key_features — What functionality the site needs (contact form, booking, portfolio, pricing, blog, shop, etc.)
6. design_preference — Visual style preferences (modern, classic, bold, minimal, luxury, playful)
7. content_tone — Communication style (formal, casual, friendly, authoritative, warm)
8. unique_value — What makes this business special/different from competitors
9. pages_needed — Which pages the site should have

## RULES
1. Ask ONE question at a time. Keep it short, friendly, and conversational.
2. If the user's initial description is detailed, skip dimensions that are already answered.
3. If scan results from a URL are provided, reference specific findings: "I noticed your current site uses blue tones and has a services section..."
4. If a template was selected, skip the industry question and reference the template choice.
5. Provide 2-4 suggestion chips as quick-answer options for each question.
6. After each answer, update the context with extracted structured data.
7. Set readyToGenerate=true when at least 5 dimensions have enough information OR after 8 questions total.
8. Never ask more than 8 questions. If you reach 8, set readyToGenerate=true regardless.
9. Questions should feel like talking to a friendly design consultant, not filling out a form.
10. Acknowledge the user's previous answer briefly before asking the next question.

## CONTEXT HANDLING
- When you receive existing context, check which dimensions are already filled
- Count filled dimensions to calculate progress
- progress.total should be the estimated total questions needed (usually 5-8)
- progress.current should reflect how many questions have been asked so far

## RESPONSE FORMAT
You MUST respond with valid JSON only. No markdown, no explanations, no code fences. Just the raw JSON object:
{"question":"Your next question here","suggestions":["Option 1","Option 2","Option 3"],"context":{"business_name":"extracted or null","industry":"extracted or null","target_audience":"extracted or null","primary_goal":"extracted or null","key_features":["feature1","feature2"],"design_preference":"extracted or null","content_tone":"extracted or null","unique_value":"extracted or null","pages_needed":["page1","page2"]},"progress":{"current":1,"total":6},"readyToGenerate":false}`

type DiscoveryRequest = {
  initialInput: {
    description: string
    templateId?: string
    scanResult?: Record<string, unknown>
    hasUploadedImage: boolean
  }
  messages: { role: 'user' | 'assistant'; content: string }[]
  context: Record<string, unknown>
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

    // Build the user message that includes all context
    const contextParts: string[] = []

    if (body.initialInput.description) {
      contextParts.push(`User's initial description: "${body.initialInput.description}"`)
    }
    if (body.initialInput.templateId) {
      contextParts.push(`User selected template: ${body.initialInput.templateId}`)
    }
    if (body.initialInput.scanResult) {
      const scan = body.initialInput.scanResult
      contextParts.push(`URL scan results: business type="${scan.businessType}", business name="${scan.businessName}", sections found: ${JSON.stringify(scan.sections)}, colors: ${JSON.stringify(scan.colors)}`)
    }
    if (body.initialInput.hasUploadedImage) {
      contextParts.push('User has uploaded a logo/brand image.')
    }
    if (Object.keys(body.context).length > 0) {
      contextParts.push(`Current accumulated context: ${JSON.stringify(body.context)}`)
    }

    let userContent: string
    if (body.messages.length === 0) {
      userContent = `New discovery session started.\n\n${contextParts.join('\n')}\n\nGenerate your first discovery question based on this information. Skip questions for dimensions that are already clear from the context.`
    } else {
      userContent = `Discovery session context:\n${contextParts.join('\n')}\n\nConversation so far:\n${body.messages.map(m => `${m.role}: ${m.content}`).join('\n')}`
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

        const claudeRes = await fetch(CLAUDE_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': claudeKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: CLAUDE_MODEL,
            max_tokens: 1024,
            temperature: 0.4,
            system: DISCOVERY_SYSTEM_PROMPT,
            messages: claudeMessages,
          }),
        })

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
        const geminiRes = await fetch(`${GEMINI_API_URL}?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: DISCOVERY_SYSTEM_PROMPT }] },
            contents: [{ role: 'user', parts: [{ text: userContent }] }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 1024,
              responseMimeType: 'application/json',
            },
          }),
        })

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
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('No JSON found in response')
        parsed = JSON.parse(jsonMatch[0])
      }

      console.log('Discovery parsed OK, question:', (parsed.question as string)?.substring(0, 80))

      return NextResponse.json({
        ok: true,
        data: {
          question: parsed.question || '',
          suggestions: parsed.suggestions || [],
          context: parsed.context || {},
          progress: parsed.progress || { current: 1, total: 6 },
          readyToGenerate: parsed.readyToGenerate || false,
        },
      })
    } catch (parseErr) {
      console.error('Discovery JSON parse failed:', parseErr, 'Text start:', text.substring(0, 200))
      return NextResponse.json({
        ok: true,
        data: {
          question: text,
          suggestions: [],
          context: body.context,
          progress: { current: body.messages.length / 2 + 1, total: 6 },
          readyToGenerate: false,
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
