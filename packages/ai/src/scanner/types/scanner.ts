/**
 * Scanner V2 — Shared type definitions
 *
 * All types used across scanner phases and extractors.
 * Uses `type` (not `interface`) per project conventions.
 */

// ---------------------------------------------------------------------------
// Section Types
// ---------------------------------------------------------------------------

export type SectionType =
  | 'hero'
  | 'features'
  | 'about'
  | 'services'
  | 'testimonials'
  | 'pricing'
  | 'faq'
  | 'contact'
  | 'footer'
  | 'gallery'
  | 'team'
  | 'stats'
  | 'cta'
  | 'blog'
  | 'products'
  | 'newsletter'
  | 'navbar'
  | 'portfolio'
  | 'unknown'

export type SectionTemplate = {
  type: SectionType
  variant: string
  order: number
  layout: {
    columns: number
    alignment: 'left' | 'center' | 'right'
    background: 'light' | 'dark' | 'colored' | 'image' | 'gradient' | 'transparent'
  }
  content: {
    hasHeading: boolean
    hasImage: boolean
    hasForm: boolean
    hasCta: boolean
    itemCount: number
  }
  htmlSnapshot: string
}

// ---------------------------------------------------------------------------
// Component Types
// ---------------------------------------------------------------------------

export type ComponentType =
  | 'button'
  | 'card'
  | 'form'
  | 'input'
  | 'badge'
  | 'accordion'
  | 'tab'
  | 'testimonial-card'
  | 'pricing-card'
  | 'nav-item'
  | 'image-gallery'

export type ComponentPattern = {
  type: ComponentType
  variant: string
  count: number
  htmlSnapshot: string
  attributes: Record<string, string>
}

// ---------------------------------------------------------------------------
// Component Library (Phase 3 output)
// ---------------------------------------------------------------------------

export type ComponentLibrary = {
  sections: SectionTemplate[]
  components: ComponentPattern[]
  sectionTypeDistribution: Record<SectionType, number>
  totalSections: number
  totalComponents: number
}

// ---------------------------------------------------------------------------
// Content Architecture (Phase 4 output)
// ---------------------------------------------------------------------------

export type HeadingNode = {
  level: number
  text: string
  valid: boolean
}

export type CtaElement = {
  text: string
  href: string
  placement: 'hero' | 'section-end' | 'floating' | 'header' | 'footer' | 'inline'
  priority: 'primary' | 'secondary' | 'tertiary'
}

export type TrustElement = {
  type: 'testimonial' | 'logo-grid' | 'stat' | 'certification' | 'rating' | 'case-study'
  count: number
  hasAvatar: boolean
  hasRating: boolean
  hasCompany: boolean
}

export type FormInfo = {
  purpose: 'contact' | 'signup' | 'login' | 'search' | 'newsletter' | 'checkout' | 'feedback' | 'unknown'
  fields: { type: string; label: string; required: boolean }[]
  hasSubmitButton: boolean
  action: string
}

export type ImageRole =
  | 'hero'
  | 'card'
  | 'avatar'
  | 'logo'
  | 'gallery'
  | 'background'
  | 'icon'
  | 'product'
  | 'decorative'
  | 'unknown'

export type CatalogImage = {
  src: string
  alt: string
  role: ImageRole
  width: number
  height: number
  page: string
}

export type ContentTone = {
  formality: 'formal' | 'neutral' | 'casual'
  perspective: 'first-person' | 'second-person' | 'third-person' | 'mixed'
  avgSentenceLength: number
}

export type PageContentMap = {
  pagePath: string
  sectionOrder: SectionType[]
  headings: HeadingNode[]
  headingHierarchyValid: boolean
  ctas: CtaElement[]
  trustElements: TrustElement[]
  forms: FormInfo[]
  images: CatalogImage[]
}

export type ContentArchitecture = {
  pages: PageContentMap[]
  globalCtas: CtaElement[]
  globalTrustElements: TrustElement[]
  totalForms: number
  totalImages: number
  tone: ContentTone
}

// ---------------------------------------------------------------------------
// Technical DNA (Phase 6 output)
// ---------------------------------------------------------------------------

export type SeoData = {
  title: string
  metaDescription: string
  keywords: string
  canonical: string
  ogTags: Record<string, string>
  twitterTags: Record<string, string>
  robots: string
  headingHierarchy: HeadingNode[]
  headingHierarchyValid: boolean
  internalLinkCount: number
  externalLinkCount: number
  imagesWithAlt: number
  imagesWithoutAlt: number
  hasSitemap: boolean
  hasRobotsTxt: boolean
  hreflangTags: { lang: string; href: string }[]
}

export type MotionIntensity = 'none' | 'subtle' | 'premium' | 'dynamic' | 'cinematic'

export type MotionData = {
  animationLibrary: string | null
  keyframeCount: number
  transitionCount: number
  hasScrollAnimations: boolean
  hasParallax: boolean
  hasStickyHeader: boolean
  hoverEffects: string[]
  scrollAttributes: string[]
  intensity: MotionIntensity
}

export type TechStackInfo = {
  framework: string | null
  cssFramework: string | null
  cms: string | null
  analytics: string[]
  cdn: string | null
  hosting: string | null
}

export type AccessibilityIssue = {
  type: string
  description: string
  severity: 'error' | 'warning' | 'info'
}

export type AccessibilityResult = {
  score: number
  issues: AccessibilityIssue[]
  hasAriaLabels: boolean
  hasSkipNav: boolean
  hasFocusStyles: boolean
  hasFormLabels: boolean
  hasSemanticHtml: boolean
  altTextCoverage: number
}

export type SchemaOrgData = {
  types: string[]
  items: { type: string; properties: Record<string, unknown> }[]
  isValid: boolean
}

export type TechnicalDNA = {
  seo: SeoData
  motion: MotionData
  techStack: TechStackInfo
  accessibility: AccessibilityResult
  schemaOrg: SchemaOrgData
}
