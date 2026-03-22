/**
 * Art Direction System
 *
 * Maps business context → specific premium visual direction.
 * Each direction defines concrete design parameters that flow into
 * the designer/content prompts and section selection.
 *
 * This prevents "same premium look for every site" by creating
 * intentionally differentiated visual systems per business/product.
 */

// ─── Direction Definitions ──────────────────────────────────────────

export type ArtDirection = {
  id: string
  name: string
  description: string
  /** Emotional keywords for prompt injection */
  emotionalTone: string[]
  /** Hero composition style */
  heroStyle: string
  /** Typography direction */
  typography: {
    headingStyle: string
    bodyStyle: string
    scale: 'compact' | 'standard' | 'generous' | 'cinematic'
    hebrewFont: string
    englishFont: string
  }
  /** Spacing rhythm */
  spacing: 'dense' | 'balanced' | 'airy' | 'luxurious'
  /** Background treatment */
  backgrounds: string
  /** Image/visual style */
  imageryStyle: string
  /** CTA style */
  ctaStyle: string
  /** Section density */
  sectionDensity: 'compact' | 'standard' | 'spacious'
  /** Color approach */
  colorApproach: string
  /** Motion/interaction feel */
  motionFeel: string
  /** Product presentation style */
  productPresentation: string
  /** Trust section tone */
  trustTone: string
  /** Preferred section variants */
  preferredVariants: Record<string, string[]>
  /** Preferred effects */
  preferredEffects: string[]
  /** Dark mode preference */
  preferDark: boolean
}

