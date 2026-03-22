/**
 * POST /api/ai/generate-site-stream
 * Streaming version of site generation — sends HTML chunks as they're generated.
 * Uses Claude's streaming API so the user sees progress in real-time.
 */

import { NextResponse } from 'next/server'

// Vercel: allow up to 300s for streaming responses (Pro plan)
// Falls back to 60s on hobby plan automatically
export const maxDuration = 300

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const CLAUDE_MODEL = 'claude-sonnet-4-20250514'
const FETCH_TIMEOUT = 240000 // 240s (4 min) — generous for large site generation
const KEEPALIVE_INTERVAL = 15000 // 15s — periodic keepalive to prevent proxy/browser timeouts

export async function POST(request: Request) {
  try {
    const { designDna, siteName, businessType, originalContent, systemPrompt, userPrompt, locale } = await request.json()

    const claudeKey = process.env.CLAUDE_API_KEY
    const geminiKey = process.env.GEMINI_API_KEY
    if (!claudeKey && !geminiKey) {
      return NextResponse.json(
        { ok: false, error: 'No AI API key configured. Set CLAUDE_API_KEY or GEMINI_API_KEY.' },
        { status: 400 }
      )
    }

    // Hebrew addendum for RTL sites
    const hebrewAddendum = locale === 'he' ? `\n\n## HEBREW / RTL REQUIREMENTS\n- ALL text in Hebrew. dir="rtl" lang="he" on root element.\n- Font: 'Heebo', 'Assistant', sans-serif (import from Google Fonts).\n- Use CSS logical properties (margin-inline-start, not margin-left).\n- Phone: 05X-XXX-XXXX | Currency: ₪\n- Write fluent, native-sounding Hebrew copy.` : ''

    // Use provided prompts or build comprehensive ones
    const system = systemPrompt || `You are the world's #1 web designer. Generate a complete, stunning HTML website from <!DOCTYPE html> to </html>. No markdown fences, no explanations. Include all CSS in <style>, all JS in <script>. Use Google Fonts via <link>. Use verified Unsplash photo IDs. Make it look like a $20,000 agency site. 1200+ lines minimum. Include Schema.org structured data, SEO meta tags, scroll animations, mobile hamburger menu, smooth scroll, parallax, counter animations, testimonial carousel, and back-to-top button.${hebrewAddendum}`
    const user = (userPrompt ? userPrompt + hebrewAddendum : '') || `Generate a phenomenal website for "${siteName || 'My Site'}" (${businessType || 'business'}).${hebrewAddendum}
Design DNA: ${JSON.stringify(designDna || {})}
Original content: ${JSON.stringify(originalContent || {})}
Build 12-16 unique sections. Every section must have a different visual layout.`

    // Try Claude first, then fall back to Gemini
    let response: Response | null = null
    let useGemini = false

    if (claudeKey) {
      try {
        response = await fetch(CLAUDE_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': claudeKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: CLAUDE_MODEL,
            max_tokens: 64000,
            temperature: 0.7,
            stream: true,
            system,
            messages: [{ role: 'user', content: user }],
          }),
        })
        if (!response.ok) {
          console.error('Claude stream error:', response.status, await response.text().catch(() => ''))
          response = null
        }
      } catch (err) {
        console.error('Claude stream fetch failed:', err)
        response = null
      }
    }

    if (!response && geminiKey) {
      useGemini = true
      const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${geminiKey}`
      try {
        response = await fetch(GEMINI_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ role: 'user', parts: [{ text: user }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 65536 },
          }),
        })
      } catch (err) {
        console.error('Gemini stream fetch failed:', err)
        response = null
      }
    }

    if (!response || !response.ok) {
      const errorMsg = response ? `API error (${response.status})` : 'All AI providers failed'
      return NextResponse.json(
        { ok: false, error: errorMsg },
        { status: 502 }
      )
    }

    // Transform Claude's SSE stream into a simpler text stream for the client
    const reader = response.body?.getReader()
    if (!reader) {
      return NextResponse.json(
        { ok: false, error: 'No response body' },
        { status: 502 }
      )
    }

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = ''

        // Periodic keepalive to prevent proxy/browser timeouts
        const keepaliveTimer = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(': keepalive\n\n'))
          } catch {
            // Controller may be closed already
          }
        }, KEEPALIVE_INTERVAL)

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })

            // Process SSE events
            const lines = buffer.split('\n')
            buffer = lines.pop() || '' // keep incomplete line in buffer

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue
              const data = line.slice(6).trim()

              if (data === '[DONE]') continue

              try {
                const event = JSON.parse(data)

                // Extract text from Claude or Gemini streaming format
                if (useGemini) {
                  // Gemini SSE format: { candidates: [{ content: { parts: [{ text }] } }] }
                  const text = event?.candidates?.[0]?.content?.parts?.[0]?.text
                  if (text) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', text })}\n\n`))
                  }
                  // Gemini signals finish via finishReason
                  if (event?.candidates?.[0]?.finishReason === 'STOP') {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
                  }
                } else {
                  // Claude SSE format
                  if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
                    const text = event.delta.text
                    if (text) {
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', text })}\n\n`))
                    }
                  }
                  if (event.type === 'message_stop') {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
                  }
                }

                // Handle errors (both providers)
                if (event.type === 'error' || event.error) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: event.error?.message || 'Unknown streaming error' })}\n\n`))
                }
              } catch {
                // Skip malformed JSON lines
              }
            }
          }

          // Send final done event if not already sent
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
          clearInterval(keepaliveTimer)
          controller.close()
        } catch (error) {
          clearInterval(keepaliveTimer)
          const message = error instanceof Error ? error.message : 'Stream error'
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: message })}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Content-Type-Options': 'nosniff',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { ok: false, error: `Stream setup failed: ${message}` },
      { status: 500 }
    )
  }
}
