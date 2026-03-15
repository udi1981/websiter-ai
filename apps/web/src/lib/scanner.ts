/**
 * Website Scanner Engine
 *
 * Client-side scanner that fetches a website URL and extracts its design DNA.
 * Uses DOMParser (browser-native) for HTML parsing — no Puppeteer needed.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ColorInfo = {
  hex: string
  usage: 'primary' | 'secondary' | 'background' | 'text' | 'accent' | 'border'
  frequency: number
}

export type FontInfo = {
  family: string
  usage: 'heading' | 'body' | 'accent'
  weight: string
  source: 'google-fonts' | 'system' | 'custom'
}

export type DetectedSection = {
  type:
    | 'hero'
    | 'features'
    | 'about'
    | 'services'
    | 'testimonials'
    | 'pricing'
    | 'faq'
    | 'contact'
    | 'footer'
    | 'gallery'
    | 'team'
    | 'stats'
    | 'cta'
    | 'blog'
    | 'products'
    | 'newsletter'
    | 'navbar'
    | 'unknown'
  title: string
  content: string
  hasImages: boolean
  hasForm: boolean
  itemCount: number
  order: number
}

export type NavItem = {
  text: string
  href: string
}

export type ImageInfo = {
  src: string
  alt: string
  role:
    | 'hero'
    | 'card'
    | 'avatar'
    | 'logo'
    | 'gallery'
    | 'background'
    | 'icon'
    | 'product'
    | 'unknown'
  width: number
  height: number
}

export type ScanResult = {
  url: string
  domain: string
  title: string
  description: string
  favicon: string
  ogImage: string

  // Design DNA
  colors: ColorInfo[]
  fonts: FontInfo[]

  // Structure
  sections: DetectedSection[]
  navigation: NavItem[]

  // Content
  headings: { level: number; text: string }[]
  paragraphs: string[]
  images: ImageInfo[]
  ctaButtons: { text: string; href: string }[]

  // Meta
  seoMeta: {
    title: string
    description: string
    keywords: string
    canonical: string
    ogTags: Record<string, string>
  }

  // Detected business type
  businessType: string
  businessName: string

  // Motion DNA (detected from scanned site)
  motion?: {
    hasAnimationLibrary: string | null
    hasScrollAnimations: boolean
    hasParallax: boolean
    hasStickyHeader: boolean
    suggestedPreset: import('./motion-presets').MotionIntensity
  }

  // AI-analyzed design DNA (deep analysis via AI API)
  designDna?: Record<string, unknown>

  // Raw HTML + CSS for AI generation pipeline
  rawHtml?: string
  rawCss?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SYSTEM_FONTS = [
  'arial',
  'helvetica',
  'times new roman',
  'times',
  'courier new',
  'courier',
  'verdana',
  'georgia',
  'palatino',
  'garamond',
  'bookman',
  'tahoma',
  'trebuchet ms',
  'impact',
  'comic sans ms',
  'system-ui',
  'sans-serif',
  'serif',
  'monospace',
  'ui-sans-serif',
  'ui-serif',
  'ui-monospace',
  '-apple-system',
  'blinkmacsystemfont',
  'segoe ui',
]

/** Normalise a hex colour to 6-char lowercase form. */
const normaliseHex = (raw: string): string | null => {
  const h = raw.replace('#', '').toLowerCase()
  if (h.length === 3) return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`
  if (h.length === 6) return `#${h}`
  if (h.length === 8) return `#${h.slice(0, 6)}` // strip alpha
  return null
}

/** Convert rgb(r,g,b) → #rrggbb */
const rgbToHex = (r: number, g: number, b: number): string => {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)))
  return (
    '#' +
    [r, g, b]
      .map((v) => clamp(v).toString(16).padStart(2, '0'))
      .join('')
  )
}

/** Rough hsl-to-hex (ignores edge-cases that don't affect scanning). */
const hslToHex = (h: number, s: number, l: number): string => {
  const sn = s / 100
  const ln = l / 100
  const a = sn * Math.min(ln, 1 - ln)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
  }
  return rgbToHex(f(0), f(8), f(4))
}

