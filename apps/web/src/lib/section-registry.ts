/**
 * Section Registry — Central catalog of all available section variants.
 *
 * This file contains METADATA only. The actual HTML generators live in
 * `section-templates.ts`. The registry is consumed by the AI generation
 * pipeline to pick the best section variants for a given site/page.
 */

import type {
  SectionCategory,
  SectionVariant,
  AnimationLevel,
  SectionTheme,
  BackgroundType,
  DividerStyle,
  MediaSlotDef,
  SectionPropDef,
  SectionRegistry,
} from '@ubuilder/types'

// ---------------------------------------------------------------------------
// Helpers — reduce boilerplate when defining variants
// ---------------------------------------------------------------------------

const ALL_INDUSTRIES = ['all']
const TECH_INDUSTRIES = ['tech', 'saas', 'startup']
const CREATIVE_INDUSTRIES = ['creative', 'fashion', 'portfolio', 'agency']
const BUSINESS_INDUSTRIES = ['saas', 'business', 'enterprise']
const ECOMMERCE_INDUSTRIES = ['ecommerce', 'fashion', 'retail']
const LOCAL_INDUSTRIES = ['restaurant', 'dental', 'law', 'realestate', 'fitness', 'medical']

/** Shorthand to build a MediaSlotDef */
const media = (
  id: string,
  role: MediaSlotDef['role'],
  type: MediaSlotDef['type'] = 'image',
  aspectRatio: MediaSlotDef['aspectRatio'] = '16:9',
  required = true,
  fallbackType: MediaSlotDef['fallbackType'] = 'unsplash',
): MediaSlotDef => ({ id, role, type, aspectRatio, required, fallbackType })

/** Shorthand to build a SectionPropDef */
const prop = (
  key: string,
  label: string,
  type: SectionPropDef['type'] = 'text',
  defaultValue?: unknown,
  options?: string[],
): SectionPropDef => ({ key, label, type, defaultValue, ...(options ? { options } : {}) })

/** Base defaults shared by most variants */
const base = (
  overrides: Partial<SectionVariant> & Pick<SectionVariant, 'id' | 'category' | 'name' | 'description' | 'tags'>,
): SectionVariant => ({
  thumbnail: '',
  industries: ALL_INDUSTRIES,
  features: [],
  responsive: true,
  rtlReady: true,
  darkMode: true,
  animationLevel: 'subtle' as AnimationLevel,
  theme: 'dark' as SectionTheme,
  backgroundType: 'solid' as BackgroundType,
  dividerTop: 'none' as DividerStyle,
  dividerBottom: 'none' as DividerStyle,
  requiredMedia: [],
  props: [],
  maxContentWidth: 'lg',
  ...overrides,
})

// ---------------------------------------------------------------------------
// Common prop sets
// ---------------------------------------------------------------------------

const navProps = [
  prop('siteName', 'Site Name'),
  prop('links', 'Navigation Links', 'array'),
  prop('ctaText', 'CTA Button Text'),
  prop('ctaHref', 'CTA Button URL'),
]

const heroProps = [
  prop('title', 'Title'),
  prop('subtitle', 'Subtitle'),
  prop('ctaText', 'Primary CTA'),
  prop('ctaHref', 'Primary CTA URL'),
  prop('secondaryCtaText', 'Secondary CTA'),
  prop('secondaryCtaHref', 'Secondary CTA URL'),
]

const featureItemProps = [
  prop('title', 'Section Title'),
  prop('subtitle', 'Section Subtitle'),
  prop('features', 'Feature Items', 'array'),
]

const testimonialProps = [
  prop('title', 'Section Title'),
  prop('subtitle', 'Section Subtitle'),
  prop('testimonials', 'Testimonial Items', 'array'),
]

const pricingProps = [
  prop('title', 'Section Title'),
  prop('subtitle', 'Section Subtitle'),
  prop('plans', 'Pricing Plans', 'array'),
  prop('billingToggle', 'Show Billing Toggle', 'boolean', true),
]

const ctaProps = [
  prop('title', 'Title'),
  prop('subtitle', 'Subtitle'),
  prop('ctaText', 'CTA Button Text'),
  prop('ctaHref', 'CTA Button URL'),
]

const faqProps = [
  prop('title', 'Section Title'),
  prop('subtitle', 'Section Subtitle'),
  prop('items', 'FAQ Items', 'array'),
]

const footerProps = [
  prop('siteName', 'Site Name'),
  prop('columns', 'Link Columns', 'array'),
  prop('copyright', 'Copyright Text'),
  prop('socialLinks', 'Social Links', 'array'),
]

const galleryProps = [
  prop('title', 'Section Title'),
  prop('items', 'Gallery Items', 'array'),
]

// ---------------------------------------------------------------------------
// NAVBAR VARIANTS (8)
// ---------------------------------------------------------------------------

const navbarVariants: SectionVariant[] = [
  base({
    id: 'navbar-transparent',
    category: 'navbar',
    name: 'Transparent Navbar',
    description: 'Transparent background that transitions to solid on scroll with blur backdrop.',
    tags: ['animated', 'blur', 'sticky'],
    industries: ALL_INDUSTRIES,
    features: ['scroll-transition', 'backdrop-blur', 'sticky'],
    animationLevel: 'subtle',
    theme: 'transparent',
    backgroundType: 'solid',
    props: navProps,
    minHeight: '64px',
    maxContentWidth: 'xl',
  }),
  base({
    id: 'navbar-floating',
    category: 'navbar',
    name: 'Floating Pill Navbar',
    description: 'Floating pill shape with centered logo, detached from edges.',
    tags: ['modern', 'pill', 'floating'],
    industries: TECH_INDUSTRIES,
    features: ['floating', 'pill-shape', 'shadow'],
    animationLevel: 'subtle',
    theme: 'glass',
    props: navProps,
    minHeight: '56px',
    maxContentWidth: 'lg',
  }),
  base({
    id: 'navbar-sidebar',
    category: 'navbar',
    name: 'Sidebar Navigation',
    description: 'Full-height sidebar navigation for desktop, hamburger on mobile.',
    tags: ['sidebar', 'dashboard'],
    industries: ['dashboard', 'saas', 'enterprise'],
    features: ['sidebar', 'collapsible', 'responsive-hamburger'],
    animationLevel: 'subtle',
    theme: 'dark',
    props: [...navProps, prop('collapsible', 'Collapsible', 'boolean', true)],
    minHeight: '100vh',
    maxContentWidth: 'sm',
  }),
  base({
    id: 'navbar-mega-menu',
    category: 'navbar',
    name: 'Mega Menu Navbar',
    description: 'Multi-column dropdown menus for enterprise-scale navigation.',
    tags: ['mega-menu', 'enterprise'],
    industries: ['enterprise', 'ecommerce'],
    features: ['mega-dropdown', 'multi-column', 'hover-reveal'],
    animationLevel: 'moderate',
    props: [...navProps, prop('megaMenuColumns', 'Mega Menu Columns', 'array')],
    minHeight: '64px',
    maxContentWidth: 'xl',
  }),
  base({
    id: 'navbar-hamburger',
    category: 'navbar',
    name: 'Full-screen Overlay Nav',
    description: 'Animated hamburger icon that transitions to X with full-screen overlay menu.',
    tags: ['fullscreen', 'mobile-first'],
    industries: CREATIVE_INDUSTRIES,
    features: ['fullscreen-overlay', 'animated-icon', 'transition'],
    animationLevel: 'moderate',
    theme: 'dark',
    props: navProps,
    minHeight: '64px',
    maxContentWidth: 'xl',
  }),
  base({
    id: 'navbar-minimal',
    category: 'navbar',
    name: 'Minimal Navbar',
    description: 'Logo + 3 links + CTA only. Clean and uncluttered.',
    tags: ['minimal', 'clean'],
    industries: ALL_INDUSTRIES,
    features: ['minimal', 'fast-load'],
    animationLevel: 'none',
    props: navProps,
    minHeight: '56px',
    maxContentWidth: 'lg',
  }),
  base({
    id: 'navbar-split',
    category: 'navbar',
    name: 'Split Navbar',
    description: 'Logo left, links center, CTA right. Balanced and professional.',
    tags: ['balanced', 'standard'],
    industries: [...BUSINESS_INDUSTRIES, 'saas'],
    features: ['split-layout', 'centered-links'],
    animationLevel: 'subtle',
    props: navProps,
    minHeight: '64px',
    maxContentWidth: 'xl',
  }),
  base({
    id: 'navbar-command',
    category: 'navbar',
    name: 'Command Palette Navbar',
    description: 'Navigation with built-in command palette search (Cmd+K).',
    tags: ['developer', 'search'],
    industries: ['tech', 'developer-tools', 'saas'],
    features: ['command-palette', 'keyboard-shortcut', 'search'],
    animationLevel: 'moderate',
    props: [...navProps, prop('searchPlaceholder', 'Search Placeholder')],
    minHeight: '64px',
    maxContentWidth: 'xl',
  }),
]

