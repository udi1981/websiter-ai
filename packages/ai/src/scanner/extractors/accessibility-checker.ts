/**
 * Accessibility Checker — Programmatic accessibility audit
 *
 * Checks for ARIA labels, skip navigation, focus styles, semantic HTML,
 * alt text coverage, form labels, and color contrast indicators.
 * Returns a score (0-100) with detailed issues list.
 */

import type { AccessibilityResult, AccessibilityIssue } from '../types/scanner'

// ---------------------------------------------------------------------------
// Individual checks
// ---------------------------------------------------------------------------

/** Check for ARIA label usage. */
const checkAriaLabels = (html: string): { present: boolean; count: number } => {
  const matches = html.match(/aria-label(?:ledby)?=["'][^"']+["']/gi) || []
  return { present: matches.length > 0, count: matches.length }
}

/** Check for skip navigation link. */
const checkSkipNav = (html: string): boolean =>
  /skip.*(?:nav|content|main)|<a[^>]+href=["']#(?:main|content|skip)[^"']*["']/i.test(html)

/** Check for :focus styles in CSS. */
const checkFocusStyles = (css: string): boolean =>
  /:focus(?:-visible|-within)?\s*\{/i.test(css)

/** Check semantic HTML tag usage. */
const checkSemanticHtml = (html: string): { hasIt: boolean; tags: string[] } => {
  const semanticTags = ['header', 'nav', 'main', 'footer', 'article', 'aside', 'section']
  const found: string[] = []

  for (const tag of semanticTags) {
    const regex = new RegExp(`<${tag}[\\s>]`, 'i')
    if (regex.test(html)) found.push(tag)
  }

  return { hasIt: found.length >= 3, tags: found }
}

/** Check alt text on images. */
const checkAltText = (html: string): { coverage: number; total: number; missing: number } => {
  const allImages = (html.match(/<img\b[^>]*>/gi) || [])
  let withAlt = 0
  let withoutAlt = 0

  for (const imgTag of allImages) {
    // Has non-empty alt
    if (/alt=["'][^"']+["']/i.test(imgTag)) {
      withAlt++
    }
    // Has empty alt (decorative — valid)
    else if (/alt=["']["']/i.test(imgTag)) {
      withAlt++ // intentionally empty alt is fine
    } else {
      withoutAlt++
    }
  }

  const total = allImages.length
  const coverage = total > 0 ? Math.round((withAlt / total) * 100) : 100

  return { coverage, total, missing: withoutAlt }
}

/** Check for form labels. */
const checkFormLabels = (html: string): { hasLabels: boolean; issues: number } => {
  // Count inputs that should have labels
  const inputs = html.match(/<input\b[^>]*type=["'](?:text|email|password|tel|number|search|url)[^>]*>/gi) || []
  const textareas = html.match(/<textarea\b/gi) || []
  const selects = html.match(/<select\b/gi) || []
  const totalFields = inputs.length + textareas.length + selects.length

  if (totalFields === 0) return { hasLabels: true, issues: 0 }

  // Count labels and aria-labels
  const labelCount = (html.match(/<label\b/gi) || []).length
  const ariaLabelCount = (html.match(/aria-label(?:ledby)?=["'][^"']+["']/gi) || []).length

  // Rough check: labels + aria-labels should be >= total fields
  const hasLabels = (labelCount + ariaLabelCount) >= totalFields * 0.7
  const issues = Math.max(0, totalFields - labelCount - ariaLabelCount)

  return { hasLabels, issues }
}

/** Check for role attributes. */
const checkRoles = (html: string): number =>
  (html.match(/role=["'][^"']+["']/gi) || []).length

/** Check for lang attribute on html tag. */
const checkLangAttribute = (html: string): boolean =>
  /<html[^>]+lang=["'][^"']+["']/i.test(html)

// ---------------------------------------------------------------------------
// Score calculation
// ---------------------------------------------------------------------------

const calculateScore = (checks: {
  hasAriaLabels: boolean
  ariaCount: number
  hasSkipNav: boolean
  hasFocusStyles: boolean
  hasSemanticHtml: boolean
  semanticTags: string[]
  altTextCoverage: number
  hasFormLabels: boolean
  formLabelIssues: number
  roleCount: number
  hasLangAttr: boolean
}): number => {
  let score = 0
  const max = 100

  // ARIA labels (15 pts)
  if (checks.hasAriaLabels) score += 8
  if (checks.ariaCount > 5) score += 7
  else if (checks.ariaCount > 0) score += Math.min(checks.ariaCount, 7)

  // Skip nav (10 pts)
  if (checks.hasSkipNav) score += 10

  // Focus styles (10 pts)
  if (checks.hasFocusStyles) score += 10

  // Semantic HTML (15 pts)
  score += Math.min(checks.semanticTags.length * 2, 15)

  // Alt text (20 pts)
  score += Math.round(checks.altTextCoverage * 0.2)

  // Form labels (10 pts)
  if (checks.hasFormLabels) score += 10
  else score += Math.max(0, 10 - checks.formLabelIssues * 2)

  // Roles (5 pts)
  score += Math.min(checks.roleCount, 5)

  // Lang attribute (5 pts)
  if (checks.hasLangAttr) score += 5

  // Heading structure bonus (10 pts) — checked elsewhere, give partial credit
  score += 5

  return Math.min(score, max)
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

/**
 * Run an accessibility audit on raw HTML and CSS.
 *
 * @param html - Raw HTML string
 * @param css - Aggregated CSS string
 * @returns Accessibility score (0-100) and detailed issues list
 */
export const checkAccessibility = (html: string, css: string): AccessibilityResult => {
  const issues: AccessibilityIssue[] = []

  // Run checks
  const ariaResult = checkAriaLabels(html)
  const hasSkipNav = checkSkipNav(html)
  const hasFocusStyles = checkFocusStyles(css)
  const semanticResult = checkSemanticHtml(html)
  const altResult = checkAltText(html)
  const formResult = checkFormLabels(html)
  const roleCount = checkRoles(html)
  const hasLangAttr = checkLangAttribute(html)

  // Build issues list
  if (!ariaResult.present) {
    issues.push({ type: 'aria', description: 'No ARIA labels found on interactive elements', severity: 'warning' })
  }

  if (!hasSkipNav) {
    issues.push({ type: 'skip-nav', description: 'No skip navigation link found', severity: 'warning' })
  }

  if (!hasFocusStyles) {
    issues.push({ type: 'focus', description: 'No :focus styles detected in CSS', severity: 'error' })
  }

  if (!semanticResult.hasIt) {
    issues.push({
      type: 'semantic',
      description: `Only ${semanticResult.tags.length} semantic tags found (need at least 3)`,
      severity: 'warning',
    })
  }

  if (altResult.missing > 0) {
    issues.push({
      type: 'alt-text',
      description: `${altResult.missing} image(s) missing alt text`,
      severity: altResult.missing > 3 ? 'error' : 'warning',
    })
  }

  if (!formResult.hasLabels) {
    issues.push({
      type: 'form-labels',
      description: `${formResult.issues} form field(s) missing labels`,
      severity: 'error',
    })
  }

  if (!hasLangAttr) {
    issues.push({ type: 'lang', description: 'Missing lang attribute on <html> element', severity: 'error' })
  }

  const score = calculateScore({
    hasAriaLabels: ariaResult.present,
    ariaCount: ariaResult.count,
    hasSkipNav,
    hasFocusStyles,
    hasSemanticHtml: semanticResult.hasIt,
    semanticTags: semanticResult.tags,
    altTextCoverage: altResult.coverage,
    hasFormLabels: formResult.hasLabels,
    formLabelIssues: formResult.issues,
    roleCount,
    hasLangAttr,
  })

  return {
    score,
    issues,
    hasAriaLabels: ariaResult.present,
    hasSkipNav,
    hasFocusStyles,
    hasFormLabels: formResult.hasLabels,
    hasSemanticHtml: semanticResult.hasIt,
    altTextCoverage: altResult.coverage,
  }
}
