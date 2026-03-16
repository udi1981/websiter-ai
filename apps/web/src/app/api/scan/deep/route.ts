import { NextResponse } from 'next/server'

/**
 * POST /api/scan/deep
 *
 * Deep website scanner — multi-page crawl with AI analysis.
 * Streams progress events via SSE so the UI can show real-time updates.
 *
 * 7 Phases:
 *  1. Site Discovery — crawl all internal pages (nav, sitemap, links)
 *  2. Page Fetch — fetch HTML + CSS for every discovered page
 *  3. Design System — extract colors, fonts, spacing, shadows, tokens
 *  4. Content Architecture — classify sections, headings, CTAs per page
 *  5. Media Intelligence — catalog images with roles and AI descriptions
 *  6. Responsive Audit — detect breakpoints, mobile nav, layout shifts
 *  7. AI Deep Analysis — Claude analyzes full design DNA + rebuild plan
 */

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

// ─── Types ───────────────────────────────────────────────────────────────────

type PageData = {
  url: string
  path: string
  title: string
  html: string
  css: string
  depth: number
  isNav: boolean
  purpose: string
}

type DeepScanResult = {
  // Site-level
  url: string
  domain: string
  siteName: string
  businessType: string
  pageCount: number

  // All pages
  pages: {
    url: string
    path: string
    title: string
    purpose: string
    depth: number
    isNav: boolean
    sectionCount: number
    hasForm: boolean
    hasMedia: boolean
  }[]

  // Design system (aggregated across all pages)
  designTokens: {
    colors: { hex: string; usage: string; frequency: number; pages: string[] }[]
    fonts: { family: string; usage: string; weight: string; source: string }[]
    spacing: string[]
    borderRadius: string[]
    shadows: string[]
    gradients: string[]
    cssVariables: Record<string, string>
  }

  // Content architecture (per page)
  contentMap: {
    pagePath: string
    sections: {
      type: string
      title: string
      content: string
      hasImages: boolean
      hasForm: boolean
      itemCount: number
      order: number
    }[]
    headings: { level: number; text: string }[]
    ctaButtons: { text: string; href: string }[]
  }[]

  // Navigation
  navigation: { text: string; href: string; isActive: boolean }[]
  footerLinks: { text: string; href: string; group: string }[]

  // Media
  images: {
    src: string
    alt: string
    role: string
    page: string
    width: number
    height: number
    description: string
  }[]

  // SEO
  seoMeta: {
    title: string
    description: string
    keywords: string
    canonical: string
    ogTags: Record<string, string>
  }

  // Motion
  motion: {
    hasAnimationLibrary: string | null
    hasScrollAnimations: boolean
    hasParallax: boolean
    hasStickyHeader: boolean
    keyframeCount: number
    transitionCount: number
  }

  // AI analysis
  designDna: Record<string, unknown> | null

  // Rebuild plan
  rebuildPlan: {
    preserve: string[]
    rebuild: string[]
    improve: string[]
    upgrade: string[]
  } | null

  // Timing
  scanDuration: number
  phases: { name: string; duration: number; status: string }[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

async function fetchPage(url: string, timeout = 15000): Promise<{ html: string; finalUrl: string } | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,he;q=0.8',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(timeout),
    })
    if (!res.ok) return null
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('text/html') && !contentType.includes('text/plain') && !contentType.includes('application/xhtml')) return null
    const html = await res.text()
    return { html, finalUrl: res.url }
  } catch {
    return null
  }
}

async function fetchCss(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return ''
    const text = await res.text()
    if (text.length > 500000 || text.includes('<!DOCTYPE')) return ''
    return text
  } catch {
    return ''
  }
}

function extractLinks(html: string, baseUrl: string): string[] {
  const base = new URL(baseUrl)
  const links: string[] = []
  const seen = new Set<string>()

  // Find all href attributes
  const hrefRegex = /href=["']([^"'#]+)["']/gi
  let match
  while ((match = hrefRegex.exec(html)) !== null) {
    try {
      const resolved = new URL(match[1], base.origin)
      // Only internal links, same domain
      if (resolved.hostname !== base.hostname) continue
      // Skip non-page resources
      if (/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|pdf|zip|mp4|mp3|webp|avif)$/i.test(resolved.pathname)) continue
      // Skip anchors, mailto, tel
      if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') continue

      const normalized = resolved.origin + resolved.pathname.replace(/\/+$/, '') || '/'
      if (!seen.has(normalized)) {
        seen.add(normalized)
        links.push(normalized)
      }
    } catch {
      // skip invalid URLs
    }
  }
  return links
}