// ---------------------------------------------------------------------------
// HERO VARIANTS (15)
// ---------------------------------------------------------------------------

const heroVariants: SectionVariant[] = [
  base({
    id: 'hero-gradient-mesh',
    category: 'hero',
    name: 'Gradient Mesh Hero',
    description: 'Animated gradient mesh background with vivid flowing colors.',
    tags: ['gradient', 'animated', 'shader'],
    industries: TECH_INDUSTRIES,
    features: ['animated-gradient', 'mesh', 'gpu-accelerated'],
    animationLevel: 'dramatic',
    backgroundType: 'shader',
    props: heroProps,
    minHeight: '100vh',
    maxContentWidth: 'lg',
  }),
  base({
    id: 'hero-split-image',
    category: 'hero',
    name: 'Split Image Hero',
    description: 'Text left, image right with parallax scroll effect.',
    tags: ['split', 'parallax', 'image'],
    industries: ALL_INDUSTRIES,
    features: ['split-layout', 'parallax', 'image-reveal'],
    animationLevel: 'moderate',
    requiredMedia: [media('hero-img', 'hero-image', 'image', '4:3')],
    props: heroProps,
    minHeight: '90vh',
    maxContentWidth: 'xl',
  }),
  base({
    id: 'hero-fullscreen-video',
    category: 'hero',
    name: 'Fullscreen Video Hero',
    description: 'Full-viewport video background with overlay text.',
    tags: ['video', 'fullscreen', 'cinematic'],
    industries: ['creative', 'fashion', 'restaurant', 'fitness', 'agency'],
    features: ['video-bg', 'autoplay', 'overlay'],
    animationLevel: 'moderate',
    backgroundType: 'video',
    requiredMedia: [media('hero-video', 'background-video', 'video', '16:9')],
    props: heroProps,
    minHeight: '100vh',
    maxContentWidth: 'lg',
  }),
  base({
    id: 'hero-particles',
    category: 'hero',
    name: 'Particles Hero',
    description: 'Interactive particle canvas background that reacts to mouse movement.',
    tags: ['particles', 'interactive', 'canvas'],
    industries: TECH_INDUSTRIES,
    features: ['particle-canvas', 'mouse-interaction', 'gpu-accelerated'],
    animationLevel: 'dramatic',
    backgroundType: 'shader',
    props: heroProps,
    minHeight: '100vh',
    maxContentWidth: 'lg',
  }),
  base({
    id: 'hero-typewriter',
    category: 'hero',
    name: 'Typewriter Hero',
    description: 'Typewriter text animation effect with gradient text colors.',
    tags: ['typewriter', 'text-effect'],
    industries: [...TECH_INDUSTRIES, 'agency', 'creative'],
    features: ['typewriter-effect', 'gradient-text', 'text-animation'],
    animationLevel: 'moderate',
    props: [
      ...heroProps,
      prop('rotatingWords', 'Rotating Words', 'array'),
    ],
    minHeight: '90vh',
    maxContentWidth: 'lg',
  }),
  base({
    id: 'hero-3d-globe',
    category: 'hero',
    name: '3D Globe Hero',
    description: 'Interactive 3D rotating globe with connection points.',
    tags: ['3d', 'globe', 'interactive'],
    industries: ['tech', 'saas', 'enterprise'],
    features: ['3d-globe', 'webgl', 'interactive-rotation'],
    animationLevel: 'dramatic',
    backgroundType: 'shader',
    props: heroProps,
    minHeight: '100vh',
    maxContentWidth: 'lg',
  }),
  base({
    id: 'hero-parallax-layers',
    category: 'hero',
    name: 'Parallax Layers Hero',
    description: 'Multi-layer parallax effect on scroll with depth illusion.',
    tags: ['parallax', 'layers', 'scroll'],
    industries: ['creative', 'agency', 'portfolio'],
    features: ['multi-layer-parallax', 'scroll-driven', 'depth'],
    animationLevel: 'dramatic',
    requiredMedia: [
      media('layer-bg', 'background-image', 'image', '16:9'),
      media('layer-mid', 'hero-image', 'image', '16:9', false),
    ],
    props: heroProps,
    minHeight: '100vh',
    maxContentWidth: 'xl',
  }),
  base({
    id: 'hero-magazine',
    category: 'hero',
    name: 'Magazine Hero',
    description: 'Editorial layout with asymmetric CSS grid, magazine-style.',
    tags: ['editorial', 'asymmetric', 'magazine'],
    industries: ['creative', 'fashion', 'agency', 'portfolio'],
    features: ['asymmetric-grid', 'editorial-layout', 'typography-focus'],
    animationLevel: 'subtle',
    requiredMedia: [media('hero-img', 'hero-image', 'image', '4:3')],
    props: heroProps,
    minHeight: '85vh',
    maxContentWidth: 'xl',
  }),
  base({
    id: 'hero-product-showcase',
    category: 'hero',
    name: 'Product Showcase Hero',
    description: 'Floating product image with glow effect and ambient lighting.',
    tags: ['product', 'glow', 'floating'],
    industries: [...ECOMMERCE_INDUSTRIES, 'tech', 'saas'],
    features: ['product-float', 'glow-effect', 'ambient-light'],
    animationLevel: 'moderate',
    requiredMedia: [media('product-img', 'product', 'image', '1:1')],
    props: heroProps,
    minHeight: '90vh',
    maxContentWidth: 'lg',
  }),
  base({
    id: 'hero-minimal-text',
    category: 'hero',
    name: 'Minimal Text Hero',
    description: 'Massive typography, no image, animated underline accent.',
    tags: ['minimal', 'text-only', 'typography'],
    industries: ALL_INDUSTRIES,
    features: ['large-typography', 'animated-underline', 'clean'],
    animationLevel: 'subtle',
    props: heroProps,
    minHeight: '80vh',
    maxContentWidth: 'lg',
  }),
  base({
    id: 'hero-counter-stats',
    category: 'hero',
    name: 'Counter Stats Hero',
    description: 'Hero section with animated counting stat numbers.',
    tags: ['counters', 'stats', 'numbers'],
    industries: [...BUSINESS_INDUSTRIES, 'enterprise'],
    features: ['animated-counters', 'stat-highlights'],
    animationLevel: 'moderate',
    props: [
      ...heroProps,
      prop('stats', 'Stat Items', 'array'),
    ],
    minHeight: '90vh',
    maxContentWidth: 'lg',
  }),
  base({
    id: 'hero-carousel',
    category: 'hero',
    name: 'Carousel Hero',
    description: 'Multi-slide hero with smooth transitions and auto-play.',
    tags: ['carousel', 'slideshow', 'auto'],
    industries: ALL_INDUSTRIES,
    features: ['multi-slide', 'auto-play', 'smooth-transition'],
    animationLevel: 'moderate',
    requiredMedia: [
      media('slide-1', 'hero-image', 'image', '16:9'),
      media('slide-2', 'hero-image', 'image', '16:9'),
      media('slide-3', 'hero-image', 'image', '16:9', false),
    ],
    props: [
      ...heroProps,
      prop('slides', 'Slide Items', 'array'),
      prop('autoPlayInterval', 'Auto-play Interval (ms)', 'number', 5000),
    ],
    minHeight: '100vh',
    maxContentWidth: 'full',
  }),
  base({
    id: 'hero-aurora',
    category: 'hero',
    name: 'Aurora Hero',
    description: 'Aurora / northern lights animated background with flowing colors.',
    tags: ['aurora', 'ambient', 'colorful'],
    industries: [...TECH_INDUSTRIES, 'creative'],
    features: ['aurora-effect', 'ambient-animation', 'color-flow'],
    animationLevel: 'dramatic',
    backgroundType: 'gradient',
    props: heroProps,
    minHeight: '100vh',
    maxContentWidth: 'lg',
  }),
  base({
    id: 'hero-noise-gradient',
    category: 'hero',
    name: 'Noise Gradient Hero',
    description: 'Grainy gradient background with SVG noise filter texture.',
    tags: ['noise', 'grain', 'modern'],
    industries: [...TECH_INDUSTRIES, 'creative', 'agency'],
    features: ['svg-noise', 'grain-texture', 'gradient'],
    animationLevel: 'subtle',
    backgroundType: 'noise',
    props: heroProps,
    minHeight: '90vh',
    maxContentWidth: 'lg',
  }),
  base({
    id: 'hero-interactive-cards',
    category: 'hero',
    name: 'Interactive Cards Hero',
    description: 'Hero section with hoverable feature cards positioned below headline.',
    tags: ['cards', 'interactive', 'hover'],
    industries: [...TECH_INDUSTRIES, ...BUSINESS_INDUSTRIES],
    features: ['hover-cards', 'feature-preview', 'interactive'],
    animationLevel: 'moderate',
    props: [
      ...heroProps,
      prop('cards', 'Feature Cards', 'array'),
    ],
    minHeight: '90vh',
    maxContentWidth: 'xl',
  }),
]

