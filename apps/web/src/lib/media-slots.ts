/**
 * Media slot types for the content-aware media system.
 * Every image in a generated site is a contextual slot, not a random photo.
 */

export type MediaSlotRole =
  | 'hero-bg'
  | 'hero-image'
  | 'feature-icon'
  | 'feature-image'
  | 'product-image'
  | 'testimonial-avatar'
  | 'team-avatar'
  | 'gallery-item'
  | 'about-image'
  | 'cta-bg'
  | 'card-image'
  | 'logo'
  | 'decorative'
  | 'background-pattern'

export type MediaAspectRatio = '16:9' | '4:3' | '1:1' | '3:4' | '21:9'

export type MediaStyle = 'photorealistic' | 'lifestyle' | 'product' | 'abstract' | 'illustration' | 'minimal'

export type MediaMood = 'professional' | 'warm' | 'energetic' | 'calm' | 'luxury' | 'playful'

export type MediaSource = 'unsplash' | 'ai-generated' | 'uploaded' | 'scanned'

export type MediaSlot = {
  id: string
  role: MediaSlotRole
  section: string
  aspectRatio: MediaAspectRatio
  context: {
    headline: string
    subheadline: string
    businessType: string
    sectionPurpose: string
    targetAudience: string
  }
  prompt: string
  negativePrompt: string
  style: MediaStyle
  mood: MediaMood
  source: MediaSource
  currentUrl: string
  locked: boolean
  fallbackUrl: string
  alt: string
  mobileBehavior: 'same' | 'crop-center' | 'hide' | 'simplify'
}

/**
 * Default aspect ratios per media slot role.
 */
export const DEFAULT_ASPECT_RATIOS: Record<MediaSlotRole, MediaAspectRatio> = {
  'hero-bg': '21:9',
  'hero-image': '4:3',
  'feature-icon': '1:1',
  'feature-image': '4:3',
  'product-image': '1:1',
  'testimonial-avatar': '1:1',
  'team-avatar': '1:1',
  'gallery-item': '1:1',
  'about-image': '4:3',
  'cta-bg': '21:9',
  'card-image': '16:9',
  'logo': '1:1',
  'decorative': '16:9',
  'background-pattern': '16:9',
}

/**
 * Default moods per industry.
 */
export const INDUSTRY_MOODS: Record<string, MediaMood> = {
  restaurant: 'warm',
  dental: 'professional',
  law: 'professional',
  realestate: 'luxury',
  fitness: 'energetic',
  photography: 'calm',
  yoga: 'calm',
  saas: 'professional',
  ecommerce: 'playful',
  portfolio: 'calm',
  business: 'professional',
  blog: 'warm',
  salon: 'luxury',
  construction: 'professional',
  consulting: 'professional',
  education: 'warm',
  healthcare: 'calm',
}

/**
 * Section purpose descriptions for content-aware prompts.
 */
export const SECTION_PURPOSES: Record<string, string> = {
  hero: 'capture attention and convey brand identity',
  features: 'showcase key benefits and differentiators',
  about: 'build trust and tell the brand story',
  services: 'present service offerings clearly',
  testimonials: 'build social proof and trust',
  gallery: 'showcase work, products, or portfolio',
  team: 'humanize the brand with team faces',
  pricing: 'support decision making with clear value',
  cta: 'drive conversion with urgency',
  contact: 'encourage direct communication',
  menu: 'present food/drink offerings appetizingly',
}

/**
 * Creates a unique ID for a media slot.
 */
export const createSlotId = (section: string, role: MediaSlotRole, index = 0): string => {
  return `${section}-${role}-${index}`
}