function extractCssUrls(html: string, origin: string): string[] {
  const urls: string[] = []
  const linkRegex = /<link[^>]+(?:rel=["']stylesheet["'][^>]*href=["']([^"']+)["']|href=["']([^"']+)["'][^>]*rel=["']stylesheet["'])[^>]*>/gi
  let match
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1] || match[2]
    if (!href) continue
    if (/fonts\.googleapis|cdnjs|unpkg|cdn\.jsdelivr|fontawesome/i.test(href)) continue
    try {
      urls.push(new URL(href, origin).href)
    } catch { /* skip */ }
  }
  return urls
}

function extractNavLinks(html: string): { text: string; href: string }[] {
  const navRegex = /<nav[^>]*>([\s\S]*?)<\/nav>/gi
  const links: { text: string; href: string }[] = []
  let navMatch
  while ((navMatch = navRegex.exec(html)) !== null) {
    const aRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
    let aMatch
    while ((aMatch = aRegex.exec(navMatch[1])) !== null) {
      const text = aMatch[2].replace(/<[^>]+>/g, '').trim()
      if (text && text.length < 50) {
        links.push({ text, href: aMatch[1] })
      }
    }
  }
  return links
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  return match ? match[1].trim() : ''
}

function extractMeta(html: string): Record<string, string> {
  const meta: Record<string, string> = {}
  const regex = /<meta[^>]+(?:name|property)=["']([^"']+)["'][^>]+content=["']([^"']+)["'][^>]*>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    meta[match[1]] = match[2]
  }
  return meta
}

function normalizeHex(color: string): string {
  const c = color.toLowerCase().trim()
  if (/^#[0-9a-f]{3}$/i.test(c)) {
    return `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`
  }
  return c
}

function extractColors(html: string, css: string): { hex: string; usage: string; frequency: number }[] {
  const colorMap = new Map<string, { count: number; contexts: string[] }>()
  const combined = html + '\n' + css

  // Hex colors
  const hexRegex = /#(?:[0-9a-fA-F]{3}){1,2}\b/g
  let match
  while ((match = hexRegex.exec(combined)) !== null) {
    const hex = normalizeHex(match[0])
    if (hex === '#ffffff' || hex === '#000000' || hex === '#fff' || hex === '#000') continue
    const entry = colorMap.get(hex) || { count: 0, contexts: [] }
    entry.count++
    colorMap.set(hex, entry)
  }

  // CSS variables with color values
  const varRegex = /--[\w-]+:\s*(#[0-9a-fA-F]{3,8})/g
  while ((match = varRegex.exec(combined)) !== null) {
    const hex = normalizeHex(match[1])
    const entry = colorMap.get(hex) || { count: 0, contexts: [] }
    entry.count += 5 // CSS vars are more significant
    entry.contexts.push('css-variable')
    colorMap.set(hex, entry)
  }

  // Sort by frequency
  const sorted = [...colorMap.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20)

  // Classify usage
  return sorted.map(([hex, data], i) => ({
    hex,
    usage: i === 0 ? 'primary' : i === 1 ? 'secondary' : i === 2 ? 'accent' : 'other',
    frequency: data.count,
  }))
}

function extractFonts(html: string, css: string): { family: string; usage: string; weight: string; source: string }[] {
  const fonts = new Map<string, { weight: string; source: string; count: number }>()

  // Google Fonts links
  const gfRegex = /fonts\.googleapis\.com\/css2?\?family=([^"'&]+)/gi
  let match
  while ((match = gfRegex.exec(html)) !== null) {
    const families = decodeURIComponent(match[1]).split('|')
    for (const f of families) {
      const name = f.split(':')[0].replace(/\+/g, ' ').trim()
      if (name) {
        fonts.set(name.toLowerCase(), { weight: '400', source: 'google-fonts', count: 10 })
      }
    }
  }

  // font-family in CSS
  const ffRegex = /font-family:\s*["']?([^"';},]+)/gi
  const combined = html + '\n' + css
  while ((match = ffRegex.exec(combined)) !== null) {
    const name = match[1].split(',')[0].trim().replace(/["']/g, '').toLowerCase()
    if (['inherit', 'initial', 'unset', 'system-ui', 'sans-serif', 'serif', 'monospace'].includes(name)) continue
    const existing = fonts.get(name)
    if (existing) {
      existing.count++
    } else {
      fonts.set(name, { weight: '400', source: 'custom', count: 1 })
    }
  }

  return [...fonts.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8)
    .map(([family, data], i) => ({
      family,
      usage: i === 0 ? 'heading' : i === 1 ? 'body' : 'accent',
      weight: data.weight,
      source: data.source,
    }))
}

const SECTION_PATTERNS: [string, RegExp][] = [
  ['hero', /hero|banner|jumbotron|masthead|splash/i],
  ['navbar', /nav|header|topbar|menu-bar/i],
  ['features', /features?|benefits?|capabilities|highlights/i],
  ['services', /services?|offerings?|what-we-do/i],
  ['about', /about|who-we-are|our-story|mission/i],
  ['testimonials', /testimonial|review|feedback|client-say|quote/i],
  ['pricing', /pricing|plans?|packages?|subscription/i],
  ['faq', /faq|questions|accordion/i],
  ['contact', /contact|get-in-touch|reach-us/i],
  ['footer', /footer|bottom/i],
  ['gallery', /gallery|portfolio|showcase|work/i],
  ['team', /team|staff|people|crew/i],
  ['stats', /stats?|numbers?|counter|metrics/i],
  ['cta', /cta|call-to-action|get-started/i],
  ['blog', /blog|news|articles?|posts?/i],
  ['products', /products?|shop|store|catalog/i],
  ['newsletter', /newsletter|subscribe|signup|mailing/i],
]

function detectSections(html: string): { type: string; title: string; content: string; hasImages: boolean; hasForm: boolean; itemCount: number; order: number }[] {
  const sections: { type: string; title: string; content: string; hasImages: boolean; hasForm: boolean; itemCount: number; order: number }[] = []
  // Match section/div/main/article with class or id
  const sectionRegex = /<(?:section|div|main|article|header|footer)[^>]*(?:class|id)=["']([^"']+)["'][^>]*>([\s\S]*?)(?=<(?:section|div|main|article|header|footer)[^>]*(?:class|id)=["']|<\/body>)/gi
  let match
  let order = 0
  while ((match = sectionRegex.exec(html)) !== null) {
    const classOrId = match[1]
    const content = match[2] || ''
    if (content.length < 50) continue // skip tiny sections

    let type = 'unknown'
    for (const [sType, pattern] of SECTION_PATTERNS) {
      if (pattern.test(classOrId)) {
        type = sType
        break
      }
    }

    // Content-based detection fallback
    if (type === 'unknown') {
      if (/\$\d|\/mo|\/yr|per month/i.test(content)) type = 'pricing'
      else if (/★|⭐|rating|review/i.test(content)) type = 'testimonials'
      else if (/<form/i.test(content)) type = 'contact'
    }

    // Extract title (first heading in section)
    const titleMatch = content.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i)
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim().slice(0, 100) : ''

    // Count items (cards, list items, etc.)
    const itemCount = (content.match(/<(?:li|article|\.card|div[^>]*class="[^"]*card)/gi) || []).length

    sections.push({
      type,
      title,
      content: content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300),
      hasImages: /<img/i.test(content),
      hasForm: /<form/i.test(content),
      itemCount,
      order: order++,
    })
  }

  return sections.slice(0, 30) // cap at 30 sections
}

function detectBusinessType(text: string): string {
  const types: [string, string[]][] = [
    ['restaurant', ['restaurant', 'menu', 'dining', 'cuisine', 'reservation', 'chef', 'food', 'eat']],
    ['dental', ['dental', 'dentist', 'teeth', 'smile', 'orthodont', 'oral']],
    ['law', ['law', 'attorney', 'legal', 'lawyer', 'litigation', 'court']],
    ['fitness', ['fitness', 'gym', 'workout', 'training', 'exercise', 'muscle']],
    ['saas', ['saas', 'software', 'platform', 'dashboard', 'analytics', 'api', 'integration']],
    ['ecommerce', ['shop', 'store', 'cart', 'product', 'buy', 'price', 'order']],
    ['realestate', ['property', 'real estate', 'listing', 'home', 'apartment', 'rent']],
    ['agency', ['agency', 'creative', 'design studio', 'branding', 'marketing']],
    ['healthcare', ['health', 'medical', 'clinic', 'patient', 'doctor', 'care']],
    ['education', ['course', 'learn', 'education', 'student', 'training', 'academy']],
    ['photography', ['photo', 'photography', 'portrait', 'shoot', 'album']],
  ]

  const lower = text.toLowerCase()
  let bestType = 'business'
  let bestScore = 0

  for (const [type, keywords] of types) {
    let score = 0
    for (const kw of keywords) {
      const matches = lower.split(kw).length - 1
      score += matches
    }
    if (score > bestScore) {
      bestScore = score
      bestType = type
    }
  }

  return bestType
}

function extractImages(html: string, origin: string, pagePath: string): { src: string; alt: string; role: string; page: string; width: number; height: number }[] {
  const images: { src: string; alt: string; role: string; page: string; width: number; height: number }[] = []
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
  let match
  while ((match = imgRegex.exec(html)) !== null) {
    const tag = match[0]
    let src = match[1]
    try {
      src = new URL(src, origin).href
    } catch { /* keep as-is */ }

    const altMatch = tag.match(/alt=["']([^"']*)["']/i)
    const widthMatch = tag.match(/width=["']?(\d+)/i)
    const heightMatch = tag.match(/height=["']?(\d+)/i)

    // Detect role
    let role = 'unknown'
    if (/logo/i.test(tag)) role = 'logo'
    else if (/hero|banner|jumbotron/i.test(tag) || /hero|banner/i.test(src)) role = 'hero'
    else if (/avatar|profile|headshot/i.test(tag)) role = 'avatar'
    else if (/product/i.test(tag)) role = 'product'
    else if (/gallery/i.test(tag)) role = 'gallery'
    else if (/background/i.test(tag) || /bg/i.test(src)) role = 'background'
    else if (/icon/i.test(tag) || (widthMatch && parseInt(widthMatch[1]) < 64)) role = 'icon'
    else role = 'card'

    images.push({
      src,
      alt: altMatch ? altMatch[1] : '',
      role,
      page: pagePath,
      width: widthMatch ? parseInt(widthMatch[1]) : 0,
      height: heightMatch ? parseInt(heightMatch[1]) : 0,
    })
  }
  return images
}

function extractMotion(html: string, css: string): DeepScanResult['motion'] {
  const combined = html + '\n' + css
  return {
    hasAnimationLibrary:
      /gsap|greensock/i.test(combined) ? 'gsap' :
      /framer-motion/i.test(combined) ? 'framer-motion' :
      /aos/i.test(combined) ? 'aos' :
      /animate\.css/i.test(combined) ? 'animate.css' :
      null,
    hasScrollAnimations: /data-aos|scroll-reveal|scrollreveal|intersectionobserver/i.test(combined),
    hasParallax: /parallax|data-parallax|rellax/i.test(combined),
    hasStickyHeader: /position:\s*(?:sticky|fixed)/i.test(css) && /header|nav/i.test(css),
    keyframeCount: (css.match(/@keyframes/gi) || []).length,
    transitionCount: (css.match(/transition:/gi) || []).length,
  }
}

function extractDesignTokens(css: string, html: string) {
  // Spacing values
  const spacingSet = new Set<string>()
  const spacingRegex = /(?:margin|padding|gap)(?:-(?:top|bottom|left|right|inline|block))?:\s*(\d+(?:px|rem|em))/gi
  let match
  while ((match = spacingRegex.exec(css)) !== null) {
    spacingSet.add(match[1])
  }

  // Border radius
  const radiusSet = new Set<string>()
  const radiusRegex = /border-radius:\s*([^;]+)/gi
  while ((match = radiusRegex.exec(css)) !== null) {
    radiusSet.add(match[1].trim())
  }

  // Shadows
  const shadowSet = new Set<string>()
  const shadowRegex = /box-shadow:\s*([^;]+)/gi
  while ((match = shadowRegex.exec(css)) !== null) {
    shadowSet.add(match[1].trim().slice(0, 100))
  }

  // Gradients
  const gradientSet = new Set<string>()
  const gradientRegex = /(?:linear|radial|conic)-gradient\([^)]+\)/gi
  while ((match = gradientRegex.exec(css + html)) !== null) {
    gradientSet.add(match[0].slice(0, 150))
  }

  // CSS variables
  const cssVars: Record<string, string> = {}
  const varRegex = /(--[\w-]+):\s*([^;]+)/g
  while ((match = varRegex.exec(css + html)) !== null) {
    cssVars[match[1]] = match[2].trim()
  }

  return {
    spacing: [...spacingSet].slice(0, 15),
    borderRadius: [...radiusSet].slice(0, 10),
    shadows: [...shadowSet].slice(0, 10),
    gradients: [...gradientSet].slice(0, 10),
    cssVariables: cssVars,
  }
}

// ─── AI Analysis ─────────────────────────────────────────────────────────────

async function aiDeepAnalysis(
  pages: PageData[],
  colors: DeepScanResult['designTokens']['colors'],
  fonts: DeepScanResult['designTokens']['fonts'],
  sections: DeepScanResult['contentMap'],
  claudeKey: string | undefined,
  geminiKey: string | undefined
): Promise<{ designDna: Record<string, unknown> | null; rebuildPlan: DeepScanResult['rebuildPlan'] }> {
  const prompt = `You are analyzing a multi-page website for a complete rebuild. Analyze the extracted data and provide:

1. **designDna** — comprehensive design system analysis:
   - designStyle (e.g., "luxury-minimal", "corporate-clean", "bold-creative")
   - colorSystem (primary, secondary, accent usage patterns)
   - typographySystem (heading/body font pairing rationale, scale)
   - layoutPatterns (grid, spacing, alignment patterns across pages)
   - componentPatterns (card styles, button variants, form patterns)
   - motionLanguage (animation style and rhythm)
   - brandPersonality (warm, authoritative, playful, etc.)

2. **rebuildPlan** — what to preserve, rebuild, improve, upgrade:
   - preserve: elements to keep exactly (brand colors, logo placement, nav structure)
   - rebuild: elements to recreate as structured sections
   - improve: weak areas (poor CTAs, missing trust elements, bad responsive)
   - upgrade: opportunities (add testimonials, better hero, modern animations)

WEBSITE DATA:
Pages found: ${pages.length}
${pages.map(p => `- ${p.path} (${p.title})`).join('\n')}

Colors: ${JSON.stringify(colors.slice(0, 10))}
Fonts: ${JSON.stringify(fonts)}

Section map:
${sections.map(s => `${s.pagePath}: ${s.sections.map(sec => sec.type).join(', ')}`).join('\n')}

Homepage HTML (first 8000 chars):
${pages[0]?.html?.slice(0, 8000) || 'N/A'}

Respond with valid JSON only: { "designDna": {...}, "rebuildPlan": { "preserve": [...], "rebuild": [...], "improve": [...], "upgrade": [...] } }`

  let text = ''

  // Try Claude first
  if (claudeKey) {
    try {
      const res = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          temperature: 0.2,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      if (res.ok) {
        const data = await res.json()
        text = data.content?.[0]?.text || ''
      }
    } catch (e) {
      console.error('Deep scan AI (Claude) error:', e)
    }
  }

  // Fallback to Gemini
  if (!text && geminiKey) {
    try {
      const res = await fetch(`${GEMINI_API_URL}?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 4096,
            responseMimeType: 'application/json',
          },
        }),
      })
      if (res.ok) {
        const data = await res.json()
        text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      }
    } catch (e) {
      console.error('Deep scan AI (Gemini) error:', e)
    }
  }

  if (!text) return { designDna: null, rebuildPlan: null }

  try {
    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(text)
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) return { designDna: null, rebuildPlan: null }
      parsed = JSON.parse(jsonMatch[0])
    }
    return {
      designDna: (parsed.designDna as Record<string, unknown>) || null,
      rebuildPlan: (parsed.rebuildPlan as DeepScanResult['rebuildPlan']) || null,
    }
  } catch {
    return { designDna: null, rebuildPlan: null }
  }
}

// ─── Main Handler (SSE streaming) ────────────────────────────────────────────

export async function POST(request: Request) {
  const claudeKey = process.env.CLAUDE_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY

  try {
    const { url } = await request.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ ok: false, error: 'URL is required' }, { status: 400 })
    }

    let normalizedUrl = url.trim()
    if (!normalizedUrl.startsWith('http')) normalizedUrl = `https://${normalizedUrl}`

    let baseUrl: URL
    try {
      baseUrl = new URL(normalizedUrl)
    } catch {
      return NextResponse.json({ ok: false, error: 'Invalid URL' }, { status: 400 })
    }

    // SSE stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const startTime = Date.now()
        const phases: { name: string; duration: number; status: string }[] = []

        function send(event: string, data: Record<string, unknown>) {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
        }

        function phaseStart(name: string, description: string) {
          send('phase', { phase: name, status: 'running', description })
        }

        function phaseEnd(name: string, duration: number, details?: Record<string, unknown>) {
          phases.push({ name, duration, status: 'done' })
          send('phase', { phase: name, status: 'done', duration, ...details })
        }

        try {
          // ─── Phase 1: Site Discovery ─────────────────────────────────
          phaseStart('discovery', 'Discovering all pages on the site...')
          const p1Start = Date.now()

          const homeResult = await fetchPage(normalizedUrl)
          if (!homeResult) {
            send('error', { error: 'Failed to fetch the website. Please check the URL.' })
            controller.close()
            return
          }

          const homeHtml = homeResult.html
          const allLinks = extractLinks(homeHtml, baseUrl.origin)
          const navLinks = extractNavLinks(homeHtml)

          // Also check sitemap.xml
          let sitemapUrls: string[] = []
          try {
            const sitemapRes = await fetchPage(`${baseUrl.origin}/sitemap.xml`, 5000)
            if (sitemapRes) {
              const locRegex = /<loc>(.*?)<\/loc>/gi
              let locMatch
              while ((locMatch = locRegex.exec(sitemapRes.html)) !== null) {
                try {
                  const sitemapUrl = new URL(locMatch[1])
                  if (sitemapUrl.hostname === baseUrl.hostname) {
                    sitemapUrls.push(sitemapUrl.href)
                  }
                } catch { /* skip */ }
              }
            }
          } catch { /* no sitemap */ }

          // Merge all discovered URLs (dedup)
          const urlSet = new Set<string>([normalizedUrl, ...allLinks, ...sitemapUrls])
          const pagesToCrawl = [...urlSet].slice(0, 20) // Cap at 20 pages

          phaseEnd('discovery', Date.now() - p1Start, { pagesFound: pagesToCrawl.length })
          send('progress', { percent: 10, message: `Found ${pagesToCrawl.length} pages to analyze` })

          // ─── Phase 2: Page Fetch ──────────────────────────────────────
          phaseStart('fetch', `Fetching ${pagesToCrawl.length} pages...`)
          const p2Start = Date.now()

          const pages: PageData[] = []
          const navPaths = new Set(navLinks.map(n => {
            try { return new URL(n.href, baseUrl.origin).pathname } catch { return '' }
          }))

          // Fetch pages in batches of 5
          for (let i = 0; i < pagesToCrawl.length; i += 5) {
            const batch = pagesToCrawl.slice(i, i + 5)
            const results = await Promise.allSettled(
              batch.map(async (pageUrl) => {
                const result = await fetchPage(pageUrl)
                if (!result) return null

                // Fetch CSS for this page
                const cssUrls = extractCssUrls(result.html, baseUrl.origin)
                const cssTexts = await Promise.allSettled(
                  cssUrls.slice(0, 5).map(u => fetchCss(u))
                )
                const css = cssTexts
                  .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
                  .map(r => r.value)
                  .join('\n')

                const path = new URL(pageUrl).pathname || '/'
                return {
                  url: pageUrl,
                  path,
                  title: extractTitle(result.html),
                  html: result.html,
                  css,
                  depth: path.split('/').filter(Boolean).length,
                  isNav: navPaths.has(path),
                  purpose: '',
                } as PageData
              })
            )

            for (const r of results) {
              if (r.status === 'fulfilled' && r.value) {
                pages.push(r.value)
              }
            }

            send('progress', {
              percent: 10 + Math.round((i / pagesToCrawl.length) * 20),
              message: `Fetched ${pages.length}/${pagesToCrawl.length} pages`,
            })
          }

          // Add homepage at index 0 if not already there
          if (!pages.find(p => p.path === '/')) {
            const cssUrls = extractCssUrls(homeHtml, baseUrl.origin)
            const cssTexts = await Promise.allSettled(cssUrls.slice(0, 5).map(u => fetchCss(u)))
            const css = cssTexts
              .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
              .map(r => r.value)
              .join('\n')

            pages.unshift({
              url: normalizedUrl,
              path: '/',
              title: extractTitle(homeHtml),
              html: homeHtml,
              css,
              depth: 0,
              isNav: true,
              purpose: 'homepage',
            })
          }

          phaseEnd('fetch', Date.now() - p2Start, { pagesFetched: pages.length })
          send('progress', { percent: 30, message: `Fetched ${pages.length} pages with CSS` })

          // ─── Phase 3: Design System Extraction ────────────────────────
          phaseStart('design', 'Extracting design system tokens...')
          const p3Start = Date.now()

          // Aggregate all HTML + CSS
          const allHtml = pages.map(p => p.html).join('\n')
          const allCss = pages.map(p => p.css).join('\n')

          const colors = extractColors(allHtml, allCss)
          const fonts = extractFonts(allHtml, allCss)
          const tokenExtras = extractDesignTokens(allCss, allHtml)

          // Tag colors with which pages they appear on
          const colorsWithPages = colors.map(c => ({
            ...c,
            pages: pages
              .filter(p => p.html.includes(c.hex) || p.css.includes(c.hex))
              .map(p => p.path),
          }))

          phaseEnd('design', Date.now() - p3Start, {
            colors: colorsWithPages.length,
            fonts: fonts.length,
            cssVars: Object.keys(tokenExtras.cssVariables).length,
          })
          send('progress', { percent: 45, message: `Extracted ${colorsWithPages.length} colors, ${fonts.length} fonts` })

          // ─── Phase 4: Content Architecture ────────────────────────────
          phaseStart('content', 'Analyzing content architecture per page...')
          const p4Start = Date.now()

          const contentMap: DeepScanResult['contentMap'] = pages.map(p => {
            const sections = detectSections(p.html)
            const headings: { level: number; text: string }[] = []
            const hRegex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi
            let hMatch
            while ((hMatch = hRegex.exec(p.html)) !== null) {
              const text = hMatch[2].replace(/<[^>]+>/g, '').trim()
              if (text) headings.push({ level: parseInt(hMatch[1]), text: text.slice(0, 120) })
            }

            const ctaButtons: { text: string; href: string }[] = []
            const btnRegex = /<a[^>]+href=["']([^"']+)["'][^>]*class=["'][^"']*(?:btn|button|cta)[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi
            let btnMatch
            while ((btnMatch = btnRegex.exec(p.html)) !== null) {
              const text = btnMatch[2].replace(/<[^>]+>/g, '').trim()
              if (text) ctaButtons.push({ text, href: btnMatch[1] })
            }

            return {
              pagePath: p.path,
              sections,
              headings: headings.slice(0, 20),
              ctaButtons: ctaButtons.slice(0, 10),
            }
          })

          const totalSections = contentMap.reduce((sum, p) => sum + p.sections.length, 0)
          phaseEnd('content', Date.now() - p4Start, { totalSections, pages: contentMap.length })
          send('progress', { percent: 55, message: `Mapped ${totalSections} sections across ${pages.length} pages` })

          // ─── Phase 5: Media Intelligence ──────────────────────────────
          phaseStart('media', 'Cataloging images and media...')
          const p5Start = Date.now()

          const allImages = pages.flatMap(p => extractImages(p.html, baseUrl.origin, p.path))
          // Dedup by src
          const seen = new Set<string>()
          const uniqueImages = allImages.filter(img => {
            if (seen.has(img.src)) return false
            seen.add(img.src)
            return true
          }).slice(0, 50)

          phaseEnd('media', Date.now() - p5Start, { imageCount: uniqueImages.length })
          send('progress', { percent: 65, message: `Cataloged ${uniqueImages.length} images` })

          // ─── Phase 6: Responsive & Motion Audit ───────────────────────
          phaseStart('responsive', 'Auditing responsive design and animations...')
          const p6Start = Date.now()

          const motion = extractMotion(allHtml, allCss)

          // Extract breakpoints from CSS
          const breakpointSet = new Set<string>()
          const bpRegex = /@media[^{]*(?:min|max)-width:\s*(\d+(?:px|em|rem))/gi
          let bpMatch
          while ((bpMatch = bpRegex.exec(allCss)) !== null) {
            breakpointSet.add(bpMatch[1])
          }

          phaseEnd('responsive', Date.now() - p6Start, {
            breakpoints: [...breakpointSet],
            animationLibrary: motion.hasAnimationLibrary,
            keyframes: motion.keyframeCount,
          })
          send('progress', { percent: 75, message: 'Responsive and motion audit complete' })

          // ─── Phase 7: AI Deep Analysis ────────────────────────────────
          phaseStart('ai-analysis', 'AI is analyzing design DNA and creating rebuild plan...')
          const p7Start = Date.now()

          send('progress', { percent: 80, message: 'Claude is analyzing the full design DNA...' })

          const aiResult = await aiDeepAnalysis(pages, colorsWithPages, fonts, contentMap, claudeKey, geminiKey)

          phaseEnd('ai-analysis', Date.now() - p7Start, {
            hasDesignDna: !!aiResult.designDna,
            hasRebuildPlan: !!aiResult.rebuildPlan,
          })
          send('progress', { percent: 95, message: 'AI analysis complete' })

          // ─── Build Final Result ───────────────────────────────────────
          const allText = pages.map(p => p.html).join(' ')
          const businessType = detectBusinessType(allText)
          const meta = extractMeta(pages[0]?.html || '')

          const result: DeepScanResult = {
            url: normalizedUrl,
            domain: baseUrl.hostname,
            siteName: pages[0]?.title?.split('|')[0]?.split('-')[0]?.trim() || baseUrl.hostname,
            businessType,
            pageCount: pages.length,
            pages: pages.map(p => ({
              url: p.url,
              path: p.path,
              title: p.title,
              purpose: p.purpose || (p.path === '/' ? 'homepage' : p.path.replace(/\//g, ' ').trim()),
              depth: p.depth,
              isNav: p.isNav,
              sectionCount: contentMap.find(c => c.pagePath === p.path)?.sections.length || 0,
              hasForm: /<form/i.test(p.html),
              hasMedia: /<(?:video|audio|iframe)/i.test(p.html),
            })),
            designTokens: {
              colors: colorsWithPages,
              fonts,
              ...tokenExtras,
            },
            contentMap,
            navigation: navLinks.map(n => ({ ...n, isActive: false })),
            footerLinks: [],
            images: uniqueImages.map(img => ({ ...img, description: img.alt || `${img.role} image` })),
            seoMeta: {
              title: pages[0]?.title || '',
              description: meta['description'] || '',
              keywords: meta['keywords'] || '',
              canonical: meta['canonical'] || normalizedUrl,
              ogTags: Object.fromEntries(
                Object.entries(meta).filter(([k]) => k.startsWith('og:'))
              ),
            },
            motion,
            designDna: aiResult.designDna,
            rebuildPlan: aiResult.rebuildPlan,
            scanDuration: Date.now() - startTime,
            phases,
          }

          send('progress', { percent: 100, message: 'Deep scan complete!' })
          send('result', { ok: true, data: result })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          send('error', { error: `Deep scan failed: ${message}` })
        }

        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