// ---------------------------------------------------------------------------
// FEATURES VARIANTS (12)
// ---------------------------------------------------------------------------

const featuresVariants: SectionVariant[] = [
  base({
    id: 'features-bento-grid',
    category: 'features',
    name: 'Bento Grid Features',
    description: 'Bento box layout with mixed-size cards for visual hierarchy.',
    tags: ['bento', 'grid', 'modern'],
    industries: TECH_INDUSTRIES,
    features: ['bento-layout', 'mixed-sizes', 'hover-effects'],
    animationLevel: 'moderate',
    requiredMedia: [media('feature-icon-1', 'feature-icon', 'icon', '1:1', false, 'icon')],
    props: featureItemProps,
  }),
  base({
    id: 'features-tabs',
    category: 'features',
    name: 'Tabbed Features',
    description: 'Interactive tabbed interface to showcase features one at a time.',
    tags: ['tabs', 'interactive'],
    industries: ALL_INDUSTRIES,
    features: ['tabs', 'content-switch', 'animated-transition'],
    animationLevel: 'moderate',
    requiredMedia: [media('feature-img', 'feature-icon', 'image', '16:9', false)],
    props: featureItemProps,
  }),
  base({
    id: 'features-accordion',
    category: 'features',
    name: 'Accordion Features',
    description: 'Expandable sections with image that changes per feature.',
    tags: ['accordion', 'expandable'],
    industries: ALL_INDUSTRIES,
    features: ['accordion', 'expand-collapse', 'image-swap'],
    animationLevel: 'moderate',
    props: featureItemProps,
  }),
  base({
    id: 'features-zigzag',
    category: 'features',
    name: 'Zigzag Features',
    description: 'Alternating image/text rows with scroll-triggered reveal.',
    tags: ['zigzag', 'alternating', 'scroll-reveal'],
    industries: ALL_INDUSTRIES,
    features: ['alternating-layout', 'scroll-reveal', 'stagger'],
    animationLevel: 'moderate',
    requiredMedia: [
      media('feature-img-1', 'feature-icon', 'image', '4:3', false),
      media('feature-img-2', 'feature-icon', 'image', '4:3', false),
      media('feature-img-3', 'feature-icon', 'image', '4:3', false),
    ],
    props: featureItemProps,
  }),
  base({
    id: 'features-icon-grid',
    category: 'features',
    name: 'Icon Grid Features',
    description: '3-4 column grid with animated icons and descriptions.',
    tags: ['icons', 'grid', 'hover'],
    industries: ALL_INDUSTRIES,
    features: ['icon-animation', 'grid-layout', 'hover-effect'],
    animationLevel: 'subtle',
    props: featureItemProps,
  }),
  base({
    id: 'features-carousel',
    category: 'features',
    name: 'Carousel Features',
    description: 'Horizontal scrollable feature cards with drag support.',
    tags: ['carousel', 'scroll', 'drag'],
    industries: ALL_INDUSTRIES,
    features: ['horizontal-scroll', 'drag', 'snap'],
    animationLevel: 'moderate',
    props: featureItemProps,
  }),
  base({
    id: 'features-comparison',
    category: 'features',
    name: 'Comparison Features',
    description: 'Side-by-side feature comparison with toggle switch.',
    tags: ['comparison', 'toggle'],
    industries: [...TECH_INDUSTRIES, 'ecommerce'],
    features: ['comparison', 'toggle-view', 'side-by-side'],
    animationLevel: 'subtle',
    props: [
      ...featureItemProps,
      prop('comparisonItems', 'Comparison Items', 'array'),
    ],
  }),
  base({
    id: 'features-timeline',
    category: 'features',
    name: 'Timeline Features',
    description: 'Vertical timeline layout with scroll-triggered reveals.',
    tags: ['timeline', 'vertical', 'scroll'],
    industries: ALL_INDUSTRIES,
    features: ['vertical-timeline', 'scroll-reveal', 'connector-line'],
    animationLevel: 'moderate',
    props: featureItemProps,
  }),
  base({
    id: 'features-video-cards',
    category: 'features',
    name: 'Video Card Features',
    description: 'Feature cards with embedded video previews and play button.',
    tags: ['video', 'cards', 'play'],
    industries: [...TECH_INDUSTRIES, 'education', 'creative'],
    features: ['video-embed', 'play-on-hover', 'thumbnail'],
    animationLevel: 'moderate',
    requiredMedia: [media('feature-video', 'background-video', 'video', '16:9', false)],
    props: featureItemProps,
  }),
  base({
    id: 'features-interactive',
    category: 'features',
    name: 'Interactive Features',
    description: 'Click to explore each feature with expanded detail view.',
    tags: ['interactive', 'expand'],
    industries: [...TECH_INDUSTRIES, ...BUSINESS_INDUSTRIES],
    features: ['click-expand', 'detail-view', 'animated-transition'],
    animationLevel: 'moderate',
    props: featureItemProps,
  }),
  base({
    id: 'features-stats-integrated',
    category: 'features',
    name: 'Stats-Integrated Features',
    description: 'Feature sections with inline animated stat counters.',
    tags: ['stats', 'counters', 'numbers'],
    industries: BUSINESS_INDUSTRIES,
    features: ['inline-stats', 'counter-animation', 'data-driven'],
    animationLevel: 'moderate',
    props: [
      ...featureItemProps,
      prop('stats', 'Stat Counters', 'array'),
    ],
  }),
  base({
    id: 'features-hoverable-cards',
    category: 'features',
    name: 'Hoverable 3D Cards',
    description: 'Feature cards with 3D tilt effect and glow on hover.',
    tags: ['tilt', 'glow', '3d', 'hover'],
    industries: TECH_INDUSTRIES,
    features: ['3d-tilt', 'glow-effect', 'perspective'],
    animationLevel: 'moderate',
    props: featureItemProps,
  }),
]

// ---------------------------------------------------------------------------
// TESTIMONIALS VARIANTS (10)
// ---------------------------------------------------------------------------

