/**
 * Section Composer Engine
 *
 * Composes a full HTML page from a PageComposition (ordered list of sections).
 * Maps variant IDs → generator functions, wraps sections with markers,
 * collects effects CSS/JS, and assembles the final document.
 *
 * Usage:
 *   composePage(composition) → complete HTML string with section markers
 */

import type {
  PageComposition,
  PageSection,
  SectionCategory,
  SectionPalette,
  SectionFonts,
  SectionOutput,
} from '@ubuilder/types'

import type { ColorPalette, FontCombo } from './design-presets'
import {
  floatingOrbs,
  particlesCanvas,
  waveCanvas,
  gridPattern,
  shootingStars,
  auroraGradient,
  dotMatrix,
} from './background-effects'

// Import effect generators
import {
  scrollReveal,
  staggerReveal,
  parallaxFloat,
  magneticButton,
  tiltCard,
  glowCard,
  shimmerButton,
  gradientMesh,
  noiseTexture,
  counterAnimation,
  typewriterText,
  marquee,
  smoothAccordion,
  blurFade,
  springAnimation,
  liquidGlass,
  containerScroll,
  textShimmer,
  glowingBorder,
  backgroundPaths,
  auroraEffect,
  meteorShower,
  beamEffect,
  spotlightEffect,
  expandableTabs,
  spotlightTitle,
  glassCard,
  gradientBorderAnim,
  dotGrid,
  textGradient,
  sectionFade,
} from './section-effects'

// Import section generators
import {
  generateNavbarMinimal,
  generateNavbarTransparent,
  generateNavbarFloating,
  generateNavbarSplit,
  generateNavbarMegaMenu,
  generateNavbarHamburger,
  generateNavbarSidebar,
  generateNavbarCommand,
  generateHeroGradientMesh,
  generateHeroSplitImage,
  generateHeroFullscreenVideo,
  generateHeroParticles,
  generateHeroTypewriter,
  generateHeroParallaxLayers,
  generateHeroMagazine,
  generateHeroProductShowcase,
  generateHeroMinimalText,
  generateHeroCounterStats,
  generateHeroCarousel,
  generateHeroAurora,
  generateHeroNoiseGradient,
  generateHeroInteractiveCards,
  generateHero3DGlobe,
} from './sections/hero-sections'

import {
  generateFeaturesBentoGrid,
  generateFeaturesTabs,
  generateFeaturesAccordion,
  generateFeaturesZigzag,
  generateFeaturesIconGrid,
  generateFeaturesCarousel,
  generateFeaturesComparison,
  generateFeaturesTimeline,
  generateFeaturesVideoCards,
  generateFeaturesInteractive,
  generateFeaturesStatsIntegrated,
  generateFeaturesHoverableCards,
  generateTestimonialsCarousel,
  generateTestimonialsMasonry,
  generateTestimonialsFeatured,
  generateTestimonialsVideo,
  generateTestimonialsWall,
  generateTestimonialsMinimal,
  generateTestimonialsStarRating,
  generateTestimonialsLogoBar,
  generateTestimonialsBeforeAfter,
  generateTestimonialsGlassmorphism,
  generatePricingAnimatedCards,
  generatePricingToggle,
  generatePricingComparisonTable,
  generatePricingSlider,
  generatePricingMinimal,
  generatePricingGradient,
  generatePricingEnterprise,
  generatePricingIsraeli,
} from './sections/content-sections'

import {
  generateCtaGradientBanner,
  generateCtaSplitImage,
  generateCtaFloatingCard,
  generateCtaNewsletter,
  generateCtaCountdown,
  generateCtaStickyBottom,
  generateCtaVideoBackground,
  generateCtaGlassmorphism,
  generateFaqAccordion,
  generateFaqSearchable,
  generateFaqCategorized,
  generateFaqTwoColumn,
  generateFaqChatStyle,
  generateFooterMultiColumn,
  generateFooterMinimal,
  generateFooterMega,
  generateFooterCentered,
  generateFooterGradient,
  generateFooterCtaIntegrated,
} from './sections/utility-sections-cta-faq-footer'

import {
  generateGalleryMasonry,
  generateGalleryLightbox,
  generateGalleryCarousel,
  generateGalleryFilterable,
  generateGalleryFullscreen,
  generateGalleryBeforeAfter,
  generateTeamGrid,
  generateTeamCarousel,
  generateTeamFlipCards,
  generateTeamHoverable,
  generateStatsCounters,
  generateStatsProgressBars,
  generateStatsDashboard,
  generateStatsRadial,
  generateContactFormMap,
  generateContactSplit,
  generateContactChatWidget,
  generateContactMinimal,
} from './sections/utility-sections-gallery-team-stats-contact'

import {
  generatePartnersMarquee,
  generatePartnersGrid,
  generatePartnersTiered,
  generateHowItWorksSteps,
  generateHowItWorksTimeline,
  generateHowItWorksInteractive,
  generateHowItWorksVideo,
  generateBlogCardGrid,
  generateBlogFeaturedList,
  generateBlogMagazine,
  generateBlogMinimal,
  generatePortfolioCaseStudy,
  generatePortfolioFilterable,
  generatePortfolioMasonry,
  generateComparisonFeatureMatrix,
  generateComparisonBeforeAfter,
  generateNewsletterInline,
  generateNewsletterPopup,
  generateNewsletterBottomBar,
  generateAboutStoryTimeline,
  generateAboutTeamMission,
  generateAboutSplitImage,
} from './sections/utility-sections-extra'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/** A generator function that takes params and returns HTML string */
type GeneratorFn = (params: Record<string, unknown>) => string

