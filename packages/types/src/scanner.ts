/**
 * Scanner V2 — Complete type system for deep website DNA extraction.
 *
 * These types represent the full output of a multi-phase website scan,
 * capturing design, content, structure, brand, technical, and strategic data.
 *
 * @module scanner
 */

// =============================================================================
// Top-level result
// =============================================================================

/** Complete result of a full website DNA scan. */
export type ScanResult = {
  /** Unique scan identifier */
  id: string
  /** Original URL that was scanned */
  url: string
  /** Root domain (e.g. "example.com") */
  domain: string
  /** Detected site name / brand */
  siteName: string
  /** Detected business type (e.g. "saas", "restaurant", "dental") */
  businessType: string
  /** Industry category (e.g. "technology", "food-and-beverage") */
  industryCategory: string
  /** Detected primary locale (e.g. "en-US", "he-IL") */
  locale: string
  /** ISO timestamp when the scan started */
  scanDate: string
  /** Total scan duration in milliseconds */
  scanDuration: number
  /** Scanner version string */
  version: string

  /** Complete site map with all discovered pages and navigation */
  siteMap: SiteMap
  /** Extracted visual design system */
  visualDna: VisualDNA
  /** Detected UI component patterns */
  componentLibrary: ComponentLibrary
  /** Content structure and strategy per page */
  contentArchitecture: ContentArchitecture
  /** Brand identity and personality analysis */
  brandIntelligence: BrandIntelligence
  /** Technical characteristics (SEO, performance, motion, a11y) */
  technicalDna: TechnicalDNA
  /** AI-derived strategic insights and recommendations */
  strategicInsights: StrategicInsights

  /** Status and timing of each scan phase */
  phases: PhaseResult[]
  /** Non-fatal errors encountered during scanning */
  errors: ScanError[]
  /** Overall confidence score (0-100) of the scan output */
  confidence: number
}

// =============================================================================
// Site Map
// =============================================================================

/** All discovered pages and navigation structures. */
export type SiteMap = {
  /** List of all discovered pages */
  pages: DiscoveredPage[]
  /** Sitemap.xml URL if found */
  sitemapUrl: string | null
  /** robots.txt contents if found */
  robotsTxt: string | null
  /** Parsed navigation structures */
  navigation: NavigationStructure
  /** Total number of internal links found */
  totalInternalLinks: number
  /** Total number of external links found */
  totalExternalLinks: number
}

/** Classification of a page's purpose. */
export type PageType =
  | 'homepage'
  | 'about'
  | 'services'
  | 'service-detail'
  | 'portfolio'
  | 'blog-index'
  | 'blog-post'
  | 'contact'
  | 'pricing'
  | 'faq'
  | 'team'
  | 'testimonials'
  | 'product-listing'
  | 'product-detail'
  | 'landing'
  | 'legal'
  | 'custom'

/** A single discovered page with its metadata. */
export type DiscoveredPage = {
  /** Full URL */
  url: string
  /** URL path (e.g. "/about") */
  path: string
  /** Page title from <title> tag */
  title: string
  /** Crawl depth from homepage (0 = homepage) */
  depth: number
  /** Whether the page appears in the main navigation */
  isInNav: boolean
  /** Whether the page appears in the footer links */
  isInFooter: boolean
  /** Classified page type */
  pageType: PageType
  /** Human-readable purpose description */
  purpose: string
  /** Whether the page contains a form */
  hasForm: boolean
  /** Whether the page has significant media (images/video) */
  hasMedia: boolean
  /** HTTP status code received */
  statusCode: number
  /** Approximate content length in characters (text only) */
  contentLength: number
}

/** All navigation structures found on the site. */
export type NavigationStructure = {
  /** Primary top-level navigation items */
  primary: NavItem[]
  /** Secondary navigation (e.g. top bar links) */
  secondary: NavItem[]
  /** Footer navigation columns */
  footer: FooterColumn[]
  /** Whether breadcrumbs were detected */
  breadcrumbs: boolean
  /** Whether a mega menu was detected */
  megaMenu: boolean
  /** Type of mobile navigation detected */
  mobileNav: 'hamburger' | 'bottom-tabs' | 'slide-out' | 'none' | 'unknown'
}

/** A single navigation item, possibly with children. */
export type NavItem = {
  /** Display text */
  text: string
  /** Link target */
  href: string
  /** Child items (dropdowns / sub-menus) */
  children: NavItem[]
  /** Whether this link points to an external domain */
  isExternal: boolean
  /** Whether this link is styled as a CTA button */
  isCta: boolean
}

