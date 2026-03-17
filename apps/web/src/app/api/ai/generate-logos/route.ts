import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const CLAUDE_MODEL = 'claude-sonnet-4-20250514'

const LOGO_SYSTEM_PROMPT = `You are a world-class brand identity designer. Generate SVG logos for a business.

OUTPUT FORMAT: Return ONLY a valid JSON array of 6 logo objects. No explanations, no markdown fences.

Each logo object:
{
  "id": "logo_1",
  "name": "Short descriptive name (e.g. 'Bold Monogram')",
  "style": "minimal | geometric | elegant | playful | corporate | creative",
  "svg": "<svg>...</svg>"
}

SVG RULES:
- Each SVG must be COMPLETE and VALID
- viewBox="0 0 200 60" for horizontal logos
- Use the brand colors provided
- Include both icon/symbol AND text (the business name)
- The text MUST be the actual business name
- Use <text> element with a web-safe font (font-family: system-ui, sans-serif)
- For icons, use <path>, <circle>, <rect>, <polygon> — pure SVG shapes, NO external assets
- Keep SVGs compact (under 2KB each)
- Make each logo VISUALLY DISTINCT — different styles, layouts, icon shapes

STYLE VARIATIONS — generate exactly these 6 styles:
1. **Minimal Icon + Text** — Simple geometric icon left, clean text right. Thin lines.
2. **Bold Monogram** — Large stylized first letter(s) with text. Heavy weight.
3. **Enclosed Badge** — Text inside a shape (circle, rounded rect, shield). Vintage-modern feel.
4. **Elegant Serif** — Sophisticated serif-style text with thin decorative element (line, dot, accent).
5. **Stacked** — Icon on top, text below centered. App-icon style.
6. **Creative/Playful** — Unique shape, integrated text, personality-driven. Fun but professional.

COLOR USAGE:
- Use the primary color for the main icon/accent
- Use dark color (#1a1a2e or similar) for text
- Keep background transparent (no background rect)
- Some logos can be single-color, others can use primary + dark`

type LogoRequest = {
  businessName: string
  industry?: string
  primaryColor?: string
  style?: string
}

export const POST = async (req: NextRequest) => {
  try {
    const body: LogoRequest = await req.json()
    const { businessName, industry, primaryColor, style } = body

    if (!businessName?.trim()) {
      return NextResponse.json(
        { ok: false, error: 'Business name is required' },
        { status: 400 }
      )
    }

    const claudeKey = process.env.CLAUDE_API_KEY
    if (!claudeKey) {
      // Fallback: generate logos locally without AI
      return NextResponse.json({
        ok: true,
        data: generateFallbackLogos(businessName, primaryColor || '#7C3AED'),
      })
    }

    const userPrompt = `Generate 6 SVG logos for:
- Business Name: "${businessName}"
- Industry: ${industry || 'general business'}
- Primary Brand Color: ${primaryColor || '#7C3AED'}
- Design mood: ${style || 'modern and professional'}

Return ONLY the JSON array. Each SVG must render the actual name "${businessName}".`

    const res = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 8192,
        temperature: 0.8,
        system: LOGO_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    if (!res.ok) {
      console.error('[generate-logos] Claude API error:', res.status)
      return NextResponse.json({
        ok: true,
        data: generateFallbackLogos(businessName, primaryColor || '#7C3AED'),
      })
    }

    const data = await res.json()
    const content = data.content?.[0]?.text || ''

    // Extract JSON array from response
    let logos
    try {
      // Try direct parse
      logos = JSON.parse(content)
    } catch {
      // Try extracting JSON from markdown fences
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        logos = JSON.parse(jsonMatch[0])
      } else {
        console.error('[generate-logos] Failed to parse response')
        return NextResponse.json({
          ok: true,
          data: generateFallbackLogos(businessName, primaryColor || '#7C3AED'),
        })
      }
    }

    // Validate logos
    if (!Array.isArray(logos) || logos.length === 0) {
      return NextResponse.json({
        ok: true,
        data: generateFallbackLogos(businessName, primaryColor || '#7C3AED'),
      })
    }

    // Sanitize SVGs (basic security)
    const sanitized = logos.map((logo: { id?: string; name?: string; style?: string; svg?: string }, i: number) => ({
      id: logo.id || `logo_${i + 1}`,
      name: logo.name || `Logo ${i + 1}`,
      style: logo.style || 'minimal',
      svg: (logo.svg || '').replace(/<script[\s\S]*?<\/script>/gi, ''),
    })).filter((l: { svg: string }) => l.svg.includes('<svg'))

    return NextResponse.json({ ok: true, data: sanitized })
  } catch (err) {
    console.error('[generate-logos] Error:', err)
    return NextResponse.json(
      { ok: false, error: 'Failed to generate logos' },
      { status: 500 }
    )
  }
}

