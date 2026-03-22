'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'

type SectionVariant = {
  id: string
  name: string
  desc: string
}

type SectionCategory = {
  label: string
  icon: string
  variants: SectionVariant[]
}

type SectionPickerProps = {
  onInsert: (category: string, variantId: string) => void
  locale?: string
  isOpen: boolean
  onClose: () => void
}

const SECTION_CATALOG: Record<string, SectionCategory> = {
  navbar: { label: 'Navigation', icon: '\u{1F9ED}', variants: [
    { id: 'navbar-minimal', name: 'Minimal', desc: 'Clean, simple navigation' },
    { id: 'navbar-transparent', name: 'Transparent', desc: 'Overlays the hero' },
    { id: 'navbar-floating', name: 'Floating', desc: 'Rounded floating bar' },
    { id: 'navbar-split', name: 'Split', desc: 'Logo center, links split' },
    { id: 'navbar-mega-menu', name: 'Mega Menu', desc: 'Multi-column dropdowns' },
    { id: 'navbar-hamburger', name: 'Hamburger', desc: 'Always-collapsed menu' },
    { id: 'navbar-sidebar', name: 'Sidebar', desc: 'Full-screen side drawer' },
    { id: 'navbar-command', name: 'Command', desc: 'Search-focused command bar' },
  ]},
  hero: { label: 'Hero', icon: '\u{1F31F}', variants: [
    { id: 'hero-gradient-mesh', name: 'Gradient Mesh', desc: 'Animated gradient background' },
    { id: 'hero-split-image', name: 'Split Image', desc: 'Text + image side by side' },
    { id: 'hero-fullscreen-video', name: 'Fullscreen Video', desc: 'Video background hero' },
    { id: 'hero-particles', name: 'Particles', desc: 'Interactive particle background' },
    { id: 'hero-typewriter', name: 'Typewriter', desc: 'Animated typing headline' },
    { id: 'hero-parallax-layers', name: 'Parallax', desc: 'Layered parallax scroll' },
    { id: 'hero-magazine', name: 'Magazine', desc: 'Editorial layout' },
    { id: 'hero-product-showcase', name: 'Product', desc: 'Product-focused hero' },
    { id: 'hero-minimal-text', name: 'Minimal', desc: 'Typography-first design' },
    { id: 'hero-counter-stats', name: 'Counter Stats', desc: 'Stats-integrated hero' },
    { id: 'hero-carousel', name: 'Carousel', desc: 'Multi-slide hero' },
    { id: 'hero-aurora', name: 'Aurora', desc: 'Aurora borealis effect' },
    { id: 'hero-noise-gradient', name: 'Noise', desc: 'Noise texture gradient' },
    { id: 'hero-interactive-cards', name: 'Cards', desc: 'Interactive card hero' },
    { id: 'hero-3d-globe', name: '3D Globe', desc: 'Global/international feel' },
  ]},
  features: { label: 'Features', icon: '\u2728', variants: [
    { id: 'features-bento-grid', name: 'Bento Grid', desc: 'Mixed-size grid layout' },
    { id: 'features-tabs', name: 'Tabs', desc: 'Tabbed feature panels' },
    { id: 'features-accordion', name: 'Accordion', desc: 'Expandable features' },
    { id: 'features-zigzag', name: 'Zigzag', desc: 'Alternating image+text' },
    { id: 'features-icon-grid', name: 'Icon Grid', desc: 'Clean icon-based grid' },
    { id: 'features-carousel', name: 'Carousel', desc: 'Scrollable feature cards' },
    { id: 'features-comparison', name: 'Comparison', desc: 'Before/after comparison' },
    { id: 'features-timeline', name: 'Timeline', desc: 'Timeline of features' },
    { id: 'features-video-cards', name: 'Video Cards', desc: 'Video-first feature cards' },
    { id: 'features-interactive', name: 'Interactive', desc: 'Hover-reveal features' },
    { id: 'features-stats-integrated', name: 'With Stats', desc: 'Stats mixed with features' },
    { id: 'features-hoverable-cards', name: 'Hover Cards', desc: 'Rich hover effects' },
  ]},
  testimonials: { label: 'Testimonials', icon: '\u{1F4AC}', variants: [
    { id: 'testimonials-carousel', name: 'Carousel', desc: 'Sliding testimonials' },
    { id: 'testimonials-masonry', name: 'Masonry', desc: 'Pinterest-style grid' },
    { id: 'testimonials-featured', name: 'Featured', desc: 'One big + supporting' },
    { id: 'testimonials-video', name: 'Video', desc: 'Video testimonials' },
    { id: 'testimonials-wall', name: 'Wall', desc: 'Social media style wall' },
    { id: 'testimonials-minimal', name: 'Minimal', desc: 'Clean, simple quotes' },
    { id: 'testimonials-star-rating', name: 'Star Rating', desc: 'With 5-star ratings' },
    { id: 'testimonials-logo-bar', name: 'Logo Bar', desc: 'Quotes with company logos' },
    { id: 'testimonials-before-after', name: 'Before/After', desc: 'Transformation stories' },
    { id: 'testimonials-glassmorphism', name: 'Glass', desc: 'Frosted glass cards' },
  ]},
  pricing: { label: 'Pricing', icon: '\u{1F4B0}', variants: [
    { id: 'pricing-animated-cards', name: 'Animated', desc: 'Hover-animated cards' },
    { id: 'pricing-toggle', name: 'Toggle', desc: 'Monthly/annual switch' },
    { id: 'pricing-comparison-table', name: 'Table', desc: 'Feature comparison table' },
    { id: 'pricing-slider', name: 'Slider', desc: 'Usage-based pricing' },
    { id: 'pricing-minimal', name: 'Minimal', desc: 'Simple, clean layout' },
    { id: 'pricing-gradient', name: 'Gradient', desc: 'Gradient background cards' },
    { id: 'pricing-enterprise', name: 'Enterprise', desc: 'Custom enterprise plans' },
    { id: 'pricing-israeli', name: 'Israeli', desc: 'Shekel pricing, Hebrew' },
  ]},
  cta: { label: 'Call to Action', icon: '\u{1F3AF}', variants: [
    { id: 'cta-gradient-banner', name: 'Gradient', desc: 'Bold gradient banner' },
    { id: 'cta-split-image', name: 'Split Image', desc: 'Image + CTA side by side' },
    { id: 'cta-floating-card', name: 'Floating Card', desc: 'Elevated glow card' },
    { id: 'cta-newsletter', name: 'Newsletter', desc: 'Email capture CTA' },
    { id: 'cta-countdown', name: 'Countdown', desc: 'Urgency timer CTA' },
    { id: 'cta-sticky-bottom', name: 'Sticky Bottom', desc: 'Fixed bottom bar' },
    { id: 'cta-video-background', name: 'Video BG', desc: 'CTA over video' },
    { id: 'cta-glassmorphism', name: 'Glass', desc: 'Frosted glass effect' },
  ]},
  faq: { label: 'FAQ', icon: '\u2753', variants: [
    { id: 'faq-accordion', name: 'Accordion', desc: 'Expandable Q&A' },
    { id: 'faq-searchable', name: 'Searchable', desc: 'With search filter' },
    { id: 'faq-categorized', name: 'Categorized', desc: 'Tabbed categories' },
    { id: 'faq-two-column', name: 'Two Column', desc: 'Side-by-side layout' },
    { id: 'faq-chat-style', name: 'Chat', desc: 'Chat bubble format' },
  ]},
  footer: { label: 'Footer', icon: '\u{1F4CD}', variants: [
    { id: 'footer-multi-column', name: 'Multi Column', desc: '4-column with newsletter' },
    { id: 'footer-minimal', name: 'Minimal', desc: 'Single row, clean' },
    { id: 'footer-mega', name: 'Mega', desc: 'Full mega footer' },
    { id: 'footer-centered', name: 'Centered', desc: 'Centered with socials' },
    { id: 'footer-gradient', name: 'Gradient', desc: 'Gradient background' },
    { id: 'footer-cta-integrated', name: 'CTA Footer', desc: 'CTA blends into footer' },
  ]},
  gallery: { label: 'Gallery', icon: '\u{1F5BC}\uFE0F', variants: [
    { id: 'gallery-masonry', name: 'Masonry', desc: 'Pinterest-style layout' },
    { id: 'gallery-lightbox', name: 'Lightbox', desc: 'Click to expand' },
    { id: 'gallery-carousel', name: 'Carousel', desc: 'Horizontal scroll' },
    { id: 'gallery-filterable', name: 'Filterable', desc: 'Category filter tabs' },
    { id: 'gallery-fullscreen', name: 'Fullscreen', desc: 'Full viewport slides' },
    { id: 'gallery-before-after', name: 'Before/After', desc: 'Drag comparison' },
  ]},
  team: { label: 'Team', icon: '\u{1F465}', variants: [
    { id: 'team-grid', name: 'Grid', desc: 'Photo + role cards' },
    { id: 'team-carousel', name: 'Carousel', desc: 'Horizontal scroll team' },
    { id: 'team-flip-cards', name: 'Flip Cards', desc: '3D flip on hover' },
    { id: 'team-hoverable', name: 'Hoverable', desc: 'Glow + expand on hover' },
  ]},
  stats: { label: 'Statistics', icon: '\u{1F4CA}', variants: [
    { id: 'stats-counters', name: 'Counters', desc: 'Animated counting numbers' },
    { id: 'stats-progress-bars', name: 'Progress', desc: 'Animated bars' },
    { id: 'stats-dashboard', name: 'Dashboard', desc: 'Dashboard-style cards' },
    { id: 'stats-radial', name: 'Radial', desc: 'Circular progress' },
  ]},
  contact: { label: 'Contact', icon: '\u{1F4E7}', variants: [
    { id: 'contact-form-map', name: 'Form + Map', desc: 'Contact form with map' },
    { id: 'contact-split', name: 'Split', desc: 'Image + form split' },
    { id: 'contact-chat-widget', name: 'Chat', desc: 'Chat-style contact' },
    { id: 'contact-minimal', name: 'Minimal', desc: 'Simple centered form' },
  ]},
  partners: { label: 'Partners', icon: '\u{1F91D}', variants: [
    { id: 'partners-marquee', name: 'Marquee', desc: 'Infinite scrolling logos' },
    { id: 'partners-grid', name: 'Grid', desc: 'Hover grayscale to color' },
    { id: 'partners-tiered', name: 'Tiered', desc: 'Featured + standard' },
  ]},
  'how-it-works': { label: 'How It Works', icon: '\u{1F527}', variants: [
    { id: 'how-it-works-steps', name: 'Steps', desc: 'Numbered with lines' },
    { id: 'how-it-works-timeline', name: 'Timeline', desc: 'Vertical scroll reveal' },
    { id: 'how-it-works-interactive', name: 'Interactive', desc: 'Click to reveal' },
    { id: 'how-it-works-video', name: 'Video', desc: 'Steps with video' },
  ]},
  blog: { label: 'Blog', icon: '\u{1F4DD}', variants: [
    { id: 'blog-card-grid', name: 'Card Grid', desc: '3-column card grid' },
    { id: 'blog-featured-list', name: 'Featured', desc: '1 large + list' },
    { id: 'blog-magazine', name: 'Magazine', desc: 'Asymmetric grid' },
    { id: 'blog-minimal', name: 'Minimal', desc: 'Text-focused with dates' },
  ]},
  portfolio: { label: 'Portfolio', icon: '\u{1F4BC}', variants: [
    { id: 'portfolio-case-study', name: 'Case Study', desc: 'Overlay on hover' },
    { id: 'portfolio-filterable', name: 'Filterable', desc: 'Category filter' },
    { id: 'portfolio-masonry', name: 'Masonry', desc: 'Pinterest + lightbox' },
  ]},
  comparison: { label: 'Comparison', icon: '\u2696\uFE0F', variants: [
    { id: 'comparison-feature-matrix', name: 'Matrix', desc: 'Feature comparison table' },
    { id: 'comparison-before-after', name: 'Before/After', desc: 'Side-by-side cards' },
  ]},
  newsletter: { label: 'Newsletter', icon: '\u{1F4EC}', variants: [
    { id: 'newsletter-inline', name: 'Inline', desc: 'Horizontal bar' },
    { id: 'newsletter-popup', name: 'Popup', desc: 'Modal with blur' },
    { id: 'newsletter-bottom-bar', name: 'Bottom Bar', desc: 'Fixed bottom bar' },
  ]},
  about: { label: 'About', icon: '\u{1F4D6}', variants: [
    { id: 'about-story-timeline', name: 'Story Timeline', desc: 'Company history' },
    { id: 'about-team-mission', name: 'Team & Mission', desc: 'Mission + team grid' },
    { id: 'about-split-image', name: 'Split Image', desc: 'Image + story + stats' },
  ]},
}