/** A column of links in the footer. */
export type FooterColumn = {
  /** Column heading */
  title: string
  /** Links within the column */
  links: NavItem[]
}

// =============================================================================
// Visual DNA
// =============================================================================

/** Complete extracted design system. */
export type VisualDNA = {
  /** Color palette and semantic mapping */
  colorSystem: ColorSystem
  /** Typography: fonts, scale, and line heights */
  typographySystem: TypographySystem
  /** Spacing scale and patterns */
  spacingSystem: SpacingSystem
  /** Border radius patterns */
  borderSystem: BorderSystem
  /** Box shadow patterns */
  shadowSystem: ShadowSystem
  /** Layout system (grid, max-width, breakpoints) */
  layoutSystem: LayoutSystem
  /** Image treatment patterns */
  imageSystem: ImageSystem
  /** Detected gradients */
  gradients: GradientInfo[]
  /** Raw CSS custom properties from :root */
  cssVariables: Record<string, string>
}

/** Extracted color palette with semantic roles and accessibility data. */
export type ColorSystem = {
  /** All unique colors found, ranked by frequency */
  palette: ColorToken[]
  /** Semantic color assignments */
  primary: string | null
  secondary: string | null
  accent: string | null
  background: string | null
  surface: string | null
  text: string | null
  textSecondary: string | null
  border: string | null
  /** Whether a dark mode variant was detected */
  darkMode: boolean
  /** WCAG contrast ratios for key pairs */
  contrastPairs: ContrastPair[]
}

/** A single extracted color with usage metadata. */
export type ColorToken = {
  /** Normalised hex value (e.g. "#7c3aed") */
  hex: string
  /** What CSS property context this color appeared in */
  usageRole: 'background' | 'text' | 'border' | 'accent' | 'shadow' | 'gradient' | 'unknown'
  /** How many times this color was found across all sources */
  frequency: number
  /** Which page paths this color was found on */
  pagesUsedOn: string[]
  /** The CSS property it was most commonly used with */
  cssProperty: string
}

/** WCAG contrast ratio between two colors. */
export type ContrastPair = {
  foreground: string
  background: string
  ratio: number
  /** WCAG AA pass for normal text (>=4.5) */
  passAA: boolean
  /** WCAG AAA pass for normal text (>=7.0) */
  passAAA: boolean
}

/** Complete typography extraction. */
export type TypographySystem = {
  /** All detected font families */
  fonts: FontToken[]
  /** Derived type scale from h1 down to caption */
  scale: {
    h1: TypographySpec | null
    h2: TypographySpec | null
    h3: TypographySpec | null
    h4: TypographySpec | null
    h5: TypographySpec | null
    h6: TypographySpec | null
    body: TypographySpec | null
    small: TypographySpec | null
    caption: TypographySpec | null
  }
  /** All unique line heights found */
  lineHeights: string[]
  /** All unique letter spacing values found */
  letterSpacings: string[]
}

/** A detected font family with usage and source. */
export type FontToken = {
  /** Font family name (e.g. "Inter", "Heebo") */
  family: string
  /** Where the font is used */
  usage: 'heading' | 'body' | 'accent' | 'code' | 'unknown'
  /** Available font weights */
  weights: number[]
  /** How the font is loaded */
  source: 'google-fonts' | 'adobe-fonts' | 'system' | 'custom' | 'unknown'
  /** URL to the font resource if available */
  url: string | null
}

/** Font specification for a single text level. */
export type TypographySpec = {
  fontSize: string
  fontWeight: number | string
  lineHeight: string
  letterSpacing: string
  fontFamily: string
}

/** Spacing scale and patterns. */
export type SpacingSystem = {
  /** Detected base unit (e.g. "4px", "0.25rem") */
  baseUnit: string | null
  /** All unique spacing values found, sorted ascending */
  scale: string[]
  /** Common section vertical padding */
  sectionPadding: string | null
  /** Max-width of content containers */
  containerMaxWidth: string | null
  /** Common gap between content items */
  contentGap: string | null
}

/** Border radius patterns grouped by context. */
export type BorderSystem = {
  /** All unique radii with frequency and context */
  radii: Array<{ value: string; frequency: number; context: string }>
  /** Most commonly used radius */
  primaryRadius: string | null
  /** Radius used on buttons */
  buttonRadius: string | null
  /** Radius used on cards */
  cardRadius: string | null
  /** Radius used on inputs */
  inputRadius: string | null
}