/** Effect name used in the effects map */
type EffectName =
  | 'scrollReveal'
  | 'staggerReveal'
  | 'parallaxFloat'
  | 'magneticButton'
  | 'tiltCard'
  | 'glowCard'
  | 'shimmerButton'
  | 'gradientMesh'
  | 'noiseTexture'
  | 'counterAnimation'
  | 'typewriterText'
  | 'marquee'
  | 'smoothAccordion'
  | 'blurFade'
  | 'springAnimation'
  | 'liquidGlass'
  | 'containerScroll'
  | 'textShimmer'
  | 'glowingBorder'
  | 'backgroundPaths'
  | 'auroraEffect'
  | 'meteorShower'
  | 'beamEffect'
  | 'spotlightEffect'
  | 'expandableTabs'
  | 'spotlightTitle'
  | 'glassCard'
  | 'gradientBorderAnim'
  | 'dotGrid'
  | 'textGradient'
  | 'sectionFade'

/* ------------------------------------------------------------------ */
/*  Palette/Font adapters                                              */
/* ------------------------------------------------------------------ */

/** Convert SectionPalette → ColorPalette (they match, but explicit conversion) */
const toColorPalette = (p: SectionPalette): ColorPalette => ({
  primary: p.primary,
  primaryHover: p.primaryHover,
  secondary: p.secondary,
  background: p.background,
  backgroundAlt: p.backgroundAlt,
  text: p.text,
  textMuted: p.textMuted,
  border: p.border,
  accent: p.accent,
})

/** Convert SectionFonts → FontCombo */
const toFontCombo = (f: SectionFonts): FontCombo => ({
  heading: f.heading,
  body: f.body,
  headingWeight: f.headingWeight,
  bodyWeight: f.bodyWeight,
})

/* ------------------------------------------------------------------ */
/*  Default palette and fonts                                          */
/* ------------------------------------------------------------------ */

const DEFAULT_PALETTE: SectionPalette = {
  primary: '#7C3AED',
  primaryHover: '#6D28D9',
  secondary: '#06B6D4',
  background: '#FFFFFF',
  backgroundAlt: '#F8FAFC',
  text: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
  accent: '#F59E0B',
}

const DEFAULT_FONTS: SectionFonts = {
  heading: 'Inter',
  body: 'Inter',
  headingWeight: '700',
  bodyWeight: '400',
}

/* ------------------------------------------------------------------ */
/*  Generator Registry — maps variant IDs to generator functions       */
/* ------------------------------------------------------------------ */

/**
 * Maps variant IDs (e.g., "hero-gradient-mesh") to their generator functions.
 * The generators use different param shapes, so we wrap them with a
 * standardized adapter in resolveGenerator().
 */
const GENERATOR_MAP: Record<string, GeneratorFn> = {}

/** Register a generator with a variant ID */
const reg = (id: string, fn: GeneratorFn) => {
  GENERATOR_MAP[id] = fn
}

// --- Navbar generators ---
reg('nav-minimal', generateNavbarMinimal as unknown as GeneratorFn)
reg('nav-transparent', generateNavbarTransparent as unknown as GeneratorFn)
reg('nav-floating', generateNavbarFloating as unknown as GeneratorFn)
reg('nav-split', generateNavbarSplit as unknown as GeneratorFn)
reg('nav-mega-menu', generateNavbarMegaMenu as unknown as GeneratorFn)
reg('nav-hamburger', generateNavbarHamburger as unknown as GeneratorFn)
reg('nav-sidebar', generateNavbarSidebar as unknown as GeneratorFn)
reg('nav-command', generateNavbarCommand as unknown as GeneratorFn)

// --- Hero generators ---
reg('hero-gradient-mesh', generateHeroGradientMesh as unknown as GeneratorFn)
reg('hero-split-image', generateHeroSplitImage as unknown as GeneratorFn)
reg('hero-fullscreen-video', generateHeroFullscreenVideo as unknown as GeneratorFn)
reg('hero-particles', generateHeroParticles as unknown as GeneratorFn)
reg('hero-typewriter', generateHeroTypewriter as unknown as GeneratorFn)
reg('hero-parallax-layers', generateHeroParallaxLayers as unknown as GeneratorFn)
reg('hero-magazine', generateHeroMagazine as unknown as GeneratorFn)
reg('hero-product-showcase', generateHeroProductShowcase as unknown as GeneratorFn)
reg('hero-minimal-text', generateHeroMinimalText as unknown as GeneratorFn)
reg('hero-counter-stats', generateHeroCounterStats as unknown as GeneratorFn)
reg('hero-carousel', generateHeroCarousel as unknown as GeneratorFn)
reg('hero-aurora', generateHeroAurora as unknown as GeneratorFn)
reg('hero-noise-gradient', generateHeroNoiseGradient as unknown as GeneratorFn)
reg('hero-interactive-cards', generateHeroInteractiveCards as unknown as GeneratorFn)
reg('hero-3d-globe', generateHero3DGlobe as unknown as GeneratorFn)

// --- Features generators ---
reg('features-bento-grid', generateFeaturesBentoGrid as unknown as GeneratorFn)
reg('features-tabs', generateFeaturesTabs as unknown as GeneratorFn)
reg('features-accordion', generateFeaturesAccordion as unknown as GeneratorFn)
reg('features-zigzag', generateFeaturesZigzag as unknown as GeneratorFn)
reg('features-icon-grid', generateFeaturesIconGrid as unknown as GeneratorFn)
reg('features-carousel', generateFeaturesCarousel as unknown as GeneratorFn)
reg('features-comparison', generateFeaturesComparison as unknown as GeneratorFn)
reg('features-timeline', generateFeaturesTimeline as unknown as GeneratorFn)
reg('features-video-cards', generateFeaturesVideoCards as unknown as GeneratorFn)
reg('features-interactive', generateFeaturesInteractive as unknown as GeneratorFn)
reg('features-stats-integrated', generateFeaturesStatsIntegrated as unknown as GeneratorFn)
reg('features-hoverable-cards', generateFeaturesHoverableCards as unknown as GeneratorFn)

