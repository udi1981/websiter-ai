/**
 * Extracts motion/animation DNA from scanned HTML.
 * Detects animation libraries, CSS keyframes, transitions,
 * parallax, sticky nav, and maps to a suggested MotionIntensity.
 */

import type { MotionIntensity } from './motion-presets'

export type ScannedMotion = {
  hasAnimationLibrary: string | null
  cssKeyframeCount: number
  cssTransitionCount: number
  hasScrollAnimations: boolean
  hasParallax: boolean
  hasStickyHeader: boolean
  hasAOS: boolean
  hasAnimateCSS: boolean
  hasGSAP: boolean
  hasFramerMotion: boolean
  suggestedPreset: MotionIntensity
}

/**
 * Analyzes HTML for motion/animation patterns and returns a motion profile.
 */
export const extractMotionDNA = (html: string): ScannedMotion => {
  const result: ScannedMotion = {
    hasAnimationLibrary: null,
    cssKeyframeCount: 0,
    cssTransitionCount: 0,
    hasScrollAnimations: false,
    hasParallax: false,
    hasStickyHeader: false,
    hasAOS: false,
    hasAnimateCSS: false,
    hasGSAP: false,
    hasFramerMotion: false,
    suggestedPreset: 'subtle',
  }

  const lower = html.toLowerCase()

  // Detect animation libraries via script src/imports
  if (lower.includes('gsap') || lower.includes('greensock')) {
    result.hasGSAP = true
    result.hasAnimationLibrary = 'GSAP'
  }
  if (lower.includes('framer-motion') || lower.includes('framer motion')) {
    result.hasFramerMotion = true
    result.hasAnimationLibrary = result.hasAnimationLibrary ? result.hasAnimationLibrary + ', Framer Motion' : 'Framer Motion'
  }
  if (lower.includes('aos.js') || lower.includes('aos.css') || lower.includes('unpkg.com/aos')) {
    result.hasAOS = true
    result.hasAnimationLibrary = result.hasAnimationLibrary ? result.hasAnimationLibrary + ', AOS' : 'AOS'
  }
  if (lower.includes('animate.css') || lower.includes('animate.min.css')) {
    result.hasAnimateCSS = true
    result.hasAnimationLibrary = result.hasAnimationLibrary ? result.hasAnimationLibrary + ', Animate.css' : 'Animate.css'
  }

  // Count CSS keyframes in <style> blocks
  const styleBlocks = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) ?? []
  for (const block of styleBlocks) {
    const keyframes = block.match(/@keyframes/gi)
    if (keyframes) result.cssKeyframeCount += keyframes.length

    const transitions = block.match(/transition\s*:/gi)
    if (transitions) result.cssTransitionCount += transitions.length
  }

  // Detect data-aos attributes (AOS library)
  if (html.includes('data-aos=') || html.includes('data-aos-')) {
    result.hasScrollAnimations = true
    result.hasAOS = true
  }

  // Detect animate__ class prefixes (Animate.css)
  if (html.includes('animate__')) {
    result.hasAnimateCSS = true
  }

  // Detect parallax indicators
  if (
    lower.includes('data-parallax') ||
    lower.includes('rellax') ||
    lower.includes('class="parallax"') ||
    lower.includes("class='parallax'") ||
    lower.includes('parallax-window') ||
    lower.includes('jarallax')
  ) {
    result.hasParallax = true
  }

  // Detect sticky/fixed nav
  if (
    lower.includes('position: fixed') ||
    lower.includes('position:fixed') ||
    lower.includes('position: sticky') ||
    lower.includes('position:sticky') ||
    lower.includes('fixed top-0') ||
    lower.includes('sticky top-0')
  ) {
    result.hasStickyHeader = true
  }

  // Detect IntersectionObserver usage
  if (lower.includes('intersectionobserver')) {
    result.hasScrollAnimations = true
  }

  // Map findings to suggested preset
  result.suggestedPreset = mapToPreset(result)

  return result
}

/**
 * Maps scanned motion indicators to a suggested MotionIntensity level.
 */
const mapToPreset = (motion: ScannedMotion): MotionIntensity => {
  let score = 0

  // Score based on detected features
  if (motion.hasGSAP) score += 4
  if (motion.hasFramerMotion) score += 4
  if (motion.hasAOS) score += 2
  if (motion.hasAnimateCSS) score += 2
  if (motion.hasScrollAnimations) score += 2
  if (motion.hasParallax) score += 3
  if (motion.hasStickyHeader) score += 1
  if (motion.cssKeyframeCount > 5) score += 2
  else if (motion.cssKeyframeCount > 0) score += 1
  if (motion.cssTransitionCount > 10) score += 2
  else if (motion.cssTransitionCount > 3) score += 1

  // Map score to preset
  if (score === 0) return 'subtle'
  if (score <= 2) return 'subtle'
  if (score <= 5) return 'premium'
  if (score <= 8) return 'dynamic'
  if (score <= 12) return 'cinematic'
  return 'storytelling'
}
