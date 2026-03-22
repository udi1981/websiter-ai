/**
 * Hebrew font catalog — all Google Fonts supporting Hebrew script.
 * Used by the generation pipeline when locale is 'he' to ensure proper
 * Hebrew typography in generated sites.
 */

type FontCategory = 'sans-serif' | 'serif' | 'display' | 'handwritten' | 'decorative'

type HebrewFont = {
  name: string
  weights: number[]
  category: FontCategory
  style: string
  googleImportUrl: string
}

/** All Google Fonts with Hebrew subset support */
export const HEBREW_FONTS: HebrewFont[] = [
  {
    name: 'Heebo',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    category: 'sans-serif',
    style: 'Modern, clean, versatile — the go-to Hebrew sans-serif',
    googleImportUrl: 'https://fonts.googleapis.com/css2?family=Heebo:wght@100;200;300;400;500;600;700;800;900&display=swap',
  },
  {
    name: 'Assistant',
    weights: [200, 300, 400, 500, 600, 700, 800],
    category: 'sans-serif',
    style: 'Friendly, rounded, approachable',
    googleImportUrl: 'https://fonts.googleapis.com/css2?family=Assistant:wght@200;300;400;500;600;700;800&display=swap',
  },
  {
    name: 'Rubik',
    weights: [300, 400, 500, 600, 700, 800, 900],
    category: 'sans-serif',
    style: 'Slightly rounded, modern, geometric',
    googleImportUrl: 'https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800;900&display=swap',
  },
  {
    name: 'Noto Sans Hebrew',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    category: 'sans-serif',
    style: 'Neutral, professional, comprehensive weight range',
    googleImportUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@100;200;300;400;500;600;700;800;900&display=swap',
  },
  {
    name: 'Varela Round',
    weights: [400],
    category: 'sans-serif',
    style: 'Soft, rounded, playful',
    googleImportUrl: 'https://fonts.googleapis.com/css2?family=Varela+Round&display=swap',
  },
  {
    name: 'Alef',
    weights: [400, 700],
    category: 'sans-serif',
    style: 'Clean, minimal, legible at small sizes',
    googleImportUrl: 'https://fonts.googleapis.com/css2?family=Alef:wght@400;700&display=swap',
  },
  {
    name: 'Miriam Libre',
    weights: [400, 700],
    category: 'sans-serif',
    style: 'Traditional yet modern, newspaper feel',
    googleImportUrl: 'https://fonts.googleapis.com/css2?family=Miriam+Libre:wght@400;700&display=swap',
  },
  {
    name: 'Open Sans',
    weights: [300, 400, 500, 600, 700, 800],
    category: 'sans-serif',
    style: 'Universal, highly legible, Hebrew subset available',
    googleImportUrl: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&subset=hebrew&display=swap',
  },
  {
    name: 'Secular One',
    weights: [400],
    category: 'sans-serif',
    style: 'Bold, condensed, great for headlines',
    googleImportUrl: 'https://fonts.googleapis.com/css2?family=Secular+One&display=swap',
  },
  {
    name: 'Karantina',
    weights: [300, 400, 700],
    category: 'decorative',
    style: 'Quirky, decorative, eye-catching display font',
    googleImportUrl: 'https://fonts.googleapis.com/css2?family=Karantina:wght@300;400;700&display=swap',
  },
  {
    name: 'Amatic SC',
    weights: [400, 700],
    category: 'handwritten',
    style: 'Hand-drawn, casual, artisan feel',
    googleImportUrl: 'https://fonts.googleapis.com/css2?family=Amatic+SC:wght@400;700&display=swap',
  },
  {
    name: 'Suez One',
    weights: [400],
    category: 'display',
    style: 'Bold serif display, editorial, strong presence',
    googleImportUrl: 'https://fonts.googleapis.com/css2?family=Suez+One&display=swap',
  },
  {
    name: 'Frank Ruhl Libre',
    weights: [300, 400, 500, 600, 700, 800, 900],
    category: 'serif',
    style: 'Elegant serif, editorial quality, versatile weights',
    googleImportUrl: 'https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@300;400;500;600;700;800;900&display=swap',
  },
  {
    name: 'David Libre',
    weights: [400, 500, 700],
    category: 'serif',
    style: 'Classic Hebrew serif, traditional, professional',
    googleImportUrl: 'https://fonts.googleapis.com/css2?family=David+Libre:wght@400;500;700&display=swap',
  },
  {
    name: 'Noto Serif Hebrew',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    category: 'serif',
    style: 'Comprehensive serif, pairs perfectly with Noto Sans Hebrew',
    googleImportUrl: 'https://fonts.googleapis.com/css2?family=Noto+Serif+Hebrew:wght@100;200;300;400;500;600;700;800;900&display=swap',
  },
]

/** Default Hebrew font stack for body text */
export const HEBREW_FONT_STACK = "'Heebo', 'Assistant', system-ui, sans-serif"

/** Default Hebrew font stack for headings */
export const HEBREW_HEADING_FONT_STACK = "'Heebo', 'Rubik', system-ui, sans-serif"

/** Get recommended fonts for an industry/style */
export const getRecommendedHebrewFonts = (style: 'modern' | 'classic' | 'playful' | 'professional'): { heading: string; body: string } => {
  switch (style) {
    case 'modern':
      return { heading: 'Heebo', body: 'Heebo' }
    case 'classic':
      return { heading: 'Frank Ruhl Libre', body: 'Noto Sans Hebrew' }
    case 'playful':
      return { heading: 'Rubik', body: 'Assistant' }
    case 'professional':
      return { heading: 'Noto Sans Hebrew', body: 'Open Sans' }
    default:
      return { heading: 'Heebo', body: 'Heebo' }
  }
}