// --- Testimonials generators ---
reg('testimonials-carousel', generateTestimonialsCarousel as unknown as GeneratorFn)
reg('testimonials-masonry', generateTestimonialsMasonry as unknown as GeneratorFn)
reg('testimonials-featured', generateTestimonialsFeatured as unknown as GeneratorFn)
reg('testimonials-video', generateTestimonialsVideo as unknown as GeneratorFn)
reg('testimonials-wall', generateTestimonialsWall as unknown as GeneratorFn)
reg('testimonials-minimal', generateTestimonialsMinimal as unknown as GeneratorFn)
reg('testimonials-star-rating', generateTestimonialsStarRating as unknown as GeneratorFn)
reg('testimonials-logo-bar', generateTestimonialsLogoBar as unknown as GeneratorFn)
reg('testimonials-before-after', generateTestimonialsBeforeAfter as unknown as GeneratorFn)
reg('testimonials-glassmorphism', generateTestimonialsGlassmorphism as unknown as GeneratorFn)

// --- Pricing generators ---
reg('pricing-animated-cards', generatePricingAnimatedCards as unknown as GeneratorFn)
reg('pricing-toggle', generatePricingToggle as unknown as GeneratorFn)
reg('pricing-comparison-table', generatePricingComparisonTable as unknown as GeneratorFn)
reg('pricing-slider', generatePricingSlider as unknown as GeneratorFn)
reg('pricing-minimal', generatePricingMinimal as unknown as GeneratorFn)
reg('pricing-gradient', generatePricingGradient as unknown as GeneratorFn)
reg('pricing-enterprise', generatePricingEnterprise as unknown as GeneratorFn)
reg('pricing-israeli', generatePricingIsraeli as unknown as GeneratorFn)

// --- CTA generators ---
reg('cta-gradient-banner', generateCtaGradientBanner as unknown as GeneratorFn)
reg('cta-split-image', generateCtaSplitImage as unknown as GeneratorFn)
reg('cta-floating-card', generateCtaFloatingCard as unknown as GeneratorFn)
reg('cta-newsletter', generateCtaNewsletter as unknown as GeneratorFn)
reg('cta-countdown', generateCtaCountdown as unknown as GeneratorFn)
reg('cta-sticky-bottom', generateCtaStickyBottom as unknown as GeneratorFn)
reg('cta-video-background', generateCtaVideoBackground as unknown as GeneratorFn)
reg('cta-glassmorphism', generateCtaGlassmorphism as unknown as GeneratorFn)

// --- FAQ generators ---
reg('faq-accordion', generateFaqAccordion as unknown as GeneratorFn)
reg('faq-searchable', generateFaqSearchable as unknown as GeneratorFn)
reg('faq-categorized', generateFaqCategorized as unknown as GeneratorFn)
reg('faq-two-column', generateFaqTwoColumn as unknown as GeneratorFn)
reg('faq-chat-style', generateFaqChatStyle as unknown as GeneratorFn)

// --- Footer generators ---
reg('footer-multi-column', generateFooterMultiColumn as unknown as GeneratorFn)
reg('footer-minimal', generateFooterMinimal as unknown as GeneratorFn)
reg('footer-mega', generateFooterMega as unknown as GeneratorFn)
reg('footer-centered', generateFooterCentered as unknown as GeneratorFn)
reg('footer-gradient', generateFooterGradient as unknown as GeneratorFn)
reg('footer-cta-integrated', generateFooterCtaIntegrated as unknown as GeneratorFn)

// --- Gallery generators ---
reg('gallery-masonry', generateGalleryMasonry as unknown as GeneratorFn)
reg('gallery-lightbox', generateGalleryLightbox as unknown as GeneratorFn)
reg('gallery-carousel', generateGalleryCarousel as unknown as GeneratorFn)
reg('gallery-filterable', generateGalleryFilterable as unknown as GeneratorFn)
reg('gallery-fullscreen', generateGalleryFullscreen as unknown as GeneratorFn)
reg('gallery-before-after', generateGalleryBeforeAfter as unknown as GeneratorFn)

// --- Team generators ---
reg('team-grid', generateTeamGrid as unknown as GeneratorFn)
reg('team-carousel', generateTeamCarousel as unknown as GeneratorFn)
reg('team-flip-cards', generateTeamFlipCards as unknown as GeneratorFn)
reg('team-hoverable', generateTeamHoverable as unknown as GeneratorFn)

// --- Stats generators ---
reg('stats-counters', generateStatsCounters as unknown as GeneratorFn)
reg('stats-progress-bars', generateStatsProgressBars as unknown as GeneratorFn)
reg('stats-dashboard', generateStatsDashboard as unknown as GeneratorFn)
reg('stats-radial', generateStatsRadial as unknown as GeneratorFn)

// --- Contact generators ---
reg('contact-form-map', generateContactFormMap as unknown as GeneratorFn)
reg('contact-split', generateContactSplit as unknown as GeneratorFn)
reg('contact-chat-widget', generateContactChatWidget as unknown as GeneratorFn)
reg('contact-minimal', generateContactMinimal as unknown as GeneratorFn)

// --- Partners generators ---
reg('partners-marquee', generatePartnersMarquee as unknown as GeneratorFn)
reg('partners-grid', generatePartnersGrid as unknown as GeneratorFn)
reg('partners-tiered', generatePartnersTiered as unknown as GeneratorFn)

// --- How-It-Works generators ---
reg('how-it-works-steps', generateHowItWorksSteps as unknown as GeneratorFn)
reg('how-it-works-timeline', generateHowItWorksTimeline as unknown as GeneratorFn)
reg('how-it-works-interactive', generateHowItWorksInteractive as unknown as GeneratorFn)
reg('how-it-works-video', generateHowItWorksVideo as unknown as GeneratorFn)

// --- Blog generators ---
reg('blog-card-grid', generateBlogCardGrid as unknown as GeneratorFn)
reg('blog-featured-list', generateBlogFeaturedList as unknown as GeneratorFn)
reg('blog-magazine', generateBlogMagazine as unknown as GeneratorFn)
reg('blog-minimal', generateBlogMinimal as unknown as GeneratorFn)

// --- Portfolio generators ---
reg('portfolio-case-study', generatePortfolioCaseStudy as unknown as GeneratorFn)
reg('portfolio-filterable', generatePortfolioFilterable as unknown as GeneratorFn)
reg('portfolio-masonry', generatePortfolioMasonry as unknown as GeneratorFn)