const testimonialsVariants: SectionVariant[] = [
  base({
    id: 'testimonials-carousel',
    category: 'testimonials',
    name: 'Carousel Testimonials',
    description: 'Sliding testimonial cards with dot navigation and auto-play.',
    tags: ['carousel', 'auto-play'],
    features: ['auto-play', 'dot-navigation', 'smooth-slide'],
    animationLevel: 'moderate',
    requiredMedia: [media('avatar-1', 'testimonial-avatar', 'image', '1:1', false)],
    props: testimonialProps,
  }),
  base({
    id: 'testimonials-masonry',
    category: 'testimonials',
    name: 'Masonry Testimonials',
    description: 'Pinterest-style masonry grid of quote cards with stagger animation.',
    tags: ['masonry', 'grid', 'stagger'],
    features: ['masonry-layout', 'stagger-reveal', 'mixed-heights'],
    animationLevel: 'moderate',
    requiredMedia: [media('avatar-1', 'testimonial-avatar', 'image', '1:1', false)],
    props: testimonialProps,
  }),
  base({
    id: 'testimonials-featured',
    category: 'testimonials',
    name: 'Featured Testimonial',
    description: 'One large featured testimonial with scrolling smaller ones.',
    tags: ['featured', 'mixed-size'],
    features: ['featured-highlight', 'scroll-secondary', 'emphasis'],
    animationLevel: 'subtle',
    requiredMedia: [media('avatar-featured', 'testimonial-avatar', 'image', '1:1')],
    props: testimonialProps,
  }),
  base({
    id: 'testimonials-video',
    category: 'testimonials',
    name: 'Video Testimonials',
    description: 'Video testimonials with play button overlay and transcript.',
    tags: ['video', 'play-button'],
    industries: [...BUSINESS_INDUSTRIES, 'education'],
    features: ['video-player', 'play-overlay', 'transcript'],
    animationLevel: 'subtle',
    requiredMedia: [media('video-1', 'background-video', 'video', '16:9')],
    props: testimonialProps,
  }),
  base({
    id: 'testimonials-wall',
    category: 'testimonials',
    name: 'Social Proof Wall',
    description: 'Twitter/social media style wall of testimonials with infinite scroll feel.',
    tags: ['wall', 'social', 'infinite'],
    features: ['social-style', 'infinite-scroll', 'marquee'],
    animationLevel: 'moderate',
    requiredMedia: [media('avatar-1', 'testimonial-avatar', 'image', '1:1', false)],
    props: testimonialProps,
  }),
  base({
    id: 'testimonials-minimal',
    category: 'testimonials',
    name: 'Minimal Testimonials',
    description: 'Large quote text only, no images, typography-focused.',
    tags: ['minimal', 'typography'],
    features: ['large-quote', 'typography-focus', 'clean'],
    animationLevel: 'subtle',
    props: testimonialProps,
  }),
  base({
    id: 'testimonials-star-rating',
    category: 'testimonials',
    name: 'Star Rating Testimonials',
    description: 'Testimonial cards with animated star ratings.',
    tags: ['stars', 'rating', 'animated'],
    industries: [...ECOMMERCE_INDUSTRIES, ...LOCAL_INDUSTRIES],
    features: ['star-animation', 'rating-display', 'aggregate-score'],
    animationLevel: 'moderate',
    requiredMedia: [media('avatar-1', 'testimonial-avatar', 'image', '1:1', false)],
    props: [
      ...testimonialProps,
      prop('showAggregate', 'Show Aggregate Rating', 'boolean', true),
    ],
  }),
  base({
    id: 'testimonials-logo-bar',
    category: 'testimonials',
    name: 'Logo Bar Testimonials',
    description: 'Client logos marquee with rotating featured quote below.',
    tags: ['logos', 'rotating'],
    industries: BUSINESS_INDUSTRIES,
    features: ['logo-marquee', 'rotating-quote', 'trust-signals'],
    animationLevel: 'moderate',
    requiredMedia: [
      media('logo-1', 'logo', 'image', '4:3', false),
      media('logo-2', 'logo', 'image', '4:3', false),
      media('logo-3', 'logo', 'image', '4:3', false),
    ],
    props: testimonialProps,
  }),
  base({
    id: 'testimonials-before-after',
    category: 'testimonials',
    name: 'Before/After Testimonials',
    description: 'Draggable before/after comparison slider with testimonial.',
    tags: ['slider', 'comparison', 'drag'],
    industries: ['fitness', 'medical', 'dental', 'creative'],
    features: ['drag-slider', 'comparison-view', 'visual-proof'],
    animationLevel: 'moderate',
    requiredMedia: [
      media('before-img', 'hero-image', 'image', '16:9'),
      media('after-img', 'hero-image', 'image', '16:9'),
    ],
    props: testimonialProps,
  }),
  base({
    id: 'testimonials-glassmorphism',
    category: 'testimonials',
    name: 'Glassmorphism Testimonials',
    description: 'Frosted glass effect cards with blur backdrop.',
    tags: ['glass', 'blur', 'frosted'],
    industries: TECH_INDUSTRIES,
    features: ['glassmorphism', 'backdrop-blur', 'translucent'],
    animationLevel: 'subtle',
    theme: 'glass',
    requiredMedia: [media('avatar-1', 'testimonial-avatar', 'image', '1:1', false)],
    props: testimonialProps,
  }),
]

// ---------------------------------------------------------------------------
// PRICING VARIANTS (8)
// ---------------------------------------------------------------------------

const pricingVariants: SectionVariant[] = [
  base({
    id: 'pricing-animated-cards',
    category: 'pricing',
    name: 'Animated Pricing Cards',
    description: 'Spring-animated cards that expand on hover/focus.',
    tags: ['animated', 'spring', 'expand'],
    industries: TECH_INDUSTRIES,
    features: ['spring-animation', 'hover-expand', 'highlight-popular'],
    animationLevel: 'moderate',
    props: pricingProps,
  }),
  base({
    id: 'pricing-toggle',
    category: 'pricing',
    name: 'Toggle Pricing',
    description: 'Monthly/Annual billing toggle with animated price switch.',
    tags: ['toggle', 'billing-switch'],
    industries: [...TECH_INDUSTRIES, 'saas'],
    features: ['billing-toggle', 'price-animation', 'save-badge'],
    animationLevel: 'moderate',
    props: pricingProps,
  }),
  base({
    id: 'pricing-comparison-table',
    category: 'pricing',
    name: 'Comparison Table Pricing',
    description: 'Full feature comparison matrix with check/cross indicators.',
    tags: ['table', 'comparison', 'features'],
    industries: [...TECH_INDUSTRIES, 'enterprise'],
    features: ['feature-matrix', 'sticky-header', 'responsive-scroll'],
    animationLevel: 'subtle',
    props: [
      ...pricingProps,
      prop('featureMatrix', 'Feature Matrix', 'array'),
    ],
  }),
  base({
    id: 'pricing-slider',
    category: 'pricing',
    name: 'Slider Pricing',
    description: 'Interactive slider to adjust usage/quantity with dynamic pricing.',
    tags: ['slider', 'interactive', 'dynamic'],
    industries: ['saas', 'tech'],
    features: ['range-slider', 'dynamic-price', 'usage-based'],
    animationLevel: 'moderate',
    props: [
      ...pricingProps,
      prop('sliderMin', 'Slider Min', 'number', 0),
      prop('sliderMax', 'Slider Max', 'number', 1000),
      prop('sliderUnit', 'Slider Unit Label'),
    ],
  }),
  base({
    id: 'pricing-minimal',
    category: 'pricing',
    name: 'Minimal Pricing',
    description: 'Simple, clean pricing cards with clear typography.',
    tags: ['minimal', 'clean'],
    industries: ALL_INDUSTRIES,
    features: ['clean-layout', 'clear-hierarchy', 'fast-load'],
    animationLevel: 'subtle',
    props: pricingProps,
  }),
  base({
    id: 'pricing-gradient',
    category: 'pricing',
    name: 'Gradient Border Pricing',
    description: 'Pricing cards with animated gradient borders and glow.',
    tags: ['gradient', 'border', 'animated'],
    industries: TECH_INDUSTRIES,
    features: ['gradient-border', 'animated-glow', 'modern-look'],
    animationLevel: 'moderate',
    backgroundType: 'gradient',
    props: pricingProps,
  }),
  base({
    id: 'pricing-enterprise',
    category: 'pricing',
    name: 'Enterprise Pricing',
    description: 'Custom enterprise pricing with contact sales CTA.',
    tags: ['enterprise', 'contact', 'b2b'],
    industries: ['enterprise', 'saas'],
    features: ['contact-cta', 'custom-quote', 'enterprise-features'],
    animationLevel: 'subtle',
    props: [
      ...pricingProps,
      prop('contactEmail', 'Sales Contact Email'),
      prop('enterpriseFeatures', 'Enterprise Features', 'array'),
    ],
  }),
  base({
    id: 'pricing-israeli',
    category: 'pricing',
    name: 'Israeli Pricing',
    description: 'ILS currency pricing with Hebrew-optimized RTL layout.',
    tags: ['hebrew', 'ils', 'local'],
    industries: ALL_INDUSTRIES,
    features: ['ils-currency', 'hebrew-layout', 'vat-inclusive'],
    animationLevel: 'subtle',
    props: [
      ...pricingProps,
      prop('currency', 'Currency', 'select', 'ILS', ['ILS', 'USD', 'EUR']),
      prop('includeVat', 'Include VAT', 'boolean', true),
    ],
  }),
]

// ---------------------------------------------------------------------------
// CTA VARIANTS (8)
// ---------------------------------------------------------------------------

