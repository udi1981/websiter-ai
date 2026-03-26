/**
 * Section Mapper — Mode 3 Redesign Engine
 *
 * Maps source page sections to new section-composer generators
 * while preserving original content, order, and meaning.
 *
 * Input: source sections (from section detector) + extracted content (from Phase 4.5)
 * Output: PageSection[] ready for composePage() with real content, new design
 *
 * Rules:
 * 1. Preserve source section order
 * 2. Preserve real content (text, images, products, prices)
 * 3. Map to best matching section-composer variant
 * 4. Zero generic placeholders when real content exists
 * 5. New visual design through section-composer generators
 */

import type { SectionCategory, PageSection } from '@ubuilder/types'
import { prefixedId } from '@ubuilder/utils'

// ─── Types ──────────────────────────────────────────────────────────

export type SourceSection = {
  type: string
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

export type ExtractedPageData = {
  url: string
  path: string
  title: string
  h1s: string[]
  h2s: string[]
  paragraphs: string[]
  images: { src: string; alt: string }[]
  ogImage?: string
  metaDescription?: string
}

export type CatalogProduct = {
  name: { value: string; confidence: number }
  price?: { value: number; confidence: number }
  originalPrice?: { value: number; confidence: number }
  currency?: { value: string }
  description?: { value: string }
  image?: { value: string }
  additionalImages?: { value: string }[]
  category?: { value: string }
}

export type MappedSection = PageSection & {
  sourceType: string
  contentSource: 'extracted' | 'catalog' | 'generic'
  contentCompleteness: number
}

// ─── Source Type → Composer Variant ─────────────────────────────────

const SOURCE_TO_COMPOSER: Record<string, { category: SectionCategory; variants: string[] }> = {
  'hero':         { category: 'hero',         variants: ['hero-family-warm', 'hero-apple-clean', 'hero-gradient-mesh'] },
  'navbar':       { category: 'navbar',       variants: ['navbar-floating'] },
  'features':     { category: 'features',     variants: ['features-bento-grid', 'features-icon-grid'] },
  'services':     { category: 'features',     variants: ['features-icon-grid', 'features-zigzag'] },
  'products':     { category: 'pricing',      variants: ['pricing-premium-showcase', 'pricing-animated-cards'] },
  'pricing':      { category: 'pricing',      variants: ['pricing-premium-showcase', 'pricing-animated-cards'] },
  'testimonials': { category: 'testimonials', variants: ['testimonials-premium', 'testimonials-wall'] },
  'faq':          { category: 'faq',          variants: ['faq-accordion'] },
  'contact':      { category: 'contact',      variants: ['contact-split-form'] },
  'gallery':      { category: 'gallery',      variants: ['gallery-masonry', 'gallery-carousel'] },
  'footer':       { category: 'footer',       variants: ['footer-multi-column'] },
  'about':        { category: 'about',        variants: ['about-story-timeline', 'about-split-image'] },
  'team':         { category: 'team',         variants: ['team-cards'] },
  'stats':        { category: 'stats',        variants: ['stats-counters'] },
  'cta':          { category: 'cta',          variants: ['cta-premium-close', 'cta-gradient-banner'] },
  'blog':         { category: 'blog',         variants: ['blog-card-grid'] },
  'newsletter':   { category: 'newsletter',   variants: ['newsletter-inline'] },
  'portfolio':    { category: 'portfolio',     variants: ['portfolio-filter-grid'] },
  'unknown':      { category: 'features',     variants: ['features-icon-grid'] },
}

// ─── Content Extraction from htmlSnapshot ───────────────────────────

const extractFromSnapshot = (html: string) => {
  const strip = (s: string) => s.replace(/<[^>]+>/g, '').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim()

  const headings: string[] = []
  let m
  const hRe = /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi
  while ((m = hRe.exec(html)) !== null) {
    const t = strip(m[1])
    if (t.length > 2 && t.length < 200) headings.push(t)
  }

  const paragraphs: string[] = []
  const pRe = /<p[^>]*>([\s\S]*?)<\/p>/gi
  while ((m = pRe.exec(html)) !== null) {
    const t = strip(m[1])
    if (t.length > 15) paragraphs.push(t)
  }

  const listItems: string[] = []
  const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi
  while ((m = liRe.exec(html)) !== null) {
    const t = strip(m[1])
    if (t.length > 3 && t.length < 200) listItems.push(t)
  }

  const images: { src: string; alt: string }[] = []
  const imgRe = /<img[^>]*\bsrc=["']([^"']+)["'][^>]*/gi
  while ((m = imgRe.exec(html)) !== null) {
    if (m[1].startsWith('data:image/svg') || m[1].includes('pixel')) continue
    const alt = (m[0].match(/alt=["']([^"']*)["']/i) || [])[1] || ''
    images.push({ src: m[1], alt })
  }

  const links: { text: string; href: string }[] = []
  const aRe = /<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  while ((m = aRe.exec(html)) !== null) {
    const t = strip(m[2])
    if (t.length > 1 && t.length < 60) links.push({ text: t, href: m[1] })
  }

  const btnRe = /<(?:button|a)[^>]*class=["'][^"']*(?:btn|cta|button|primary)[^"']*["'][^>]*>([\s\S]*?)<\/(?:button|a)>/gi
  const ctaMatch = btnRe.exec(html)
  const ctaText = ctaMatch ? strip(ctaMatch[1]) : null

  return { headings, paragraphs, listItems, images, links, ctaText }
}

// ─── Main Section Mapper ────────────────────────────────────────────

export const mapSourceSectionsToRedesign = (
  sourceSections: SourceSection[],
  extractedPage: ExtractedPageData | null,
  products: CatalogProduct[],
  siteName: string,
  locale: string,
  navLinks?: { label: string; href: string }[],
  footerColumns?: { title: string; links: { label: string; href: string }[] }[],
): MappedSection[] => {
  const mapped: MappedSection[] = []
  const isHe = locale === 'he'
  const sorted = [...sourceSections].sort((a, b) => a.order - b.order)

  for (const source of sorted) {
    const mapping = SOURCE_TO_COMPOSER[source.type] || SOURCE_TO_COMPOSER['unknown']
    const variantId = mapping.variants[0]
    const snap = extractFromSnapshot(source.htmlSnapshot)
    const pageH1s = extractedPage?.h1s || []
    const pageH2s = extractedPage?.h2s || []
    const pageParagraphs = extractedPage?.paragraphs || []
    const pageImages = extractedPage?.images || []

    const content = buildContent(
      source.type, snap,
      { h1s: pageH1s, h2s: pageH2s, paragraphs: pageParagraphs, images: pageImages },
      products, siteName, isHe, navLinks, footerColumns,
    )

    const completeness = calcCompleteness(content, source.type, products)

    mapped.push({
      id: prefixedId('sec'),
      category: mapping.category,
      variantId,
      order: source.order,
      content,
      images: buildImages(snap.images, pageImages, source.type),
      sourceType: source.type,
      contentSource: completeness > 50 ? 'extracted' : products.length > 0 ? 'catalog' : 'generic',
      contentCompleteness: completeness,
    })
  }

  return mapped
}

// ─── Content Builder ────────────────────────────────────────────────

const buildContent = (
  type: string,
  snap: ReturnType<typeof extractFromSnapshot>,
  page: { h1s: string[]; h2s: string[]; paragraphs: string[]; images: { src: string; alt: string }[] },
  products: CatalogProduct[],
  siteName: string,
  isHe: boolean,
  navLinks?: { label: string; href: string }[],
  footerColumns?: { title: string; links: { label: string; href: string }[] }[],
): Record<string, unknown> => {
  const base = { businessName: siteName, locale: isHe ? 'he' : 'en', brand: siteName }

  switch (type) {
    case 'hero':
      return { ...base,
        headline: snap.headings[0] || page.h1s[0] || siteName,
        subheadline: snap.paragraphs[0] || page.paragraphs[0] || '',
        ctaText: snap.ctaText || (isHe ? 'לרכישה' : 'Get Started'),
        ctaLink: '#products',
        imageUrl: snap.images[0]?.src || page.images[0]?.src,
      }

    case 'navbar':
      return { ...base,
        links: navLinks || snap.links.slice(0, 8).map(l => ({ label: l.text, href: l.href })),
        ctaText: snap.ctaText || (isHe ? 'לרכישה' : 'Buy Now'),
        ctaLink: '#',
      }

    case 'products':
    case 'pricing':
      if (products.length > 0) {
        return { ...base,
          headline: snap.headings[0] || (isHe ? 'המוצרים שלנו' : 'Our Products'),
          subheadline: snap.paragraphs[0] || '',
          items: products.slice(0, 4).map(p => ({
            name: p.name?.value || '', price: p.price?.value ? String(p.price.value) : '',
            originalPrice: p.originalPrice?.value ? String(p.originalPrice.value) : undefined,
            currency: p.currency?.value || '₪', description: p.description?.value || '',
            image: p.image?.value || '', features: [],
            cta: isHe ? 'לפרטים' : 'Details', popular: false,
          })),
        }
      }
      return { ...base, headline: snap.headings[0] || '', items: snap.headings.slice(1).map(h => ({ title: h, description: '', icon: '✨' })) }

    case 'features':
    case 'services':
      return { ...base,
        headline: snap.headings[0] || (isHe ? 'היתרונות' : 'Features'),
        subheadline: snap.paragraphs[0] || '',
        items: snap.headings.slice(1).map((h, i) => ({
          title: h, description: snap.paragraphs[i + 1] || snap.listItems[i] || '',
          icon: ['🛡️', '📍', '💬', '⚡', '🎯', '💎'][i] || '✨',
        })),
      }

    case 'testimonials':
      return { ...base,
        headline: snap.headings[0] || (isHe ? 'מה הלקוחות אומרים' : 'Testimonials'),
        items: snap.paragraphs.slice(0, 4).map((p, i) => ({
          quote: p, text: p, author: snap.headings[i + 1] || '', role: '', rating: 5,
        })),
      }

    case 'faq':
      return { ...base,
        headline: snap.headings[0] || (isHe ? 'שאלות נפוצות' : 'FAQ'),
        items: snap.headings.slice(1).map((q, i) => ({
          question: q, title: q, answer: snap.paragraphs[i] || '', description: snap.paragraphs[i] || '',
        })),
      }

    case 'contact':
      return { ...base, headline: snap.headings[0] || (isHe ? 'צרו קשר' : 'Contact'), subheadline: snap.paragraphs[0] || '' }

    case 'gallery':
      return { ...base,
        headline: snap.headings[0] || (isHe ? 'גלריה' : 'Gallery'),
        items: (snap.images.length > 0 ? snap.images : page.images).slice(0, 8).map(i => ({ title: i.alt, image: i.src, description: '' })),
      }

    case 'about':
      return { ...base,
        headline: snap.headings[0] || page.h2s.find(h => /about|אודות/i.test(h)) || `${siteName}`,
        subheadline: snap.paragraphs[0] || page.paragraphs[0] || '',
        items: snap.headings.slice(1, 4).map((h, i) => ({ title: h, description: snap.paragraphs[i + 1] || '', icon: ['🎯', '💎', '🏆'][i] || '✨' })),
      }

    case 'footer':
      return { ...base, items: footerColumns || [{ title: isHe ? 'ניווט' : 'Navigation', links: snap.links.slice(0, 10) }], contact: {} }

    case 'stats':
      return { ...base, headline: snap.headings[0] || '',
        stats: snap.headings.slice(1).map((h, i) => ({ value: h.match(/[\d,]+/)?.[0] || h, label: snap.paragraphs[i] || '' })),
      }

    case 'cta':
      return { ...base, headline: snap.headings[0] || (isHe ? 'מוכנים?' : 'Ready?'),
        subheadline: snap.paragraphs[0] || '', ctaText: snap.ctaText || (isHe ? 'התחילו' : 'Start'), ctaLink: '#',
      }

    case 'blog':
      return { ...base, headline: snap.headings[0] || (isHe ? 'בלוג' : 'Blog'),
        items: snap.headings.slice(1).map((h, i) => ({ title: h, excerpt: snap.paragraphs[i] || '', image: snap.images[i]?.src || '' })),
      }

    default:
      return { ...base, headline: snap.headings[0] || page.h2s[0] || '', subheadline: snap.paragraphs[0] || '',
        items: snap.headings.slice(1).map((h, i) => ({ title: h, description: snap.paragraphs[i + 1] || '' })),
      }
  }
}

const buildImages = (snapImgs: { src: string; alt: string }[], pageImgs: { src: string; alt: string }[], type: string): Record<string, string> => {
  const images: Record<string, string> = {}
  const all = snapImgs.length > 0 ? snapImgs : pageImgs
  if (all[0]) images.imageUrl = all[0].src.startsWith('//') ? `https:${all[0].src}` : all[0].src
  if (type === 'gallery' || type === 'products') {
    all.slice(0, 8).forEach((img, i) => { images[`gallery_${i}`] = img.src.startsWith('//') ? `https:${img.src}` : img.src })
  }
  return images
}

const calcCompleteness = (content: Record<string, unknown>, type: string, products: CatalogProduct[]): number => {
  let score = 0
  const h = content.headline as string || ''
  if (h.length > 5) score += 30
  const items = content.items as unknown[]
  if (items?.length > 0) score += 30
  if (content.imageUrl) score += 20
  if ((type === 'pricing' || type === 'products') && products.length > 0) score += 20
  else if ((content.subheadline as string || '').length > 20) score += 20
  return Math.min(score, 100)
}