// --- Comparison generators ---
reg('comparison-feature-matrix', generateComparisonFeatureMatrix as unknown as GeneratorFn)
reg('comparison-before-after', generateComparisonBeforeAfter as unknown as GeneratorFn)

// --- Newsletter generators ---
reg('newsletter-inline', generateNewsletterInline as unknown as GeneratorFn)
reg('newsletter-popup', generateNewsletterPopup as unknown as GeneratorFn)
reg('newsletter-bottom-bar', generateNewsletterBottomBar as unknown as GeneratorFn)

// --- About generators ---
reg('about-story-timeline', generateAboutStoryTimeline as unknown as GeneratorFn)
reg('about-team-mission', generateAboutTeamMission as unknown as GeneratorFn)
reg('about-split-image', generateAboutSplitImage as unknown as GeneratorFn)

// --- Aliases: AI sometimes generates "navbar-X" instead of "nav-X" ---
reg('navbar-minimal', generateNavbarMinimal as unknown as GeneratorFn)
reg('navbar-transparent', generateNavbarTransparent as unknown as GeneratorFn)
reg('navbar-floating', generateNavbarFloating as unknown as GeneratorFn)
reg('navbar-split', generateNavbarSplit as unknown as GeneratorFn)
reg('navbar-mega-menu', generateNavbarMegaMenu as unknown as GeneratorFn)
reg('navbar-hamburger', generateNavbarHamburger as unknown as GeneratorFn)
reg('navbar-sidebar', generateNavbarSidebar as unknown as GeneratorFn)
reg('navbar-command', generateNavbarCommand as unknown as GeneratorFn)

/* ------------------------------------------------------------------ */
/*  Effects collector                                                  */
/* ------------------------------------------------------------------ */

/** Map of effect name → generator function */
const EFFECT_GENERATORS: Record<EffectName, () => { css: string; js?: string }> = {
  scrollReveal,
  staggerReveal,
  parallaxFloat,
  magneticButton,
  tiltCard,
  glowCard,
  shimmerButton,
  gradientMesh,
  noiseTexture,
  counterAnimation,
  typewriterText,
  marquee,
  smoothAccordion,
  blurFade,
  springAnimation,
  liquidGlass,
  containerScroll,
  textShimmer,
  glowingBorder,
  backgroundPaths,
  auroraEffect,
  meteorShower,
  beamEffect,
  spotlightEffect,
  expandableTabs,
  spotlightTitle,
  glassCard,
  gradientBorderAnim,
  dotGrid,
  textGradient,
  sectionFade,
}

/** CSS class → effect name mapping (detects which effects are needed from HTML) */
const CLASS_TO_EFFECT: Record<string, EffectName> = {
  'motion-reveal': 'scrollReveal',
  'stagger-reveal': 'staggerReveal',
  'parallax-float': 'parallaxFloat',
  'magnetic-btn': 'magneticButton',
  'tilt-card': 'tiltCard',
  'glow-card': 'glowCard',
  'shimmer-btn': 'shimmerButton',
  'gradient-mesh': 'gradientMesh',
  'noise-overlay': 'noiseTexture',
  'counter-value': 'counterAnimation',
  'typewriter-cursor': 'typewriterText',
  'marquee-track': 'marquee',
  'smooth-accordion': 'smoothAccordion',
  'blur-fade': 'blurFade',
  'spring-anim': 'springAnimation',
  'liquid-glass': 'liquidGlass',
  'container-scroll': 'containerScroll',
  'text-shimmer': 'textShimmer',
  'glowing-border': 'glowingBorder',
  'bg-paths': 'backgroundPaths',
  'aurora-bg': 'auroraEffect',
  'meteor-shower': 'meteorShower',
  'meteor': 'meteorShower',
  'beam-line': 'beamEffect',
  'spotlight-section': 'spotlightEffect',
  'expandable-tabs': 'expandableTabs',
  'spotlight-title': 'spotlightTitle',
  'glass-card': 'glassCard',
  'gradient-border-anim': 'gradientBorderAnim',
  'dot-grid': 'dotGrid',
  'dot-grid-dark': 'dotGrid',
  'text-gradient': 'textGradient',
  'section-fade-top': 'sectionFade',
  'section-fade-bottom': 'sectionFade',
}

/**
 * Scans all section HTML to detect which effects are used,
 * then collects CSS/JS for those effects (deduplicating).
 */
const collectEffects = (sectionHtmls: string[]): { css: string; js: string } => {
  const allHtml = sectionHtmls.join('\n')
  const neededEffects = new Set<EffectName>()

  for (const [className, effectName] of Object.entries(CLASS_TO_EFFECT)) {
    if (allHtml.includes(className)) {
      neededEffects.add(effectName)
    }
  }

  let css = ''
  let js = ''

  for (const name of neededEffects) {
    const gen = EFFECT_GENERATORS[name]
    if (gen) {
      const output = gen()
      css += output.css + '\n'
      if (output.js) js += output.js + '\n'
    }
  }

  return { css, js }
}

/* ------------------------------------------------------------------ */
/*  Section marker wrapping                                            */
/* ------------------------------------------------------------------ */

/**
 * Wraps a section's HTML with comment markers for editor identification.
 * Format: <!-- section:category:variant-id -->
 */
const wrapWithMarkers = (html: string, section: PageSection): string => {
  const startMarker = `<!-- section:${section.category}:${section.variantId} -->`
  const endMarker = `<!-- /section:${section.category}:${section.variantId} -->`
  return `${startMarker}\n${html}\n${endMarker}`
}

/* ------------------------------------------------------------------ */
/*  Section generation                                                 */
/* ------------------------------------------------------------------ */

/**
 * Adapt generic plan items ({ title, description, icon }) to section-specific types.
 * This bridges the gap between AI planning output and generator param shapes.
 */