/** Map Tailwind colour class segments to approximate hex values. */
const TAILWIND_COLOR_MAP: Record<string, string> = {
  'red-50': '#fef2f2', 'red-100': '#fee2e2', 'red-200': '#fecaca',
  'red-300': '#fca5a5', 'red-400': '#f87171', 'red-500': '#ef4444',
  'red-600': '#dc2626', 'red-700': '#b91c1c', 'red-800': '#991b1b',
  'red-900': '#7f1d1d',
  'orange-500': '#f97316', 'orange-600': '#ea580c',
  'yellow-500': '#eab308', 'yellow-600': '#ca8a04',
  'green-500': '#22c55e', 'green-600': '#16a34a',
  'teal-500': '#14b8a6', 'teal-600': '#0d9488',
  'blue-50': '#eff6ff', 'blue-100': '#dbeafe', 'blue-200': '#bfdbfe',
  'blue-300': '#93c5fd', 'blue-400': '#60a5fa', 'blue-500': '#3b82f6',
  'blue-600': '#2563eb', 'blue-700': '#1d4ed8', 'blue-800': '#1e40af',
  'blue-900': '#1e3a8a',
  'indigo-500': '#6366f1', 'indigo-600': '#4f46e5',
  'purple-500': '#a855f7', 'purple-600': '#9333ea',
  'pink-500': '#ec4899', 'pink-600': '#db2777',
  'gray-50': '#f9fafb', 'gray-100': '#f3f4f6', 'gray-200': '#e5e7eb',
  'gray-300': '#d1d5db', 'gray-400': '#9ca3af', 'gray-500': '#6b7280',
  'gray-600': '#4b5563', 'gray-700': '#374151', 'gray-800': '#1f2937',
  'gray-900': '#111827',
  'slate-50': '#f8fafc', 'slate-100': '#f1f5f9', 'slate-200': '#e2e8f0',
  'slate-300': '#cbd5e1', 'slate-400': '#94a3b8', 'slate-500': '#64748b',
  'slate-600': '#475569', 'slate-700': '#334155', 'slate-800': '#1e293b',
  'slate-900': '#0f172a',
  'zinc-500': '#71717a', 'zinc-600': '#52525b', 'zinc-700': '#3f3f46',
  'zinc-800': '#27272a', 'zinc-900': '#18181b',
  'neutral-500': '#737373', 'neutral-600': '#525252',
  'stone-500': '#78716c', 'stone-600': '#57534e',
  'white': '#ffffff', 'black': '#000000',
}

/** Try to resolve a Tailwind colour class (e.g. "bg-blue-500") to a hex. */
const tailwindClassToHex = (cls: string): string | null => {
  // match patterns like bg-blue-500, text-red-600, border-gray-300
  const m = cls.match(
    /(?:bg|text|border|ring|accent|outline|fill|stroke|decoration)-([a-z]+-\d{2,3}|white|black)/,
  )
  if (!m) return null
  return TAILWIND_COLOR_MAP[m[1]] ?? null
}

/** Detect usage bucket for a colour based on the CSS property it came from. */
const classifyColorUsage = (
  property: string,
): ColorInfo['usage'] => {
  const p = property.toLowerCase()
  if (p.includes('background') || p.startsWith('bg')) return 'background'
  if (p.includes('border') || p.startsWith('border')) return 'border'
  if (p.includes('color') || p.startsWith('text')) return 'text'
  return 'accent'
}

/** Extract text content of an element, trimmed and truncated. */
const textOf = (el: Element, maxLen = 200): string =>
  (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, maxLen)

/** Resolve a possibly-relative URL against a base. */
const resolveUrl = (raw: string, base: string): string => {
  if (!raw) return ''
  try {
    return new URL(raw, base).href
  } catch {
    return raw
  }
}

// ---------------------------------------------------------------------------
// Fetch HTML
// ---------------------------------------------------------------------------

/**
 * Fetch HTML + CSS via server-side proxy (no CORS issues).
 * Falls back to client-side CORS proxies if server proxy fails.
 */
const fetchViaServerProxy = async (url: string): Promise<{ html: string; css: string } | null> => {
  try {
    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
    if (res.ok) {
      const data = await res.json()
      if (data.ok && data.data?.html) {
        return { html: data.data.html, css: data.data.css || '' }
      }
    }
  } catch {
    // fall through to client-side
  }
  return null
}

/** Fetch the HTML of a page using CORS proxy fallbacks. */
const fetchHtml = async (url: string): Promise<string> => {
  // Strategy 1: direct fetch (may work for same-origin or permissive CORS)
  try {
    const res = await fetch(url, {
      mode: 'cors',
      headers: { Accept: 'text/html' },
    })
    if (res.ok) return await res.text()
  } catch {
    // swallow — try proxy
  }

  // Strategy 2: allorigins.win
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
    const res = await fetch(proxyUrl)
    if (res.ok) return await res.text()
  } catch {
    // swallow
  }

  // Strategy 3: corsproxy.io
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`
    const res = await fetch(proxyUrl)
    if (res.ok) return await res.text()
  } catch {
    // swallow
  }

  throw new Error(`Failed to fetch HTML for ${url}`)
}

// ---------------------------------------------------------------------------
// Fetch external CSS files to extract more design data
// ---------------------------------------------------------------------------

/** Fetch external CSS files linked from the HTML document. */
const fetchExternalCSS = async (doc: Document, baseUrl: string): Promise<string> => {
  const cssLinks = doc.querySelectorAll('link[rel="stylesheet"]')
  const cssTexts: string[] = []

  const fetchPromises: Promise<void>[] = []

  cssLinks.forEach((link) => {
    const href = link.getAttribute('href')
    if (!href) return
    // Skip CDN/third-party CSS that won't have design tokens
    if (/fonts\.googleapis|cdnjs|unpkg|cdn\.jsdelivr|fontawesome/i.test(href)) return

    const fullUrl = resolveUrl(href, baseUrl)
    if (!fullUrl) return

    const p = (async () => {
      try {
        // Try direct fetch first
        let res: Response | null = null
        try {
          res = await fetch(fullUrl, { mode: 'cors', signal: AbortSignal.timeout(5000) })
        } catch {
          // Try proxy
          try {
            res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(fullUrl)}`, { signal: AbortSignal.timeout(5000) })
          } catch {
            // skip
          }
        }
        if (res?.ok) {
          const text = await res.text()
          // Only keep if it looks like CSS (not HTML error pages)
          if (text.length < 500000 && !text.includes('<!DOCTYPE')) {
            cssTexts.push(text)
          }
        }
      } catch {
        // skip this CSS file
      }
    })()
    fetchPromises.push(p)
  })

  // Fetch up to 10 CSS files in parallel, with a 10s timeout
  await Promise.race([
    Promise.allSettled(fetchPromises.slice(0, 10)),
    new Promise<void>((resolve) => setTimeout(resolve, 10000)),
  ])

  return cssTexts.join('\n')
}

