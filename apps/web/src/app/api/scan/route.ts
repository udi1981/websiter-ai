import { NextResponse } from 'next/server'

export const maxDuration = 30

/**
 * POST /api/scan
 * Server-side proxy for website scanning — bypasses CORS restrictions.
 * Fetches the target URL's HTML and CSS from the server side where there are no CORS limits.
 */
export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'URL is required' },
        { status: 400 }
      )
    }

    // Normalize URL
    let normalizedUrl = url.trim()
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`
    }

    // Validate URL
    let parsedUrl: URL
    try {
      parsedUrl = new URL(normalizedUrl)
    } catch {
      return NextResponse.json(
        { ok: false, error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Fetch HTML — server-side, no CORS restrictions
    const htmlResponse = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,he;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    })

    if (!htmlResponse.ok) {
      return NextResponse.json(
        { ok: false, error: `Failed to fetch URL: HTTP ${htmlResponse.status}` },
        { status: 502 }
      )
    }

    const html = await htmlResponse.text()

    // Extract CSS stylesheet URLs from the HTML
    const cssUrls: string[] = []
    const linkRegex = /<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi
    const linkRegex2 = /<link[^>]+href=["']([^"']+)["'][^>]*rel=["']stylesheet["'][^>]*>/gi

    for (const regex of [linkRegex, linkRegex2]) {
      let match
      while ((match = regex.exec(html)) !== null) {
        const href = match[1]
        // Skip CDN/third-party CSS that won't have design tokens
        if (/fonts\.googleapis|cdnjs|unpkg|cdn\.jsdelivr|fontawesome/i.test(href)) continue
        try {
          const fullUrl = new URL(href, parsedUrl.origin).href
          cssUrls.push(fullUrl)
        } catch {
          // skip invalid URLs
        }
      }
    }

    // Fetch CSS files in parallel (max 10, 5s timeout each)
    const cssTexts: string[] = []
    const cssPromises = cssUrls.slice(0, 10).map(async (cssUrl) => {
      try {
        const res = await fetch(cssUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/css,*/*;q=0.1',
          },
          signal: AbortSignal.timeout(5000),
        })
        if (res.ok) {
          const text = await res.text()
          // Only keep if it looks like CSS (not HTML error pages)
          if (text.length < 500000 && !text.includes('<!DOCTYPE')) {
            cssTexts.push(text)
          }
        }
      } catch {
        // skip this CSS file
      }
    })

    await Promise.allSettled(cssPromises)

    const css = cssTexts.join('\n')

    return NextResponse.json({
      ok: true,
      data: {
        html,
        css,
        url: normalizedUrl,
        finalUrl: htmlResponse.url, // in case of redirects
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { ok: false, error: `Scan failed: ${message}` },
      { status: 500 }
    )
  }
}