const adaptContent = (
  category: string,
  content: Record<string, unknown>,
): Record<string, unknown> => {
  const items = content.items as { title?: string; description?: string; icon?: string }[] | undefined

  // Normalize headline/title fields — generators use different names
  const cta = content.cta as Record<string, unknown> | undefined
  const normalized: Record<string, unknown> = {
    ...content,
    // Map businessName → brand for navbar generators
    brand: content.brand || content.businessName || content.siteName || 'Brand',
    // Ensure both title and headline exist (generators use different ones)
    title: content.title || content.headline || '',
    subtitle: content.subtitle || content.subheadline || content.description || '',
    headline: content.headline || content.title || '',
    subheadline: content.subheadline || content.subtitle || content.description || '',
    // Normalize CTA — AI may send { cta: { text, action } } or { ctaText, ctaLink }
    ctaText: content.ctaText || cta?.text || cta?.label || '',
    ctaLink: content.ctaLink || cta?.action || cta?.href || cta?.link || '#',
  }

  switch (category) {
    case 'navbar': {
      const rawLinks = (content.links || content.items || []) as Array<Record<string, unknown>>
      return {
        ...normalized,
        links: rawLinks.map(l => ({
          label: l.label || l.text || l.title || l.name || 'Link',
          href: l.href || l.url || l.link || '#',
        })),
      }
    }
    case 'testimonials': {
      // Plan items: { title: "Person Name", description: "Quote", icon: "Role at Company" }
      // Generator expects: { quote, author, role, rating? }
      if (items?.length) {
        return {
          ...normalized,
          items: items.map(item => ({
            quote: item.description || '',
            author: item.title || 'Client',
            role: item.icon || 'Customer',
            rating: 5,
          })),
        }
      }
      break
    }
    case 'pricing': {
      // V1.3.1: Handle both old format { title, description } and new enriched format { name, price, features[], ... }
      const rawItems = (content.items || content.plans || []) as Record<string, unknown>[]
      if (rawItems.length) {
        const plans = rawItems.map((item, i) => {
          // New enriched format: { name, price (number), currency, features[], cta, popular, originalPrice, description }
          if (item.name && (item.price !== undefined || item.features)) {
            const priceVal = item.price !== undefined ? `${item.currency || '₪'}${item.price}` : ''
            const originalVal = item.originalPrice ? `${item.currency || '₪'}${item.originalPrice}` : undefined
            return {
              name: item.name as string,
              price: priceVal,
              originalPrice: originalVal,
              period: (item.period as string) || '',
              description: (item.description as string) || '',
              features: Array.isArray(item.features) ? (item.features as string[]).slice(0, 6) : [],
              cta: (item.cta as string) || (i === 1 ? 'התחילו עכשיו' : 'בחרו תוכנית'),
              href: (item.href as string) || '#',
              popular: item.popular === true || i === 1,
            }
          }
          // Old format: { title, description: "$XX/mo — feature1, feature2..." }
          const desc = (item.description as string) || ''
          const priceMatch = desc.match(/\$[\d,.]+(?:\/\w+)?|₪[\d,.]+|[\d,.]+\s*₪/)
          const price = priceMatch ? priceMatch[0] : (item.title as string || `Plan ${i + 1}`)
          const features = desc.replace(priceMatch?.[0] || '', '')
            .split(/[,;—–\-\|]/)
            .map(f => f.trim())
            .filter(f => f.length > 2)
          return {
            name: (item.title as string) || `Plan ${i + 1}`,
            price,
            period: '/חודש',
            description: features[0] || (item.title as string) || '',
            features: features.length > 1 ? features.slice(0, 6) : ['שירות מלא', 'תמיכה', 'דוחות'],
            cta: (item.cta as string) || (i === 1 ? 'התחילו עכשיו' : 'בחרו תוכנית'),
            popular: i === 1,
          }
        })
        return { ...normalized, plans, items: plans }
      }
      break
    }
    case 'faq': {
      // V1.3.1: Handle both { title, description } and { question, answer } formats
      const faqItems = (content.items || []) as Record<string, unknown>[]
      if (faqItems.length) {
        return {
          ...normalized,
          items: faqItems.map(item => ({
            title: (item.title || item.question || '') as string,
            description: (item.description || item.answer || '') as string,
            question: (item.question || item.title || '') as string,
            answer: (item.answer || item.description || '') as string,
          })),
        }
      }
      break
    }
    case 'stats': {
      // Plan items: { title: "100+", description: "Stat Label", icon: "📊" }
      // Generator expects: { value, label } or businessName/businessType
      if (items?.length) {
        return {
          ...normalized,
          stats: items.map(item => ({
            value: item.title || '0',
            label: item.description || '',
          })),
        }
      }
      break
    }
    case 'team': {
      // Plan items: { title: "Person Name", description: "Role — Bio", icon: "👤" }
      if (items?.length) {
        return {
          ...normalized,
          members: items.map(item => {
            const parts = (item.description || '').split(/[—–\-]/).map(s => s.trim())
            return {
              name: item.title || 'Team Member',
              role: parts[0] || '',
              bio: parts.slice(1).join(' ') || '',
              avatar: item.icon || '👤',
            }
          }),
        }
      }
      break
    }
    case 'features': {
      // Plan items: { title, description, icon } — already compatible with generators
      // Just ensure items array is passed through correctly
      break
    }
    case 'gallery': {
      // V1.3.1: Handle items with image URLs from scan data
      const galleryItems = (content.items || []) as Record<string, unknown>[]
      if (galleryItems.length) {
        return {
          ...normalized,
          images: galleryItems.map(item => ({
            caption: (item.title || item.caption || '') as string,
            alt: (item.description || item.alt || item.title || '') as string,
            src: (item.image || item.src || '') as string,
          })),
          items: galleryItems.map(item => ({
            title: (item.title || item.caption || '') as string,
            description: (item.description || item.alt || '') as string,
            image: (item.image || item.src || '') as string,
          })),
        }
      }
      break
    }
    case 'blog': {
      // Plan items: { title: "Post Title", description: "Excerpt...", icon: "📝" }
      if (items?.length) {
        return {
          ...normalized,
          posts: items.map(item => ({
            title: item.title || 'Blog Post',
            excerpt: item.description || '',
            date: new Date().toLocaleDateString(),
            category: item.icon || '📝',
          })),
        }
      }
      break
    }
    case 'portfolio': {
      // Plan items: { title: "Project Name", description: "Description", icon: "🎨" }
      if (items?.length) {
        return {
          ...normalized,
          projects: items.map(item => ({
            title: item.title || 'Project',
            description: item.description || '',
            category: item.icon || '🎨',
          })),
        }
      }
      break
    }
    case 'partners': {
      // Plan items: { title: "Partner Name", description: "Industry/type", icon: "🤝" }
      if (items?.length) {
        return {
          ...normalized,
          partners: items.map(item => ({
            name: item.title || 'Partner',
            industry: item.description || '',
          })),
        }
      }
      break
    }
    case 'how-it-works': {
      // Plan items: { title: "Step Title", description: "Step description", icon: "1️⃣" }
      if (items?.length) {
        return {
          ...normalized,
          steps: items.map((item, i) => ({
            num: i + 1,
            title: item.title || `Step ${i + 1}`,
            desc: item.description || '',
            icon: item.icon || `${i + 1}`,
          })),
        }
      }
      break
    }
    case 'comparison': {
      // Plan items: { title: "Feature", description: "Us: ✅ | Them: ❌", icon: "⚖️" }
      if (items?.length) {
        return {
          ...normalized,
          rows: items.map(item => ({
            feature: item.title || '',
            us: item.description?.includes('✅') || true,
            them: item.description?.includes('❌') ? false : true,
          })),
        }
      }
      break
    }
    case 'about':
    case 'newsletter':
    case 'contact':
    case 'cta':
      // These use headline/subheadline/ctaText which are already mapped
      // in tryComposedGeneration — no item transformation needed
      break
    default:
      break
  }
  return normalized
}

