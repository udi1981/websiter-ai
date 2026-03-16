/**
 * Motion Detector — Detects animations, transitions, scroll effects, and parallax
 *
 * Fully programmatic analysis of CSS and HTML to determine motion DNA.
 * Classifies intensity from none to cinematic.
 */

import type { MotionData, MotionIntensity } from '../types/scanner'

// ---------------------------------------------------------------------------
// Animation library detection
// ---------------------------------------------------------------------------

const detectAnimationLibrary = (combined: string): string | null => {
  if (/gsap|greensock|TweenMax|TweenLite|ScrollTrigger/i.test(combined)) return 'gsap'
  if (/framer-motion|motion\.div|AnimatePresence/i.test(combined)) return 'framer-motion'
  if (/data-aos(?:=|-)/i.test(combined)) return 'aos'
  if (/animate\.css|animate__/i.test(combined)) return 'animate.css'
  if (/lottie|bodymovin/i.test(combined)) return 'lottie'
  if (/anime\.js|animejs/i.test(combined)) return 'anime.js'
  if (/velocity\.js|velocityjs/i.test(combined)) return 'velocity'
  if (/popmotion/i.test(combined)) return 'popmotion'
  if (/motion-one|@motionone/i.test(combined)) return 'motion-one'
  return null
}

// ---------------------------------------------------------------------------
// Keyframe and transition counting
// ---------------------------------------------------------------------------

const countKeyframes = (css: string): number =>
  (css.match(/@keyframes\s/gi) || []).length

const countTransitions = (css: string): number =>
  (css.match(/transition\s*:/gi) || []).length

// ---------------------------------------------------------------------------
// Scroll animation detection
// ---------------------------------------------------------------------------

const detectScrollAnimations = (combined: string): boolean =>
  /data-aos(?:=|-)|scroll-reveal|scrollreveal|ScrollReveal|IntersectionObserver|data-scroll(?:=|-)|data-animate|scroll-trigger|waypoint/i.test(combined)

/** Extract scroll-related data attribute names found in HTML. */
const extractScrollAttributes = (html: string): string[] => {
  const attrs = new Set<string>()
  const regex = /\b(data-(?:aos|scroll|animate|parallax|reveal|speed|delay|offset|duration|easing|once|anchor)[a-z-]*)/gi
  let match: RegExpExecArray | null
  while ((match = regex.exec(html)) !== null) {
    attrs.add(match[1].toLowerCase())
  }
  return [...attrs]
}

// ---------------------------------------------------------------------------
// Parallax detection
// ---------------------------------------------------------------------------

const detectParallax = (combined: string): boolean =>
  /parallax|data-parallax|rellax|data-speed|transform:\s*translate3d.*scroll|background-attachment:\s*fixed/i.test(combined)

// ---------------------------------------------------------------------------
// Sticky header detection
// ---------------------------------------------------------------------------

const detectStickyHeader = (html: string, css: string): boolean => {
  // Check CSS for position: sticky/fixed on header/nav
  if (/(?:header|nav|\.header|\.nav|#header|#nav)[^{]*\{[^}]*position:\s*(?:sticky|fixed)/i.test(css)) {
    return true
  }
  // Check inline styles on header/nav elements
  if (/<(?:header|nav)\b[^>]*style=["'][^"']*position:\s*(?:sticky|fixed)/i.test(html)) {
    return true
  }
  // Check Tailwind classes
  if (/<(?:header|nav)\b[^>]*class=["'][^"']*(?:sticky|fixed)\b/i.test(html)) {
    return true
  }
  return false
}

// ---------------------------------------------------------------------------
// Hover effects extraction
// ---------------------------------------------------------------------------

const extractHoverEffects = (css: string): string[] => {
  const effects = new Set<string>()
  // Match :hover rules
  const hoverRegex = /:hover\s*\{([^}]+)\}/gi
  let match: RegExpExecArray | null
  while ((match = hoverRegex.exec(css)) !== null) {
    const props = match[1]
    if (/transform/i.test(props)) effects.add('transform')
    if (/scale/i.test(props)) effects.add('scale')
    if (/translate/i.test(props)) effects.add('translate')
    if (/rotate/i.test(props)) effects.add('rotate')
    if (/opacity/i.test(props)) effects.add('opacity')
    if (/box-shadow/i.test(props)) effects.add('shadow')
    if (/background/i.test(props)) effects.add('background')
    if (/color(?!:)/i.test(props)) effects.add('color')
    if (/border/i.test(props)) effects.add('border')
    if (/filter/i.test(props)) effects.add('filter')
  }
  return [...effects]
}

// ---------------------------------------------------------------------------
// Intensity classification
// ---------------------------------------------------------------------------

const classifyIntensity = (data: {
  library: string | null
  keyframes: number
  transitions: number
  scrollAnims: boolean
  parallax: boolean
  hoverCount: number
}): MotionIntensity => {
  let score = 0

  // Library presence
  if (data.library === 'gsap') score += 4
  else if (data.library === 'framer-motion') score += 4
  else if (data.library === 'lottie') score += 3
  else if (data.library) score += 2

  // Keyframes
  if (data.keyframes > 10) score += 3
  else if (data.keyframes > 3) score += 2
  else if (data.keyframes > 0) score += 1

  // Transitions
  if (data.transitions > 15) score += 2
  else if (data.transitions > 5) score += 1

  // Scroll animations
  if (data.scrollAnims) score += 2

  // Parallax
  if (data.parallax) score += 2

  // Hover effects
  if (data.hoverCount > 5) score += 2
  else if (data.hoverCount > 2) score += 1

  if (score >= 12) return 'cinematic'
  if (score >= 8) return 'dynamic'
  if (score >= 5) return 'premium'
  if (score >= 2) return 'subtle'
  return 'none'
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

/**
 * Detect animation and motion patterns from HTML and CSS.
 *
 * @param html - Raw HTML string
 * @param css - Aggregated CSS string
 * @returns Complete motion analysis data with intensity classification
 */
export const extractMotion = (html: string, css: string): MotionData => {
  const combined = html + '\n' + css

  const library = detectAnimationLibrary(combined)
  const keyframeCount = countKeyframes(css)
  const transitionCount = countTransitions(css)
  const hasScrollAnimations = detectScrollAnimations(combined)
  const hasParallax = detectParallax(combined)
  const hasStickyHeader = detectStickyHeader(html, css)
  const hoverEffects = extractHoverEffects(css)
  const scrollAttributes = extractScrollAttributes(html)

  const intensity = classifyIntensity({
    library,
    keyframes: keyframeCount,
    transitions: transitionCount,
    scrollAnims: hasScrollAnimations,
    parallax: hasParallax,
    hoverCount: hoverEffects.length,
  })

  return {
    animationLibrary: library,
    keyframeCount,
    transitionCount,
    hasScrollAnimations,
    hasParallax,
    hasStickyHeader,
    hoverEffects,
    scrollAttributes,
    intensity,
  }
}
