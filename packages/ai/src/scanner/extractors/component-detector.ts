/**
 * Component Detector — Pure function for UI component pattern recognition
 *
 * Detects buttons, cards, forms, inputs, badges, accordions, and tabs
 * from raw HTML using regex-based parsing (no DOM required).
 */

import type { ComponentPattern, ComponentType } from '../types/scanner'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip HTML tags from a string. */
const stripTags = (html: string): string =>
  html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

/** Truncate HTML for snapshot storage. */
const truncate = (html: string, max: number): string =>
  html.replace(/\s+/g, ' ').trim().slice(0, max)

/** Extract attribute value from a tag string. */
const getAttr = (tag: string, attr: string): string => {
  const match = tag.match(new RegExp(`${attr}=["']([^"']*?)["']`, 'i'))
  return match ? match[1] : ''
}

// ---------------------------------------------------------------------------
// Button Detection
// ---------------------------------------------------------------------------

const detectButtons = (html: string): ComponentPattern[] => {
  const variants = new Map<string, { count: number; snapshot: string; attrs: Record<string, string> }>()

  // Match <button> elements
  const btnRegex = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi
  let match: RegExpExecArray | null
  while ((match = btnRegex.exec(html)) !== null) {
    const attrs = match[1] || ''
    const text = stripTags(match[2]).slice(0, 60)
    const classStr = getAttr(match[0], 'class')
    const variant = classifyButtonVariant(classStr)
    const key = `button-${variant}`
    const existing = variants.get(key)
    if (existing) {
      existing.count++
    } else {
      variants.set(key, {
        count: 1,
        snapshot: truncate(match[0], 500),
        attrs: { text, class: classStr, variant },
      })
    }
  }

  // Match <a> tags with button-like classes or role="button"
  const aBtnRegex = /<a\b([^>]*(?:class=["'][^"']*(?:btn|button|cta)[^"']*["']|role=["']button["'])[^>]*)>([\s\S]*?)<\/a>/gi
  while ((match = aBtnRegex.exec(html)) !== null) {
    const text = stripTags(match[2]).slice(0, 60)
    const classStr = getAttr(match[0], 'class')
    const variant = classifyButtonVariant(classStr)
    const key = `button-${variant}`
    const existing = variants.get(key)
    if (existing) {
      existing.count++
    } else {
      variants.set(key, {
        count: 1,
        snapshot: truncate(match[0], 500),
        attrs: { text, class: classStr, href: getAttr(match[0], 'href'), variant },
      })
    }
  }

  return [...variants.entries()].map(([, data]) => ({
    type: 'button' as ComponentType,
    variant: data.attrs.variant || 'default',
    count: data.count,
    htmlSnapshot: data.snapshot,
    attributes: data.attrs,
  }))
}

/** Classify button variant from CSS classes. */
const classifyButtonVariant = (classStr: string): string => {
  const c = classStr.toLowerCase()
  if (/outline|bordered|border-/i.test(c)) return 'outline'
  if (/ghost|text-only|link/i.test(c)) return 'ghost'
  if (/secondary|subtle|muted/i.test(c)) return 'secondary'
  if (/primary|main|cta|accent/i.test(c)) return 'primary'
  if (/icon-btn|icon-only/i.test(c)) return 'icon'
  if (/sm\b|small|compact/i.test(c)) return 'small'
  if (/lg\b|large|big/i.test(c)) return 'large'
  return 'default'
}

// ---------------------------------------------------------------------------
// Card Detection
// ---------------------------------------------------------------------------