/**
 * Generate a single section's HTML from its variant ID and content.
 * If the variant ID is not found, returns a placeholder section.
 */
const generateSection = (
  section: PageSection,
  palette: SectionPalette,
  fonts: SectionFonts,
): SectionOutput => {
  const resolvedId = resolveVariantId(section.variantId)
  const generator = resolvedId ? GENERATOR_MAP[resolvedId] : null

  if (!generator) {
    // Placeholder for unregistered variants
    const p = toColorPalette(palette)
    return {
      html: `<section class="py-20 px-6 text-center" style="background:${p.backgroundAlt};color:${p.textMuted}">
  <div class="max-w-2xl mx-auto">
    <p class="text-sm uppercase tracking-widest mb-2 opacity-50">${section.category}</p>
    <h2 class="text-2xl font-bold mb-4" style="color:${p.text}">${section.variantId}</h2>
    <p>This section variant is coming soon. Use the AI chat to customize it.</p>
  </div>
</section>`,
    }
  }

  // Adapt generic plan content to section-specific param shapes
  const adaptedContent = adaptContent(section.category, section.content || {})

  // Build params from section content + palette + fonts
  const params = {
    ...adaptedContent,
    ...(section.images || {}),
    palette: toColorPalette(palette),
    fonts: toFontCombo(fonts),
  }

  try {
    const html = generator(params)
    return { html }
  } catch (err) {
    console.error(`[section-composer] Generator failed for ${section.variantId}:`, err)
    return {
      html: `<section class="py-16 px-6 text-center bg-red-50 text-red-600">
  <p class="font-medium">Error generating section: ${section.variantId}</p>
</section>`,
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Automatic background effect injection                              */
/* ------------------------------------------------------------------ */

/**
 * Selects and injects a background effect for a section based on its
 * category and position in the page. This adds visual variety without
 * modifying individual generators.
 *
 * Rules:
 * - Hero sections: always get particles/orbs (most dramatic)
 * - Stats/CTA: get subtle grid/dots (supportive)
 * - Features: get dot-matrix or grid-fade (depth)
 * - Testimonials: keep clean (content focus)
 * - Every other dark-bg section: alternate between effects
 */
const injectBackground = (
  html: string,
  category: string,
  index: number,
  palette: SectionPalette,
): string => {
  // Detect dark vs light backgrounds
  const isDark = html.includes('background:#0B') || html.includes('background:#0a') ||
    html.includes('background:#11') || html.includes('background:#1') ||
    html.includes('background: #0B') || html.includes('background: #0a') ||
    html.includes('background: #11') || html.includes('background: #1')
  // Light backgrounds also get effects — just with subtler colors
  const isLight = !isDark

  let bgEffect = ''
  switch (category) {
    case 'hero':
      // Heroes already have effects injected by hero-sections.ts for gradient-mesh/aurora/noise
      // Only add for heroes that DON'T have them
      if (!html.includes('ptcl-') && !html.includes('orbs-') && !html.includes('aurora-')) {
        bgEffect = dotMatrix({ color: `${palette.primary}15`, size: 24 })
      }
      break
    case 'stats':
      bgEffect = gridPattern({ color: isLight ? `${palette.primary}10` : `${palette.primary}12`, size: 32, fade: true })
      break
    case 'cta':
      bgEffect = floatingOrbs({ c1: palette.primary, c2: palette.secondary, c3: palette.accent })
      break
    case 'features':
      bgEffect = dotMatrix({ color: isLight ? `${palette.primary}08` : `rgba(255,255,255,0.04)`, size: 20 })
      break
    case 'testimonials':
      bgEffect = gridPattern({ color: isLight ? `${palette.primary}06` : 'rgba(255,255,255,0.03)', size: 48, fade: true })
      break
    case 'pricing':
      bgEffect = gridPattern({ color: `${palette.primary}08`, size: 36, fade: true })
      break
    case 'team':
      bgEffect = dotMatrix({ color: isLight ? `${palette.primary}08` : 'rgba(255,255,255,0.03)', size: 28 })
      break
    case 'how-it-works':
      bgEffect = gridPattern({ color: isLight ? `${palette.primary}08` : 'rgba(255,255,255,0.04)', size: 40, fade: true })
      break
    case 'portfolio':
    case 'gallery':
      bgEffect = dotMatrix({ color: isLight ? `${palette.primary}06` : 'rgba(255,255,255,0.02)', size: 24 })
      break
    default:
      // Alternate between effects for variety
      if (index % 3 === 0) {
        bgEffect = gridPattern({ color: isLight ? `${palette.primary}06` : 'rgba(255,255,255,0.03)', size: 40, fade: true })
      } else if (index % 3 === 1) {
        bgEffect = dotMatrix({ color: isLight ? `${palette.primary}06` : 'rgba(255,255,255,0.04)', size: 20 })
      }
      break
  }

  if (!bgEffect) return html

  // Inject background effect right after the opening <section tag
  // Make sure section has position:relative
  return html.replace(
    /(<section[^>]*)(>)/,
    (match, tag, close) => {
      const hasRelative = tag.includes('position:relative')
      const style = hasRelative ? '' : ';position:relative;overflow:hidden'
      // Add position:relative to the inline style if not present
      if (tag.includes('style="')) {
        return tag.replace(/style="([^"]*)"/, `style="$1${style}"`) + close + '\n' + bgEffect
      }
      return tag + ` style="position:relative;overflow:hidden"` + close + '\n' + bgEffect
    }
  )
}

/* ------------------------------------------------------------------ */
/*  Google Fonts URL builder                                           */
/* ------------------------------------------------------------------ */

/** Build a Google Fonts URL from the font configuration */
const buildGoogleFontsUrl = (fonts: SectionFonts): string => {
  const families = new Set<string>()
  families.add(`${fonts.heading}:wght@${fonts.headingWeight}`)
  if (fonts.body !== fonts.heading) {
    families.add(`${fonts.body}:wght@${fonts.bodyWeight}`)
  }
  const familyParam = Array.from(families)
    .map((f) => `family=${f.replace(/ /g, '+')}`)
    .join('&')
  return `https://fonts.googleapis.com/css2?${familyParam}&display=swap`
}

/* ------------------------------------------------------------------ */
/*  Main composer                                                      */
/* ------------------------------------------------------------------ */

/**
 * Compose a full HTML page from a PageComposition.
 *
 * @param composition - The page composition with ordered sections
 * @returns Complete HTML string ready for iframe rendering
 */
export const composePage = (composition: PageComposition): string => {
  const {
    siteName,
    locale,
    palette = DEFAULT_PALETTE,
    fonts = DEFAULT_FONTS,
    sections,
    globalCss = '',
    globalJs = '',
  } = composition

  const dir = locale === 'he' ? 'rtl' : 'ltr'
  const lang = locale === 'he' ? 'he' : 'en'

  // Sort sections by order
  const sortedSections = [...sections].sort((a, b) => a.order - b.order)

  // Generate all sections
  const sectionOutputs = sortedSections.map((section) => ({
    section,
    output: generateSection(section, palette, fonts),
  }))

  // Wrap each section with markers
  // Inject background effects into sections for visual variety
  const enhancedOutputs = sectionOutputs.map(({ section, output }, index) => ({
    section,
    output: {
      ...output,
      html: injectBackground(output.html, section.category, index, palette),
    },
  }))

  const sectionHtmls = enhancedOutputs.map(({ section, output }) =>
    wrapWithMarkers(output.html, section)
  )

  // Collect effects CSS/JS from all section HTML
  const rawHtmls = enhancedOutputs.map(({ output }) => output.html)
  const effects = collectEffects(rawHtmls)

  // Collect section-level CSS/JS
  const sectionCss = enhancedOutputs
    .map(({ output }) => output.css || '')
    .filter(Boolean)
    .join('\n')
  const sectionJs = enhancedOutputs
    .map(({ output }) => output.js || '')
    .filter(Boolean)
    .join('\n')

  // Build Google Fonts URL
  const googleFontsUrl = buildGoogleFontsUrl(fonts)

  // Assemble the full page
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${siteName}</title>
  <meta name="description" content="${siteName} — Built with UBuilder AI">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${googleFontsUrl}" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lucide-static@latest/font/lucide.min.css">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    /* Global base styles */
    *, *::before, *::after { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      font-family: '${fonts.body}', system-ui, sans-serif;
      font-weight: ${fonts.bodyWeight};
      color: ${palette.text};
      background: ${palette.background};
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    h1, h2, h3, h4, h5, h6 {
      font-family: '${fonts.heading}', system-ui, sans-serif;
      font-weight: ${fonts.headingWeight};
    }
    img { max-width: 100%; height: auto; }
    a { color: inherit; text-decoration: none; }

    /* Effects CSS */
    ${effects.css}

    /* Section-level CSS */
    ${sectionCss}

    /* Global custom CSS */
    ${globalCss}
  </style>
</head>
<body>
${sectionHtmls.join('\n\n')}

<script>
// Effects JS
${effects.js}

// Section-level JS
${sectionJs}

// Global custom JS
${globalJs}
</script>
</body>
</html>`
}

/* ------------------------------------------------------------------ */
/*  Utility exports                                                    */
/* ------------------------------------------------------------------ */

/**
 * Generate a single section by variant ID with the given params.
 * Useful for the section picker UI — preview/insert individual sections.
 */
export const generateSingleSection = (
  variantId: string,
  params: {
    businessName?: string
    businessType?: string
    locale?: string
    primaryColor?: string
    secondaryColor?: string
  } = {},
): string | null => {
  const generator = GENERATOR_MAP[variantId]
  if (!generator) return null

  try {
    return generator(params as Record<string, unknown>)
  } catch (err) {
    console.error(`[section-composer] generateSingleSection failed for ${variantId}:`, err)
    return null
  }
}

/**
 * Get list of all registered variant IDs.
 * Useful for validation and debugging.
 */
export const getRegisteredVariants = (): string[] => Object.keys(GENERATOR_MAP)

/**
 * Check if a variant ID has a registered generator.
 */
/**
 * Resolve a variantId to the closest matching generator key.
 * Tries: exact match → underscore→hyphen → category prefix removal → closest in category.
 */
export const resolveVariantId = (variantId: string): string | null => {
  // Exact match
  if (variantId in GENERATOR_MAP) return variantId

  // Underscore → hyphen (common AI mistake)
  const hyphenated = variantId.replace(/_/g, '-')
  if (hyphenated in GENERATOR_MAP) return hyphenated

  // Try without category prefix duplication (e.g. "hero-hero-gradient" → "hero-gradient")
  const deduped = variantId.replace(/^(\w+)-\1-/, '$1-')
  if (deduped in GENERATOR_MAP) return deduped

  // Try adding common prefixes: nav- → navbar-
  // Direct single-ID aliases (AI frequently uses singular/short forms)
  const directAliases: Record<string, string> = {
    'stats-counter': 'stats-counters',
    'stat-counter': 'stats-counters',
    'stat-counters': 'stats-counters',
  }
  if (variantId in directAliases && directAliases[variantId] in GENERATOR_MAP) {
    return directAliases[variantId]
  }

  const aliases: Record<string, string> = {
    'nav-': 'navbar-', 'navbar-': 'nav-',
    'feature-': 'features-', 'features-': 'feature-',
    'testimonial-': 'testimonials-', 'testimonials-': 'testimonial-',
    'price-': 'pricing-', 'pricing-': 'price-',
    'stat-': 'stats-', 'stats-': 'stat-',
  }
  for (const [from, to] of Object.entries(aliases)) {
    if (variantId.startsWith(from)) {
      const alt = to + variantId.slice(from.length)
      if (alt in GENERATOR_MAP) return alt
    }
  }

  // Try adding 's' suffix (counter → counters, feature → features)
  const withS = variantId + 's'
  if (withS in GENERATOR_MAP) return withS
  // Try removing trailing 's'
  if (variantId.endsWith('s')) {
    const withoutS = variantId.slice(0, -1)
    if (withoutS in GENERATOR_MAP) return withoutS
  }

  // Find closest match in same category (category is the first word before first hyphen)
  const category = variantId.split('-')[0]
  const candidates = Object.keys(GENERATOR_MAP).filter(k => k.startsWith(category + '-'))
  if (candidates.length === 1) return candidates[0]

  console.warn(`[section-composer] No generator found for variantId: "${variantId}"`)
  return null
}

export const hasGenerator = (variantId: string): boolean => resolveVariantId(variantId) !== null

/**
 * Register a new generator at runtime.
 * Used by utility section files to add their generators.
 */
export const registerGenerator = (variantId: string, fn: GeneratorFn): void => {
  GENERATOR_MAP[variantId] = fn
}

/**
 * Parse section markers from an HTML string.
 * Returns the list of sections found with their category and variant.
 */
export const parseSectionMarkers = (
  html: string
): { category: SectionCategory; variantId: string; html: string }[] => {
  const regex = /<!-- section:(\w[\w-]*):(\w[\w-]*) -->\n([\s\S]*?)\n<!-- \/section:\1:\2 -->/g
  const sections: { category: SectionCategory; variantId: string; html: string }[] = []
  let match

  while ((match = regex.exec(html)) !== null) {
    sections.push({
      category: match[1] as SectionCategory,
      variantId: match[2],
      html: match[3],
    })
  }

  return sections
}

/**
 * Replace a section in composed HTML by its category and variant.
 * Returns the updated full HTML string.
 */
export const replaceSection = (
  fullHtml: string,
  category: SectionCategory,
  oldVariantId: string,
  newSectionHtml: string,
  newVariantId: string,
): string => {
  const startMarker = `<!-- section:${category}:${oldVariantId} -->`
  const endMarker = `<!-- /section:${category}:${oldVariantId} -->`

  const startIdx = fullHtml.indexOf(startMarker)
  const endIdx = fullHtml.indexOf(endMarker)

  if (startIdx === -1 || endIdx === -1) {
    console.warn(`[section-composer] Could not find section markers for ${category}:${oldVariantId}`)
    return fullHtml
  }

  const newStartMarker = `<!-- section:${category}:${newVariantId} -->`
  const newEndMarker = `<!-- /section:${category}:${newVariantId} -->`

  const before = fullHtml.slice(0, startIdx)
  const after = fullHtml.slice(endIdx + endMarker.length)

  return `${before}${newStartMarker}\n${newSectionHtml}\n${newEndMarker}${after}`
}

/**
 * Insert a new section into composed HTML at a given position.
 * Position is 0-indexed relative to existing sections.
 */
export const insertSection = (
  fullHtml: string,
  sectionHtml: string,
  category: SectionCategory,
  variantId: string,
  afterCategory?: SectionCategory,
): string => {
  const wrapped = `<!-- section:${category}:${variantId} -->\n${sectionHtml}\n<!-- /section:${category}:${variantId} -->`

  if (afterCategory) {
    // Find the last end marker of the specified category
    const endPattern = `<!-- /section:${afterCategory}:`
    const lastIdx = fullHtml.lastIndexOf(endPattern)
    if (lastIdx !== -1) {
      const lineEnd = fullHtml.indexOf('-->', lastIdx) + 3
      const before = fullHtml.slice(0, lineEnd)
      const after = fullHtml.slice(lineEnd)
      return `${before}\n\n${wrapped}${after}`
    }
  }

  // Default: insert before </body>
  if (fullHtml.includes('</body>')) {
    return fullHtml.replace('</body>', `\n${wrapped}\n</body>`)
  }

  return fullHtml + `\n${wrapped}`
}

/**
 * Remove a section from composed HTML by its markers.
 */
export const removeSection = (
  fullHtml: string,
  category: SectionCategory,
  variantId: string,
): string => {
  const startMarker = `<!-- section:${category}:${variantId} -->`
  const endMarker = `<!-- /section:${category}:${variantId} -->`

  const startIdx = fullHtml.indexOf(startMarker)
  const endIdx = fullHtml.indexOf(endMarker)

  if (startIdx === -1 || endIdx === -1) return fullHtml

  const before = fullHtml.slice(0, startIdx)
  const after = fullHtml.slice(endIdx + endMarker.length)

  return before + after
}
