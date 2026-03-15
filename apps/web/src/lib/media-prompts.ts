/**
 * Content-aware prompt generator for AI image generation.
 * Generates image prompts based on section context, headline, business type, and mood.
 */

import type { MediaSlot, MediaSlotRole, MediaMood, MediaStyle } from './media-slots'

type PromptResult = {
  prompt: string
  negativePrompt: string
}

/**
 * Generates an AI image prompt and negative prompt for a media slot.
 */
export const generateMediaPrompt = (slot: MediaSlot): PromptResult => {
  const { role, context, style, mood } = slot
  const { headline, businessType, sectionPurpose } = context

  // Build prompt components
  const subjectPrompt = getSubjectPrompt(role, businessType, headline)
  const stylePrompt = getStylePrompt(style)
  const moodPrompt = getMoodPrompt(mood)
  const qualityPrompt = 'high quality, professional photography, sharp focus, good lighting'

  const prompt = [subjectPrompt, moodPrompt, stylePrompt, qualityPrompt]
    .filter(Boolean)
    .join(', ')

  const negativePrompt = getNegativePrompt(businessType, role)

  return { prompt, negativePrompt }
}

/**
 * Industry + role prompt patterns for subject matter.
 */
const INDUSTRY_ROLE_PROMPTS: Record<string, Record<string, string>> = {
  restaurant: {
    'hero-bg': 'elegant restaurant interior, warm ambient lighting, set dining table, fine dining atmosphere',
    'hero-image': 'beautifully plated gourmet dish, restaurant setting, food photography',
    'feature-image': 'fresh ingredients close-up, culinary preparation, cooking ingredients',
    'about-image': 'chef preparing food in professional kitchen, cooking action shot',
    'gallery-item': 'gourmet food plating, restaurant atmosphere, culinary artistry',
    'team-avatar': 'professional chef portrait, kitchen uniform, friendly expression',
    'cta-bg': 'warm restaurant ambiance, candlelight dining, evening atmosphere',
  },
  dental: {
    'hero-bg': 'modern dental clinic interior, bright clean space, healthcare environment',
    'hero-image': 'happy patient smiling, bright natural light, dental care',
    'feature-image': 'modern dental equipment close-up, clean clinical tools',
    'about-image': 'friendly dental team, professional healthcare providers',
    'gallery-item': 'clean dental office, patient care, modern clinic',
    'team-avatar': 'professional dentist portrait, lab coat, friendly smile',
    'cta-bg': 'bright healthcare environment, clean medical space',
  },
  law: {
    'hero-bg': 'prestigious courthouse architecture, columns, legal symbolism',
    'hero-image': 'legal books and gavel, professional law office',
    'feature-image': 'document signing, legal consultation, professional meeting',
    'about-image': 'professional lawyers in office, serious but approachable',
    'gallery-item': 'law office interior, legal library, conference room',
    'team-avatar': 'professional lawyer portrait, formal attire, confident expression',
    'cta-bg': 'justice scales, law books, elegant office',
  },
  realestate: {
    'hero-bg': 'luxury modern home exterior, beautiful architecture, curb appeal',
    'hero-image': 'stunning home interior, open floor plan, natural light',
    'feature-image': 'modern apartment feature, kitchen or living room detail',
    'about-image': 'real estate agent showing property to clients',
    'gallery-item': 'luxury home room, interior design, staged property',
    'team-avatar': 'professional real estate agent, business attire, friendly',
    'cta-bg': 'aerial view of luxury neighborhood, modern architecture',
  },
  fitness: {
    'hero-bg': 'modern gym interior, fitness equipment, energetic atmosphere',
    'hero-image': 'athletic person exercising, dynamic movement, gym setting',
    'feature-image': 'exercise equipment detail, workout tools, fitness gear',
    'about-image': 'personal trainer with client, training session, motivation',
    'gallery-item': 'gym workout action, fitness class, exercise equipment',
    'team-avatar': 'fit personal trainer, athletic wear, confident pose',
    'cta-bg': 'energetic gym atmosphere, workout motivation, fitness',
  },
  photography: {
    'hero-bg': 'creative photography studio, professional lighting setup',
    'hero-image': 'stunning portrait photography, artistic composition',
    'feature-image': 'camera lens close-up, photography equipment detail',
    'about-image': 'photographer at work, creative process, behind the scenes',
    'gallery-item': 'artistic photograph, professional composition, creative work',
    'team-avatar': 'creative photographer portrait, camera, artistic style',
    'cta-bg': 'photography studio atmosphere, creative lighting',
  },
  saas: {
    'hero-bg': 'modern tech workspace, clean desk, digital devices',
    'hero-image': 'software dashboard on laptop screen, modern UI design',
    'feature-image': 'abstract technology illustration, digital innovation',
    'about-image': 'tech team collaborating, modern office, startup culture',
    'gallery-item': 'software interface, app screen, digital product',
    'team-avatar': 'tech professional, modern office attire, approachable',
    'cta-bg': 'abstract tech gradient, futuristic digital background',
  },
  ecommerce: {
    'hero-bg': 'stylish product display, shopping environment, retail',
    'hero-image': 'attractive product photography, lifestyle setting',
    'feature-image': 'product detail shot, package, unboxing experience',
    'about-image': 'warehouse operations, product packaging, team at work',
    'gallery-item': 'product lifestyle photography, styled product shot',
    'team-avatar': 'friendly customer service representative, approachable',
    'cta-bg': 'shopping bags, luxury retail, excited customer',
  },
  salon: {
    'hero-bg': 'luxury beauty salon interior, elegant styling stations',
    'hero-image': 'beautiful hair styling result, salon treatment',
    'feature-image': 'beauty treatment close-up, salon tools, cosmetics',
    'about-image': 'professional stylist at work, salon atmosphere',
    'gallery-item': 'hair transformation, beauty treatment result, nail art',
    'team-avatar': 'beauty professional, salon attire, friendly smile',
    'cta-bg': 'elegant spa atmosphere, beauty and relaxation',
  },
  yoga: {
    'hero-bg': 'serene yoga studio, natural light, peaceful atmosphere',
    'hero-image': 'person in yoga pose, meditation, mindfulness',
    'feature-image': 'wellness element, candle, incense, zen garden',
    'about-image': 'yoga instructor leading class, peaceful setting',
    'gallery-item': 'yoga practice, wellness retreat, nature meditation',
    'team-avatar': 'yoga instructor portrait, peaceful expression, active wear',
    'cta-bg': 'serene nature landscape, peaceful wellness setting',
  },
  construction: {
    'hero-bg': 'impressive building under construction, cranes, urban development',
    'hero-image': 'construction workers on site, hard hats, teamwork',
    'feature-image': 'construction tools, blueprints, architectural plans',
    'about-image': 'construction team reviewing plans, professional builders',
    'gallery-item': 'completed building project, architecture, construction result',
    'team-avatar': 'construction professional, hard hat, confident expression',
    'cta-bg': 'modern architecture, completed building, impressive structure',
  },
  consulting: {
    'hero-bg': 'modern conference room, professional meeting space',
    'hero-image': 'business consulting session, strategy discussion',
    'feature-image': 'data analysis, charts, strategy planning documents',
    'about-image': 'consultant advising client, professional interaction',
    'gallery-item': 'business presentation, workshop, professional event',
    'team-avatar': 'business consultant portrait, formal attire, trustworthy',
    'cta-bg': 'modern office skyline, professional business environment',
  },
  education: {
    'hero-bg': 'modern classroom or university campus, learning environment',
    'hero-image': 'students engaged in learning, interactive education',
    'feature-image': 'educational tools, books, digital learning devices',
    'about-image': 'teacher with students, interactive learning session',
    'gallery-item': 'campus life, classroom activity, student achievements',
    'team-avatar': 'friendly educator portrait, approachable, knowledgeable',
    'cta-bg': 'inspiring library, university campus, academic setting',
  },
  healthcare: {
    'hero-bg': 'modern medical facility, clean healthcare environment',
    'hero-image': 'caring doctor with patient, compassionate healthcare',
    'feature-image': 'medical equipment, health technology, diagnostic tools',
    'about-image': 'healthcare team, medical professionals, caring staff',
    'gallery-item': 'medical facility, patient care, health and wellness',
    'team-avatar': 'medical professional portrait, lab coat, stethoscope',
    'cta-bg': 'calming healthcare environment, modern medical space',
  },
}