const DIRECTIONS: ArtDirection[] = [
  {
    id: 'minimal-luxury',
    name: 'Minimal Luxury',
    description: 'Apple-inspired clean product focus with restrained elegance',
    emotionalTone: ['refined', 'confident', 'understated', 'premium'],
    heroStyle: 'Large centered product image on clean white/light background. Minimal text, maximum whitespace. Single strong headline.',
    typography: {
      headingStyle: 'Thin or light weight, large scale, generous letter-spacing',
      bodyStyle: 'Clean, readable, moderate weight',
      scale: 'cinematic',
      hebrewFont: 'Heebo',
      englishFont: 'Inter',
    },
    spacing: 'luxurious',
    backgrounds: 'White or very light gray. No gradients. Subtle shadows for depth. Occasional soft dividers.',
    imageryStyle: 'Product photography on clean backgrounds. Studio-quality isolation. High contrast product shots.',
    ctaStyle: 'Pill-shaped, solid primary color, subtle hover. One primary CTA per section max.',
    sectionDensity: 'spacious',
    colorApproach: 'Monochromatic with one accent. Maximum 2-3 colors total. White dominates.',
    motionFeel: 'Subtle fade-ins, smooth scroll reveals. No flashy animations. Elegant transitions.',
    productPresentation: 'Hero product shots, clean spec grids, side-by-side comparison with clean lines.',
    trustTone: 'Understated social proof. Clean stat numbers. Professional testimonials.',
    preferredVariants: {
      hero: ['hero-product-showcase', 'hero-minimal-text', 'hero-split-image'],
      features: ['features-bento-grid', 'features-icon-grid'],
      pricing: ['pricing-animated-cards', 'pricing-comparison-table'],
      testimonials: ['testimonials-featured', 'testimonials-wall'],
      cta: ['cta-gradient-banner', 'cta-split-image'],
      faq: ['faq-accordion', 'faq-search'],
      footer: ['footer-multi-column', 'footer-minimal'],
    },
    preferredEffects: ['scrollReveal', 'blurFade', 'sectionFade'],
    preferDark: false,
  },
  {
    id: 'futuristic-tech',
    name: 'Futuristic Tech',
    description: 'Dark, glowing, cutting-edge technology feel',
    emotionalTone: ['innovative', 'cutting-edge', 'powerful', 'futuristic'],
    heroStyle: 'Dark background with glowing accents, gradient mesh or aurora effect. Bold statement headline with glow.',
    typography: {
      headingStyle: 'Bold or black weight, tight letter-spacing, tech feel',
      bodyStyle: 'Clean sans-serif, lighter weight for contrast',
      scale: 'generous',
      hebrewFont: 'Rubik',
      englishFont: 'Space Grotesk',
    },
    spacing: 'balanced',
    backgrounds: 'Dark navy/charcoal with gradient accents. Subtle grid patterns. Glow effects on cards.',
    imageryStyle: 'Tech product renders, glowing interfaces, dark-mode screenshots, abstract tech patterns.',
    ctaStyle: 'Gradient buttons with glow effect on hover. Shimmer animation. Bold text.',
    sectionDensity: 'standard',
    colorApproach: 'Dark base with vibrant accent (electric blue, cyan, purple). Neon-like highlights.',
    motionFeel: 'Particle backgrounds, floating elements, subtle parallax. Tech-forward animations.',
    productPresentation: 'Product renders on dark backgrounds with glow halos. Feature spotlights with icons.',
    trustTone: 'Stats-heavy, metric-driven. Counter animations. Technical credibility.',
    preferredVariants: {
      hero: ['hero-gradient-mesh', 'hero-aurora', 'hero-animated-text'],
      features: ['features-bento-grid', 'features-interactive-tabs'],
      pricing: ['pricing-animated-cards', 'pricing-gradient'],
      testimonials: ['testimonials-carousel', 'testimonials-wall'],
      cta: ['cta-gradient-banner', 'cta-floating-card'],
      faq: ['faq-accordion', 'faq-search'],
      footer: ['footer-mega', 'footer-multi-column'],
    },
    preferredEffects: ['glowCard', 'gradientMesh', 'shimmerButton', 'spotlightTitle', 'particlesCanvas'],
    preferDark: true,
  },
  {
    id: 'family-premium',
    name: 'Family-Safe Premium',
    description: 'Warm, trustworthy, premium feel for family-oriented products',
    emotionalTone: ['warm', 'trustworthy', 'safe', 'caring', 'premium'],
    heroStyle: 'Bright, warm hero with family-friendly imagery area. Reassuring headline with safety/trust messaging.',
    typography: {
      headingStyle: 'Medium-bold weight, rounded feel, friendly but professional',
      bodyStyle: 'Warm, readable, inviting',
      scale: 'generous',
      hebrewFont: 'Assistant',
      englishFont: 'DM Sans',
    },
    spacing: 'airy',
    backgrounds: 'Warm white, soft cream, or light blue tints. Rounded corners on cards. Soft shadows.',
    imageryStyle: 'Family lifestyle, children safely using products, warm lighting, genuine expressions.',
    ctaStyle: 'Rounded pills, warm primary color (blue/green/teal), friendly text. Reassuring micro-copy.',
    sectionDensity: 'spacious',
    colorApproach: 'Warm palette: soft blues, teals, gentle greens. Accent with warm orange/amber for CTAs.',
    motionFeel: 'Gentle reveals, soft fades, playful but not childish. Smooth scrolling.',
    productPresentation: 'Products in context (child wearing watch, parent using app). Comparison for age groups.',
    trustTone: 'Safety certifications prominent. Parent testimonials with names. Trust badges. Israeli-local trust signals.',
    preferredVariants: {
      hero: ['hero-split-image', 'hero-product-showcase', 'hero-gradient-mesh'],
      features: ['features-icon-grid', 'features-bento-grid'],
      pricing: ['pricing-animated-cards', 'pricing-comparison-table'],
      testimonials: ['testimonials-carousel', 'testimonials-featured'],
      cta: ['cta-gradient-banner', 'cta-split-image'],
      faq: ['faq-accordion', 'faq-search'],
      footer: ['footer-multi-column', 'footer-mega'],
    },
    preferredEffects: ['scrollReveal', 'blurFade', 'counterAnimation', 'sectionFade'],
    preferDark: false,
  },
  {
    id: 'editorial-storytelling',
    name: 'Editorial Storytelling',
    description: 'Magazine-quality content-first design with narrative flow',
    emotionalTone: ['thoughtful', 'narrative', 'cultured', 'sophisticated'],
    heroStyle: 'Full-bleed imagery with overlay text. Magazine cover feel. Strong editorial headline.',
    typography: {
      headingStyle: 'Elegant serif or display serif. Large scale, dramatic contrast.',
      bodyStyle: 'Clean serif for long-form, sans for UI elements',
      scale: 'cinematic',
      hebrewFont: 'Frank Ruhl Libre',
      englishFont: 'Playfair Display',
    },
    spacing: 'luxurious',
    backgrounds: 'Clean white with occasional full-bleed dark sections. High contrast alternation.',
    imageryStyle: 'Editorial photography, lifestyle shots, brand storytelling imagery. Magazine quality.',
    ctaStyle: 'Understated text links or minimal outlined buttons. Let content drive action.',
    sectionDensity: 'spacious',
    colorApproach: 'Mostly neutral (black, white, warm gray). One refined accent (burgundy, forest, navy).',
    motionFeel: 'Parallax imagery, smooth scroll-linked animations. Page-turn feeling.',
    productPresentation: 'Products as lifestyle objects. In-context storytelling. Rich descriptions.',
    trustTone: 'Story-driven testimonials. Press quotes. Award mentions with editorial treatment.',
    preferredVariants: {
      hero: ['hero-fullscreen-image', 'hero-parallax-layers', 'hero-split-image'],
      features: ['features-alternating', 'features-icon-grid'],
      pricing: ['pricing-comparison-table', 'pricing-animated-cards'],
      testimonials: ['testimonials-featured', 'testimonials-wall'],
      cta: ['cta-split-image', 'cta-gradient-banner'],
      faq: ['faq-accordion'],
      footer: ['footer-multi-column', 'footer-minimal'],
    },
    preferredEffects: ['parallaxFloat', 'scrollReveal', 'blurFade', 'textGradient'],
    preferDark: false,
  },
  {
    id: 'high-energy-commerce',
    name: 'High-Energy Commerce',
    description: 'Bold, conversion-focused, urgency-driven commercial feel',
    emotionalTone: ['bold', 'energetic', 'urgent', 'exciting', 'deal-driven'],
    heroStyle: 'Bold colors, price callouts, product grid or deal spotlight. Action-heavy.',
    typography: {
      headingStyle: 'Extra-bold, compact, impactful. Price numbers large.',
      bodyStyle: 'Clean, scannable, bullet-friendly',
      scale: 'compact',
      hebrewFont: 'Secular One',
      englishFont: 'Outfit',
    },
    spacing: 'dense',
    backgrounds: 'Vibrant sections, gradient banners, color-blocked regions. High visual energy.',
    imageryStyle: 'Product shots with badges (SALE, NEW, BEST). Deal-focused compositions.',
    ctaStyle: 'Large, bold buttons with urgency. "Buy Now", "Limited Offer". Bright contrast colors.',
    sectionDensity: 'compact',
    colorApproach: 'Bold primaries with high contrast. Red/orange for urgency. Yellow for highlights.',
    motionFeel: 'Counter animations, badge bounces, shimmer buttons, attention-grabbing effects.',
    productPresentation: 'Price-forward product cards. Comparison tables. Deal/bundle highlights.',
    trustTone: 'Review scores, purchase counts, delivery guarantees. Social proof numbers.',
    preferredVariants: {
      hero: ['hero-gradient-mesh', 'hero-product-showcase'],
      features: ['features-bento-grid', 'features-icon-grid'],
      pricing: ['pricing-animated-cards', 'pricing-gradient'],
      testimonials: ['testimonials-wall', 'testimonials-carousel'],
      cta: ['cta-gradient-banner', 'cta-floating-card'],
      faq: ['faq-accordion'],
      footer: ['footer-multi-column'],
    },
    preferredEffects: ['counterAnimation', 'shimmerButton', 'scrollReveal', 'glowCard'],
    preferDark: false,
  },
  {
    id: 'clinical-premium',
    name: 'Clinical Premium',
    description: 'Clean, trustworthy, evidence-based professional feel',
    emotionalTone: ['professional', 'trustworthy', 'clean', 'evidence-based'],
    heroStyle: 'Clean white hero with professional imagery. Authority headline. Credentials visible.',
    typography: {
      headingStyle: 'Medium weight, clean proportions, professional authority',
      bodyStyle: 'Highly readable, moderate size, comfortable line height',
      scale: 'standard',
      hebrewFont: 'Heebo',
      englishFont: 'DM Sans',
    },
    spacing: 'balanced',
    backgrounds: 'White, very light blue or green tints. Clinical cleanliness. Subtle borders.',
    imageryStyle: 'Professional headshots, clean office/clinic spaces, credential badges.',
    ctaStyle: 'Professional blue/teal buttons. "Schedule Consultation", "Book Appointment".',
    sectionDensity: 'standard',
    colorApproach: 'White + one professional accent (teal, navy, forest green). Minimal color usage.',
    motionFeel: 'Minimal, professional animations. Smooth reveals. No playful effects.',
    productPresentation: 'Service tier cards. Process/timeline visuals. Before/after if relevant.',
    trustTone: 'Credentials prominent. Professional associations. Years of experience. Certifications.',
    preferredVariants: {
      hero: ['hero-minimal-text', 'hero-split-image'],
      features: ['features-icon-grid', 'features-alternating'],
      pricing: ['pricing-comparison-table', 'pricing-animated-cards'],
      testimonials: ['testimonials-featured', 'testimonials-wall'],
      cta: ['cta-gradient-banner'],
      faq: ['faq-accordion', 'faq-search'],
      footer: ['footer-multi-column'],
    },
    preferredEffects: ['scrollReveal', 'sectionFade'],
    preferDark: false,
  },
]