const ctaVariants: SectionVariant[] = [
  base({
    id: 'cta-gradient-banner',
    category: 'cta',
    name: 'Gradient Banner CTA',
    description: 'Full-width gradient background with centered CTA text.',
    tags: ['gradient', 'banner', 'full-width'],
    features: ['gradient-bg', 'centered-text', 'bold-cta'],
    animationLevel: 'subtle',
    backgroundType: 'gradient',
    props: ctaProps,
  }),
  base({
    id: 'cta-split-image',
    category: 'cta',
    name: 'Split Image CTA',
    description: 'Text and CTA button alongside a supporting image.',
    tags: ['split', 'image', 'side-by-side'],
    features: ['split-layout', 'image-support', 'balanced'],
    animationLevel: 'subtle',
    requiredMedia: [media('cta-img', 'hero-image', 'image', '4:3')],
    props: ctaProps,
  }),
  base({
    id: 'cta-floating-card',
    category: 'cta',
    name: 'Floating Card CTA',
    description: 'Elevated card with glow shadow floating above background.',
    tags: ['card', 'floating', 'glow'],
    features: ['floating-card', 'glow-shadow', 'elevated'],
    animationLevel: 'moderate',
    theme: 'glass',
    props: ctaProps,
  }),
  base({
    id: 'cta-newsletter',
    category: 'cta',
    name: 'Newsletter CTA',
    description: 'Email capture form with validation and success animation.',
    tags: ['newsletter', 'email', 'form'],
    features: ['email-input', 'validation', 'success-animation'],
    animationLevel: 'moderate',
    props: [
      ...ctaProps,
      prop('placeholder', 'Email Placeholder'),
      prop('successMessage', 'Success Message'),
    ],
  }),
  base({
    id: 'cta-countdown',
    category: 'cta',
    name: 'Countdown CTA',
    description: 'Urgency countdown timer with prominent CTA button.',
    tags: ['countdown', 'urgency', 'timer'],
    industries: [...ECOMMERCE_INDUSTRIES, 'saas'],
    features: ['countdown-timer', 'urgency', 'animated-digits'],
    animationLevel: 'moderate',
    props: [
      ...ctaProps,
      prop('endDate', 'Countdown End Date'),
    ],
  }),
  base({
    id: 'cta-sticky-bottom',
    category: 'cta',
    name: 'Sticky Bottom CTA',
    description: 'Fixed bottom bar that appears on scroll with CTA.',
    tags: ['sticky', 'bottom', 'fixed'],
    features: ['sticky-position', 'scroll-trigger', 'dismissible'],
    animationLevel: 'subtle',
    props: [
      ...ctaProps,
      prop('showAfterScroll', 'Show After Scroll %', 'number', 30),
    ],
    minHeight: '56px',
  }),
  base({
    id: 'cta-video-background',
    category: 'cta',
    name: 'Video Background CTA',
    description: 'CTA text overlaid on a looping background video.',
    tags: ['video', 'background', 'cinematic'],
    features: ['video-loop', 'overlay', 'autoplay'],
    animationLevel: 'moderate',
    backgroundType: 'video',
    requiredMedia: [media('cta-video', 'background-video', 'video', '16:9')],
    props: ctaProps,
  }),
  base({
    id: 'cta-glassmorphism',
    category: 'cta',
    name: 'Glassmorphism CTA',
    description: 'Frosted glass card with blur backdrop for CTA.',
    tags: ['glass', 'blur', 'frosted'],
    features: ['glassmorphism', 'backdrop-blur', 'translucent'],
    animationLevel: 'subtle',
    theme: 'glass',
    props: ctaProps,
  }),
]

// ---------------------------------------------------------------------------
// FAQ VARIANTS (5)
// ---------------------------------------------------------------------------

const faqVariants: SectionVariant[] = [
  base({
    id: 'faq-accordion',
    category: 'faq',
    name: 'Accordion FAQ',
    description: 'Classic expand/collapse FAQ with smooth animations.',
    tags: ['accordion', 'expand', 'classic'],
    features: ['expand-collapse', 'smooth-animation', 'single-open'],
    animationLevel: 'subtle',
    props: faqProps,
  }),
  base({
    id: 'faq-searchable',
    category: 'faq',
    name: 'Searchable FAQ',
    description: 'FAQ with search bar that filters questions in real-time.',
    tags: ['search', 'filter', 'interactive'],
    features: ['search-filter', 'instant-results', 'highlight-match'],
    animationLevel: 'subtle',
    props: [
      ...faqProps,
      prop('searchPlaceholder', 'Search Placeholder'),
    ],
  }),
  base({
    id: 'faq-categorized',
    category: 'faq',
    name: 'Categorized FAQ',
    description: 'FAQ organized by category tabs for easy navigation.',
    tags: ['tabs', 'categories', 'organized'],
    features: ['tab-categories', 'organized-sections', 'filter-by-topic'],
    animationLevel: 'subtle',
    props: [
      ...faqProps,
      prop('categories', 'Categories', 'array'),
    ],
  }),
  base({
    id: 'faq-two-column',
    category: 'faq',
    name: 'Two-Column FAQ',
    description: 'FAQ split into two columns for efficient space usage.',
    tags: ['two-column', 'grid', 'compact'],
    features: ['two-column-layout', 'compact', 'balanced'],
    animationLevel: 'subtle',
    props: faqProps,
  }),
  base({
    id: 'faq-chat-style',
    category: 'faq',
    name: 'Chat-Style FAQ',
    description: 'FAQ presented as chat bubble Q&A conversation.',
    tags: ['chat', 'bubble', 'conversational'],
    features: ['chat-bubbles', 'conversational-ui', 'stagger-reveal'],
    animationLevel: 'moderate',
    props: faqProps,
  }),
]

// ---------------------------------------------------------------------------
// FOOTER VARIANTS (6)
// ---------------------------------------------------------------------------

const footerVariants: SectionVariant[] = [
  base({
    id: 'footer-multi-column',
    category: 'footer',
    name: 'Multi-Column Footer',
    description: '4-column links layout with newsletter signup at bottom.',
    tags: ['columns', 'links', 'newsletter'],
    features: ['multi-column', 'newsletter', 'social-links'],
    animationLevel: 'none',
    props: footerProps,
    maxContentWidth: 'xl',
  }),
  base({
    id: 'footer-minimal',
    category: 'footer',
    name: 'Minimal Footer',
    description: 'Logo + 3 links + copyright only. Clean and simple.',
    tags: ['minimal', 'clean', 'simple'],
    features: ['minimal-links', 'copyright', 'fast-load'],
    animationLevel: 'none',
    props: footerProps,
    maxContentWidth: 'lg',
  }),
  base({
    id: 'footer-mega',
    category: 'footer',
    name: 'Mega Footer',
    description: 'Full mega footer with multiple sections, CTA, and sitemap.',
    tags: ['mega', 'comprehensive', 'sitemap'],
    industries: ['enterprise', 'ecommerce'],
    features: ['mega-layout', 'sitemap', 'multi-section'],
    animationLevel: 'none',
    props: footerProps,
    maxContentWidth: 'xl',
  }),
  base({
    id: 'footer-centered',
    category: 'footer',
    name: 'Centered Footer',
    description: 'Centered content with social icons and newsletter.',
    tags: ['centered', 'social', 'newsletter'],
    features: ['centered-layout', 'social-icons', 'clean'],
    animationLevel: 'none',
    props: footerProps,
    maxContentWidth: 'md',
  }),
  base({
    id: 'footer-gradient',
    category: 'footer',
    name: 'Gradient Footer',
    description: 'Footer with gradient background transitioning from content.',
    tags: ['gradient', 'colorful', 'transition'],
    features: ['gradient-bg', 'smooth-transition', 'visual-end'],
    animationLevel: 'none',
    backgroundType: 'gradient',
    props: footerProps,
    maxContentWidth: 'xl',
  }),
  base({
    id: 'footer-cta-integrated',
    category: 'footer',
    name: 'CTA-Integrated Footer',
    description: 'Footer with built-in call-to-action section above links.',
    tags: ['cta', 'integrated', 'conversion'],
    features: ['built-in-cta', 'conversion-focused', 'newsletter'],
    animationLevel: 'subtle',
    props: [
      ...footerProps,
      prop('ctaTitle', 'CTA Title'),
      prop('ctaText', 'CTA Button Text'),
      prop('ctaHref', 'CTA Button URL'),
    ],
    maxContentWidth: 'xl',
  }),
]

// ---------------------------------------------------------------------------
// GALLERY VARIANTS (6)
// ---------------------------------------------------------------------------

