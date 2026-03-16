import { NextResponse } from 'next/server'

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const CLAUDE_MODEL = 'claude-sonnet-4-20250514'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

type BlogGenerateRequest = {
  siteId: string
  topic?: string
  businessType: string
  businessName: string
  language?: string
  targetKeywords?: string[]
}

const BLOG_SYSTEM_PROMPT = `You are an elite SEO/GSO content strategist and writer for "Team 100" — the most advanced AI website builder. You produce articles that rank on Google, get cited by ChatGPT/Perplexity/Bing AI, and convert readers into customers.

## YOUR MISSION
Generate a comprehensive, SEO/GSO-optimized blog article (1500-3000 words) that:
- Ranks highly on Google AND Bing (critical for GSO — Generative Search Optimization)
- Gets cited by AI assistants (ChatGPT, Perplexity, Bing Copilot, Google AI Overview)
- Drives organic traffic and converts readers into leads/customers
- Establishes the business as an authoritative voice in their industry

## SEO OPTIMIZATION RULES
1. **Title**: Include primary keyword, under 60 characters, compelling click-worthy
2. **Meta description**: 150-160 characters, include primary keyword, clear value prop
3. **Heading hierarchy**: One H1 (title), multiple H2s for main sections, H3s for subsections
4. **Keyword density**: Primary keyword 1-2%, secondary keywords naturally distributed
5. **Internal links**: Suggest 3-5 places where internal links to other site pages would be valuable
6. **External authority**: Reference statistics, studies, or data points to build credibility
7. **Content length**: 1500-3000 words — comprehensive enough to be the definitive resource

## GSO OPTIMIZATION RULES (for AI citation)
1. **FAQ section**: Include 4-6 frequently asked questions with clear, concise answers
2. **Key takeaways**: Bullet-point summary at the top or bottom for AI extraction
3. **Structured data**: Include FAQ schema-ready content
4. **Definitive statements**: Include quotable, factual statements that AI can cite
5. **Entity clarity**: Clearly define terms and concepts — AI models prefer clear definitions
6. **Bing optimization**: Structure content for Bing indexing (ChatGPT uses Bing) — clear headings, lists, tables where appropriate

## YMYL COMPLIANCE
For health, finance, legal, or safety topics:
- Include disclaimers where appropriate
- Reference authoritative sources
- Avoid making absolute claims without evidence
- Suggest consulting professionals

## CONTENT QUALITY
- Write in a natural, engaging voice — not robotic SEO content
- Include real-world examples and actionable advice
- Use storytelling where appropriate
- Include statistics and data points (use realistic industry data)
- Break up text with lists, subheadings, and short paragraphs
- End with a clear CTA related to the business

## LANGUAGE SUPPORT
- If language is "he" or "hebrew": Write in Hebrew, RTL-optimized, use Israeli market context
- If language is "en" or "english" or not specified: Write in English
- Maintain SEO best practices in the target language

## RESPONSE FORMAT
You MUST respond with valid JSON only. No markdown, no code fences. Just the raw JSON object:
{
  "title": "SEO-optimized article title",
  "slug": "url-friendly-slug",
  "excerpt": "2-3 sentence compelling excerpt for previews",
  "content": "<article>Full HTML article content with proper H2, H3, p, ul, ol, strong, em tags</article>",
  "meta": {
    "title": "SEO title tag (may differ from article title)",
    "description": "150-160 char meta description"
  },
  "tags": ["tag1", "tag2", "tag3"],
  "keywords": {
    "primary": "main target keyword",
    "secondary": ["keyword2", "keyword3", "keyword4"],
    "longTail": ["long tail phrase 1", "long tail phrase 2"]
  },
  "faqSchema": [
    {"question": "FAQ question 1", "answer": "Concise answer 1"},
    {"question": "FAQ question 2", "answer": "Concise answer 2"}
  ],
  "readTime": 7,
  "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"],
  "internalLinkSuggestions": [
    {"anchorText": "link text", "targetPage": "suggested target page (e.g., /services, /about)"}
  ],
  "mediaKeywords": {
    "images": ["descriptive keyword for image 1", "keyword for image 2"],
    "videos": ["suggested video topic 1"]
  }
}`

/**
 * POST /api/ai/blog/generate
 * Generates an SEO/GSO-optimized blog article using Claude (primary) or Gemini (fallback).
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
    const body = (await request.json()) as BlogGenerateRequest

    if (!body.businessType || !body.businessName) {
      return NextResponse.json(
        { ok: false, error: 'businessType and businessName are required' },
        { status: 400 }
      )
    }

    const language = body.language || 'en'
    const keywordsContext = body.targetKeywords?.length
      ? `Target keywords to focus on: ${body.targetKeywords.join(', ')}`
      : 'Research and choose the best keywords for this business and topic.'

    const userPrompt = `Generate an SEO/GSO-optimized blog article for:

Business: "${body.businessName}"
Industry: ${body.businessType}
${body.topic ? `Topic: ${body.topic}` : `Topic: Choose the most valuable topic for a ${body.businessType} business to rank for`}
Language: ${language}
${keywordsContext}
Site ID: ${body.siteId}

Write a comprehensive, high-quality article that will rank on Google, get cited by AI assistants, and drive traffic to this ${body.businessType} business.`

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
            max_tokens: 8192,
            temperature: 0.7,
            system: BLOG_SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userPrompt }],
          }),
        })

        if (claudeRes.ok) {
          const claudeData = await claudeRes.json()
          text = claudeData.content?.[0]?.text || ''
          console.log('Blog generate: Claude response received')
        } else {
          const errText = await claudeRes.text()
          console.error('Blog generate: Claude API error:', claudeRes.status, errText.substring(0, 200))
        }
      } catch (err) {
        console.error('Blog generate: Claude fetch error:', err)
      }
    }

    // Fallback to Gemini
    if (!text && geminiKey) {
      try {
        const geminiRes = await fetch(`${GEMINI_API_URL}?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: BLOG_SYSTEM_PROMPT }] },
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 8192,
              responseMimeType: 'application/json',
            },
          }),
        })

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json()
          text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''
          console.log('Blog generate: Gemini fallback response received')
        } else {
          const errText = await geminiRes.text()
          console.error('Blog generate: Gemini API error:', geminiRes.status, errText.substring(0, 200))
        }
      } catch (err) {
        console.error('Blog generate: Gemini fetch error:', err)
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

      console.log('Blog generate parsed OK, title:', (parsed.title as string)?.substring(0, 80))

      return NextResponse.json({
        ok: true,
        data: {
          title: parsed.title || '',
          slug: parsed.slug || '',
          excerpt: parsed.excerpt || '',
          content: parsed.content || '',
          meta: parsed.meta || { title: '', description: '' },
          tags: parsed.tags || [],
          keywords: parsed.keywords || { primary: '', secondary: [], longTail: [] },
          faqSchema: parsed.faqSchema || [],
          readTime: parsed.readTime || 5,
          keyTakeaways: parsed.keyTakeaways || [],
          internalLinkSuggestions: parsed.internalLinkSuggestions || [],
          mediaKeywords: parsed.mediaKeywords || { images: [], videos: [] },
        },
      })
    } catch (parseErr) {
      console.error('Blog generate JSON parse failed:', parseErr, 'Text start:', text.substring(0, 200))
      return NextResponse.json(
        { ok: false, error: 'Failed to parse AI response' },
        { status: 502 }
      )
    }
  } catch (err) {
    console.error('Blog generate API error:', err)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