// ─── Direction Selection ────────────────────────────────────────────

type SelectionInput = {
  industry: string
  businessType: string
  designDirection?: string
  targetAudience?: string
  productType?: string
  scanDesignDna?: Record<string, unknown>
}

/** Map industries/business types to best-fit art directions */
const INDUSTRY_DIRECTION_MAP: Record<string, string> = {
  // Tech / electronics
  'consumer_electronics': 'family-premium',
  'tech': 'futuristic-tech',
  'saas': 'futuristic-tech',
  'software': 'futuristic-tech',
  'ai': 'futuristic-tech',
  'startup': 'futuristic-tech',
  // Family / kids
  'kids': 'family-premium',
  'education': 'family-premium',
  'childcare': 'family-premium',
  'toys': 'family-premium',
  // Professional
  'law': 'clinical-premium',
  'legal': 'clinical-premium',
  'accounting': 'clinical-premium',
  'consulting': 'clinical-premium',
  'medical': 'clinical-premium',
  'dental': 'clinical-premium',
  'healthcare': 'clinical-premium',
  // Lifestyle / luxury
  'fashion': 'editorial-storytelling',
  'beauty': 'editorial-storytelling',
  'jewelry': 'minimal-luxury',
  'luxury': 'minimal-luxury',
  'design': 'minimal-luxury',
  'architecture': 'minimal-luxury',
  'interior': 'editorial-storytelling',
  // Food
  'restaurant': 'editorial-storytelling',
  'cafe': 'editorial-storytelling',
  'food': 'editorial-storytelling',
  'catering': 'editorial-storytelling',
  // Commerce
  'ecommerce': 'high-energy-commerce',
  'retail': 'high-energy-commerce',
  'store': 'high-energy-commerce',
  'shop': 'high-energy-commerce',
  // Fitness / wellness
  'fitness': 'high-energy-commerce',
  'gym': 'high-energy-commerce',
  'yoga': 'editorial-storytelling',
  'wellness': 'editorial-storytelling',
  'spa': 'editorial-storytelling',
  // Real estate
  'realestate': 'minimal-luxury',
  'real_estate': 'minimal-luxury',
  'property': 'minimal-luxury',
  // Creative
  'photography': 'editorial-storytelling',
  'portfolio': 'minimal-luxury',
  'agency': 'futuristic-tech',
  'creative': 'editorial-storytelling',
}