const galleryVariants: SectionVariant[] = [
  base({
    id: 'gallery-masonry',
    category: 'gallery',
    name: 'Masonry Gallery',
    description: 'Pinterest-style masonry layout with varied image heights.',
    tags: ['masonry', 'pinterest', 'varied'],
    industries: ['portfolio', 'creative', 'fashion', 'restaurant'],
    features: ['masonry-layout', 'lazy-load', 'responsive-columns'],
    animationLevel: 'moderate',
    requiredMedia: [media('gallery-1', 'gallery-item', 'image', 'free')],
    props: galleryProps,
  }),
  base({
    id: 'gallery-lightbox',
    category: 'gallery',
    name: 'Lightbox Gallery',
    description: 'Click to enlarge images in a full-screen lightbox overlay.',
    tags: ['lightbox', 'zoom', 'overlay'],
    industries: ['portfolio', 'creative', 'realestate'],
    features: ['lightbox-overlay', 'zoom', 'keyboard-nav'],
    animationLevel: 'moderate',
    requiredMedia: [media('gallery-1', 'gallery-item', 'image', '4:3')],
    props: galleryProps,
  }),
  base({
    id: 'gallery-carousel',
    category: 'gallery',
    name: 'Carousel Gallery',
    description: 'Horizontal scroll gallery with snap points.',
    tags: ['carousel', 'horizontal', 'scroll'],
    industries: ALL_INDUSTRIES,
    features: ['horizontal-scroll', 'snap-points', 'arrows'],
    animationLevel: 'moderate',
    requiredMedia: [media('gallery-1', 'gallery-item', 'image', '16:9')],
    props: galleryProps,
  }),
  base({
    id: 'gallery-filterable',
    category: 'gallery',
    name: 'Filterable Gallery',
    description: 'Gallery with category filter tabs and animated transitions.',
    tags: ['filter', 'tabs', 'categories'],
    industries: ['portfolio', 'creative', 'agency'],
    features: ['filter-tabs', 'animated-filter', 'category-sort'],
    animationLevel: 'moderate',
    requiredMedia: [media('gallery-1', 'gallery-item', 'image', '4:3')],
    props: [
      ...galleryProps,
      prop('categories', 'Filter Categories', 'array'),
    ],
  }),
  base({
    id: 'gallery-fullscreen',
    category: 'gallery',
    name: 'Fullscreen Gallery',
    description: 'Full-viewport slideshow with cinematic transitions.',
    tags: ['fullscreen', 'slideshow', 'cinematic'],
    industries: ['creative', 'fashion', 'portfolio', 'realestate'],
    features: ['fullscreen-view', 'cinematic-transition', 'auto-play'],
    animationLevel: 'dramatic',
    requiredMedia: [media('gallery-1', 'gallery-item', 'image', '16:9')],
    props: galleryProps,
  }),
  base({
    id: 'gallery-before-after',
    category: 'gallery',
    name: 'Before/After Gallery',
    description: 'Draggable slider to compare before and after images.',
    tags: ['before-after', 'slider', 'comparison'],
    industries: ['fitness', 'medical', 'dental', 'creative', 'realestate'],
    features: ['drag-slider', 'comparison', 'side-by-side'],
    animationLevel: 'moderate',
    requiredMedia: [
      media('before-img', 'gallery-item', 'image', '16:9'),
      media('after-img', 'gallery-item', 'image', '16:9'),
    ],
    props: galleryProps,
  }),
]

// ---------------------------------------------------------------------------
// TEAM VARIANTS (4)
// ---------------------------------------------------------------------------

const teamVariants: SectionVariant[] = [
  base({
    id: 'team-grid',
    category: 'team',
    name: 'Team Grid',
    description: 'Grid of team member cards with photo, name, role, and social links.',
    tags: ['grid', 'cards', 'social'],
    industries: ALL_INDUSTRIES,
    features: ['photo-cards', 'social-links', 'hover-reveal'],
    animationLevel: 'subtle',
    requiredMedia: [media('team-avatar-1', 'team-avatar', 'image', '1:1')],
    props: [
      prop('title', 'Section Title'),
      prop('subtitle', 'Section Subtitle'),
      prop('members', 'Team Members', 'array'),
    ],
  }),
  base({
    id: 'team-carousel',
    category: 'team',
    name: 'Team Carousel',
    description: 'Horizontal scrollable team cards with bios.',
    tags: ['carousel', 'scroll', 'bio'],
    industries: ALL_INDUSTRIES,
    features: ['horizontal-scroll', 'bio-expand', 'snap-points'],
    animationLevel: 'moderate',
    requiredMedia: [media('team-avatar-1', 'team-avatar', 'image', '1:1')],
    props: [
      prop('title', 'Section Title'),
      prop('members', 'Team Members', 'array'),
    ],
  }),
  base({
    id: 'team-featured',
    category: 'team',
    name: 'Featured Team',
    description: 'Large featured member card with supporting team grid below.',
    tags: ['featured', 'leadership', 'highlight'],
    industries: BUSINESS_INDUSTRIES,
    features: ['featured-member', 'leadership-highlight', 'hierarchy'],
    animationLevel: 'subtle',
    requiredMedia: [
      media('featured-avatar', 'team-avatar', 'image', '4:3'),
      media('team-avatar-1', 'team-avatar', 'image', '1:1', false),
    ],
    props: [
      prop('title', 'Section Title'),
      prop('members', 'Team Members', 'array'),
    ],
  }),
  base({
    id: 'team-minimal',
    category: 'team',
    name: 'Minimal Team',
    description: 'Simple name and role list, no photos, clean typography.',
    tags: ['minimal', 'text-only', 'clean'],
    industries: ALL_INDUSTRIES,
    features: ['text-only', 'clean-list', 'fast-load'],
    animationLevel: 'none',
    props: [
      prop('title', 'Section Title'),
      prop('members', 'Team Members', 'array'),
    ],
  }),
]

// ---------------------------------------------------------------------------
// STATS VARIANTS (4)
// ---------------------------------------------------------------------------

const statsVariants: SectionVariant[] = [
  base({
    id: 'stats-counter',
    category: 'stats',
    name: 'Counter Stats',
    description: 'Animated counting numbers that trigger on scroll into view.',
    tags: ['counter', 'animated', 'scroll-trigger'],
    industries: ALL_INDUSTRIES,
    features: ['count-up', 'scroll-trigger', 'number-animation'],
    animationLevel: 'moderate',
    props: [
      prop('stats', 'Stat Items', 'array'),
      prop('columns', 'Columns', 'select', '4', ['2', '3', '4']),
    ],
  }),
  base({
    id: 'stats-icon-cards',
    category: 'stats',
    name: 'Icon Card Stats',
    description: 'Stat cards with icons and supporting descriptions.',
    tags: ['icons', 'cards', 'descriptive'],
    industries: ALL_INDUSTRIES,
    features: ['icon-support', 'card-layout', 'description'],
    animationLevel: 'subtle',
    props: [
      prop('stats', 'Stat Items', 'array'),
    ],
  }),
  base({
    id: 'stats-progress-bars',
    category: 'stats',
    name: 'Progress Bar Stats',
    description: 'Horizontal progress bars with animated fill on scroll.',
    tags: ['progress', 'bar', 'animated'],
    industries: [...TECH_INDUSTRIES, 'education', 'nonprofit'],
    features: ['progress-bar', 'animated-fill', 'percentage'],
    animationLevel: 'moderate',
    props: [
      prop('stats', 'Stat Items', 'array'),
    ],
  }),
  base({
    id: 'stats-marquee',
    category: 'stats',
    name: 'Marquee Stats',
    description: 'Scrolling marquee banner of key statistics.',
    tags: ['marquee', 'scroll', 'banner'],
    industries: ALL_INDUSTRIES,
    features: ['marquee-scroll', 'continuous', 'eye-catching'],
    animationLevel: 'moderate',
    props: [
      prop('stats', 'Stat Items', 'array'),
      prop('speed', 'Marquee Speed', 'select', 'normal', ['slow', 'normal', 'fast']),
    ],
  }),
]

// ---------------------------------------------------------------------------
// CONTACT VARIANTS (4)
// ---------------------------------------------------------------------------

const contactVariants: SectionVariant[] = [
  base({
    id: 'contact-form-map',
    category: 'contact',
    name: 'Form + Map Contact',
    description: 'Contact form alongside an embedded map.',
    tags: ['form', 'map', 'split'],
    industries: ALL_INDUSTRIES,
    features: ['contact-form', 'embedded-map', 'split-layout'],
    animationLevel: 'subtle',
    props: [
      prop('title', 'Section Title'),
      prop('subtitle', 'Section Subtitle'),
      prop('email', 'Contact Email'),
      prop('phone', 'Phone Number'),
      prop('address', 'Address'),
      prop('mapEmbed', 'Map Embed URL'),
    ],
  }),
  base({
    id: 'contact-minimal-form',
    category: 'contact',
    name: 'Minimal Contact Form',
    description: 'Clean form with name, email, message fields.',
    tags: ['minimal', 'form', 'clean'],
    industries: ALL_INDUSTRIES,
    features: ['simple-form', 'validation', 'clean-layout'],
    animationLevel: 'subtle',
    props: [
      prop('title', 'Section Title'),
      prop('subtitle', 'Section Subtitle'),
      prop('email', 'Contact Email'),
    ],
  }),
  base({
    id: 'contact-cards',
    category: 'contact',
    name: 'Contact Info Cards',
    description: 'Cards showing phone, email, address, and hours.',
    tags: ['cards', 'info', 'details'],
    industries: LOCAL_INDUSTRIES,
    features: ['info-cards', 'click-to-call', 'click-to-email'],
    animationLevel: 'subtle',
    props: [
      prop('title', 'Section Title'),
      prop('email', 'Contact Email'),
      prop('phone', 'Phone Number'),
      prop('address', 'Address'),
      prop('hours', 'Business Hours'),
    ],
  }),
  base({
    id: 'contact-split-info',
    category: 'contact',
    name: 'Split Info Contact',
    description: 'Form on one side, contact details and social links on the other.',
    tags: ['split', 'social', 'detailed'],
    industries: ALL_INDUSTRIES,
    features: ['split-layout', 'social-links', 'multi-channel'],
    animationLevel: 'subtle',
    props: [
      prop('title', 'Section Title'),
      prop('email', 'Contact Email'),
      prop('phone', 'Phone Number'),
      prop('address', 'Address'),
      prop('socialLinks', 'Social Links', 'array'),
    ],
  }),
]

