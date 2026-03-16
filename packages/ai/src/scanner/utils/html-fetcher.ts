/**
 * Robust HTML page fetcher with retries, timeout, and realistic headers.
 *
 * Designed for Node.js serverless environments (Vercel / Cloudflare Workers).
 *
 * @module scanner/utils/html-fetcher
 */

import type { Result } from '@ubuilder/types'
import { ok, err } from '@ubuilder/types'

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

const DEFAULT_HEADERS: Record<string, string> = {
  'User-Agent': USER_AGENT,
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,he;q=0.8',
  'Accept-Encoding': 'gzip, deflate',
  Connection: 'keep-alive',
}

export type FetchPageResult = {
  /** Final HTML content */
  html: string
  /** Final URL after redirects */
  finalUrl: string
  /** HTTP status code */
  statusCode: number
  /** Content-Length or measured length */
  contentLength: number
}

/**
 * Fetch a single page with retries, timeout, and redirect following.
 *
 * @param url - The URL to fetch
 * @param timeoutMs - Per-attempt timeout in ms (default 15000)
 * @param maxRetries - Max retry attempts (default 2)
 * @returns Result containing the page HTML and metadata, or an error
 */
export const fetchPage = async (
  url: string,
  timeoutMs = 15000,
  maxRetries = 2,
): Promise<Result<FetchPageResult>> => {
  let lastError = ''

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeoutMs)

      const response = await fetch(url, {
        headers: DEFAULT_HEADERS,
        redirect: 'follow',
        signal: controller.signal,
      })

      clearTimeout(timer)

      if (!response.ok) {
        lastError = `HTTP ${response.status}: ${response.statusText}`
        continue
      }

      const contentType = response.headers.get('content-type') ?? ''
      const isHtml =
        contentType.includes('text/html') ||
        contentType.includes('application/xhtml') ||
        contentType.includes('text/plain')

      if (!isHtml) {
        return err(`Non-HTML content type: ${contentType}`)
      }

      const html = await response.text()

      return ok({
        html,
        finalUrl: response.url,
        statusCode: response.status,
        contentLength: html.length,
      })
    } catch (error: unknown) {
      const isAbort = error instanceof Error && error.name === 'AbortError'
      if (isAbort) {
        lastError = `Timeout after ${timeoutMs}ms`
      } else {
        lastError = error instanceof Error ? error.message : 'Unknown fetch error'
      }
    }
  }

  return err(`Failed to fetch ${url} after ${maxRetries + 1} attempts: ${lastError}`)
}

/**
 * Fetch a CSS stylesheet. Returns the CSS text or empty string on failure.
 *
 * @param url - The stylesheet URL
 * @param timeoutMs - Timeout in ms (default 5000)
 */
export const fetchCss = async (
  url: string,
  timeoutMs = 5000,
): Promise<string> => {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/css,*/*' },
      redirect: 'follow',
      signal: controller.signal,
    })

    clearTimeout(timer)

    if (!response.ok) return ''

    const text = await response.text()

    // Sanity check: reject if it looks like an HTML error page or is huge
    if (text.length > 500_000) return ''
    if (text.trimStart().startsWith('<!DOCTYPE') || text.trimStart().startsWith('<html')) return ''

    return text
  } catch {
    return ''
  }
}

/**
 * Fetch a resource and return raw text (for sitemap.xml, robots.txt, etc.).
 *
 * @param url - Resource URL
 * @param timeoutMs - Timeout in ms (default 5000)
 */
export const fetchText = async (
  url: string,
  timeoutMs = 5000,
): Promise<string | null> => {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      redirect: 'follow',
      signal: controller.signal,
    })

    clearTimeout(timer)

    if (!response.ok) return null
    return await response.text()
  } catch {
    return null
  }
}