const detectCards = (html: string): ComponentPattern[] => {
  const variants = new Map<string, { count: number; snapshot: string; attrs: Record<string, string> }>()

  // Match elements with "card" in class
  const cardRegex = /<(?:div|article|li)\b[^>]*class=["'][^"']*card[^"']*["'][^>]*>([\s\S]*?)(?=<\/(?:div|article|li)>)/gi
  let match: RegExpExecArray | null
  while ((match = cardRegex.exec(html)) !== null) {
    const inner = match[1] || ''
    const hasImage = /<img/i.test(inner)
    const hasBadge = /badge|tag|label|chip/i.test(inner)
    const hasPrice = /\$\d|€\d|£\d|₪\d|price/i.test(inner)
    const variant = [
      hasImage ? 'image' : 'text-only',
      hasBadge ? 'badge' : '',
      hasPrice ? 'price' : '',
    ].filter(Boolean).join('-') || 'default'

    const key = `card-${variant}`
    const existing = variants.get(key)
    if (existing) {
      existing.count++
    } else {
      variants.set(key, {
        count: 1,
        snapshot: truncate(match[0], 800),
        attrs: { variant, hasImage: String(hasImage), hasBadge: String(hasBadge), hasPrice: String(hasPrice) },
      })
    }
  }

  return [...variants.entries()].map(([, data]) => ({
    type: 'card' as ComponentType,
    variant: data.attrs.variant || 'default',
    count: data.count,
    htmlSnapshot: data.snapshot,
    attributes: data.attrs,
  }))
}

// ---------------------------------------------------------------------------
// Form Detection
// ---------------------------------------------------------------------------

const detectForms = (html: string): ComponentPattern[] => {
  const forms: ComponentPattern[] = []

  const formRegex = /<form\b([^>]*)>([\s\S]*?)<\/form>/gi
  let match: RegExpExecArray | null
  while ((match = formRegex.exec(html)) !== null) {
    const inner = match[2] || ''
    const action = getAttr(match[0], 'action')
    const method = getAttr(match[0], 'method') || 'get'

    // Count fields
    const inputCount = (inner.match(/<input/gi) || []).length
    const textareaCount = (inner.match(/<textarea/gi) || []).length
    const selectCount = (inner.match(/<select/gi) || []).length
    const totalFields = inputCount + textareaCount + selectCount

    // Classify purpose
    let purpose = 'unknown'
    if (/login|sign-?in/i.test(inner)) purpose = 'login'
    else if (/register|sign-?up|create.*account/i.test(inner)) purpose = 'signup'
    else if (/search/i.test(inner) || getAttr(match[0], 'role') === 'search') purpose = 'search'
    else if (/newsletter|subscribe|email.*only/i.test(inner)) purpose = 'newsletter'
    else if (/contact|message|enquir/i.test(inner)) purpose = 'contact'
    else if (/checkout|payment|billing/i.test(inner)) purpose = 'checkout'
    else if (/feedback|survey|rate/i.test(inner)) purpose = 'feedback'

    forms.push({
      type: 'form',
      variant: purpose,
      count: 1,
      htmlSnapshot: truncate(match[0], 1000),
      attributes: {
        purpose,
        action,
        method,
        fieldCount: String(totalFields),
        inputCount: String(inputCount),
        textareaCount: String(textareaCount),
        selectCount: String(selectCount),
      },
    })
  }

  return forms
}

// ---------------------------------------------------------------------------
// Input Detection
// ---------------------------------------------------------------------------

const detectInputs = (html: string): ComponentPattern[] => {
  const variants = new Map<string, { count: number; snapshot: string }>()

  const inputRegex = /<input\b([^>]*)>/gi
  let match: RegExpExecArray | null
  while ((match = inputRegex.exec(html)) !== null) {
    const inputType = getAttr(match[0], 'type') || 'text'
    // Skip hidden inputs
    if (inputType === 'hidden') continue
    const key = `input-${inputType}`
    const existing = variants.get(key)
    if (existing) {
      existing.count++
    } else {
      variants.set(key, { count: 1, snapshot: truncate(match[0], 300) })
    }
  }

  return [...variants.entries()].map(([key, data]) => ({
    type: 'input' as ComponentType,
    variant: key.replace('input-', ''),
    count: data.count,
    htmlSnapshot: data.snapshot,
    attributes: { inputType: key.replace('input-', '') },
  }))
}

// ---------------------------------------------------------------------------
// Badge/Tag Detection
// ---------------------------------------------------------------------------

const detectBadges = (html: string): ComponentPattern[] => {
  const badgeRegex = /<(?:span|div)\b[^>]*class=["'][^"']*(?:badge|tag|chip|label|pill)[^"']*["'][^>]*>([\s\S]*?)<\/(?:span|div)>/gi
  let count = 0
  let snapshot = ''
  let match: RegExpExecArray | null
  while ((match = badgeRegex.exec(html)) !== null) {
    count++
    if (!snapshot) snapshot = truncate(match[0], 300)
  }

  if (count === 0) return []
  return [{
    type: 'badge',
    variant: 'default',
    count,
    htmlSnapshot: snapshot,
    attributes: {},
  }]
}

// ---------------------------------------------------------------------------
// Accordion Detection
// ---------------------------------------------------------------------------

const detectAccordions = (html: string): ComponentPattern[] => {
  let count = 0
  let snapshot = ''

  // <details>/<summary> pattern
  const detailsRegex = /<details\b[^>]*>([\s\S]*?)<\/details>/gi
  let match: RegExpExecArray | null
  while ((match = detailsRegex.exec(html)) !== null) {
    count++
    if (!snapshot) snapshot = truncate(match[0], 600)
  }

  // Div-based accordion (class contains accordion)
  const divAccRegex = /<div\b[^>]*class=["'][^"']*accordion[^"']*["'][^>]*>([\s\S]*?)(?=<\/div>)/gi
  while ((match = divAccRegex.exec(html)) !== null) {
    count++
    if (!snapshot) snapshot = truncate(match[0], 600)
  }

  if (count === 0) return []
  return [{
    type: 'accordion',
    variant: 'default',
    count,
    htmlSnapshot: snapshot,
    attributes: {},
  }]
}

// ---------------------------------------------------------------------------
// Tab Detection
// ---------------------------------------------------------------------------

const detectTabs = (html: string): ComponentPattern[] => {
  const tabRegex = /<(?:div|ul|nav)\b[^>]*(?:class=["'][^"']*tab[^"']*["']|role=["']tablist["'])[^>]*>([\s\S]*?)(?=<\/(?:div|ul|nav)>)/gi
  let count = 0
  let snapshot = ''
  let match: RegExpExecArray | null
  while ((match = tabRegex.exec(html)) !== null) {
    count++
    if (!snapshot) snapshot = truncate(match[0], 600)
  }

  if (count === 0) return []
  return [{
    type: 'tab',
    variant: 'default',
    count,
    htmlSnapshot: snapshot,
    attributes: {},
  }]
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

/**
 * Detect all UI component patterns in raw HTML.
 *
 * @param html - Raw HTML string to analyze
 * @returns Array of detected component patterns with variants and counts
 */
export const detectComponents = (html: string): ComponentPattern[] => {
  // Remove script and style blocks to avoid false positives
  const cleanHtml = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')

  const results: ComponentPattern[] = [
    ...detectButtons(cleanHtml),
    ...detectCards(cleanHtml),
    ...detectForms(cleanHtml),
    ...detectInputs(cleanHtml),
    ...detectBadges(cleanHtml),
    ...detectAccordions(cleanHtml),
    ...detectTabs(cleanHtml),
  ]

  return results
}