/** Box shadow patterns grouped by context. */
export type ShadowSystem = {
  /** All unique shadows with frequency and context */
  shadows: Array<{ value: string; frequency: number; context: string }>
  /** Shadow most used on cards */
  cardShadow: string | null
  /** Shadow used on navbar / sticky elements */
  navShadow: string | null
  /** Ordered elevation scale (subtle -> heavy) */
  elevationScale: string[]
}

/** Layout system characteristics. */
export type LayoutSystem = {
  /** Max content width (e.g. "1280px") */
  maxWidth: string | null
  /** Primary grid system detected */
  gridSystem: 'css-grid' | 'flexbox' | 'float' | 'mixed' | 'unknown'
  /** Most common column count */
  columnCount: number | null
  /** Gutter / gap width */
  gutterWidth: string | null
  /** All detected media query breakpoints */
  breakpoints: string[]
  /** Container centering strategy */
  containerStrategy: 'max-width-center' | 'padding' | 'fluid' | 'unknown'
}

/** Image treatment and loading patterns. */
export type ImageSystem = {
  /** Common image treatments (rounded, overlay, filter, etc.) */
  treatment: string[]
  /** Most common aspect ratios */
  commonAspectRatios: string[]
  /** How the hero image is styled */
  heroImageStyle: string | null
  /** Whether lazy loading is used */
  lazyLoading: boolean
  /** Whether WebP format is served */
  webpSupport: boolean
  /** Whether responsive srcset is used */
  responsiveImages: boolean
}

/** A gradient found in the site's CSS. */
export type GradientInfo = {
  /** Full CSS gradient value */
  value: string
  /** Type of gradient */
  type: 'linear' | 'radial' | 'conic'
  /** Where the gradient is used (e.g. "hero-background", "button") */
  context: string
}

// =============================================================================
// Component Library
// =============================================================================

/** All detected UI component patterns. */
export type ComponentLibrary = {
  /** Reusable component patterns */
  components: ComponentPattern[]
  /** Page-level section templates */
  sections: SectionTemplate[]
}

/** Classification of UI component types. */
export type ComponentType =
  | 'button'
  | 'card'
  | 'form'
  | 'input'
  | 'navbar'
  | 'hero'
  | 'footer'
  | 'testimonial-card'
  | 'pricing-card'
  | 'feature-card'
  | 'team-card'
  | 'blog-card'
  | 'product-card'
  | 'stat-card'
  | 'icon-box'
  | 'accordion'
  | 'tab'
  | 'modal'
  | 'carousel'
  | 'badge'
  | 'avatar'
  | 'breadcrumb'
  | 'pagination'
  | 'dropdown'
  | 'custom'

/** A detected reusable component pattern. */
export type ComponentPattern = {
  /** The type of component */
  type: ComponentType
  /** Visual variants of this component */
  variants: ComponentVariant[]
  /** How many times this component was found */
  frequency: number
  /** Which pages this component appears on */
  pagesUsedOn: string[]
}

/** A single visual variant of a component. */
export type ComponentVariant = {
  /** Descriptive variant name (e.g. "primary-filled", "outline-lg") */
  name: string
  /** Key CSS styles that define this variant */
  styles: Record<string, string>
  /** Simplified HTML structure */
  htmlStructure: string
  /** How many instances of this variant were found */
  frequency: number
}

/** Classification of page section types. */
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
  | 'blog-feed'
  | 'products'
  | 'newsletter'
  | 'navbar'
  | 'clients'
  | 'process'
  | 'timeline'
  | 'video'
  | 'map'
  | 'custom'

/** A detected section template on a specific page. */
export type SectionTemplate = {
  /** Section type classification */
  type: SectionType
  /** Which page this section belongs to */
  page: string
  /** Order within the page (0-indexed) */
  order: number
  /** Variant name for this section style */
  variant: string
  /** Layout approach used (e.g. "2-col-image-text", "3-col-grid") */
  layout: string
  /** Key content extracted from the section */
  content: {
    heading: string | null
    subheading: string | null
    bodyText: string | null
    ctaText: string | null
    ctaHref: string | null
    itemCount: number
  }
  /** Truncated HTML snapshot for reference */
  htmlSnapshot: string
}

// =============================================================================
// Content Architecture
// =============================================================================