// ---------------------------------------------------------------------------
// Extraction: Colours
// ---------------------------------------------------------------------------

const extractColors = (doc: Document, externalCSS = ''): ColorInfo[] => {
  const colorCounts = new Map<string, { usage: ColorInfo['usage']; count: number }>()

  const record = (hex: string | null, usage: ColorInfo['usage']) => {
    if (!hex) return
    const norm = normaliseHex(hex.replace('#', '')) ?? normaliseHex(hex) ?? null
    if (!norm) return
    const existing = colorCounts.get(norm)
    if (existing) {
      existing.count += 1
    } else {
      colorCounts.set(norm, { usage, count: 1 })
    }
  }

  // --- Inline styles ---
  const allElements = doc.querySelectorAll('[style]')
  allElements.forEach((el) => {
    const style = el.getAttribute('style') ?? ''

    // hex
    const hexMatches = style.matchAll(/#(?:[0-9a-fA-F]{3,8})\b/g)
    for (const m of hexMatches) {
      const prop = style.slice(0, style.indexOf(m[0]))
      record(m[0], classifyColorUsage(prop))
    }

    // rgb()
    const rgbMatches = style.matchAll(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g)
    for (const m of rgbMatches) {
      const hex = rgbToHex(Number(m[1]), Number(m[2]), Number(m[3]))
      const prop = style.slice(0, style.indexOf(m[0]))
      record(hex, classifyColorUsage(prop))
    }

    // hsl()
    const hslMatches = style.matchAll(/hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)/g)
    for (const m of hslMatches) {
      const hex = hslToHex(Number(m[1]), Number(m[2]), Number(m[3]))
      const prop = style.slice(0, style.indexOf(m[0]))
      record(hex, classifyColorUsage(prop))
    }
  })

  // --- Tailwind classes ---
  const allClassElements = doc.querySelectorAll('[class]')
  allClassElements.forEach((el) => {
    const classes = (el.getAttribute('class') ?? '').split(/\s+/)
    for (const cls of classes) {
      const hex = tailwindClassToHex(cls)
      if (hex) {
        const usage = classifyColorUsage(cls)
        record(hex, usage)
      }
    }
  })

  // --- <style> blocks ---
  const styleTags = doc.querySelectorAll('style')
  styleTags.forEach((tag) => {
    const css = tag.textContent ?? ''

    // hex
    const hexMatches = css.matchAll(/#(?:[0-9a-fA-F]{3,8})\b/g)
    for (const m of hexMatches) record(m[0], 'accent')

    // rgb
    const rgbMatches = css.matchAll(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g)
    for (const m of rgbMatches) {
      record(rgbToHex(Number(m[1]), Number(m[2]), Number(m[3])), 'accent')
    }

    // hsl
    const hslMatches = css.matchAll(/hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)/g)
    for (const m of hslMatches) {
      record(hslToHex(Number(m[1]), Number(m[2]), Number(m[3])), 'accent')
    }

    // CSS custom properties with colour values
    const customProps = css.matchAll(/--[\w-]+:\s*(#[0-9a-fA-F]{3,8})/g)
    for (const m of customProps) record(m[1], 'accent')
  })

  // --- External CSS ---
  if (externalCSS) {
    // hex
    const hexMatches = externalCSS.matchAll(/#(?:[0-9a-fA-F]{3,8})\b/g)
    for (const m of hexMatches) record(m[0], 'accent')

    // rgb
    const rgbMatches = externalCSS.matchAll(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g)
    for (const m of rgbMatches) {
      record(rgbToHex(Number(m[1]), Number(m[2]), Number(m[3])), 'accent')
    }

    // hsl
    const hslMatches = externalCSS.matchAll(/hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)/g)
    for (const m of hslMatches) {
      record(hslToHex(Number(m[1]), Number(m[2]), Number(m[3])), 'accent')
    }

    // CSS custom properties
    const customProps = externalCSS.matchAll(/--[\w-]+:\s*(#[0-9a-fA-F]{3,8})/g)
    for (const m of customProps) record(m[1], 'accent')
  }

  // Sort by frequency descending and convert to array
  const sorted = [...colorCounts.entries()]
    .sort((a, b) => b[1].count - a[1].count)

  // Classify top colours smartly
  const results: ColorInfo[] = []
  const skipColors = new Set(['#ffffff', '#000000'])
  let primaryAssigned = false
  let secondaryAssigned = false

  for (const [hex, { usage, count }] of sorted) {
    let finalUsage = usage

    if (!skipColors.has(hex)) {
      if (!primaryAssigned) {
        finalUsage = 'primary'
        primaryAssigned = true
      } else if (!secondaryAssigned) {
        finalUsage = 'secondary'
        secondaryAssigned = true
      }
    }

    results.push({ hex, usage: finalUsage, frequency: count })
  }

  return results
}

// ---------------------------------------------------------------------------
// Extraction: Fonts
// ---------------------------------------------------------------------------

const extractFonts = (doc: Document, externalCSS = ''): FontInfo[] => {
  const fontMap = new Map<string, FontInfo>()

  const addFont = (family: string, usage: FontInfo['usage'], weight: string, source: FontInfo['source']) => {
    const key = family.toLowerCase().trim()
    if (!key || key === 'inherit' || key === 'initial') return
    if (!fontMap.has(key)) {
      fontMap.set(key, { family: family.trim(), usage, weight, source })
    }
  }

  // --- Google Fonts <link> tags ---
  const links = doc.querySelectorAll('link[href*="fonts.googleapis.com"]')
  links.forEach((link) => {
    const href = link.getAttribute('href') ?? ''

    // fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans
    const familyMatches = href.matchAll(/family=([^&:]+)/g)
    for (const m of familyMatches) {
      const name = decodeURIComponent(m[1]).replace(/\+/g, ' ')
      const weightMatch = href.match(/wght@([\d;]+)/)
      const weight = weightMatch ? weightMatch[1].split(';')[0] : '400'
      addFont(name, 'body', weight, 'google-fonts')
    }
  })

  // --- <style> blocks: font-family declarations ---
  const styleTags = doc.querySelectorAll('style')
  styleTags.forEach((tag) => {
    const css = tag.textContent ?? ''
    const ffMatches = css.matchAll(/font-family:\s*([^;}"]+)/g)
    for (const m of ffMatches) {
      const families = m[1].split(',').map((f) => f.trim().replace(/['"]/g, ''))
      for (const fam of families) {
        if (!fam) continue
        const isSystem = SYSTEM_FONTS.includes(fam.toLowerCase())
        addFont(fam, 'body', '400', isSystem ? 'system' : 'custom')
      }
    }
  })

  // --- Inline font-family on elements ---
  const styledEls = doc.querySelectorAll('[style*="font-family"]')
  styledEls.forEach((el) => {
    const style = el.getAttribute('style') ?? ''
    const m = style.match(/font-family:\s*([^;]+)/)
    if (!m) return
    const families = m[1].split(',').map((f) => f.trim().replace(/['"]/g, ''))
    const tagName = el.tagName.toLowerCase()
    const isHeading = /^h[1-6]$/.test(tagName)
    for (const fam of families) {
      if (!fam) continue
      const isSystem = SYSTEM_FONTS.includes(fam.toLowerCase())
      addFont(fam, isHeading ? 'heading' : 'body', '400', isSystem ? 'system' : 'custom')
    }
  })

  // --- External CSS font-family declarations ---
  if (externalCSS) {
    const ffMatches = externalCSS.matchAll(/font-family:\s*([^;}"]+)/g)
    for (const m of ffMatches) {
      const families = m[1].split(',').map((f) => f.trim().replace(/['"]/g, ''))
      for (const fam of families) {
        if (!fam) continue
        const isSystem = SYSTEM_FONTS.includes(fam.toLowerCase())
        if (!isSystem) addFont(fam, 'body', '400', 'custom')
      }
    }
    // @font-face declarations
    const fontFaceMatches = externalCSS.matchAll(/@font-face\s*\{[^}]*font-family:\s*['"]?([^'";}\n]+)/g)
    for (const m of fontFaceMatches) {
      const fam = m[1].trim()
      if (fam) addFont(fam, 'body', '400', 'custom')
    }
  }

  // Try to detect heading vs body usage by checking which fonts appear on h1-h6
  const headingEls = doc.querySelectorAll('h1, h2, h3, h4, h5, h6')
  headingEls.forEach((el) => {
    const style = el.getAttribute('style') ?? ''
    const m = style.match(/font-family:\s*([^;]+)/)
    if (!m) return
    const fam = m[1].split(',')[0].trim().replace(/['"]/g, '')
    const key = fam.toLowerCase()
    if (fontMap.has(key)) {
      fontMap.get(key)!.usage = 'heading'
    }
  })

  return [...fontMap.values()]
}

// ---------------------------------------------------------------------------
// Extraction: Navigation
// ---------------------------------------------------------------------------

const extractNavigation = (doc: Document): NavItem[] => {
  const items: NavItem[] = []
  const nav = doc.querySelector('nav') ?? doc.querySelector('header')
  if (!nav) return items

  const anchors = nav.querySelectorAll('a')
  anchors.forEach((a) => {
    const text = textOf(a, 50)
    const href = a.getAttribute('href') ?? ''
    if (text && href) {
      items.push({ text, href })
    }
  })

  return items
}

// ---------------------------------------------------------------------------
// Extraction: Headings
// ---------------------------------------------------------------------------

const extractHeadings = (doc: Document): { level: number; text: string }[] => {
  const headings: { level: number; text: string }[] = []
  const els = doc.querySelectorAll('h1, h2, h3, h4, h5, h6')
  els.forEach((el) => {
    const level = parseInt(el.tagName[1], 10)
    const text = textOf(el, 200)
    if (text) headings.push({ level, text })
  })
  return headings
}

// ---------------------------------------------------------------------------
// Extraction: Paragraphs
// ---------------------------------------------------------------------------

const extractParagraphs = (doc: Document): string[] => {
  const paragraphs: string[] = []
  const els = doc.querySelectorAll('p')
  els.forEach((el) => {
    const text = textOf(el, 300)
    if (text && text.length > 10) paragraphs.push(text)
  })
  return paragraphs.slice(0, 50) // cap to avoid massive results
}

// ---------------------------------------------------------------------------
// Extraction: Images
// ---------------------------------------------------------------------------

const extractImages = (doc: Document, baseUrl: string): ImageInfo[] => {
  const images: ImageInfo[] = []
  const imgEls = doc.querySelectorAll('img')

  imgEls.forEach((img) => {
    const src = resolveUrl(img.getAttribute('src') ?? '', baseUrl)
    const alt = img.getAttribute('alt') ?? ''
    const width = parseInt(img.getAttribute('width') ?? '0', 10) || 0
    const height = parseInt(img.getAttribute('height') ?? '0', 10) || 0

    if (!src) return

    images.push({ src, alt, role: 'unknown', width, height })
  })

  return images
}

/** Classify image roles after sections have been detected. */
const classifyImageRoles = (
  images: ImageInfo[],
  doc: Document,
  baseUrl: string,
): ImageInfo[] => {
  // Identify images inside nav/header → logo
  const navImages = new Set<string>()
  const navEl = doc.querySelector('nav') ?? doc.querySelector('header')
  if (navEl) {
    navEl.querySelectorAll('img').forEach((img) => {
      const src = resolveUrl(img.getAttribute('src') ?? '', baseUrl)
      if (src) navImages.add(src)
    })
  }

  // Identify hero section (first section or first large section with h1)
  const heroImages = new Set<string>()
  const firstH1 = doc.querySelector('h1')
  if (firstH1) {
    const section = firstH1.closest('section') ?? firstH1.parentElement
    if (section) {
      section.querySelectorAll('img').forEach((img) => {
        const src = resolveUrl(img.getAttribute('src') ?? '', baseUrl)
        if (src) heroImages.add(src)
      })
    }
  }

  // Gallery sections
  const galleryImages = new Set<string>()
  doc.querySelectorAll('section, div').forEach((el) => {
    const text = (el.getAttribute('class') ?? '') + ' ' + (el.getAttribute('id') ?? '')
    if (/gallery|lightbox|carousel/i.test(text)) {
      el.querySelectorAll('img').forEach((img) => {
        const src = resolveUrl(img.getAttribute('src') ?? '', baseUrl)
        if (src) galleryImages.add(src)
      })
    }
  })

  return images.map((img) => {
    if (navImages.has(img.src)) return { ...img, role: 'logo' as const }
    if (heroImages.has(img.src)) return { ...img, role: 'hero' as const }
    if (galleryImages.has(img.src)) return { ...img, role: 'gallery' as const }

    // Small circular likely avatar
    if (
      img.width > 0 &&
      img.height > 0 &&
      img.width <= 100 &&
      img.height <= 100 &&
      Math.abs(img.width - img.height) < 10
    ) {
      return { ...img, role: 'avatar' as const }
    }

    // If very small, likely icon
    if (img.width > 0 && img.width <= 32 && img.height > 0 && img.height <= 32) {
      return { ...img, role: 'icon' as const }
    }

    return img
  })
}

// ---------------------------------------------------------------------------
// Extraction: CTA Buttons
// ---------------------------------------------------------------------------

const extractCtaButtons = (doc: Document): { text: string; href: string }[] => {
  const buttons: { text: string; href: string }[] = []
  const ctaPatterns =
    /get started|sign up|start|try|buy|order|subscribe|register|join|book|contact|learn more|free trial|download|demo/i

  // <a> tags styled as buttons or matching CTA text
  doc.querySelectorAll('a').forEach((a) => {
    const text = textOf(a, 60)
    const href = a.getAttribute('href') ?? ''
    const classes = a.getAttribute('class') ?? ''

    const isButton = /btn|button|cta/i.test(classes)
    const isCta = ctaPatterns.test(text)

    if ((isButton || isCta) && text && href) {
      buttons.push({ text, href })
    }
  })

  // <button> elements with text matching CTA patterns
  doc.querySelectorAll('button').forEach((btn) => {
    const text = textOf(btn, 60)
    if (ctaPatterns.test(text) && text) {
      buttons.push({ text, href: '' })
    }
  })

  return buttons
}

// ---------------------------------------------------------------------------
// Extraction: SEO Meta
// ---------------------------------------------------------------------------

const extractSeoMeta = (doc: Document) => {
  const meta = (name: string): string => {
    const el =
      doc.querySelector(`meta[name="${name}"]`) ??
      doc.querySelector(`meta[property="${name}"]`)
    return el?.getAttribute('content') ?? ''
  }

  const ogTags: Record<string, string> = {}
  doc.querySelectorAll('meta[property^="og:"]').forEach((el) => {
    const prop = el.getAttribute('property') ?? ''
    const content = el.getAttribute('content') ?? ''
    if (prop && content) ogTags[prop] = content
  })

  const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? ''

  return {
    title: doc.title ?? '',
    description: meta('description'),
    keywords: meta('keywords'),
    canonical,
    ogTags,
  }
}

// ---------------------------------------------------------------------------
// Extraction: Sections
// ---------------------------------------------------------------------------

const detectSectionType = (
  el: Element,
  hasH1Above: boolean,
): DetectedSection['type'] => {
  const tag = el.tagName.toLowerCase()
  const text = (el.textContent ?? '').toLowerCase()
  const classes = ((el.getAttribute('class') ?? '') + ' ' + (el.getAttribute('id') ?? '')).toLowerCase()
  const combined = text + ' ' + classes

  if (tag === 'nav') return 'navbar'
  if (tag === 'footer') return 'footer'

  // Class / id based hints
  if (/hero|banner|jumbotron/i.test(classes)) return 'hero'
  if (/pricing|plans?\b/i.test(classes)) return 'pricing'
  if (/testimonial|review/i.test(classes)) return 'testimonials'
  if (/faq|accordion|question/i.test(classes)) return 'faq'
  if (/contact/i.test(classes)) return 'contact'
  if (/features?\b/i.test(classes)) return 'features'
  if (/about/i.test(classes)) return 'about'
  if (/services?\b/i.test(classes)) return 'services'
  if (/team|staff|people/i.test(classes)) return 'team'
  if (/gallery|portfolio/i.test(classes)) return 'gallery'
  if (/stats|numbers|counter/i.test(classes)) return 'stats'
  if (/blog|articles?|posts?\b/i.test(classes)) return 'blog'
  if (/products?\b|shop/i.test(classes)) return 'products'
  if (/newsletter|subscribe/i.test(classes)) return 'newsletter'
  if (/cta|call.to.action/i.test(classes)) return 'cta'

  // Content-based detection
  if (!hasH1Above && el.querySelector('h1')) return 'hero'
  if (/\$\d|price|plan|month|year|\/mo|\/yr/i.test(text.slice(0, 500))) return 'pricing'
  if (/testimonial|★|⭐|review|"[^"]{20,}"/i.test(text.slice(0, 500))) return 'testimonials'
  if (/faq|frequently asked|question/i.test(combined.slice(0, 300))) return 'faq'

  const hasForms = el.querySelectorAll('form').length > 0
  if (/contact|get in touch|reach us|send.*message/i.test(combined.slice(0, 300))) return 'contact'
  if (hasForms && /email|message|name/i.test(text.slice(0, 500))) return 'contact'

  // Detect by child structure
  const cards = el.querySelectorAll('[class*="card"], [class*="col-"], [class*="grid"] > *')
  if (cards.length >= 3 && cards.length <= 6) return 'features'

  return 'unknown'
}

const extractSections = (doc: Document): DetectedSection[] => {
  const sections: DetectedSection[] = []
  let order = 0
  let hasH1 = false

  // Look at <nav>, <section>, <footer>, and top-level <div> with semantic class names
  const candidates: Element[] = []

  // nav
  doc.querySelectorAll('nav').forEach((el) => candidates.push(el))
  // sections
  doc.querySelectorAll('section, main > div, main > article, [role="main"] > div, body > div > div').forEach(
    (el) => candidates.push(el),
  )
  // footer
  doc.querySelectorAll('footer').forEach((el) => candidates.push(el))

  // Fallback: if no semantic sections, try large top-level divs
  if (candidates.length === 0) {
    doc.querySelectorAll('body > div, body > main').forEach((el) => candidates.push(el))
  }

  // De-duplicate (a section might match multiple selectors)
  const seen = new Set<Element>()

  for (const el of candidates) {
    if (seen.has(el)) continue
    seen.add(el)

    try {
      const sectionType = detectSectionType(el, hasH1)

      if (sectionType === 'hero' || el.querySelector('h1')) hasH1 = true

      const heading =
        el.querySelector('h1, h2, h3')
      const title = heading ? textOf(heading, 100) : ''
      const content = textOf(el, 200)

      const hasImages = el.querySelectorAll('img').length > 0
      const hasForm = el.querySelectorAll('form').length > 0

      // Count "items" — cards, list items in grids, etc.
      const gridChildren = el.querySelectorAll(
        '[class*="card"], [class*="col-"], li, [class*="item"]',
      )
      const itemCount = gridChildren.length

      sections.push({
        type: sectionType,
        title,
        content,
        hasImages,
        hasForm,
        itemCount,
        order: order++,
      })
    } catch {
      // skip this section on error
    }
  }

  return sections
}

// ---------------------------------------------------------------------------
// Business Type Detection
// ---------------------------------------------------------------------------

type BusinessKeywordMap = {
  type: string
  keywords: string[]
}

const BUSINESS_KEYWORDS: BusinessKeywordMap[] = [
  { type: 'restaurant', keywords: ['menu', 'restaurant', 'cuisine', 'reserv', 'dining', 'chef'] },
  { type: 'dental', keywords: ['dental', 'teeth', 'smile', 'clinic', 'dentist', 'orthodont'] },
  { type: 'law', keywords: ['law', 'attorney', 'legal', 'justice', 'lawyer', 'litigation'] },
  { type: 'fitness', keywords: ['gym', 'fitness', 'workout', 'train', 'muscle', 'crossfit'] },
  { type: 'yoga', keywords: ['yoga', 'meditation', 'wellness', 'mindful', 'chakra'] },
  { type: 'realestate', keywords: ['real estate', 'property', 'listing', 'realtor', 'mortgage'] },
  { type: 'photography', keywords: ['photo', 'portfolio', 'gallery', 'lens', 'photographer'] },
  { type: 'saas', keywords: ['saas', 'platform', 'software', 'api', 'dashboard', 'integration'] },
  { type: 'ecommerce', keywords: ['shop', 'store', 'product', 'cart', 'buy', 'checkout', 'add to cart'] },
  { type: 'education', keywords: ['course', 'learn', 'student', 'university', 'academy', 'class'] },
  { type: 'healthcare', keywords: ['health', 'patient', 'medical', 'doctor', 'hospital', 'appointment'] },
  { type: 'agency', keywords: ['agency', 'creative', 'design studio', 'branding', 'marketing agency'] },
]

const detectBusinessType = (text: string): string => {
  const lower = text.toLowerCase()
  let bestType = 'business'
  let bestScore = 0

  for (const { type, keywords } of BUSINESS_KEYWORDS) {
    let score = 0
    for (const kw of keywords) {
      if (lower.includes(kw)) score++
    }
    if (score > bestScore) {
      bestScore = score
      bestType = type
    }
  }

  return bestType
}

// ---------------------------------------------------------------------------
// Business Name Extraction
// ---------------------------------------------------------------------------

const extractBusinessName = (doc: Document, domain: string): string => {
  // 1. og:site_name
  const ogSiteName =
    doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ?? ''
  if (ogSiteName) return ogSiteName.trim()

  // 2. Title tag (before | or -)
  const title = doc.title ?? ''
  const titleParts = title.split(/[|\-–—]/)
  if (titleParts.length > 0 && titleParts[0].trim().length > 0) {
    return titleParts[0].trim()
  }

  // 3. h1
  const h1 = doc.querySelector('h1')
  if (h1) {
    const h1Text = textOf(h1, 60)
    if (h1Text) return h1Text
  }

  // 4. Domain name
  return domain.replace(/^www\./, '').split('.')[0]
}

// ---------------------------------------------------------------------------
// Main Scanner
// ---------------------------------------------------------------------------

export type ScanProgress = {
  step: number
  total: number
  label: string
}

/**
 * Scan a website URL and extract its design DNA, content, and structure.
 * Performs deep analysis including external CSS files.
 *
 * @param url - The URL of the website to scan
 * @param onProgress - Optional progress callback
 * @returns A complete ScanResult with design, content, and meta information
 */
export const scanWebsite = async (
  url: string,
  onProgress?: (progress: ScanProgress) => void,
): Promise<ScanResult> => {
  // Normalise URL
  let normalised = url.trim()
  if (!normalised.startsWith('http://') && !normalised.startsWith('https://')) {
    normalised = `https://${normalised}`
  }

  const urlObj = new URL(normalised)
  const domain = urlObj.hostname
  const baseUrl = urlObj.origin

  // Default/empty result — we'll fill in what we can
  const result: ScanResult = {
    url: normalised,
    domain,
    title: '',
    description: '',
    favicon: '',
    ogImage: '',
    colors: [],
    fonts: [],
    sections: [],
    navigation: [],
    headings: [],
    paragraphs: [],
    images: [],
    ctaButtons: [],
    seoMeta: {
      title: '',
      description: '',
      keywords: '',
      canonical: '',
      ogTags: {},
    },
    businessType: 'business',
    businessName: domain,
  }

  const totalSteps = 9
  const report = (step: number, label: string) => {
    onProgress?.({ step, total: totalSteps, label })
  }

  // Step 1: Fetch HTML (prefer server-side proxy — no CORS issues)
  report(1, 'Fetching website HTML...')
  let html: string
  let externalCSS = ''
  let usedServerProxy = false

  // Try server-side proxy first (fetches both HTML + CSS server-side)
  try {
    const serverData = await fetchViaServerProxy(normalised)
    if (serverData) {
      html = serverData.html
      externalCSS = serverData.css
      usedServerProxy = true
    } else {
      html = await fetchHtml(normalised)
    }
  } catch {
    try {
      html = await fetchHtml(normalised)
    } catch {
      return result // return empty result if we can't fetch
    }
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Step 2: Fetch external CSS files (skip if server proxy already got them)
  report(2, 'Downloading stylesheets...')
  if (!usedServerProxy || !externalCSS) {
    try {
      const clientCSS = await fetchExternalCSS(doc, baseUrl)
      externalCSS = externalCSS ? externalCSS + '\n' + clientCSS : clientCSS
    } catch {
      // continue without external CSS
    }
  }

  // Step 3: Basic meta
  report(3, 'Extracting metadata...')
  try {
    result.title = doc.title ?? ''
    result.description =
      doc.querySelector('meta[name="description"]')?.getAttribute('content') ?? ''

    const faviconLink =
      doc.querySelector('link[rel="icon"]') ??
      doc.querySelector('link[rel="shortcut icon"]')
    result.favicon = resolveUrl(faviconLink?.getAttribute('href') ?? '', baseUrl)

    result.ogImage =
      doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ?? ''
  } catch {
    // continue
  }

  // --- SEO Meta ---
  try {
    result.seoMeta = extractSeoMeta(doc)
  } catch {
    // continue
  }

  // Step 4: Colors (includes external CSS)
  report(4, 'Analyzing color palette...')
  try {
    result.colors = extractColors(doc, externalCSS)
  } catch {
    // continue
  }

  // Step 5: Fonts (includes external CSS)
  report(5, 'Detecting typography...')
  try {
    result.fonts = extractFonts(doc, externalCSS)
  } catch {
    // continue
  }

  // Step 6: Content extraction
  report(6, 'Extracting content & structure...')

  // --- Navigation ---
  try {
    result.navigation = extractNavigation(doc)
  } catch {
    // continue
  }

  // --- Headings ---
  try {
    result.headings = extractHeadings(doc)
  } catch {
    // continue
  }

  // --- Paragraphs ---
  try {
    result.paragraphs = extractParagraphs(doc)
  } catch {
    // continue
  }

  // --- Images ---
  try {
    const rawImages = extractImages(doc, baseUrl)
    result.images = classifyImageRoles(rawImages, doc, baseUrl)
  } catch {
    // continue
  }

  // --- CTA Buttons ---
  try {
    result.ctaButtons = extractCtaButtons(doc)
  } catch {
    // continue
  }

  // Step 7: Layout analysis
  report(7, 'Analyzing layout & sections...')

  // --- Sections ---
  try {
    result.sections = extractSections(doc)
  } catch {
    // continue
  }

  // --- Business Type ---
  try {
    const fullText = doc.body?.textContent ?? ''
    result.businessType = detectBusinessType(fullText)
  } catch {
    // continue
  }

  // --- Business Name ---
  try {
    result.businessName = extractBusinessName(doc, domain)
  } catch {
    // continue
  }

  // Step 8: Motion detection
  report(8, 'Detecting animations & motion...')

  // --- Motion DNA ---
  try {
    const { extractMotionDNA } = await import('./motion-scanner')
    const motionDNA = extractMotionDNA(html + '\n' + externalCSS)
    result.motion = {
      hasAnimationLibrary: motionDNA.hasAnimationLibrary,
      hasScrollAnimations: motionDNA.hasScrollAnimations,
      hasParallax: motionDNA.hasParallax,
      hasStickyHeader: motionDNA.hasStickyHeader,
      suggestedPreset: motionDNA.suggestedPreset,
    }
  } catch {
    // continue
  }

  // Store raw HTML + CSS for AI generation pipeline
  result.rawHtml = html
  result.rawCss = externalCSS

  // Step 9: AI Design Analysis
  report(9, 'AI analyzing design DNA...')
  try {
    const aiResponse = await fetch('/api/ai/analyze-design', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html: html.slice(0, 60000),
        css: externalCSS.slice(0, 30000),
        url: normalised,
      }),
    })
    if (aiResponse.ok) {
      const aiData = await aiResponse.json()
      if (aiData.ok && aiData.data) {
        result.designDna = aiData.data
      }
    }
  } catch {
    // AI analysis is optional — continue without it
  }

  return result
}
