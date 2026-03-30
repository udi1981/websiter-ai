/** All section categories available in the component library */
export type SectionCategory =
  | 'navbar'
  | 'hero'
  | 'features'
  | 'testimonials'
  | 'pricing'
  | 'faq'
  | 'cta'
  | 'footer'
  | 'gallery'
  | 'team'
  | 'stats'
  | 'contact'
  | 'newsletter'
  | 'about'
  | 'blog'
  | 'portfolio'
  | 'how-it-works'
  | 'partners'
  | 'comparison'
  | 'timeline'

/** Animation intensity level for a section */
export type AnimationLevel = 'none' | 'minimal' | 'subtle' | 'moderate' | 'dramatic'

/** Visual theme mode */
export type SectionTheme = 'light' | 'dark' | 'glass' | 'transparent'

/** Background type */
export type BackgroundType =
  | 'solid'
  | 'gradient'
  | 'image'
  | 'video'
  | 'shader'
  | 'pattern'
  | 'noise'

/** Section divider style between sections */
export type DividerStyle =
  | 'none'
  | 'wave'
  | 'diagonal'
  | 'curve'
  | 'zigzag'
  | 'gradient-fade'

/** Media slot definition for a section */
export type MediaSlotDef = {
  id: string
  role:
    | 'hero-bg'
    | 'hero-image'
    | 'feature-icon'
    | 'team-avatar'
    | 'gallery-item'
    | 'product'
    | 'logo'
    | 'testimonial-avatar'
    | 'background-video'
    | 'background-image'
  type: 'image' | 'video' | 'icon' | 'lottie'
  aspectRatio: '16:9' | '4:3' | '1:1' | '9:16' | '21:9' | 'free'
  required: boolean
  fallbackType?: 'unsplash' | 'icon' | 'gradient' | 'none'
}

/** Property definition schema for section customization */
export type SectionPropDef = {
  key: string
  label: string
  type:
    | 'text'
    | 'richtext'
    | 'number'
    | 'color'
    | 'select'
    | 'boolean'
    | 'image'
    | 'array'
  defaultValue?: unknown
  /** Available options for select type */
  options?: string[]
  /** Minimum value for number type */
  min?: number
  /** Maximum value for number type */
  max?: number
}

/** A section variant definition in the registry */
export type SectionVariant = {
  id: string
  category: SectionCategory
  name: string
  description: string
  thumbnail: string
  tags: string[]
  industries: string[]
  features: string[]
  responsive: boolean
  rtlReady: boolean
  darkMode: boolean
  animationLevel: AnimationLevel
  theme: SectionTheme
  backgroundType: BackgroundType
  dividerTop: DividerStyle
  dividerBottom: DividerStyle
  requiredMedia: MediaSlotDef[]
  props: SectionPropDef[]
  minHeight?: string
  maxContentWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

/** Color palette passed to section generators, compatible with design presets */
export type SectionPalette = {
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

/** Font configuration passed to section generators, compatible with design presets */
export type SectionFonts = {
  heading: string
  body: string
  headingWeight: string
  bodyWeight: string
}

/** Parameters passed to a section template generator */
export type SectionGeneratorParams = {
  variant: string
  content: Record<string, unknown>
  palette: SectionPalette
  fonts: SectionFonts
  images: Record<string, string>
  locale: 'en' | 'he'
  animationEnabled: boolean
}

/** Output of a section template generator */
export type SectionOutput = {
  html: string
  css?: string
  js?: string
}

/** Full section registry: category to variant list */
export type SectionRegistry = Record<SectionCategory, SectionVariant[]>

/** A section instance in a generated page */
export type PageSection = {
  id: string
  variantId: string
  category: SectionCategory
  content: Record<string, unknown>
  images: Record<string, string>
  customStyles?: Record<string, string>
  order: number
}

/** Full page composition: ordered list of sections with design context */
export type PageComposition = {
  id: string
  siteName: string
  locale: 'en' | 'he'
  palette: SectionPalette
  fonts: SectionFonts
  sections: PageSection[]
  globalCss?: string
  globalJs?: string
}