/** Select the best art direction for a given business context */
export const selectArtDirection = (input: SelectionInput): ArtDirection => {
  // Check explicit design direction from user
  if (input.designDirection) {
    const lower = input.designDirection.toLowerCase()
    if (lower.includes('apple') || lower.includes('minimal') || lower.includes('luxury')) {
      return DIRECTIONS.find(d => d.id === 'minimal-luxury')!
    }
    if (lower.includes('tech') || lower.includes('futuristic') || lower.includes('dark')) {
      return DIRECTIONS.find(d => d.id === 'futuristic-tech')!
    }
    if (lower.includes('family') || lower.includes('kids') || lower.includes('safe')) {
      return DIRECTIONS.find(d => d.id === 'family-premium')!
    }
    if (lower.includes('editorial') || lower.includes('magazine') || lower.includes('storytelling')) {
      return DIRECTIONS.find(d => d.id === 'editorial-storytelling')!
    }
    if (lower.includes('energy') || lower.includes('bold') || lower.includes('commerce') || lower.includes('sale')) {
      return DIRECTIONS.find(d => d.id === 'high-energy-commerce')!
    }
    if (lower.includes('clinical') || lower.includes('medical') || lower.includes('professional')) {
      return DIRECTIONS.find(d => d.id === 'clinical-premium')!
    }
  }

  // Check target audience hints
  if (input.targetAudience) {
    const lower = input.targetAudience.toLowerCase()
    if (lower.includes('הורים') || lower.includes('parents') || lower.includes('ילדים') || lower.includes('children') || lower.includes('families')) {
      return DIRECTIONS.find(d => d.id === 'family-premium')!
    }
  }

  // Map by industry
  const industry = (input.industry || input.businessType || '').toLowerCase().replace(/[^a-z_]/g, '')
  const directionId = INDUSTRY_DIRECTION_MAP[industry]
  if (directionId) {
    return DIRECTIONS.find(d => d.id === directionId)!
  }

  // Default: minimal luxury as the safest premium option
  return DIRECTIONS.find(d => d.id === 'minimal-luxury')!
}

