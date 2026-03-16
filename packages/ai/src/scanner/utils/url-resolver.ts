/**
 * URL utilities for the scanner — normalization, resolution, and filtering.
 *
 * @module scanner/utils/url-resolver
 */

/**
 * Resolve a possibly-relative URL against a base URL.
 * Returns the absolute href, or the raw string if resolution fails.
 */
export const resolveUrl = (raw: string, base: string): string => {
  if (!raw || !raw.trim()) return ''
  try {
    return new URL(raw.trim(), base).href
  } catch {
    return raw.trim()
  }
}

/**
 * Normalise a URL by stripping trailing slashes, hash fragments,
 * and common tracking query params.  Returns origin + pathname.
 */
export const normalizeUrl = (raw: string): string => {
  try {
    const u = new URL(raw)
    const path = u.pathname.replace(/\/+$/, '') || '/'
    return u.origin + path
  } catch {
    return raw
  }
}

/**
 * Check whether a URL belongs to the same domain (or subdomain) as the base.
 */
export const isSameDomain = (url: string, baseDomain: string): boolean => {
  try {
    const hostname = new URL(url).hostname
    return hostname === baseDomain || hostname.endsWith(`.${baseDomain}`)
  } catch {
    return false
  }
}

/**
 * Check whether a URL points to a crawlable HTML page (not an asset).
 */
export const isCrawlableUrl = (url: string): boolean => {
  try {
    const u = new URL(url)
    // Non-http protocols
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false
    // Static asset extensions
    const ext = u.pathname.split('.').pop()?.toLowerCase() ?? ''
    const ASSET_EXTS = new Set([
      'css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico',
      'woff', 'woff2', 'ttf', 'eot', 'pdf', 'zip', 'mp4',
      'mp3', 'webp', 'avif', 'webm', 'ogg', 'json', 'xml',
      'txt', 'csv', 'xls', 'xlsx', 'doc', 'docx', 'ppt', 'pptx',
    ])
    if (ASSET_EXTS.has(ext)) return false
    return true
  } catch {
    return false
  }
}

/**
 * Ensure a URL string starts with a protocol; default to https.
 */
export const ensureProtocol = (url: string): string => {
  const trimmed = url.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  return `https://${trimmed}`
}

/**
 * Extract the domain (hostname) from a URL string.
 */
export const extractDomain = (url: string): string => {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

/**
 * Deduplicate an array of URLs after normalisation.
 */
export const deduplicateUrls = (urls: string[]): string[] => {
  const seen = new Set<string>()
  const result: string[] = []
  for (const url of urls) {
    const norm = normalizeUrl(url)
    if (!seen.has(norm)) {
      seen.add(norm)
      result.push(url)
    }
  }
  return result
}