// ---------------------------------------------------------------------------
// PARTNERS / LOGOS VARIANTS (3)
// ---------------------------------------------------------------------------

const partnersVariants: SectionVariant[] = [
  base({
    id: 'partners-logo-marquee',
    category: 'partners',
    name: 'Logo Marquee',
    description: 'Infinite scrolling marquee of partner/client logos.',
    tags: ['marquee', 'infinite', 'scroll'],
    industries: ALL_INDUSTRIES,
    features: ['infinite-scroll', 'logo-display', 'grayscale-hover'],
    animationLevel: 'moderate',
    requiredMedia: [
      media('logo-1', 'logo', 'image', '4:3', false),
      media('logo-2', 'logo', 'image', '4:3', false),
    ],
    props: [
      prop('title', 'Section Title'),
      prop('logos', 'Partner Logos', 'array'),
    ],
  }),
  base({
    id: 'partners-grid',
    category: 'partners',
    name: 'Partner Logo Grid',
    description: 'Static grid of partner logos with hover color effect.',
    tags: ['grid', 'logos', 'hover'],
    industries: ALL_INDUSTRIES,
    features: ['grid-layout', 'grayscale-to-color', 'hover-effect'],
    animationLevel: 'subtle',
    requiredMedia: [
      media('logo-1', 'logo', 'image', '4:3', false),
    ],
    props: [
      prop('title', 'Section Title'),
      prop('logos', 'Partner Logos', 'array'),
    ],
  }),
  base({
    id: 'partners-featured',
    category: 'partners',
    name: 'Featured Partners',
    description: 'Partner logos with featured case studies or descriptions.',
    tags: ['featured', 'case-study', 'detailed'],
    industries: BUSINESS_INDUSTRIES,
    features: ['case-study', 'logo-feature', 'description'],
    animationLevel: 'subtle',
    requiredMedia: [
      media('logo-1', 'logo', 'image', '4:3', false),
    ],
    props: [
      prop('title', 'Section Title'),
      prop('partners', 'Partner Items', 'array'),
    ],
  }),
]

// ---------------------------------------------------------------------------
// HOW-IT-WORKS VARIANTS (4)
// ---------------------------------------------------------------------------

const howItWorksVariants: SectionVariant[] = [
  base({
    id: 'how-it-works-steps',
    category: 'how-it-works',
    name: 'Numbered Steps',
    description: 'Horizontal numbered steps with connector lines.',
    tags: ['steps', 'numbered', 'horizontal'],
    industries: ALL_INDUSTRIES,
    features: ['numbered-steps', 'connector-lines', 'scroll-reveal'],
    animationLevel: 'moderate',
    props: [
      prop('title', 'Section Title'),
      prop('subtitle', 'Section Subtitle'),
      prop('steps', 'Steps', 'array'),
    ],
  }),
  base({
    id: 'how-it-works-vertical',
    category: 'how-it-works',
    name: 'Vertical Process',
    description: 'Vertical scrolling process with alternating layout.',
    tags: ['vertical', 'process', 'alternating'],
    industries: ALL_INDUSTRIES,
    features: ['vertical-layout', 'alternating-sides', 'scroll-progress'],
    animationLevel: 'moderate',
    props: [
      prop('title', 'Section Title'),
      prop('steps', 'Steps', 'array'),
    ],
  }),
  base({
    id: 'how-it-works-interactive',
    category: 'how-it-works',
    name: 'Interactive Process',
    description: 'Click each step to reveal detailed explanation with animation.',
    tags: ['interactive', 'click', 'detail'],
    industries: [...TECH_INDUSTRIES, 'education'],
    features: ['click-reveal', 'animated-detail', 'step-progress'],
    animationLevel: 'moderate',
    props: [
      prop('title', 'Section Title'),
      prop('steps', 'Steps', 'array'),
    ],
  }),
  base({
    id: 'how-it-works-illustrated',
    category: 'how-it-works',
    name: 'Illustrated Process',
    description: 'Steps with illustrations/icons that animate on scroll.',
    tags: ['illustrated', 'icons', 'visual'],
    industries: ALL_INDUSTRIES,
    features: ['illustrations', 'icon-animation', 'visual-storytelling'],
    animationLevel: 'moderate',
    requiredMedia: [
      media('step-icon-1', 'feature-icon', 'icon', '1:1', false, 'icon'),
      media('step-icon-2', 'feature-icon', 'icon', '1:1', false, 'icon'),
      media('step-icon-3', 'feature-icon', 'icon', '1:1', false, 'icon'),
    ],
    props: [
      prop('title', 'Section Title'),
      prop('steps', 'Steps', 'array'),
    ],
  }),
]

// ---------------------------------------------------------------------------
// BLOG VARIANTS (4)
// ---------------------------------------------------------------------------

const blogVariants: SectionVariant[] = [
  base({
    id: 'blog-grid',
    category: 'blog',
    name: 'Blog Grid',
    description: '3-column grid of blog post cards with featured image.',
    tags: ['grid', 'cards', 'featured-image'],
    industries: ALL_INDUSTRIES,
    features: ['card-grid', 'featured-image', 'date-author'],
    animationLevel: 'subtle',
    requiredMedia: [media('blog-img-1', 'hero-image', 'image', '16:9', false)],
    props: [
      prop('title', 'Section Title'),
      prop('subtitle', 'Section Subtitle'),
      prop('posts', 'Blog Posts', 'array'),
      prop('showViewAll', 'Show View All Link', 'boolean', true),
    ],
  }),
  base({
    id: 'blog-featured',
    category: 'blog',
    name: 'Featured Blog Post',
    description: 'Large featured post with smaller recent posts grid.',
    tags: ['featured', 'mixed-size', 'highlight'],
    industries: ALL_INDUSTRIES,
    features: ['featured-highlight', 'mixed-layout', 'read-time'],
    animationLevel: 'subtle',
    requiredMedia: [media('blog-img-featured', 'hero-image', 'image', '16:9')],
    props: [
      prop('title', 'Section Title'),
      prop('posts', 'Blog Posts', 'array'),
    ],
  }),
  base({
    id: 'blog-minimal-list',
    category: 'blog',
    name: 'Minimal Blog List',
    description: 'Clean list of blog posts with title, date, and excerpt.',
    tags: ['list', 'minimal', 'clean'],
    industries: ALL_INDUSTRIES,
    features: ['list-layout', 'minimal-design', 'excerpt'],
    animationLevel: 'none',
    props: [
      prop('title', 'Section Title'),
      prop('posts', 'Blog Posts', 'array'),
    ],
  }),
  base({
    id: 'blog-carousel',
    category: 'blog',
    name: 'Blog Carousel',
    description: 'Horizontal scrollable blog post cards.',
    tags: ['carousel', 'scroll', 'horizontal'],
    industries: ALL_INDUSTRIES,
    features: ['horizontal-scroll', 'snap-scroll', 'card-layout'],
    animationLevel: 'moderate',
    requiredMedia: [media('blog-img-1', 'hero-image', 'image', '16:9', false)],
    props: [
      prop('title', 'Section Title'),
      prop('posts', 'Blog Posts', 'array'),
    ],
  }),
]

// ---------------------------------------------------------------------------
// PORTFOLIO VARIANTS (3)
// ---------------------------------------------------------------------------

const portfolioVariants: SectionVariant[] = [
  base({
    id: 'portfolio-grid',
    category: 'portfolio',
    name: 'Portfolio Grid',
    description: 'Filterable grid of portfolio projects with hover overlay.',
    tags: ['grid', 'filter', 'hover-overlay'],
    industries: ['portfolio', 'creative', 'agency'],
    features: ['filter-categories', 'hover-overlay', 'project-detail'],
    animationLevel: 'moderate',
    requiredMedia: [media('project-img-1', 'gallery-item', 'image', '4:3')],
    props: [
      prop('title', 'Section Title'),
      prop('projects', 'Portfolio Projects', 'array'),
      prop('categories', 'Filter Categories', 'array'),
    ],
  }),
  base({
    id: 'portfolio-case-study',
    category: 'portfolio',
    name: 'Case Study Portfolio',
    description: 'Large case study cards with client, challenge, and result.',
    tags: ['case-study', 'detailed', 'results'],
    industries: ['agency', 'creative', 'portfolio'],
    features: ['case-study-format', 'results-highlight', 'client-info'],
    animationLevel: 'subtle',
    requiredMedia: [media('case-img-1', 'gallery-item', 'image', '16:9')],
    props: [
      prop('title', 'Section Title'),
      prop('caseStudies', 'Case Studies', 'array'),
    ],
  }),
  base({
    id: 'portfolio-fullscreen',
    category: 'portfolio',
    name: 'Fullscreen Portfolio',
    description: 'Full-viewport project slides with scroll-driven transitions.',
    tags: ['fullscreen', 'scroll', 'immersive'],
    industries: ['creative', 'fashion', 'portfolio'],
    features: ['fullscreen-slides', 'scroll-driven', 'immersive'],
    animationLevel: 'dramatic',
    requiredMedia: [media('project-img-1', 'gallery-item', 'image', '16:9')],
    props: [
      prop('title', 'Section Title'),
      prop('projects', 'Portfolio Projects', 'array'),
    ],
  }),
]