/** Get all available directions for UI listing */
export const getAvailableDirections = (): Pick<ArtDirection, 'id' | 'name' | 'description'>[] =>
  DIRECTIONS.map(({ id, name, description }) => ({ id, name, description }))

/** Get direction by ID */
export const getDirectionById = (id: string): ArtDirection | undefined =>
  DIRECTIONS.find(d => d.id === id)

// ─── Prompt Injection ───────────────────────────────────────────────

/** Build the art direction block for injection into designer/content prompts */
export const buildArtDirectionPrompt = (direction: ArtDirection): string => {
  return `
=== ART DIRECTION: ${direction.name.toUpperCase()} ===
Visual Identity: ${direction.description}
Emotional Tone: ${direction.emotionalTone.join(', ')}

HERO COMPOSITION:
${direction.heroStyle}

TYPOGRAPHY:
- Headings: ${direction.typography.headingStyle}
- Body: ${direction.typography.bodyStyle}
- Scale: ${direction.typography.scale}
- Hebrew font: ${direction.typography.hebrewFont}, English: ${direction.typography.englishFont}

SPACING & DENSITY:
- Section spacing: ${direction.spacing}
- Section density: ${direction.sectionDensity}

BACKGROUNDS:
${direction.backgrounds}

IMAGERY & VISUALS:
${direction.imageryStyle}

CTA STYLE:
${direction.ctaStyle}

COLOR APPROACH:
${direction.colorApproach}

MOTION & INTERACTION:
${direction.motionFeel}

PRODUCT PRESENTATION:
${direction.productPresentation}

TRUST SECTION TONE:
${direction.trustTone}

PREFERRED SECTION VARIANTS:
${Object.entries(direction.preferredVariants).map(([cat, variants]) => `- ${cat}: ${variants.join(', ')}`).join('\n')}

PREFERRED EFFECTS:
${direction.preferredEffects.join(', ')}

DARK MODE: ${direction.preferDark ? 'YES — use dark backgrounds' : 'NO — use light/white backgrounds'}

CRITICAL: Every design decision must align with the "${direction.name}" direction.
The page must feel cohesive from top to bottom under this visual system.
Do NOT mix different visual languages. Stay consistent with this direction throughout.
=== END ART DIRECTION ===`
}
