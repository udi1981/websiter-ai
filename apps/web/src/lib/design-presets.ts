/**
 * Design presets per industry for the site rebuilder.
 * Each preset defines colors, fonts, hero style, section layout,
 * corner radius, and Unsplash search terms.
 */

export type ColorPalette = {
  primary: string
  primaryHover: string
  secondary: string
  background: string
  backgroundAlt: string
  text: string
  textMuted: string
  border: string
  accent: string
}

export type FontCombo = {
  heading: string
  body: string
  headingWeight: string
  bodyWeight: string
}

export type IndustryPreset = {
  id: string
  label: string
  palette: ColorPalette
  fonts: FontCombo
  heroStyle: 'fullscreen-image' | 'split' | 'gradient' | 'video-bg' | 'minimal'
  sectionStyle: 'cards' | 'list' | 'grid' | 'alternating'
  cornerRadius: string
  unsplashTerms: string[]
}

const presets: IndustryPreset[] = [
  {
    id: 'restaurant',
    label: 'Restaurant & Food',
    palette: {
      primary: '#B45309',
      primaryHover: '#92400E',
      secondary: '#F59E0B',
      background: '#FFFBEB',
      backgroundAlt: '#FEF3C7',
      text: '#1C1917',
      textMuted: '#78716C',
      border: '#E7E5E4',
      accent: '#D97706',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
      headingWeight: '700',
      bodyWeight: '400',
    },
    heroStyle: 'fullscreen-image',
    sectionStyle: 'cards',
    cornerRadius: 'rounded-xl',
    unsplashTerms: ['restaurant interior', 'gourmet food', 'dining table', 'chef cooking'],
  },
  {
    id: 'dental',
    label: 'Dental Clinic',
    palette: {
      primary: '#2563EB',
      primaryHover: '#1D4ED8',
      secondary: '#60A5FA',
      background: '#FFFFFF',
      backgroundAlt: '#F0F9FF',
      text: '#0F172A',
      textMuted: '#64748B',
      border: '#E2E8F0',
      accent: '#38BDF8',
    },
    fonts: {
      heading: 'DM Sans',
      body: 'Inter',
      headingWeight: '700',
      bodyWeight: '400',
    },
    heroStyle: 'split',
    sectionStyle: 'cards',
    cornerRadius: 'rounded-2xl',
    unsplashTerms: ['dental clinic', 'dentist smile', 'dental care', 'white teeth'],
  },
  {
    id: 'law',
    label: 'Law Firm',
    palette: {
      primary: '#1E3A5F',
      primaryHover: '#162D4A',
      secondary: '#D4AF37',
      background: '#FFFFFF',
      backgroundAlt: '#F8FAFC',
      text: '#0F172A',
      textMuted: '#475569',
      border: '#CBD5E1',
      accent: '#D4AF37',
    },
    fonts: {
      heading: 'Cormorant',
      body: 'Inter',
      headingWeight: '700',
      bodyWeight: '400',
    },
    heroStyle: 'minimal',
    sectionStyle: 'alternating',
    cornerRadius: 'rounded-lg',
    unsplashTerms: ['law office', 'courthouse', 'legal books', 'justice scales'],
  },
  {
    id: 'realestate',
    label: 'Real Estate',
    palette: {
      primary: '#1C1917',
      primaryHover: '#0C0A09',
      secondary: '#D4AF37',
      background: '#FFFFFF',
      backgroundAlt: '#FAFAF9',
      text: '#1C1917',
      textMuted: '#57534E',
      border: '#D6D3D1',
      accent: '#D4AF37',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Outfit',
      headingWeight: '700',
      bodyWeight: '400',
    },
    heroStyle: 'fullscreen-image',
    sectionStyle: 'grid',
    cornerRadius: 'rounded-xl',
    unsplashTerms: ['luxury home', 'modern apartment', 'real estate', 'house interior'],
  },
  {
    id: 'fitness',
    label: 'Fitness & Gym',
    palette: {
      primary: '#DC2626',
      primaryHover: '#B91C1C',
      secondary: '#F97316',
      background: '#0A0A0A',
      backgroundAlt: '#171717',
      text: '#FAFAFA',
      textMuted: '#A3A3A3',
      border: '#262626',
      accent: '#EF4444',
    },
    fonts: {
      heading: 'Oswald',
      body: 'Roboto',
      headingWeight: '700',
      bodyWeight: '400',
    },
    heroStyle: 'fullscreen-image',
    sectionStyle: 'cards',
    cornerRadius: 'rounded-xl',
    unsplashTerms: ['gym workout', 'fitness training', 'bodybuilding', 'crossfit'],
  },
  {
    id: 'photography',
    label: 'Photography',
    palette: {
      primary: '#18181B',
      primaryHover: '#09090B',
      secondary: '#FAFAFA',
      background: '#FFFFFF',
      backgroundAlt: '#F4F4F5',
      text: '#18181B',
      textMuted: '#71717A',
      border: '#E4E4E7',
      accent: '#18181B',
    },
    fonts: {
      heading: 'Space Grotesk',
      body: 'Inter',
      headingWeight: '600',
      bodyWeight: '400',
    },
    heroStyle: 'fullscreen-image',
    sectionStyle: 'grid',
    cornerRadius: 'rounded-lg',
    unsplashTerms: ['photography studio', 'camera lens', 'portrait photography', 'photo gallery'],
  },
  {
    id: 'yoga',
    label: 'Yoga & Wellness',
    palette: {
      primary: '#4D7C0F',
      primaryHover: '#3F6212',
      secondary: '#A3E635',
      background: '#FEFCE8',
      backgroundAlt: '#F7FEE7',
      text: '#1A2E05',
      textMuted: '#65A30D',
      border: '#D9F99D',
      accent: '#84CC16',
    },
    fonts: {
      heading: 'Cormorant Garamond',
      body: 'Nunito',
      headingWeight: '600',
      bodyWeight: '400',
    },
    heroStyle: 'gradient',
    sectionStyle: 'alternating',
    cornerRadius: 'rounded-2xl',
    unsplashTerms: ['yoga meditation', 'wellness spa', 'zen nature', 'peaceful retreat'],
  },
  {
    id: 'saas',
    label: 'SaaS / Software',
    palette: {
      primary: '#6366F1',
      primaryHover: '#4F46E5',
      secondary: '#A78BFA',
      background: '#FFFFFF',
      backgroundAlt: '#F5F3FF',
      text: '#0F172A',
      textMuted: '#64748B',
      border: '#E2E8F0',
      accent: '#8B5CF6',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
      headingWeight: '800',
      bodyWeight: '400',
    },
    heroStyle: 'gradient',
    sectionStyle: 'cards',
    cornerRadius: 'rounded-2xl',
    unsplashTerms: ['saas dashboard', 'tech workspace', 'software ui', 'modern office'],
  },
  {
    id: 'ecommerce',
    label: 'E-Commerce',
    palette: {
      primary: '#059669',
      primaryHover: '#047857',
      secondary: '#34D399',
      background: '#FFFFFF',
      backgroundAlt: '#F9FAFB',
      text: '#111827',
      textMuted: '#6B7280',
      border: '#E5E7EB',
      accent: '#10B981',
    },
    fonts: {
      heading: 'DM Sans',
      body: 'Inter',
      headingWeight: '700',
      bodyWeight: '400',
    },
    heroStyle: 'split',
    sectionStyle: 'grid',
    cornerRadius: 'rounded-xl',
    unsplashTerms: ['online shopping', 'product display', 'ecommerce store', 'shopping bag'],
  },
  {
    id: 'portfolio',
    label: 'Creative Portfolio',
    palette: {
      primary: '#18181B',
      primaryHover: '#09090B',
      secondary: '#EC4899',
      background: '#09090B',
      backgroundAlt: '#18181B',
      text: '#FAFAFA',
      textMuted: '#A1A1AA',
      border: '#27272A',
      accent: '#F472B6',
    },
    fonts: {
      heading: 'Space Mono',
      body: 'Inter',
      headingWeight: '700',
      bodyWeight: '400',
    },
    heroStyle: 'minimal',
    sectionStyle: 'grid',
    cornerRadius: 'rounded-lg',
    unsplashTerms: ['creative design', 'art studio', 'graphic design', 'abstract art'],
  },
  {
    id: 'business',
    label: 'Business / Corporate',
    palette: {
      primary: '#334155',
      primaryHover: '#1E293B',
      secondary: '#3B82F6',
      background: '#FFFFFF',
      backgroundAlt: '#F8FAFC',
      text: '#0F172A',
      textMuted: '#64748B',
      border: '#E2E8F0',
      accent: '#2563EB',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
      headingWeight: '700',
      bodyWeight: '400',
    },
    heroStyle: 'split',
    sectionStyle: 'cards',
    cornerRadius: 'rounded-xl',
    unsplashTerms: ['business team', 'corporate office', 'business meeting', 'skyscraper'],
  },
  {
    id: 'blog',
    label: 'Blog / Magazine',
    palette: {
      primary: '#92400E',
      primaryHover: '#78350F',
      secondary: '#F59E0B',
      background: '#FFFBF5',
      backgroundAlt: '#FEF3C7',
      text: '#1C1917',
      textMuted: '#78716C',
      border: '#E7E5E4',
      accent: '#D97706',
    },
    fonts: {
      heading: 'Merriweather',
      body: 'Inter',
      headingWeight: '700',
      bodyWeight: '400',
    },
    heroStyle: 'minimal',
    sectionStyle: 'list',
    cornerRadius: 'rounded-lg',
    unsplashTerms: ['writing desk', 'typewriter', 'journal notebook', 'coffee and book'],
  },
  {
    id: 'salon',
    label: 'Beauty Salon',
    palette: {
      primary: '#DB2777',
      primaryHover: '#BE185D',
      secondary: '#F9A8D4',
      background: '#FFFFFF',
      backgroundAlt: '#FDF2F8',
      text: '#1C1917',
      textMuted: '#78716C',
      border: '#FECDD3',
      accent: '#EC4899',
    },
    fonts: {
      heading: 'Poppins',
      body: 'Inter',
      headingWeight: '600',
      bodyWeight: '400',
    },
    heroStyle: 'fullscreen-image',
    sectionStyle: 'cards',
    cornerRadius: 'rounded-2xl',
    unsplashTerms: ['beauty salon', 'hair styling', 'nail art', 'spa treatment'],
  },
  {
    id: 'construction',
    label: 'Construction',
    palette: {
      primary: '#1C1917',
      primaryHover: '#0C0A09',
      secondary: '#EAB308',
      background: '#FFFFFF',
      backgroundAlt: '#F5F5F4',
      text: '#1C1917',
      textMuted: '#57534E',
      border: '#D6D3D1',
      accent: '#FACC15',
    },
    fonts: {
      heading: 'Oswald',
      body: 'Roboto',
      headingWeight: '700',
      bodyWeight: '400',
    },
    heroStyle: 'fullscreen-image',
    sectionStyle: 'cards',
    cornerRadius: 'rounded-lg',
    unsplashTerms: ['construction site', 'building architecture', 'hard hat worker', 'crane'],
  },
  {
    id: 'consulting',
    label: 'Consulting',
    palette: {
      primary: '#1E3A5F',
      primaryHover: '#162D4A',
      secondary: '#0D9488',
      background: '#FFFFFF',
      backgroundAlt: '#F0FDFA',
      text: '#0F172A',
      textMuted: '#64748B',
      border: '#E2E8F0',
      accent: '#14B8A6',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
      headingWeight: '700',
      bodyWeight: '400',
    },
    heroStyle: 'gradient',
    sectionStyle: 'alternating',
    cornerRadius: 'rounded-xl',
    unsplashTerms: ['consulting meeting', 'strategy planning', 'business advisor', 'conference room'],
  },
  {
    id: 'education',
    label: 'Education',
    palette: {
      primary: '#2563EB',
      primaryHover: '#1D4ED8',
      secondary: '#16A34A',
      background: '#FFFFFF',
      backgroundAlt: '#F0FDF4',
      text: '#0F172A',
      textMuted: '#64748B',
      border: '#E2E8F0',
      accent: '#22C55E',
    },
    fonts: {
      heading: 'Poppins',
      body: 'Inter',
      headingWeight: '700',
      bodyWeight: '400',
    },
    heroStyle: 'split',
    sectionStyle: 'cards',
    cornerRadius: 'rounded-2xl',
    unsplashTerms: ['education classroom', 'students learning', 'university campus', 'online learning'],
  },
  {
    id: 'healthcare',
    label: 'Healthcare',
    palette: {
      primary: '#0D9488',
      primaryHover: '#0F766E',
      secondary: '#5EEAD4',
      background: '#FFFFFF',
      backgroundAlt: '#F0FDFA',
      text: '#0F172A',
      textMuted: '#64748B',
      border: '#E2E8F0',
      accent: '#14B8A6',
    },
    fonts: {
      heading: 'DM Sans',
      body: 'Inter',
      headingWeight: '700',
      bodyWeight: '400',
    },
    heroStyle: 'split',
    sectionStyle: 'cards',
    cornerRadius: 'rounded-2xl',
    unsplashTerms: ['healthcare doctor', 'medical clinic', 'hospital care', 'health wellness'],
  },
]