/**
 * Gets the subject matter prompt based on role + industry.
 */
const getSubjectPrompt = (role: MediaSlotRole, businessType: string, headline: string): string => {
  const industry = businessType.toLowerCase()
  const rolePrompts = INDUSTRY_ROLE_PROMPTS[industry]

  if (rolePrompts?.[role]) {
    return rolePrompts[role]
  }

  // Fallback: generic prompts by role
  const genericRolePrompts: Record<string, string> = {
    'hero-bg': 'professional business environment, modern workspace',
    'hero-image': 'professional team at work, business excellence',
    'feature-image': 'abstract professional concept, business innovation',
    'about-image': 'team collaboration, professional environment',
    'gallery-item': 'professional work showcase, business quality',
    'team-avatar': 'professional business portrait, friendly expression',
    'testimonial-avatar': 'professional headshot, natural expression',
    'cta-bg': 'inspiring professional background, call to action',
    'card-image': 'professional concept image, business related',
    'product-image': 'product showcase, clean presentation',
  }

  return genericRolePrompts[role] ?? `professional ${headline.slice(0, 50)}`
}

/**
 * Gets style modifiers for the prompt.
 */
const getStylePrompt = (style: MediaStyle): string => {
  const styleMap: Record<MediaStyle, string> = {
    photorealistic: 'photorealistic, DSLR quality, sharp details',
    lifestyle: 'lifestyle photography, candid, natural moments',
    product: 'product photography, clean background, studio lighting',
    abstract: 'abstract, geometric patterns, artistic',
    illustration: 'digital illustration, clean lines, modern art style',
    minimal: 'minimal, clean, lots of white space, simple composition',
  }
  return styleMap[style] ?? ''
}

