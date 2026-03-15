/**
 * Motion preset definitions for the site rebuilder.
 * 6 intensity levels from none to storytelling.
 * All motion uses CSS transforms + opacity only (GPU-accelerated).
 */

export type MotionIntensity = 'none' | 'subtle' | 'premium' | 'dynamic' | 'cinematic' | 'storytelling'

export type EntranceType = 'none' | 'fadeUp' | 'fadeLeft' | 'fadeRight' | 'scaleIn' | 'clipReveal' | 'alternating'

export type HeroAnimation = 'none' | 'fadeUp' | 'splitWords' | 'clipReveal' | 'typewriter'

export type HoverEffect = 'none' | 'lift' | 'glow' | 'tilt' | 'shine' | 'border-glow'

export type MotionPreset = {
  id: MotionIntensity
  entrance: {
    type: EntranceType
    duration: number
    easing: string
    distance: number
    stagger: number
    threshold: number
  }
  hero: {
    titleAnimation: HeroAnimation
    subtitleDelay: number
    ctaDelay: number
    imageAnimation: 'none' | 'fadeUp' | 'scaleIn' | 'parallax'
    gradientShift: boolean
  }
  hover: {
    cards: HoverEffect
    buttons: HoverEffect
    images: HoverEffect
    links: HoverEffect
    duration: number
  }
  scroll: {
    parallaxDepth: number
    stickyHeader: boolean
    headerShrink: boolean
    headerBlur: boolean
    headerShadow: boolean
  }
  counter: {
    enabled: boolean
    duration: number
    easing: string
  }
}

// ---------------------------------------------------------------------------
// Preset definitions
// ---------------------------------------------------------------------------

const nonePreset: MotionPreset = {
  id: 'none',
  entrance: { type: 'none', duration: 0, easing: 'linear', distance: 0, stagger: 0, threshold: 0.1 },
  hero: { titleAnimation: 'none', subtitleDelay: 0, ctaDelay: 0, imageAnimation: 'none', gradientShift: false },
  hover: { cards: 'none', buttons: 'none', images: 'none', links: 'none', duration: 0 },
  scroll: { parallaxDepth: 0, stickyHeader: false, headerShrink: false, headerBlur: false, headerShadow: false },
  counter: { enabled: false, duration: 0, easing: 'linear' },
}

const subtlePreset: MotionPreset = {
  id: 'subtle',
  entrance: { type: 'fadeUp', duration: 600, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', distance: 20, stagger: 50, threshold: 0.15 },
  hero: { titleAnimation: 'fadeUp', subtitleDelay: 150, ctaDelay: 300, imageAnimation: 'fadeUp', gradientShift: false },
  hover: { cards: 'lift', buttons: 'lift', images: 'none', links: 'none', duration: 250 },
  scroll: { parallaxDepth: 0, stickyHeader: true, headerShrink: false, headerBlur: true, headerShadow: true },
  counter: { enabled: false, duration: 0, easing: 'linear' },
}

const premiumPreset: MotionPreset = {
  id: 'premium',
  entrance: { type: 'fadeUp', duration: 800, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', distance: 30, stagger: 80, threshold: 0.12 },
  hero: { titleAnimation: 'splitWords', subtitleDelay: 300, ctaDelay: 500, imageAnimation: 'scaleIn', gradientShift: false },
  hover: { cards: 'lift', buttons: 'glow', images: 'shine', links: 'none', duration: 300 },
  scroll: { parallaxDepth: 0.03, stickyHeader: true, headerShrink: true, headerBlur: true, headerShadow: true },
  counter: { enabled: true, duration: 2000, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
}

const dynamicPreset: MotionPreset = {
  id: 'dynamic',
  entrance: { type: 'alternating', duration: 600, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', distance: 40, stagger: 60, threshold: 0.1 },
  hero: { titleAnimation: 'clipReveal', subtitleDelay: 200, ctaDelay: 400, imageAnimation: 'scaleIn', gradientShift: true },
  hover: { cards: 'tilt', buttons: 'lift', images: 'shine', links: 'lift', duration: 250 },
  scroll: { parallaxDepth: 0.05, stickyHeader: true, headerShrink: true, headerBlur: true, headerShadow: true },
  counter: { enabled: true, duration: 1500, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
}

const cinematicPreset: MotionPreset = {
  id: 'cinematic',
  entrance: { type: 'fadeUp', duration: 1000, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', distance: 50, stagger: 120, threshold: 0.08 },
  hero: { titleAnimation: 'typewriter', subtitleDelay: 800, ctaDelay: 1200, imageAnimation: 'parallax', gradientShift: true },
  hover: { cards: 'glow', buttons: 'glow', images: 'shine', links: 'lift', duration: 400 },
  scroll: { parallaxDepth: 0.08, stickyHeader: true, headerShrink: true, headerBlur: true, headerShadow: true },
  counter: { enabled: true, duration: 2500, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
}

const storytellingPreset: MotionPreset = {
  id: 'storytelling',
  entrance: { type: 'clipReveal', duration: 1200, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', distance: 60, stagger: 150, threshold: 0.05 },
  hero: { titleAnimation: 'splitWords', subtitleDelay: 600, ctaDelay: 1000, imageAnimation: 'parallax', gradientShift: true },
  hover: { cards: 'border-glow', buttons: 'glow', images: 'shine', links: 'lift', duration: 400 },
  scroll: { parallaxDepth: 0.12, stickyHeader: true, headerShrink: true, headerBlur: true, headerShadow: true },
  counter: { enabled: true, duration: 3000, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const MOTION_PRESETS: Record<MotionIntensity, MotionPreset> = {
  none: nonePreset,
  subtle: subtlePreset,
  premium: premiumPreset,
  dynamic: dynamicPreset,
  cinematic: cinematicPreset,
  storytelling: storytellingPreset,
}

/**
 * Returns the motion preset for a given intensity level.
 */
export const getMotionPreset = (intensity: MotionIntensity): MotionPreset => {
  return MOTION_PRESETS[intensity] ?? MOTION_PRESETS.subtle
}

/**
 * Returns all available motion intensities.
 */
export const getAllMotionIntensities = (): MotionIntensity[] => {
  return ['none', 'subtle', 'premium', 'dynamic', 'cinematic', 'storytelling']
}

/**
 * Upgrades a motion intensity one level.
 */
export const upgradeMotion = (current: MotionIntensity): MotionIntensity => {
  const levels = getAllMotionIntensities()
  const idx = levels.indexOf(current)
  return levels[Math.min(idx + 1, levels.length - 1)]
}

/**
 * Downgrades a motion intensity one level.
 */
export const downgradeMotion = (current: MotionIntensity): MotionIntensity => {
  const levels = getAllMotionIntensities()
  const idx = levels.indexOf(current)
  return levels[Math.max(idx - 1, 0)]
}

/**
 * Default motion intensity per industry.
 */
export const INDUSTRY_MOTION_DEFAULTS: Record<string, MotionIntensity> = {
  law: 'subtle',
  dental: 'subtle',
  consulting: 'subtle',
  healthcare: 'subtle',
  restaurant: 'premium',
  realestate: 'premium',
  salon: 'premium',
  saas: 'dynamic',
  ecommerce: 'dynamic',
  education: 'dynamic',
  photography: 'cinematic',
  portfolio: 'cinematic',
  fitness: 'cinematic',
  yoga: 'premium',
  business: 'subtle',
  blog: 'subtle',
  construction: 'subtle',
}