// ---------------------------------------------------------------------------
// COMPARISON VARIANTS (2)
// ---------------------------------------------------------------------------

const comparisonVariants: SectionVariant[] = [
  base({
    id: 'comparison-table',
    category: 'comparison',
    name: 'Comparison Table',
    description: 'Feature comparison table with check/cross for multiple options.',
    tags: ['table', 'check-cross', 'features'],
    industries: [...TECH_INDUSTRIES, 'saas'],
    features: ['feature-rows', 'check-marks', 'highlight-recommended'],
    animationLevel: 'subtle',
    props: [
      prop('title', 'Section Title'),
      prop('subtitle', 'Section Subtitle'),
      prop('options', 'Comparison Options', 'array'),
      prop('features', 'Feature Rows', 'array'),
    ],
  }),
  base({
    id: 'comparison-cards',
    category: 'comparison',
    name: 'Comparison Cards',
    description: 'Side-by-side cards comparing two options with visual emphasis.',
    tags: ['cards', 'side-by-side', 'versus'],
    industries: ALL_INDUSTRIES,
    features: ['side-by-side', 'versus-layout', 'visual-comparison'],
    animationLevel: 'moderate',
    props: [
      prop('title', 'Section Title'),
      prop('optionA', 'Option A Title'),
      prop('optionB', 'Option B Title'),
      prop('features', 'Comparison Features', 'array'),
    ],
  }),
]

// ---------------------------------------------------------------------------
// NEWSLETTER VARIANTS (3)
// ---------------------------------------------------------------------------

const newsletterVariants: SectionVariant[] = [
  base({
    id: 'newsletter-inline',
    category: 'newsletter',
    name: 'Inline Newsletter',
    description: 'Compact inline email signup with submit button.',
    tags: ['inline', 'compact', 'email'],
    industries: ALL_INDUSTRIES,
    features: ['email-input', 'inline-layout', 'validation'],
    animationLevel: 'subtle',
    props: [
      prop('title', 'Section Title'),
      prop('subtitle', 'Section Subtitle'),
      prop('placeholder', 'Email Placeholder'),
      prop('buttonText', 'Button Text'),
    ],
  }),
  base({
    id: 'newsletter-card',
    category: 'newsletter',
    name: 'Newsletter Card',
    description: 'Elevated card with email signup and social proof.',
    tags: ['card', 'elevated', 'social-proof'],
    industries: ALL_INDUSTRIES,
    features: ['card-layout', 'subscriber-count', 'social-proof'],
    animationLevel: 'subtle',
    props: [
      prop('title', 'Section Title'),
      prop('subtitle', 'Section Subtitle'),
      prop('placeholder', 'Email Placeholder'),
      prop('subscriberCount', 'Subscriber Count Text'),
    ],
  }),
  base({
    id: 'newsletter-full-section',
    category: 'newsletter',
    name: 'Full Section Newsletter',
    description: 'Full-width newsletter section with benefits list.',
    tags: ['full-width', 'benefits', 'detailed'],
    industries: ALL_INDUSTRIES,
    features: ['benefits-list', 'full-width', 'detailed-description'],
    animationLevel: 'subtle',
    backgroundType: 'gradient',
    props: [
      prop('title', 'Section Title'),
      prop('subtitle', 'Section Subtitle'),
      prop('benefits', 'Benefits List', 'array'),
      prop('placeholder', 'Email Placeholder'),
    ],
  }),
]

// ---------------------------------------------------------------------------
// ABOUT VARIANTS (3)
// ---------------------------------------------------------------------------

const aboutVariants: SectionVariant[] = [
  base({
    id: 'about-story',
    category: 'about',
    name: 'Story About',
    description: 'Company story with timeline milestones and image.',
    tags: ['story', 'timeline', 'milestones'],
    industries: ALL_INDUSTRIES,
    features: ['story-narrative', 'timeline', 'milestone-markers'],
    animationLevel: 'moderate',
    requiredMedia: [media('about-img', 'hero-image', 'image', '4:3', false)],
    props: [
      prop('title', 'Section Title'),
      prop('story', 'Story Text', 'richtext'),
      prop('milestones', 'Milestones', 'array'),
    ],
  }),
  base({
    id: 'about-mission-vision',
    category: 'about',
    name: 'Mission & Vision About',
    description: 'Split layout with mission and vision statements.',
    tags: ['mission', 'vision', 'split'],
    industries: ALL_INDUSTRIES,
    features: ['mission-statement', 'vision-statement', 'split-layout'],
    animationLevel: 'subtle',
    props: [
      prop('title', 'Section Title'),
      prop('mission', 'Mission Statement', 'richtext'),
      prop('vision', 'Vision Statement', 'richtext'),
    ],
  }),
  base({
    id: 'about-values',
    category: 'about',
    name: 'Values About',
    description: 'Company values displayed as icon cards with descriptions.',
    tags: ['values', 'icons', 'cards'],
    industries: ALL_INDUSTRIES,
    features: ['value-cards', 'icon-illustrations', 'grid-layout'],
    animationLevel: 'subtle',
    props: [
      prop('title', 'Section Title'),
      prop('subtitle', 'Section Subtitle'),
      prop('values', 'Company Values', 'array'),
    ],
  }),
]

// ---------------------------------------------------------------------------
// ASSEMBLE REGISTRY
// ---------------------------------------------------------------------------

/** The complete section registry — all 127 variants across all categories. */
export const sectionRegistry: SectionRegistry = {
  navbar: navbarVariants,
  hero: heroVariants,
  features: featuresVariants,
  testimonials: testimonialsVariants,
  pricing: pricingVariants,
  cta: ctaVariants,
  faq: faqVariants,
  footer: footerVariants,
  gallery: galleryVariants,
  team: teamVariants,
  stats: statsVariants,
  contact: contactVariants,
  newsletter: newsletterVariants,
  about: aboutVariants,
  blog: blogVariants,
  portfolio: portfolioVariants,
  'how-it-works': howItWorksVariants,
  partners: partnersVariants,
  comparison: comparisonVariants,
  timeline: [], // Timeline sections are covered by features-timeline and about-story
}

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

/** Get all variants for a given category. */
export const getVariantsByCategory = (category: SectionCategory): SectionVariant[] =>
  sectionRegistry[category] ?? []

/** Get all variants matching a given industry (includes 'all'). */
export const getVariantsForIndustry = (industry: string): SectionVariant[] => {
  const results: SectionVariant[] = []
  for (const variants of Object.values(sectionRegistry)) {
    for (const v of variants) {
      if (v.industries.includes('all') || v.industries.includes(industry)) {
        results.push(v)
      }
    }
  }
  return results
}

/** Get a specific variant by its unique ID. */
export const getVariant = (id: string): SectionVariant | undefined => {
  for (const variants of Object.values(sectionRegistry)) {
    const found = variants.find((v) => v.id === id)
    if (found) return found
  }
  return undefined
}

/** Get all section categories that have at least one variant. */
export const getAllCategories = (): SectionCategory[] =>
  (Object.entries(sectionRegistry) as [SectionCategory, SectionVariant[]][])
    .filter(([, variants]) => variants.length > 0)
    .map(([cat]) => cat)

/** Search variants by a query string — matches against id, name, description, and tags. */
export const searchVariants = (query: string): SectionVariant[] => {
  const q = query.toLowerCase()
  const results: SectionVariant[] = []
  for (const variants of Object.values(sectionRegistry)) {
    for (const v of variants) {
      const haystack = [v.id, v.name, v.description, ...v.tags, ...v.industries].join(' ').toLowerCase()
      if (haystack.includes(q)) {
        results.push(v)
      }
    }
  }
  return results
}

/** Count total variants in the registry. */
export const getTotalVariantCount = (): number =>
  Object.values(sectionRegistry).reduce((sum, variants) => sum + variants.length, 0)
