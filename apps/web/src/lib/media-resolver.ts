/**
 * Resolves media slots for site sections.
 * Maps section type + business type to curated Unsplash URLs,
 * with content-aware prompts ready for future AI image generation.
 */

import type { MediaSlot, MediaSlotRole, MediaStyle, MediaMood } from './media-slots'
import { DEFAULT_ASPECT_RATIOS, INDUSTRY_MOODS, SECTION_PURPOSES, createSlotId } from './media-slots'
import { generateMediaPrompt, generateAltText } from './media-prompts'
import { getCuratedPhotoId, getPortraitPhotoId, buildUnsplashUrl, buildPortraitUrl } from './media-library'

type ResolveOptions = {
  mediaStyle?: MediaStyle
  mediaMood?: MediaMood
}

/**
 * Resolves all media slots for a given section.
 * Returns curated Unsplash URLs with AI prompts pre-generated for future upgrade.
 */
export const resolveMediaForSection = (
  sectionType: string,
  headline: string,
  businessType: string,
  options?: ResolveOptions,
): MediaSlot[] => {
  const style = options?.mediaStyle ?? 'photorealistic'
  const mood = options?.mediaMood ?? INDUSTRY_MOODS[businessType] ?? 'professional'
  const purpose = SECTION_PURPOSES[sectionType] ?? 'support the content'

  const slotConfigs = getSlotsForSection(sectionType)
  const slots: MediaSlot[] = []

  for (let i = 0; i < slotConfigs.length; i++) {
    const config = slotConfigs[i]
    const slot = createMediaSlot({
      section: sectionType,
      role: config.role,
      index: i,
      headline,
      businessType,
      purpose,
      style,
      mood,
    })
    slots.push(slot)
  }

  return slots
}

/**
 * Resolves a single hero image URL for the given industry.
 */
export const resolveHeroImage = (businessType: string, width = 1920): string => {
  const photoId = getCuratedPhotoId(businessType, 'hero-bg', 0)
  if (photoId) return buildUnsplashUrl(photoId, width, 80)
  // Fallback to general business
  const fallback = getCuratedPhotoId('business', 'hero-bg', 0)
  return fallback ? buildUnsplashUrl(fallback, width, 80) : buildUnsplashUrl('1497366216548-37526070297c', width, 80)
}

/**
 * Resolves a portrait image URL for team/testimonial avatars.
 */
export const resolvePortraitImage = (index: number, width = 400): string => {
  const photoId = getPortraitPhotoId(index)
  return buildPortraitUrl(photoId, width)
}

/**
 * Resolves a section-specific image URL.
 */
export const resolveSectionImage = (businessType: string, role: MediaSlotRole, index = 0, width = 800): string => {
  const photoId = getCuratedPhotoId(businessType, role, index)
  if (photoId) return buildUnsplashUrl(photoId, width)
  // Fallback
  const fallback = getCuratedPhotoId('business', role, index) ?? getCuratedPhotoId(businessType, 'hero-bg', index)
  return fallback ? buildUnsplashUrl(fallback, width) : buildUnsplashUrl('1497366216548-37526070297c', width)
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

type SlotConfig = {
  role: MediaSlotRole
}

/**
 * Defines which media slots each section type needs.
 */
const getSlotsForSection = (sectionType: string): SlotConfig[] => {
  switch (sectionType) {
    case 'hero':
      return [{ role: 'hero-bg' }, { role: 'hero-image' }]
    case 'features':
      return [
        { role: 'feature-image' },
        { role: 'feature-image' },
        { role: 'feature-image' },
        { role: 'feature-image' },
      ]
    case 'about':
      return [{ role: 'about-image' }]
    case 'gallery':
      return Array.from({ length: 6 }, () => ({ role: 'gallery-item' as MediaSlotRole }))
    case 'team':
      return Array.from({ length: 4 }, () => ({ role: 'team-avatar' as MediaSlotRole }))
    case 'testimonials':
      return Array.from({ length: 3 }, () => ({ role: 'testimonial-avatar' as MediaSlotRole }))
    case 'services':
      return [
        { role: 'feature-image' },
        { role: 'feature-image' },
        { role: 'feature-image' },
      ]
    case 'cta':
      return [{ role: 'cta-bg' }]
    case 'contact':
      return []
    case 'pricing':
      return []
    case 'menu':
      return []
    default:
      return [{ role: 'feature-image' }]
  }
}

type CreateSlotParams = {
  section: string
  role: MediaSlotRole
  index: number
  headline: string
  businessType: string
  purpose: string
  style: MediaStyle
  mood: MediaMood
}

/**
 * Creates a fully populated MediaSlot with prompt and URL.
 */
const createMediaSlot = (params: CreateSlotParams): MediaSlot => {
  const { section, role, index, headline, businessType, purpose, style, mood } = params

  // Resolve image URL
  let currentUrl: string
  if (role === 'team-avatar' || role === 'testimonial-avatar') {
    currentUrl = resolvePortraitImage(index)
  } else {
    currentUrl = resolveSectionImage(businessType, role, index)
  }

  const slot: MediaSlot = {
    id: createSlotId(section, role, index),
    role,
    section,
    aspectRatio: DEFAULT_ASPECT_RATIOS[role],
    context: {
      headline,
      subheadline: '',
      businessType,
      sectionPurpose: purpose,
      targetAudience: getTargetAudience(businessType),
    },
    prompt: '',
    negativePrompt: '',
    style,
    mood,
    source: 'unsplash',
    currentUrl,
    locked: false,
    fallbackUrl: currentUrl,
    alt: '',
    mobileBehavior: role === 'decorative' ? 'hide' : 'same',
  }

  // Generate AI prompt and alt text
  const { prompt, negativePrompt } = generateMediaPrompt(slot)
  slot.prompt = prompt
  slot.negativePrompt = negativePrompt
  slot.alt = generateAltText(slot)

  return slot
}

/**
 * Maps business type to target audience for prompt context.
 */
const getTargetAudience = (businessType: string): string => {
  const audiences: Record<string, string> = {
    restaurant: 'food lovers, diners, couples, families',
    dental: 'patients seeking dental care, families',
    law: 'individuals and businesses needing legal counsel',
    realestate: 'home buyers, property investors, renters',
    fitness: 'health-conscious individuals, athletes, gym-goers',
    photography: 'individuals and businesses needing photography',
    yoga: 'wellness seekers, stress management, mindfulness practitioners',
    saas: 'businesses, developers, tech teams',
    ecommerce: 'online shoppers, consumers',
    portfolio: 'potential clients, employers, collaborators',
    business: 'business professionals, corporate clients',
    blog: 'readers, content consumers, niche enthusiasts',
    salon: 'beauty-conscious individuals, self-care seekers',
    construction: 'property owners, developers, businesses needing building services',
    consulting: 'businesses seeking strategic guidance',
    education: 'students, parents, lifelong learners',
    healthcare: 'patients, families, health-conscious individuals',
  }
  return audiences[businessType] ?? 'general audience'
}