/** Content structure and strategy analysis. */
export type ContentArchitecture = {
  /** Per-page content maps */
  pages: PageContentMap[]
  /** Detected CTA strategy */
  ctaStrategy: CTAStrategy
  /** Trust and social proof elements */
  trustElements: TrustElements
  /** Conversion funnel analysis */
  conversionFunnel: ConversionFunnel
  /** Content tone and voice analysis */
  contentTone: ContentTone
}

/** Content map for a single page. */
export type PageContentMap = {
  /** Page URL path */
  path: string
  /** Page title */
  title: string
  /** Page purpose (e.g. "convert visitors", "educate about services") */
  purpose: string
  /** Ordered list of section types on this page */
  sectionOrder: SectionType[]
  /** Heading hierarchy */
  headingStructure: Array<{ level: number; text: string }>
  /** Total word count */
  wordCount: number
  /** Estimated readability score (0-100, 100 = easiest) */
  readability: number
  /** Primary CTA on this page */
  primaryCta: string | null
  /** Forms found on this page */
  forms: FormInfo[]
  /** Images found on this page */
  images: PageImageInfo[]
}

/** Information about a form found on the page. */
export type FormInfo = {
  /** Purpose of the form (e.g. "contact", "newsletter", "login") */
  purpose: string
  /** Number of fields */
  fieldCount: number
  /** Field names / labels */
  fields: string[]
  /** Submit button text */
  submitText: string
}

/** Image information within a page context. */
export type PageImageInfo = {
  /** Image source URL */
  src: string
  /** Alt text */
  alt: string
  /** Role within the page layout */
  role: 'hero' | 'card' | 'avatar' | 'logo' | 'gallery' | 'background' | 'icon' | 'product' | 'decorative' | 'unknown'
  /** Width in pixels (0 if unknown) */
  width: number
  /** Height in pixels (0 if unknown) */
  height: number
}

/** CTA strategy analysis. */
export type CTAStrategy = {
  /** Primary CTA text and destination */
  primaryCta: { text: string; href: string } | null
  /** Secondary CTA buttons */
  secondaryCtas: Array<{ text: string; href: string }>
  /** Where CTAs are placed (e.g. "hero", "sticky-header", "footer") */
  ctaPlacement: string[]
  /** CTA visual style (e.g. "filled-primary", "outline", "gradient") */
  ctaStyle: string
}

/** Trust and social proof elements detected. */
export type TrustElements = {
  /** Testimonial quotes found */
  testimonials: Array<{ quote: string; author: string; role: string }>
  /** Client / partner logo image URLs */
  clientLogos: string[]
  /** Statistic proof points (e.g. "10,000+ customers") */
  stats: Array<{ value: string; label: string }>
  /** Certifications or trust badges */
  certifications: string[]
  /** Awards mentioned */
  awards: string[]
  /** Other social proof (ratings, case studies, etc.) */
  socialProof: string[]
}

/** Conversion funnel analysis. */
export type ConversionFunnel = {
  /** Primary entry points for the funnel */
  entryPoints: string[]
  /** Micro-conversion actions (e.g. "newsletter signup", "download") */
  microConversions: string[]
  /** Primary conversion goal (e.g. "contact form submission") */
  primaryConversion: string | null
  /** Steps in the detected funnel */
  steps: string[]
}

/** Content tone and voice characteristics. */
export type ContentTone = {
  /** Formality level (1 = very casual, 5 = very formal) */
  formality: number
  /** Brand voice descriptors (e.g. "friendly", "authoritative") */
  voice: string[]
  /** Writing perspective ("first-person", "second-person", "third-person") */
  perspective: string
  /** Average sentence length (words) */
  sentenceLength: number
  /** Jargon / technical term usage (1 = none, 5 = heavy) */
  jargonLevel: number
  /** Sample phrases that capture the brand voice */
  samplePhrases: string[]
}

// =============================================================================
// Brand Intelligence
// =============================================================================

/** Brand identity and personality analysis. */
export type BrandIntelligence = {
  /** Logo information */
  logo: LogoInfo | null
  /** Brand personality analysis */
  personality: BrandPersonality
  /** Target audience inference */
  targetAudience: TargetAudience
  /** Industry classification */
  industry: IndustryClassification
  /** Detected value proposition */
  valueProposition: ValueProposition
}

/** Logo details. */
export type LogoInfo = {
  /** Image source URL */
  src: string
  /** Alt text */
  alt: string
  /** Dimensions in pixels */
  dimensions: { width: number; height: number }
  /** Image format */
  format: 'svg' | 'png' | 'jpg' | 'webp' | 'unknown'
  /** Where the logo appears */
  placement: 'header' | 'footer' | 'both' | 'other'
  /** Whether the logo is text-based (no image, just styled text) */
  textBased: boolean
}

