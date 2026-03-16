/**
 * Tech Stack Detector — Identifies frameworks, CMS, analytics, CDN, and hosting
 *
 * Fully programmatic detection using HTML patterns, class names,
 * script sources, and meta tags.
 */

import type { TechStackInfo } from '../types/scanner'

// ---------------------------------------------------------------------------
// Framework detection
// ---------------------------------------------------------------------------

const detectFramework = (html: string): string | null => {
  // Next.js
  if (/__next\b|__NEXT_DATA__|_next\/static/i.test(html)) return 'Next.js'

  // Nuxt
  if (/__nuxt\b|__NUXT__|_nuxt\//i.test(html)) return 'Nuxt'

  // Vue (generic, not Nuxt)
  if (/data-v-[a-f0-9]|__vue_|Vue\.config/i.test(html)) return 'Vue'

  // Angular
  if (/ng-version|ng-app|ng-controller|_ng[A-Z]/i.test(html)) return 'Angular'

  // React (generic, not Next.js)
  if (/data-reactroot|data-reactid|__REACT/i.test(html)) return 'React'

  // Svelte
  if (/svelte-[a-z0-9]|__svelte/i.test(html)) return 'Svelte'

  // Gatsby
  if (/gatsby-/i.test(html) && /___gatsby/i.test(html)) return 'Gatsby'

  // Astro
  if (/astro-[a-z0-9]|data-astro/i.test(html)) return 'Astro'

  // Remix
  if (/__remix_context|__remixContext/i.test(html)) return 'Remix'

  return null
}

// ---------------------------------------------------------------------------
// CSS framework detection
// ---------------------------------------------------------------------------

const detectCssFramework = (html: string, css: string): string | null => {
  const combined = html + '\n' + css

  // Tailwind — look for utility class patterns
  const tailwindClasses = (html.match(/class=["'][^"']*(?:flex|grid|p-\d|m-\d|text-(?:sm|lg|xl)|bg-(?:blue|red|green|gray)|rounded-|shadow-|border-)/gi) || []).length
  if (tailwindClasses > 10) return 'Tailwind CSS'

  // Bootstrap
  if (/class=["'][^"']*(?:container|row|col-(?:sm|md|lg|xl)|btn-(?:primary|secondary)|navbar-)/i.test(html)) return 'Bootstrap'

  // Material UI / MUI
  if (/Mui[A-Z]|class=["'][^"']*(?:MuiButton|MuiCard|MuiPaper)/i.test(html)) return 'Material UI'

  // Chakra UI
  if (/chakra-ui|class=["'][^"']*css-[a-z0-9]+/i.test(combined)) return 'Chakra UI'

  // Bulma
  if (/class=["'][^"']*(?:is-primary|is-info|is-success|is-warning|is-danger|columns|is-mobile)/i.test(html)) return 'Bulma'

  // Foundation
  if (/class=["'][^"']*(?:small-\d+|medium-\d+|large-\d+|cell|grid-x|grid-y)/i.test(html)) return 'Foundation'

  // Ant Design
  if (/class=["'][^"']*ant-/i.test(html)) return 'Ant Design'

  return null
}

// ---------------------------------------------------------------------------
// CMS detection
// ---------------------------------------------------------------------------

const detectCms = (html: string): string | null => {
  // WordPress
  if (/wp-content|wp-includes|wp-json|wordpress/i.test(html)) return 'WordPress'

  // Wix
  if (/wix\.com|_wixCssRecovery|X-Wix/i.test(html)) return 'Wix'

  // Squarespace
  if (/squarespace\.com|sqsp\.|sqs-block|static\.squarespace/i.test(html)) return 'Squarespace'

  // Webflow
  if (/webflow\.com|data-wf-|w-dyn-|w-layout/i.test(html)) return 'Webflow'

  // Shopify
  if (/shopify\.com|cdn\.shopify|Shopify\.theme/i.test(html)) return 'Shopify'

  // Drupal
  if (/\/sites\/default\/|drupal\.org|Drupal\.settings/i.test(html)) return 'Drupal'

  // Joomla
  if (/\/media\/jui\/|Joomla!/i.test(html)) return 'Joomla'

  // Ghost
  if (/ghost\.(?:org|io)|class=["'][^"']*ghost-/i.test(html)) return 'Ghost'

  // HubSpot
  if (/hubspot\.com|hs-scripts|hbspt\./i.test(html)) return 'HubSpot'

  // Contentful
  if (/contentful\.com|ctfassets\.net/i.test(html)) return 'Contentful'

  // Framer
  if (/framer\.com|framerusercontent/i.test(html)) return 'Framer'

  return null
}

// ---------------------------------------------------------------------------
// Analytics detection
// ---------------------------------------------------------------------------

const detectAnalytics = (html: string): string[] => {
  const analytics: string[] = []

  if (/google-analytics\.com|gtag|GoogleAnalyticsObject|ga\(/i.test(html)) analytics.push('Google Analytics')
  if (/googletagmanager\.com|GTM-/i.test(html)) analytics.push('Google Tag Manager')
  if (/hotjar\.com|hjid|hj\(/i.test(html)) analytics.push('Hotjar')
  if (/mixpanel\.com|mixpanel\.init/i.test(html)) analytics.push('Mixpanel')
  if (/segment\.com|analytics\.load/i.test(html)) analytics.push('Segment')
  if (/facebook\.net\/.*fbevents|fbq\(/i.test(html)) analytics.push('Facebook Pixel')
  if (/plausible\.io/i.test(html)) analytics.push('Plausible')
  if (/umami\.is|umami\./i.test(html)) analytics.push('Umami')
  if (/posthog\.com|posthog\.init/i.test(html)) analytics.push('PostHog')
  if (/clarity\.ms|clarity\(/i.test(html)) analytics.push('Microsoft Clarity')
  if (/heap-api|heapanalytics/i.test(html)) analytics.push('Heap')
  if (/amplitude\.com|amplitude\.init/i.test(html)) analytics.push('Amplitude')
  if (/sentry\.io|Sentry\.init/i.test(html)) analytics.push('Sentry')

  return analytics
}

// ---------------------------------------------------------------------------
// CDN detection
// ---------------------------------------------------------------------------

const detectCdn = (html: string): string | null => {
  if (/cdn\.cloudflare\.com|cf-ray|__cf_bm/i.test(html)) return 'Cloudflare'
  if (/fastly\.net|x-fastly/i.test(html)) return 'Fastly'
  if (/akamai\.net|akamaized\.net/i.test(html)) return 'Akamai'
  if (/cloudfront\.net/i.test(html)) return 'CloudFront'
  if (/cdn\.jsdelivr\.net/i.test(html)) return 'jsDelivr'
  if (/unpkg\.com/i.test(html)) return 'unpkg'
  return null
}

// ---------------------------------------------------------------------------
// Hosting detection
// ---------------------------------------------------------------------------

const detectHosting = (html: string): string | null => {
  if (/vercel\.app|__vercel|x-vercel/i.test(html)) return 'Vercel'
  if (/netlify\.app|netlify\.com/i.test(html)) return 'Netlify'
  if (/herokuapp\.com/i.test(html)) return 'Heroku'
  if (/\.amazonaws\.com|aws\.amazon/i.test(html)) return 'AWS'
  if (/\.azurewebsites\.net|azure\.com/i.test(html)) return 'Azure'
  if (/\.appspot\.com|googleapis\.com/i.test(html)) return 'Google Cloud'
  if (/render\.com/i.test(html)) return 'Render'
  if (/fly\.io|fly\.dev/i.test(html)) return 'Fly.io'
  if (/railway\.app/i.test(html)) return 'Railway'
  if (/pages\.dev|workers\.dev/i.test(html)) return 'Cloudflare'
  return null
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

/**
 * Detect the technology stack used by a website from its HTML and CSS.
 *
 * @param html - Raw HTML string (aggregated from all pages)
 * @param css - Aggregated CSS string
 * @returns Detected technology stack information
 */
export const extractTechStack = (html: string, css: string): TechStackInfo => ({
  framework: detectFramework(html),
  cssFramework: detectCssFramework(html, css),
  cms: detectCms(html),
  analytics: detectAnalytics(html),
  cdn: detectCdn(html),
  hosting: detectHosting(html),
})
