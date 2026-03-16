/**
 * POST /api/ai/agent-chat
 * AI-powered editor agent — replaces regex-based processAiCommand.
 * Sends user message + current HTML to Claude, gets back intelligent modifications.
 * This is the "Team 100 Agent" that lives inside each generated site's editor.
 */

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const CLAUDE_MODEL = 'claude-sonnet-4-20250514'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

const AGENT_SYSTEM_PROMPT = `You are the **Team 100 Editor Agent** — a world-class creative director and web developer embedded in an AI website builder. You work alongside the user to refine, improve, and transform their website in real-time.

## YOUR PERSONALITY
- You are enthusiastic, proactive, and creative — NOT robotic
- You speak like a senior designer/developer at a top agency
- You celebrate good choices: "Love it!", "Great call!", "This is going to look amazing!"
- You proactively suggest improvements: "While I'm at it, I noticed your CTA could be stronger — want me to fix that too?"
- You explain WHY you make changes, not just WHAT: "I'm adding more whitespace because it creates a premium feel"
- You understand Hebrew and English equally well
- Keep responses concise but warm (2-4 sentences max for simple changes)

## YOUR CAPABILITIES
1. **Edit any HTML** — You can modify text, colors, layout, sections, images, fonts, animations, spacing, anything
2. **Add new sections** — Testimonials, FAQ, pricing, gallery, team, stats, CTA, newsletter, features, etc.
3. **Remove sections** — Clean removal without breaking the page
4. **Restyle entire pages** — Dark mode, modern, minimal, luxurious, playful, etc.
5. **SEO optimization** — Add meta tags, Schema.org, OG tags, alt text, semantic HTML
6. **GSO optimization** — FAQ sections, structured data, AI-friendly content
7. **Fix issues** — Responsive problems, broken layouts, accessibility
8. **Improve copy** — Rewrite headlines, descriptions, CTAs for better conversion

## RULES
1. **ALWAYS return valid JSON** — no markdown, no code fences
2. **When modifying HTML**, return the COMPLETE modified HTML in the \`html\` field. Never return partial HTML or diffs.
3. **If no HTML changes needed** (just answering a question), set \`html\` to null
4. **Preserve ALL existing content** unless explicitly asked to change it
5. **Maintain the same tech stack** — if the site uses Tailwind CDN, keep using it. If it uses inline CSS, keep that.
6. **Never break the page** — always return valid, complete HTML that renders correctly
7. **Be proactive** — after making a change, suggest 2-3 related improvements
8. **Support Hebrew** — understand Hebrew commands and generate Hebrew content when appropriate
9. **Reference the current site** — mention specific elements you see: "I see your hero has a blue gradient..."
10. **Quality matters** — every change should make the site look MORE professional, not less

## RESPONSE FORMAT
Return ONLY valid JSON:
{
  "response": "Your conversational message to the user (2-4 sentences, warm and helpful)",
  "html": "The complete modified HTML if changes were made, or null if no changes",
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
  "toolCalls": [{"name": "tool_name", "status": "done"}],
  "proactiveTip": "Optional: A proactive improvement suggestion the user didn't ask for but would benefit from"
}

## TOOL CALLS (for visual feedback)
Include relevant tool calls to show the user what you did:
- "Analyzing page structure" — when you need to understand the current HTML
- "Modifying HTML" — when you change the HTML
- "Adding section" — when you add a new section
- "Removing section" — when you remove a section
- "Updating styles" — when you change colors, fonts, spacing
- "Optimizing SEO" — when you add meta tags, Schema.org, etc.
- "Rewriting content" — when you improve text/copy
- "Scanning URL" — when the user asks you to scan a URL for inspiration

## PROACTIVE TIPS (suggest these when relevant)
- Missing meta description → "I noticed your site doesn't have a meta description — this hurts SEO. Want me to add one?"
- No FAQ section → "Adding an FAQ section would boost your GSO score significantly. Should I add one?"
- Generic text → "Your headline says 'Welcome' — a more specific headline converts 3x better. Want me to write one?"
- No Schema.org → "Adding structured data helps AI search engines understand your business. Want me to add it?"
- Poor contrast → "Some text might be hard to read on that background. Want me to fix the contrast?"
- No mobile optimization → "I'd recommend checking how this looks on mobile. Want me to optimize the layout?"
- Missing alt text → "I see images without alt text — this hurts SEO and accessibility. Want me to fix it?"
- No CTA above fold → "Your main call-to-action is below the fold — moving it up could improve conversions."

## SPECIAL COMMANDS
- If user says "scan [URL]" or "תסרוק [URL]" → set scanRequested to the URL
- If user says "regenerate" or "ג'נרט מחדש" → suggest regenerating specific sections, not the whole site
- If user says "improve" or "שפר" → analyze the site and suggest the top 3 improvements
- If user says "SEO" or "optimize SEO" → do a full SEO audit and fix issues
- If user says "GSO" or "optimize GSO" → do a full GSO audit and fix issues`