/** Brand personality characteristics. */
export type BrandPersonality = {
  /** Personality trait descriptors */
  traits: string[]
  /** Overall mood (e.g. "warm", "professional", "edgy") */
  mood: string
  /** Brand archetype (e.g. "hero", "creator", "caregiver") */
  archetype: string
  /** Design language summary */
  designLanguage: string
}

/** Inferred target audience. */
export type TargetAudience = {
  /** Demographic descriptors */
  demographics: string[]
  /** Pain points the audience likely has */
  painPoints: string[]
  /** Desires or aspirations */
  desires: string[]
  /** Sophistication level (1 = low, 5 = high) */
  sophistication: number
}

/** Industry classification. */
export type IndustryClassification = {
  /** Primary industry */
  primary: string
  /** Sub-industry */
  sub: string
  /** Niche within the sub-industry */
  niche: string
  /** Detected or inferred competitors */
  competitors: string[]
}

/** Detected value proposition. */
export type ValueProposition = {
  /** Main headline / tagline */
  headline: string
  /** Supporting subheadline */
  subheadline: string
  /** Key benefits listed */
  benefits: string[]
  /** Differentiators from competitors */
  differentiators: string[]
  /** Proof points backing the claims */
  proofPoints: string[]
}

// =============================================================================
// Technical DNA
// =============================================================================

/** Technical characteristics of the scanned site. */
export type TechnicalDNA = {
  /** SEO analysis */
  seo: SEOAnalysis
  /** Performance indicators */
  performance: PerformanceIndicators
  /** Motion and animation system */
  motion: MotionSystem
  /** Responsive design strategy */
  responsive: ResponsiveStrategy
  /** Accessibility audit */
  accessibility: AccessibilityAudit
  /** Detected technology stack */
  techStack: TechStackDetection
  /** Structured data (JSON-LD, microdata) */
  structuredData: StructuredDataInfo[]
}

/** SEO analysis results. */
export type SEOAnalysis = {
  /** Meta tag analysis */
  meta: {
    title: string
    description: string
    keywords: string
    ogTitle: string
    ogDescription: string
    ogImage: string
  }
  /** Heading structure (H1-H6 counts and hierarchy) */
  headingStructure: {
    h1Count: number
    h2Count: number
    h3Count: number
    hasProperHierarchy: boolean
  }
  /** Link statistics */
  links: {
    internal: number
    external: number
    nofollow: number
    broken: number
  }
  /** Percentage of images with alt text */
  altTextCoverage: number
  /** Canonical URL if set */
  canonical: string | null
  /** Whether a sitemap.xml was found */
  sitemap: boolean
  /** Hreflang tags if present */
  hreflang: Array<{ lang: string; href: string }>
}

/** Performance-related indicators (no Lighthouse — just markup analysis). */
export type PerformanceIndicators = {
  /** Total images detected */
  imageCount: number
  /** Whether lazy loading is used on images */
  lazyLoading: boolean
  /** Whether images are optimised (WebP/AVIF) */
  modernImageFormats: boolean
  /** Preloaded resources (fonts, LCP image, etc.) */
  preloads: string[]
  /** Whether CSS/JS appear minified */
  minification: boolean
}

/** Detected motion and animation system. */
export type MotionSystem = {
  /** Animation library if detected (e.g. "gsap", "framer-motion", "aos") */
  library: string | null
  /** Whether scroll-triggered animations exist */
  scrollAnimations: boolean
  /** Whether parallax effects exist */
  parallax: boolean
  /** Whether the header is sticky / fixed */
  stickyHeader: boolean
  /** Hover effect patterns detected */
  hoverEffects: string[]
  /** Scroll reveal patterns */
  scrollReveals: string[]
  /** Suggested motion intensity for rebuild */
  suggestedIntensity: 'none' | 'subtle' | 'moderate' | 'dramatic'
}

/** Responsive design approach. */
export type ResponsiveStrategy = {
  /** Design approach */
  approach: 'mobile-first' | 'desktop-first' | 'adaptive' | 'unknown'
  /** Detected CSS breakpoints */
  breakpoints: string[]
  /** Mobile navigation type */
  mobileNavType: 'hamburger' | 'bottom-tabs' | 'slide-out' | 'none' | 'unknown'
  /** How sections stack on mobile */
  stackingBehavior: string
  /** Whether typography scales across breakpoints */
  typographyScaling: boolean
}