/**
 * Gets mood modifiers for the prompt.
 */
const getMoodPrompt = (mood: MediaMood): string => {
  const moodMap: Record<MediaMood, string> = {
    professional: 'professional atmosphere, corporate, polished',
    warm: 'warm tones, golden light, inviting, cozy',
    energetic: 'vibrant, dynamic, high energy, bold colors',
    calm: 'serene, peaceful, soft tones, tranquil',
    luxury: 'luxurious, elegant, premium, rich textures',
    playful: 'fun, colorful, bright, lively atmosphere',
  }
  return moodMap[mood] ?? ''
}

/**
 * Gets negative prompt based on industry and role.
 */
const getNegativePrompt = (businessType: string, role: MediaSlotRole): string => {
  const base = 'blurry, low quality, pixelated, watermark, text overlay, logo, distorted, ugly, cartoon, anime, drawing'

  const industryNegatives: Record<string, string> = {
    dental: `${base}, scary medical equipment, blood, pain, needles`,
    healthcare: `${base}, blood, scary medical procedures, pain`,
    law: `${base}, informal, casual, messy`,
    fitness: `${base}, unhealthy, overweight, sedentary`,
    restaurant: `${base}, unappetizing, messy food, dirty kitchen`,
    salon: `${base}, messy, untidy, bad hair`,
  }

  return industryNegatives[businessType.toLowerCase()] ?? base
}

/**
 * Generates SEO-optimized alt text for a media slot.
 */
export const generateAltText = (slot: MediaSlot): string => {
  const { role, context } = slot
  const { headline, businessType } = context

  if (role === 'hero-bg' || role === 'hero-image') {
    return headline || `${businessType} - hero image`
  }
  if (role === 'team-avatar' || role === 'testimonial-avatar') {
    return 'team member portrait'
  }
  if (role === 'gallery-item') {
    return `${businessType} gallery - ${headline || 'showcase'}`
  }
  if (role === 'about-image') {
    return `About ${businessType} - ${headline || 'our story'}`
  }
  return headline || `${businessType} ${role.replace('-', ' ')}`
}