type AgentRequest = {
  message: string
  htmlContent: string
  chatHistory: { role: 'user' | 'assistant'; content: string }[]
  siteData?: {
    name: string
    description: string
    businessType: string
  }
}

export async function POST(request: Request) {
  const claudeKey = process.env.CLAUDE_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY

  if (!claudeKey && !geminiKey) {
    return new Response(
      JSON.stringify({ ok: false, error: 'No AI API key configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body = (await request.json()) as AgentRequest
    const { message, htmlContent, chatHistory, siteData } = body

    // Input validation
    if (!message || typeof message !== 'string' || !message.trim()) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Message is required and must be a non-empty string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    if (htmlContent !== undefined && typeof htmlContent !== 'string') {
      return new Response(
        JSON.stringify({ ok: false, error: 'htmlContent must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // HTML size limit — if > 100KB, truncate to first and last 40KB with a note
    const HTML_SIZE_LIMIT = 100 * 1024
    const HTML_CHUNK_SIZE = 40 * 1024
    let processedHtml = htmlContent || ''
    if (processedHtml.length > HTML_SIZE_LIMIT) {
      const head = processedHtml.slice(0, HTML_CHUNK_SIZE)
      const tail = processedHtml.slice(-HTML_CHUNK_SIZE)
      processedHtml = `${head}\n\n<!-- ... HTML TRUNCATED (${processedHtml.length} chars total, showing first and last ${HTML_CHUNK_SIZE} chars) ... -->\n\n${tail}`
      console.warn(`Agent Chat: HTML truncated from ${htmlContent.length} to ${processedHtml.length} chars`)
    }

    // Build context about the current page
    const pageAnalysis = analyzeHtml(processedHtml)

    // Build the user message with full context
    const contextMessage = `## Current Site Context
Site name: ${siteData?.name || 'Unknown'}
Business type: ${siteData?.description || siteData?.businessType || 'Unknown'}

## Current Page Analysis
- Total sections: ${pageAnalysis.sectionCount}
- Has Schema.org: ${pageAnalysis.hasSchema}
- Has meta description: ${pageAnalysis.hasMetaDesc}
- Has FAQ: ${pageAnalysis.hasFaq}
- Section types detected: ${pageAnalysis.sectionTypes.join(', ') || 'none identified'}
- Primary colors: ${pageAnalysis.primaryColors.join(', ') || 'unknown'}
- Tech stack: ${pageAnalysis.techStack}
- Total images: ${pageAnalysis.imageCount}
- HTML size: ${(htmlContent || '').length} chars (~${Math.round((htmlContent || '').split('\n').length)} lines)${processedHtml.length < (htmlContent || '').length ? ' (TRUNCATED for context)' : ''}

## Current HTML
\`\`\`html
${processedHtml}
\`\`\`

## User Message
${message}`

    // Build conversation messages
    const messages: { role: 'user' | 'assistant'; content: string }[] = []

    // Add recent chat history (last 10 messages for context)
    const recentHistory = chatHistory.slice(-10)
    for (const msg of recentHistory) {
      messages.push({ role: msg.role, content: msg.content })
    }

    // Add the current message with full context
    messages.push({ role: 'user', content: contextMessage })

    let responseText = ''

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
            max_tokens: 64000,
            temperature: 0.5,
            system: AGENT_SYSTEM_PROMPT,
            messages,
          }),
        })

        if (claudeRes.ok) {
          const data = await claudeRes.json()
          responseText = data.content?.[0]?.text || ''
          console.log('Agent Chat: Claude response received, length:', responseText.length)
        } else {
          const errText = await claudeRes.text()
          console.error('Agent Chat: Claude error:', claudeRes.status, errText.substring(0, 200))
        }
      } catch (err) {
        console.error('Agent Chat: Claude fetch error:', err)
      }
    }

    // Fallback to Gemini
    if (!responseText && geminiKey) {
      try {
        const geminiRes = await fetch(`${GEMINI_API_URL}?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: AGENT_SYSTEM_PROMPT }] },
            contents: [
              // Include chat history for Gemini (map roles: assistant -> model)
              ...messages.map((m) => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }],
              })),
            ],
            generationConfig: {
              temperature: 0.5,
              maxOutputTokens: 65536,
              responseMimeType: 'application/json',
            },
          }),
        })

        if (geminiRes.ok) {
          const data = await geminiRes.json()
          responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
          console.log('Agent Chat: Gemini fallback response received')
        } else {
          const errText = await geminiRes.text()
          console.error('Agent Chat: Gemini error:', geminiRes.status, errText.substring(0, 200))
        }
      } catch (err) {
        console.error('Agent Chat: Gemini fetch error:', err)
      }
    }

    if (!responseText) {
      return new Response(
        JSON.stringify({ ok: false, error: 'All AI providers failed' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Parse the JSON response
    try {
      let parsed: Record<string, unknown>
      try {
        parsed = JSON.parse(responseText)
      } catch {
        // Try to extract JSON from response using robust bracket matching
        parsed = extractJsonObject(responseText)
      }

      // Validate and clean the HTML if present
      let html = parsed.html as string | null
      if (html && typeof html === 'string') {
        // Make sure it's complete HTML
        if (!html.includes('<!DOCTYPE') && !html.includes('<html')) {
          // AI returned partial HTML — don't use it
          console.warn('Agent Chat: AI returned partial HTML, discarding')
          html = null
        }
      }

      // Handle scan URL if requested by the AI
      const scanUrl = (parsed.scanRequested as string) || null
      let scanResults: string | null = null
      if (scanUrl) {
        const baseUrl = new URL(request.url).origin
        console.log('Agent Chat: Scanning URL:', scanUrl)
        scanResults = await callScanApi(scanUrl, baseUrl)
      }

      return new Response(
        JSON.stringify({
          ok: true,
          data: {
            response: (parsed.response as string) || 'I made the changes you requested.',
            html,
            suggestions: (parsed.suggestions as string[]) || [],
            toolCalls: (parsed.toolCalls as { name: string; status: string }[]) || [],
            proactiveTip: (parsed.proactiveTip as string) || null,
            scanRequested: scanUrl,
            scanResults,
          },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    } catch (parseErr) {
      console.error('Agent Chat: JSON parse failed:', parseErr, 'Text start:', responseText.substring(0, 300))

      // Return the raw text as a response without HTML changes
      return new Response(
        JSON.stringify({
          ok: true,
          data: {
            response: responseText.replace(/[{}"\[\]]/g, '').trim().substring(0, 500),
            html: null,
            suggestions: ['Try again', 'Be more specific'],
            toolCalls: [],
            proactiveTip: null,
            scanRequested: null,
          },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }
  } catch (err) {
    console.error('Agent Chat API error:', err)
    return new Response(
      JSON.stringify({ ok: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

/** Robust JSON extractor that handles nested braces correctly */
const extractJsonObject = (text: string): Record<string, unknown> => {
  // Find the first opening brace
  const startIdx = text.indexOf('{')
  if (startIdx === -1) throw new Error('No JSON found in response')

  let depth = 0
  let inString = false
  let escaped = false

  for (let i = startIdx; i < text.length; i++) {
    const ch = text[i]

    if (escaped) {
      escaped = false
      continue
    }

    if (ch === '\\' && inString) {
      escaped = true
      continue
    }

    if (ch === '"' && !escaped) {
      inString = !inString
      continue
    }

    if (inString) continue

    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) {
        const jsonStr = text.slice(startIdx, i + 1)
        return JSON.parse(jsonStr)
      }
    }
  }

  throw new Error('No complete JSON object found in response')
}

/** Call the scan API for URL scanning support */
const callScanApi = async (url: string, baseUrl: string): Promise<string> => {
  try {
    const scanRes = await fetch(`${baseUrl}/api/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
    if (!scanRes.ok) {
      return `Scan failed with status ${scanRes.status}`
    }
    const scanData = await scanRes.json()
    return JSON.stringify(scanData.data || scanData, null, 2)
  } catch (err) {
    console.error('Scan API call failed:', err)
    return `Scan failed: ${err instanceof Error ? err.message : 'Unknown error'}`
  }
}

/** Quick analysis of HTML to give the AI context */
const analyzeHtml = (html: string) => {
  const sectionMatches = html.match(/<section/gi) || []
  const hasSchema = html.includes('application/ld+json') || html.includes('schema.org')
  const hasMetaDesc = /<meta[^>]*name=["']description["']/i.test(html)
  const hasFaq = /faq|frequently\s+asked/i.test(html)
  const imageCount = (html.match(/<img/gi) || []).length

  // Detect section types
  const sectionTypes: string[] = []
  if (/<nav/i.test(html)) sectionTypes.push('navigation')
  if (/hero|banner/i.test(html) || /<h1/i.test(html)) sectionTypes.push('hero')
  if (/feature|service/i.test(html)) sectionTypes.push('features/services')
  if (/testimonial|review|client/i.test(html)) sectionTypes.push('testimonials')
  if (/pricing|price|plan/i.test(html)) sectionTypes.push('pricing')
  if (/faq|question/i.test(html)) sectionTypes.push('FAQ')
  if (/contact|form/i.test(html)) sectionTypes.push('contact')
  if (/gallery|portfolio/i.test(html)) sectionTypes.push('gallery')
  if (/team|staff/i.test(html)) sectionTypes.push('team')
  if (/about/i.test(html)) sectionTypes.push('about')
  if (/footer/i.test(html)) sectionTypes.push('footer')
  if (/blog|article/i.test(html)) sectionTypes.push('blog')
  if (/newsletter|subscribe/i.test(html)) sectionTypes.push('newsletter')

  // Detect primary colors
  const primaryColors: string[] = []
  const hexColors = html.match(/#[0-9a-fA-F]{6}/g) || []
  const colorFreq: Record<string, number> = {}
  for (const c of hexColors) {
    const key = c.toUpperCase()
    colorFreq[key] = (colorFreq[key] || 0) + 1
  }
  const topColors = Object.entries(colorFreq).sort((a, b) => b[1] - a[1]).slice(0, 3)
  primaryColors.push(...topColors.map(([c]) => c))

  // Check for Tailwind color classes
  const tailwindColors = html.match(/(?:bg|text|border)-(\w+)-\d+/g) || []
  const twColorFreq: Record<string, number> = {}
  for (const c of tailwindColors) {
    const color = c.replace(/(?:bg|text|border)-/, '').replace(/-\d+/, '')
    if (!['gray', 'white', 'black', 'slate', 'zinc', 'neutral', 'stone'].includes(color)) {
      twColorFreq[color] = (twColorFreq[color] || 0) + 1
    }
  }
  const topTwColors = Object.entries(twColorFreq).sort((a, b) => b[1] - a[1]).slice(0, 2)
  primaryColors.push(...topTwColors.map(([c]) => `tailwind:${c}`))

  // Detect tech stack
  let techStack = 'inline CSS'
  if (html.includes('tailwindcss') || html.includes('tailwind')) techStack = 'Tailwind CSS (CDN)'
  if (html.includes('bootstrap')) techStack = 'Bootstrap'

  return {
    sectionCount: sectionMatches.length,
    hasSchema,
    hasMetaDesc,
    hasFaq,
    imageCount,
    sectionTypes,
    primaryColors,
    techStack,
  }
}
