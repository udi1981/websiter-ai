import { NextResponse } from 'next/server'

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const CLAUDE_MODEL = 'claude-sonnet-4-20250514'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

type ContentPlanRequest = {
  siteId: string
  businessType: string
  businessName: string
  existingTopics?: string[]
  competitors?: string[]
  language?: string
}

const CONTENT_PLAN_SYSTEM_PROMPT = `You are an elite SEO/GSO content strategist for "Team 100" — the most advanced AI website builder. You create content calendars that drive organic traffic and establish businesses as industry authorities.

## YOUR MISSION
Generate a 7-day content plan (one article per day) that:
- Targets high-value keywords with realistic ranking potential
- Covers a mix of content types for variety and audience breadth
- Prioritizes topics by keyword opportunity and business value
- Avoids topics the business has already covered
- Accounts for competitors' content gaps
- Is optimized for both Google SEO and GSO (AI citation by ChatGPT/Perplexity/Bing)

## CONTENT STRATEGY RULES
1. **Mix content types**: how-to guides, listicles, comparisons, comprehensive guides, news/trends, case studies
2. **Keyword clustering**: Each article targets a primary keyword + 3-5 secondary keywords
3. **Search intent alignment**: Match content type to search intent (informational, commercial, transactional)
4. **Topic authority building**: Articles should interlink to build topical authority
5. **Seasonal awareness**: Consider time-relevant topics when applicable
6. **Local SEO**: For local businesses, include location-specific topics
7. **YMYL sensitivity**: For health/finance/legal, plan authoritative, well-sourced content

## SEARCH VOLUME ESTIMATION
Classify each topic's search volume potential:
- "high": 1000+ monthly searches (broad, competitive terms)
- "medium": 200-1000 monthly searches (moderate competition, good opportunity)
- "low": Under 200 monthly searches (low competition, easy wins, long-tail)

## PRIORITY SCORING
Rank articles by a combination of:
- Search volume opportunity
- Competition level (prefer lower competition)
- Business relevance and conversion potential
- Content gap (topics competitors haven't covered well)

## LANGUAGE SUPPORT
- If language is "he" or "hebrew": Plan topics for the Israeli market, Hebrew keywords
- If language is "en" or "english" or not specified: Plan for English-speaking market

## RESPONSE FORMAT
You MUST respond with valid JSON only. No markdown, no code fences. Just the raw JSON object:
{
  "weekPlan": [
    {
      "day": 1,
      "title": "Article title (SEO-optimized)",
      "topic": "Brief topic description",
      "keywords": {
        "primary": "main keyword",
        "secondary": ["keyword2", "keyword3"]
      },
      "searchVolume": "high",
      "contentType": "how-to",
      "imagePrompts": ["Descriptive prompt for hero image", "Prompt for supporting image"],
      "videoSuggestion": "Optional video topic idea or null",
      "priority": 1,
      "estimatedWordCount": 2000,
      "targetAudience": "Who this article is for",
      "searchIntent": "informational"
    }
  ],
  "strategyNotes": {
    "topicalAuthority": "How these 7 articles build topical authority together",
    "contentGaps": "What gaps in competitors' content this plan exploits",
    "nextWeekPreview": "Brief suggestion for week 2 direction"
  }
}`

/**
 * POST /api/ai/blog/content-plan
 * Generates a 7-day content plan using Claude (primary) or Gemini (fallback).
 */
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
    const body = (await request.json()) as ContentPlanRequest

    if (!body.businessType || !body.businessName) {
      return NextResponse.json(
        { ok: false, error: 'businessType and businessName are required' },
        { status: 400 }
      )
    }

    const language = body.language || 'en'

    const existingContext = body.existingTopics?.length
      ? `\nAlready published topics (DO NOT repeat these):\n${body.existingTopics.map(t => `- ${t}`).join('\n')}`
      : ''

    const competitorContext = body.competitors?.length
      ? `\nCompetitors to analyze for content gaps:\n${body.competitors.map(c => `- ${c}`).join('\n')}`
      : ''

    const userPrompt = `Create a 7-day SEO/GSO content plan for:

Business: "${body.businessName}"
Industry: ${body.businessType}
Language: ${language}
Site ID: ${body.siteId}
${existingContext}
${competitorContext}

Generate 7 strategic article topics ordered by priority. Each should target different keywords and search intents to maximize organic traffic and AI citation potential for this ${body.businessType} business.`

    let text = ''

    // Try Claude first (primary)
    if (claudeKey) {
      try {
        const claudeRes = await fetch(CLAUDE_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': claudeKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: CLAUDE_MODEL,
            max_tokens: 4096,
            temperature: 0.7,
            system: CONTENT_PLAN_SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userPrompt }],
          }),
        })

        if (claudeRes.ok) {
          const claudeData = await claudeRes.json()
          text = claudeData.content?.[0]?.text || ''
          console.log('Content plan: Claude response received')
        } else {
          const errText = await claudeRes.text()
          console.error('Content plan: Claude API error:', claudeRes.status, errText.substring(0, 200))
        }
      } catch (err) {
        console.error('Content plan: Claude fetch error:', err)
      }
    }

    // Fallback to Gemini
    if (!text && geminiKey) {
      try {
        const geminiRes = await fetch(`${GEMINI_API_URL}?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: CONTENT_PLAN_SYSTEM_PROMPT }] },
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096,
              responseMimeType: 'application/json',
            },
          }),
        })

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json()
          text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''
          console.log('Content plan: Gemini fallback response received')
        } else {
          const errText = await geminiRes.text()
          console.error('Content plan: Gemini API error:', geminiRes.status, errText.substring(0, 200))
        }
      } catch (err) {
        console.error('Content plan: Gemini fetch error:', err)
      }
    }

    if (!text) {
      return NextResponse.json(
        { ok: false, error: 'All AI providers failed' },
        { status: 502 }
      )
    }

    // Parse JSON response
    try {
      let parsed: Record<string, unknown>
      try {
        parsed = JSON.parse(text)
      } catch {
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('No JSON found in response')
        parsed = JSON.parse(jsonMatch[0])
      }

      const weekPlan = (parsed.weekPlan as Record<string, unknown>[]) || []
      console.log('Content plan parsed OK, articles:', weekPlan.length)

      return NextResponse.json({
        ok: true,
        data: {
          weekPlan: weekPlan.map((item, idx) => ({
            day: item.day || idx + 1,
            title: item.title || '',
            topic: item.topic || '',
            keywords: item.keywords || { primary: '', secondary: [] },
            searchVolume: item.searchVolume || 'medium',
            contentType: item.contentType || 'guide',
            imagePrompts: item.imagePrompts || [],
            videoSuggestion: item.videoSuggestion || null,
            priority: item.priority || idx + 1,
            estimatedWordCount: item.estimatedWordCount || 1500,
            targetAudience: item.targetAudience || '',
            searchIntent: item.searchIntent || 'informational',
          })),
          strategyNotes: parsed.strategyNotes || {
            topicalAuthority: '',
            contentGaps: '',
            nextWeekPreview: '',
          },
        },
      })
    } catch (parseErr) {
      console.error('Content plan JSON parse failed:', parseErr, 'Text start:', text.substring(0, 200))
      return NextResponse.json(
        { ok: false, error: 'Failed to parse AI response' },
        { status: 502 }
      )
    }
  } catch (err) {
    console.error('Content plan API error:', err)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