/**
 * Detects the best matching industry preset based on a business type string
 * and an optional array of extracted brand colors.
 */
export const detectIndustryFromScan = (
  businessType: string,
  colors: string[] = [],
): IndustryPreset => {
  const normalized = businessType.toLowerCase().trim()

  // Direct keyword matching
  const keywordMap: Record<string, string> = {
    restaurant: 'restaurant',
    cafe: 'restaurant',
    food: 'restaurant',
    bakery: 'restaurant',
    catering: 'restaurant',
    bar: 'restaurant',
    pizza: 'restaurant',
    dental: 'dental',
    dentist: 'dental',
    orthodont: 'dental',
    law: 'law',
    legal: 'law',
    attorney: 'law',
    lawyer: 'law',
    'real estate': 'realestate',
    realestate: 'realestate',
    property: 'realestate',
    realtor: 'realestate',
    housing: 'realestate',
    fitness: 'fitness',
    gym: 'fitness',
    workout: 'fitness',
    crossfit: 'fitness',
    training: 'fitness',
    photo: 'photography',
    photography: 'photography',
    photographer: 'photography',
    studio: 'photography',
    yoga: 'yoga',
    meditation: 'yoga',
    wellness: 'yoga',
    pilates: 'yoga',
    saas: 'saas',
    software: 'saas',
    app: 'saas',
    tech: 'saas',
    startup: 'saas',
    platform: 'saas',
    ecommerce: 'ecommerce',
    'e-commerce': 'ecommerce',
    shop: 'ecommerce',
    store: 'ecommerce',
    retail: 'ecommerce',
    portfolio: 'portfolio',
    designer: 'portfolio',
    creative: 'portfolio',
    freelance: 'portfolio',
    artist: 'portfolio',
    business: 'business',
    corporate: 'business',
    company: 'business',
    enterprise: 'business',
    blog: 'blog',
    magazine: 'blog',
    news: 'blog',
    journal: 'blog',
    salon: 'salon',
    beauty: 'salon',
    hair: 'salon',
    spa: 'salon',
    nails: 'salon',
    cosmetic: 'salon',
    construction: 'construction',
    builder: 'construction',
    contractor: 'construction',
    plumber: 'construction',
    electrician: 'construction',
    renovation: 'construction',
    consult: 'consulting',
    consulting: 'consulting',
    advisory: 'consulting',
    coach: 'consulting',
    mentor: 'consulting',
    education: 'education',
    school: 'education',
    university: 'education',
    course: 'education',
    tutor: 'education',
    academy: 'education',
    health: 'healthcare',
    healthcare: 'healthcare',
    medical: 'healthcare',
    clinic: 'healthcare',
    doctor: 'healthcare',
    hospital: 'healthcare',
    therapy: 'healthcare',
    therapist: 'healthcare',
  }

  for (const [keyword, presetId] of Object.entries(keywordMap)) {
    if (normalized.includes(keyword)) {
      const match = presets.find((p) => p.id === presetId)
      if (match) {
        // If brand colors are provided, override primary/accent
        if (colors.length > 0) {
          return {
            ...match,
            palette: {
              ...match.palette,
              primary: colors[0],
              accent: colors[1] ?? colors[0],
            },
          }
        }
        return match
      }
    }
  }

  // Default to business preset if nothing matches
  const fallback = presets.find((p) => p.id === 'business')!
  if (colors.length > 0) {
    return {
      ...fallback,
      palette: {
        ...fallback.palette,
        primary: colors[0],
        accent: colors[1] ?? colors[0],
      },
    }
  }
  return fallback
}

/**
 * Returns a single preset by industry ID. Falls back to 'business'.
 */
export const getPreset = (industry: string): IndustryPreset => {
  return presets.find((p) => p.id === industry) ?? presets.find((p) => p.id === 'business')!
}

/**
 * Returns all available industry presets.
 */
export const getAllPresets = (): IndustryPreset[] => {
  return [...presets]
}