/** Basic accessibility audit results. */
export type AccessibilityAudit = {
  /** Estimated a11y score (0-100) */
  score: number
  /** Whether ARIA labels are used */
  ariaLabels: boolean
  /** Whether a skip-to-content link exists */
  skipLink: boolean
  /** Whether focus styles are visible */
  focusStyles: boolean
  /** Whether text-background color contrast is adequate */
  colorContrast: boolean
  /** List of specific issues found */
  issues: string[]
}

/** Detected technology stack. */
export type TechStackDetection = {
  /** Frontend framework (e.g. "react", "vue", "angular", "wordpress") */
  framework: string | null
  /** CSS framework (e.g. "tailwind", "bootstrap", "bulma") */
  cssFramework: string | null
  /** CMS if detected */
  cms: string | null
  /** Analytics tools */
  analytics: string[]
  /** CDN if detected */
  cdn: string | null
  /** Hosting provider if detectable */
  hosting: string | null
}

/** Structured data (JSON-LD, microdata) found on the site. */
export type StructuredDataInfo = {
  /** Schema.org type */
  type: string
  /** Key properties found */
  properties: Record<string, string>
  /** Whether the data passes basic validation */
  valid: boolean
}

// =============================================================================
// Strategic Insights
// =============================================================================

/** AI-derived strategic analysis and recommendations. */
export type StrategicInsights = {
  /** Individual insight items */
  insights: Insight[]
  /** Sections the site should have but doesn't */
  missingSections: MissingSectionRecommendation[]
  /** Benchmark against industry standards */
  industryBenchmark: IndustryBenchmark
  /** Concrete rebuild plan */
  rebuildPlan: RebuildPlan
}

/** A single strategic insight. */
export type Insight = {
  /** Category of insight */
  category: 'design' | 'content' | 'seo' | 'ux' | 'performance' | 'conversion' | 'brand'
  /** Short title */
  title: string
  /** Detailed description */
  description: string
  /** Impact level */
  impact: 'low' | 'medium' | 'high' | 'critical'
  /** Whether this insight has a clear action to take */
  actionable: boolean
}

/** A recommended section that the site is missing. */
export type MissingSectionRecommendation = {
  /** The section type to add */
  sectionType: SectionType
  /** Why this section is recommended */
  reason: string
  /** Priority level */
  priority: 'low' | 'medium' | 'high'
  /** Whether this is standard for the detected industry */
  industryStandard: boolean
}

/** Industry benchmark comparison. */
export type IndustryBenchmark = {
  /** How well the design aligns with industry trends (0-100) */
  designTrendAlignment: number
  /** Best practice adherence score (0-100) */
  bestPracticeScore: number
  /** Recommended sections for this industry */
  recommendedSections: SectionType[]
  /** Recommended features for this industry */
  recommendedFeatures: string[]
}

/** Concrete plan for rebuilding the site. */
export type RebuildPlan = {
  /** Elements to preserve exactly (with reasons) */
  preserve: Array<{ element: string; reason: string }>
  /** Elements to rebuild as structured sections */
  rebuild: Array<{ element: string; reason: string }>
  /** Areas to improve */
  improve: Array<{ element: string; reason: string }>
  /** New elements to add */
  add: Array<{ element: string; reason: string }>
  /** Elements to remove */
  remove: Array<{ element: string; reason: string }>
}

// =============================================================================
// Supporting types
// =============================================================================

/** Result of a single scan phase. */
export type PhaseResult = {
  /** Phase name (e.g. "discovery", "visual-dna") */
  name: string
  /** Current status */
  status: 'pending' | 'running' | 'done' | 'error' | 'skipped'
  /** Duration in milliseconds */
  duration: number
  /** Additional details specific to this phase */
  details: Record<string, unknown>
}

/** A non-fatal error encountered during scanning. */
export type ScanError = {
  /** Which phase the error occurred in */
  phase: string
  /** Error message */
  message: string
  /** Whether scanning can continue past this error */
  recoverable: boolean
}

/** Options to configure a scan. */
export type ScanOptions = {
  /** Maximum number of pages to crawl (default: 30) */
  maxPages?: number
  /** Skip AI analysis phases (faster, less insightful) */
  skipAi?: boolean
  /** Overall timeout in milliseconds (default: 120000) */
  timeout?: number
  /** Whether to fetch external CSS files */
  fetchCss?: boolean
  /** Whether to extract images metadata */
  extractImages?: boolean
}
