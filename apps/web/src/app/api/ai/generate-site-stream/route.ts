/**
 * POST /api/ai/generate-site-stream
 * Streaming version of site generation — sends HTML chunks as they're generated.
 * Uses Claude's streaming API so the user sees progress in real-time.
 */

// Vercel: allow up to 60s for streaming responses (hobby plan max)
export const maxDuration = 60

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const CLAUDE_MODEL = 'claude-sonnet-4-20250514'
const FETCH_TIMEOUT = 55000 // 55s — leave headroom for Vercel's 60s limit

export async function POST(request: Request) {
  try {
    const { designDna, siteName, businessType, originalContent, systemPrompt, userPrompt } = await request.json()

    const claudeKey = process.env.CLAUDE_API_KEY
    const geminiKey = process.env.GEMINI_API_KEY
    if (!claudeKey && !geminiKey) {
      return new Response(
        JSON.stringify({ ok: false, error: 'No AI API key configured. Set CLAUDE_API_KEY or GEMINI_API_KEY.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Use provided prompts or build minimal ones
    const system = systemPrompt || 'You are a web developer. Generate a complete HTML page. Return ONLY the HTML, no markdown fences.'
    const user = userPrompt || `Generate a website for "${siteName || 'My Site'}" (${businessType || 'business'}).
Design DNA: ${JSON.stringify(designDna || {})}
Original content: ${JSON.stringify(originalContent || {})}`

    // Try Claude first, then fall back to Gemini
    let response: Response | null = null
    let useGemini = false

    if (claudeKey) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
        response = await fetch(CLAUDE_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': claudeKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: CLAUDE_MODEL,
            max_tokens: 32000,
            stream: true,
            system,
            messages: [{ role: 'user', content: user }],
          }),
          signal: controller.signal,
        })
        clearTimeout(timeout)
        if (!response.ok) {
          console.error('Claude stream error:', response.status)
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
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
      try {
        response = await fetch(GEMINI_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ role: 'user', parts: [{ text: user }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 65536 },
          }),
          signal: controller.signal,
        })
        clearTimeout(timeout)
      } catch (err) {
        clearTimeout(timeout)
        console.error('Gemini stream fetch failed:', err)
        response = null
      }
    }

    if (!response || !response.ok) {
      const errorMsg = response ? `API error (${response.status})` : 'All AI providers failed'
      return new Response(
        JSON.stringify({ ok: false, error: errorMsg }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Transform Claude's SSE stream into a simpler text stream for the client
    const reader = response.body?.getReader()
    if (!reader) {
      return new Response(
        JSON.stringify({ ok: false, error: 'No response body' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = ''

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
          controller.close()
        } catch (error) {
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
    return new Response(
      JSON.stringify({ ok: false, error: `Stream setup failed: ${message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
