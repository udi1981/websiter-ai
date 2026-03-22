'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

type SectionSwapProps = {
  category: string
  currentVariantId: string
  onSwap: (newVariantId: string) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  position: { top: number; left: number }
}

type VariantOption = {
  id: string
  name: string
  desc: string
}

/** Variant data per category for the swap dropdown */
const VARIANT_MAP: Record<string, { icon: string; variants: VariantOption[] }> = {
  navbar: { icon: '\u{1F9ED}', variants: [
    { id: 'navbar-minimal', name: 'Minimal', desc: 'Clean, simple navigation' },
    { id: 'navbar-transparent', name: 'Transparent', desc: 'Overlays the hero' },
    { id: 'navbar-floating', name: 'Floating', desc: 'Rounded floating bar' },
    { id: 'navbar-split', name: 'Split', desc: 'Logo center, links split' },
    { id: 'navbar-mega-menu', name: 'Mega Menu', desc: 'Multi-column dropdowns' },
    { id: 'navbar-hamburger', name: 'Hamburger', desc: 'Always-collapsed menu' },
    { id: 'navbar-sidebar', name: 'Sidebar', desc: 'Full-screen side drawer' },
    { id: 'navbar-command', name: 'Command', desc: 'Search-focused command bar' },
  ]},
  hero: { icon: '\u{1F31F}', variants: [
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
  features: { icon: '\u2728', variants: [
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
  testimonials: { icon: '\u{1F4AC}', variants: [
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
  pricing: { icon: '\u{1F4B0}', variants: [
    { id: 'pricing-animated-cards', name: 'Animated', desc: 'Hover-animated cards' },
    { id: 'pricing-toggle', name: 'Toggle', desc: 'Monthly/annual switch' },
    { id: 'pricing-comparison-table', name: 'Table', desc: 'Feature comparison table' },
    { id: 'pricing-slider', name: 'Slider', desc: 'Usage-based pricing' },
    { id: 'pricing-minimal', name: 'Minimal', desc: 'Simple, clean layout' },
    { id: 'pricing-gradient', name: 'Gradient', desc: 'Gradient background cards' },
    { id: 'pricing-enterprise', name: 'Enterprise', desc: 'Custom enterprise plans' },
    { id: 'pricing-israeli', name: 'Israeli', desc: 'Shekel pricing, Hebrew' },
  ]},
  cta: { icon: '\u{1F3AF}', variants: [
    { id: 'cta-gradient-banner', name: 'Gradient', desc: 'Bold gradient banner' },
    { id: 'cta-split-image', name: 'Split Image', desc: 'Image + CTA side by side' },
    { id: 'cta-floating-card', name: 'Floating Card', desc: 'Elevated glow card' },
    { id: 'cta-newsletter', name: 'Newsletter', desc: 'Email capture CTA' },
    { id: 'cta-countdown', name: 'Countdown', desc: 'Urgency timer CTA' },
    { id: 'cta-sticky-bottom', name: 'Sticky Bottom', desc: 'Fixed bottom bar' },
    { id: 'cta-video-background', name: 'Video BG', desc: 'CTA over video' },
    { id: 'cta-glassmorphism', name: 'Glass', desc: 'Frosted glass effect' },
  ]},
  faq: { icon: '\u2753', variants: [
    { id: 'faq-accordion', name: 'Accordion', desc: 'Expandable Q&A' },
    { id: 'faq-searchable', name: 'Searchable', desc: 'With search filter' },
    { id: 'faq-categorized', name: 'Categorized', desc: 'Tabbed categories' },
    { id: 'faq-two-column', name: 'Two Column', desc: 'Side-by-side layout' },
    { id: 'faq-chat-style', name: 'Chat', desc: 'Chat bubble format' },
  ]},
  footer: { icon: '\u{1F4CD}', variants: [
    { id: 'footer-multi-column', name: 'Multi Column', desc: '4-column with newsletter' },
    { id: 'footer-minimal', name: 'Minimal', desc: 'Single row, clean' },
    { id: 'footer-mega', name: 'Mega', desc: 'Full mega footer' },
    { id: 'footer-centered', name: 'Centered', desc: 'Centered with socials' },
    { id: 'footer-gradient', name: 'Gradient', desc: 'Gradient background' },
    { id: 'footer-cta-integrated', name: 'CTA Footer', desc: 'CTA blends into footer' },
  ]},
  gallery: { icon: '\u{1F5BC}\uFE0F', variants: [
    { id: 'gallery-masonry', name: 'Masonry', desc: 'Pinterest-style layout' },
    { id: 'gallery-lightbox', name: 'Lightbox', desc: 'Click to expand' },
    { id: 'gallery-carousel', name: 'Carousel', desc: 'Horizontal scroll' },
    { id: 'gallery-filterable', name: 'Filterable', desc: 'Category filter tabs' },
    { id: 'gallery-fullscreen', name: 'Fullscreen', desc: 'Full viewport slides' },
    { id: 'gallery-before-after', name: 'Before/After', desc: 'Drag comparison' },
  ]},
  team: { icon: '\u{1F465}', variants: [
    { id: 'team-grid', name: 'Grid', desc: 'Photo + role cards' },
    { id: 'team-carousel', name: 'Carousel', desc: 'Horizontal scroll team' },
    { id: 'team-flip-cards', name: 'Flip Cards', desc: '3D flip on hover' },
    { id: 'team-hoverable', name: 'Hoverable', desc: 'Glow + expand on hover' },
  ]},
  stats: { icon: '\u{1F4CA}', variants: [
    { id: 'stats-counters', name: 'Counters', desc: 'Animated counting numbers' },
    { id: 'stats-progress-bars', name: 'Progress', desc: 'Animated bars' },
    { id: 'stats-dashboard', name: 'Dashboard', desc: 'Dashboard-style cards' },
    { id: 'stats-radial', name: 'Radial', desc: 'Circular progress' },
  ]},
  contact: { icon: '\u{1F4E7}', variants: [
    { id: 'contact-form-map', name: 'Form + Map', desc: 'Contact form with map' },
    { id: 'contact-split', name: 'Split', desc: 'Image + form split' },
    { id: 'contact-chat-widget', name: 'Chat', desc: 'Chat-style contact' },
    { id: 'contact-minimal', name: 'Minimal', desc: 'Simple centered form' },
  ]},
  partners: { icon: '\u{1F91D}', variants: [
    { id: 'partners-marquee', name: 'Marquee', desc: 'Infinite scrolling logos' },
    { id: 'partners-grid', name: 'Grid', desc: 'Hover grayscale to color' },
    { id: 'partners-tiered', name: 'Tiered', desc: 'Featured + standard' },
  ]},
  'how-it-works': { icon: '\u{1F527}', variants: [
    { id: 'how-it-works-steps', name: 'Steps', desc: 'Numbered with lines' },
    { id: 'how-it-works-timeline', name: 'Timeline', desc: 'Vertical scroll reveal' },
    { id: 'how-it-works-interactive', name: 'Interactive', desc: 'Click to reveal' },
    { id: 'how-it-works-video', name: 'Video', desc: 'Steps with video' },
  ]},
  blog: { icon: '\u{1F4DD}', variants: [
    { id: 'blog-card-grid', name: 'Card Grid', desc: '3-column card grid' },
    { id: 'blog-featured-list', name: 'Featured', desc: '1 large + list' },
    { id: 'blog-magazine', name: 'Magazine', desc: 'Asymmetric grid' },
    { id: 'blog-minimal', name: 'Minimal', desc: 'Text-focused with dates' },
  ]},
  portfolio: { icon: '\u{1F4BC}', variants: [
    { id: 'portfolio-case-study', name: 'Case Study', desc: 'Overlay on hover' },
    { id: 'portfolio-filterable', name: 'Filterable', desc: 'Category filter' },
    { id: 'portfolio-masonry', name: 'Masonry', desc: 'Pinterest + lightbox' },
  ]},
  comparison: { icon: '\u2696\uFE0F', variants: [
    { id: 'comparison-feature-matrix', name: 'Matrix', desc: 'Feature comparison table' },
    { id: 'comparison-before-after', name: 'Before/After', desc: 'Side-by-side cards' },
  ]},
  newsletter: { icon: '\u{1F4EC}', variants: [
    { id: 'newsletter-inline', name: 'Inline', desc: 'Horizontal bar' },
    { id: 'newsletter-popup', name: 'Popup', desc: 'Modal with blur' },
    { id: 'newsletter-bottom-bar', name: 'Bottom Bar', desc: 'Fixed bottom bar' },
  ]},
  about: { icon: '\u{1F4D6}', variants: [
    { id: 'about-story-timeline', name: 'Story Timeline', desc: 'Company history' },
    { id: 'about-team-mission', name: 'Team & Mission', desc: 'Mission + team grid' },
    { id: 'about-split-image', name: 'Split Image', desc: 'Image + story + stats' },
  ]},
}

/** Get human-readable name for a variant ID */
const getVariantName = (category: string, variantId: string): string => {
  const cat = VARIANT_MAP[category]
  if (!cat) return variantId
  const variant = cat.variants.find((v) => v.id === variantId)
  return variant?.name ?? variantId
}

/** Compact floating toolbar for swapping/reordering/removing a section */
export const SectionSwap = ({
  category,
  currentVariantId,
  onSwap,
  onRemove,
  onMoveUp,
  onMoveDown,
  position,
}: SectionSwapProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const catData = VARIANT_MAP[category]
  const alternatives = catData?.variants.filter((v) => v.id !== currentVariantId) ?? []
  const currentName = getVariantName(category, currentVariantId)
  const icon = catData?.icon ?? '\u{1F9E9}'

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        toolbarRef.current &&
        !toolbarRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isDropdownOpen])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDropdownOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Compute clamped position so toolbar stays within viewport
  const clampedTop = Math.max(8, Math.min(position.top, window.innerHeight - 60))
  const clampedLeft = Math.max(8, Math.min(position.left, window.innerWidth - 320))

  const handleSwap = useCallback(
    (variantId: string) => {
      onSwap(variantId)
      setIsDropdownOpen(false)
    },
    [onSwap]
  )

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 flex items-center gap-1 rounded-xl border border-white/15 bg-[#0d1117]/95 px-2 py-1.5 shadow-xl shadow-black/40 backdrop-blur-md"
      style={{ top: clampedTop, insetInlineStart: clampedLeft }}
    >
      {/* Category icon + current variant name */}
      <span className="px-1 text-sm" title={category}>
        {icon}
      </span>
      <span className="max-w-[100px] truncate text-xs font-medium text-slate-300">
        {currentName}
      </span>

      {/* Divider */}
      <div className="mx-1 h-5 w-px bg-white/10" />

      {/* Swap button */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          className={`flex h-7 items-center gap-1 rounded-lg px-2 text-xs font-medium transition-colors ${
            isDropdownOpen
              ? 'bg-violet-600 text-white'
              : 'text-slate-400 hover:bg-white/10 hover:text-white'
          }`}
          title="Swap variant"
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H4.397a.75.75 0 00-.75.75v3.834a.75.75 0 001.5 0v-2.09l.28.282a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm-10.624-2.85a5.5 5.5 0 019.201-2.465l.312.31h-2.433a.75.75 0 000 1.5h3.834a.75.75 0 00.75-.75V3.335a.75.75 0 00-1.5 0v2.09l-.28-.282A7 7 0 002.86 8.28a.75.75 0 001.449.39z"
              clipRule="evenodd"
            />
          </svg>
          Swap
        </button>

        {/* Swap dropdown */}
        {isDropdownOpen && alternatives.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full mt-2 w-64 overflow-hidden rounded-xl border border-white/10 bg-[#0d1117] shadow-2xl shadow-black/60"
            style={{ insetInlineStart: 0 }}
          >
            <div className="border-b border-white/10 px-3 py-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Swap to
              </span>
            </div>
            <div className="max-h-60 overflow-y-auto py-1">
              {alternatives.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => handleSwap(variant.id)}
                  className="flex w-full flex-col gap-0.5 px-3 py-2 text-start transition-colors hover:bg-violet-600/15"
                >
                  <span className="text-xs font-medium text-white">{variant.name}</span>
                  <span className="text-[10px] text-slate-500">{variant.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-0.5 h-5 w-px bg-white/10" />

      {/* Move up */}
      <button
        onClick={onMoveUp}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        title="Move up"
      >
        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Move down */}
      <button
        onClick={onMoveDown}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        title="Move down"
      >
        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Divider */}
      <div className="mx-0.5 h-5 w-px bg-white/10" />

      {/* Remove */}
      <button
        onClick={onRemove}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
        title="Remove section"
      >
        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  )
}