const CATEGORY_KEYS = Object.keys(SECTION_CATALOG)

/** Browsable section catalog for inserting sections into the editor */
export const SectionPicker = ({ onInsert, isOpen, onClose }: SectionPickerProps) => {
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORY_KEYS[0])
  const [searchQuery, setSearchQuery] = useState('')

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
      setActiveCategory(CATEGORY_KEYS[0])
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return null

    const q = searchQuery.toLowerCase()
    const results: { category: string; variants: SectionVariant[] }[] = []

    for (const [key, cat] of Object.entries(SECTION_CATALOG)) {
      const matchingVariants = cat.variants.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.desc.toLowerCase().includes(q) ||
          v.id.toLowerCase().includes(q) ||
          cat.label.toLowerCase().includes(q)
      )
      if (matchingVariants.length > 0) {
        results.push({ category: key, variants: matchingVariants })
      }
    }
    return results
  }, [searchQuery])

  const handleInsert = useCallback(
    (category: string, variantId: string) => {
      onInsert(category, variantId)
      onClose()
    },
    [onInsert, onClose]
  )

  const currentCatalog = SECTION_CATALOG[activeCategory]

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className="fixed inset-y-0 z-50 flex w-full max-w-3xl flex-col bg-[#0d1117] shadow-2xl transition-transform duration-300 ease-out lg:inset-y-4 lg:rounded-2xl"
        style={{
          right: 0,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-semibold text-white">Add Section</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.5 4.5L13.5 13.5M4.5 13.5L13.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-white/10 px-5 py-3">
          <div className="relative">
            <svg
              className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-slate-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sections..."
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pe-4 ps-10 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 end-3 my-auto text-slate-500 hover:text-white"
              >
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                  <path d="M4.5 4.5L13.5 13.5M4.5 13.5L13.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1">
          {/* Category tabs (hidden during search) */}
          {!filteredCategories && (
            <div className="hidden w-48 shrink-0 overflow-y-auto border-e border-white/10 py-2 md:block">
              {CATEGORY_KEYS.map((key) => {
                const cat = SECTION_CATALOG[key]
                const isActive = key === activeCategory
                return (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    className={`flex w-full items-center gap-2 px-4 py-2.5 text-start text-sm transition-colors ${
                      isActive
                        ? 'bg-violet-600/20 text-violet-300'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                    <span className="ms-auto text-xs text-slate-600">{cat.variants.length}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Mobile category selector (hidden during search) */}
          {!filteredCategories && (
            <div className="absolute start-0 end-0 top-[7.5rem] z-10 overflow-x-auto border-b border-white/10 bg-[#0d1117] px-4 py-2 md:hidden">
              <div className="flex gap-1.5">
                {CATEGORY_KEYS.map((key) => {
                  const cat = SECTION_CATALOG[key]
                  const isActive = key === activeCategory
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveCategory(key)}
                      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-violet-600 text-white'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Variant cards */}
          <div className="flex-1 overflow-y-auto p-4 md:p-5">
            {/* Mobile top padding for the horizontal category bar */}
            {!filteredCategories && <div className="h-12 md:hidden" />}

            {filteredCategories ? (
              /* Search results */
              filteredCategories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                  <svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor" className="mb-3 opacity-40">
                    <path
                      fillRule="evenodd"
                      d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm">No sections match &quot;{searchQuery}&quot;</p>
                </div>
              ) : (
                filteredCategories.map(({ category, variants }) => (
                  <div key={category} className="mb-6">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-300">
                      <span>{SECTION_CATALOG[category].icon}</span>
                      <span>{SECTION_CATALOG[category].label}</span>
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {variants.map((variant) => (
                        <VariantCard
                          key={variant.id}
                          variant={variant}
                          category={category}
                          onInsert={handleInsert}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )
            ) : (
              /* Category view */
              <>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-300">
                  <span className="text-lg">{currentCatalog.icon}</span>
                  <span>{currentCatalog.label}</span>
                  <span className="ms-1 rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-500">
                    {currentCatalog.variants.length}
                  </span>
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {currentCatalog.variants.map((variant) => (
                    <VariantCard
                      key={variant.id}
                      variant={variant}
                      category={activeCategory}
                      onInsert={handleInsert}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

/** A single variant card in the section picker grid */
const VariantCard = ({
  variant,
  category,
  onInsert,
}: {
  variant: SectionVariant
  category: string
  onInsert: (category: string, variantId: string) => void
}) => {
  return (
    <button
      onClick={() => onInsert(category, variant.id)}
      className="group flex flex-col gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-start transition-all duration-200 hover:border-violet-500/50 hover:bg-violet-600/10 hover:shadow-lg hover:shadow-violet-500/5 active:scale-[0.98]"
    >
      <span className="text-sm font-medium text-white group-hover:text-violet-300">
        {variant.name}
      </span>
      <span className="text-xs leading-relaxed text-slate-500 group-hover:text-slate-400">
        {variant.desc}
      </span>
      <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-slate-600">
        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" className="opacity-50">
          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
        </svg>
        Insert
      </span>
    </button>
  )
}