/** Generate simple SVG logos without AI as fallback */
const generateFallbackLogos = (name: string, color: string) => {
  const initial = name.charAt(0).toUpperCase()
  const darkColor = '#1a1a2e'
  const shortName = name.length > 15 ? name.substring(0, 15) : name

  return [
    {
      id: 'logo_1',
      name: 'Minimal Icon',
      style: 'minimal',
      svg: `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="30" r="12" fill="${color}" opacity="0.9"/><text x="42" y="36" font-family="system-ui,sans-serif" font-size="22" font-weight="600" fill="${darkColor}">${shortName}</text></svg>`,
    },
    {
      id: 'logo_2',
      name: 'Bold Monogram',
      style: 'geometric',
      svg: `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="8" width="44" height="44" rx="10" fill="${color}"/><text x="26" y="40" font-family="system-ui,sans-serif" font-size="28" font-weight="800" fill="white" text-anchor="middle">${initial}</text><text x="60" y="38" font-family="system-ui,sans-serif" font-size="20" font-weight="600" fill="${darkColor}">${shortName}</text></svg>`,
    },
    {
      id: 'logo_3',
      name: 'Enclosed Badge',
      style: 'elegant',
      svg: `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="8" width="196" height="44" rx="22" fill="none" stroke="${color}" stroke-width="2"/><text x="100" y="37" font-family="system-ui,sans-serif" font-size="18" font-weight="700" fill="${darkColor}" text-anchor="middle" letter-spacing="3">${shortName.toUpperCase()}</text></svg>`,
    },
    {
      id: 'logo_4',
      name: 'Elegant Line',
      style: 'elegant',
      svg: `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg"><text x="100" y="32" font-family="Georgia,serif" font-size="22" font-weight="400" fill="${darkColor}" text-anchor="middle">${shortName}</text><line x1="30" y1="42" x2="170" y2="42" stroke="${color}" stroke-width="1.5"/><circle cx="100" cy="42" r="2.5" fill="${color}"/></svg>`,
    },
    {
      id: 'logo_5',
      name: 'Stacked',
      style: 'corporate',
      svg: `<svg viewBox="0 0 200 70" xmlns="http://www.w3.org/2000/svg"><polygon points="100,4 112,28 88,28" fill="${color}"/><circle cx="100" cy="22" r="6" fill="${color}" opacity="0.6"/><text x="100" y="52" font-family="system-ui,sans-serif" font-size="16" font-weight="700" fill="${darkColor}" text-anchor="middle" letter-spacing="2">${shortName.toUpperCase()}</text><line x1="60" y1="58" x2="140" y2="58" stroke="${color}" stroke-width="1" opacity="0.4"/></svg>`,
    },
    {
      id: 'logo_6',
      name: 'Creative Dots',
      style: 'playful',
      svg: `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="30" r="8" fill="${color}"/><circle cx="28" cy="20" r="5" fill="${color}" opacity="0.6"/><circle cx="28" cy="40" r="5" fill="${color}" opacity="0.4"/><text x="44" y="37" font-family="system-ui,sans-serif" font-size="22" font-weight="700" fill="${darkColor}">${shortName}</text><circle cx="${44 + shortName.length * 12}" cy="20" r="4" fill="${color}"/></svg>`,
    },
  ]
}
