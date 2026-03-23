import { NextRequest } from 'next/server'
import {
  getAgentSystemPrompt,
  crossCheck,
  type SiteContext,
  type AgentRole,
} from '@/lib/agent-orchestrator'
import { composePage, resolveVariantId } from '@/lib/section-composer'
import type { SectionCategory, PageSection } from '@ubuilder/types'
import { createDb, sites, eq } from '@ubuilder/db'
import { prefixedId } from '@ubuilder/utils'
import { getAuthUser } from '@/lib/auth-middleware'
import * as tracker from '@/lib/generation-tracker'
import type { GenerationStepName } from '@ubuilder/types'

// ─── AI Call Infrastructure ──────────────────────────────────────────

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const CLAUDE_MODEL = 'claude-sonnet-4-20250514'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

const parseAgentResponse = (text: string): Record<string, unknown> => {
  const cleaned = text.replace(/^```(?:json)?\s*\n?/m, '').replace(/\n?```\s*$/m, '')
  const startIdx = cleaned.indexOf('{')
  if (startIdx === -1) return { reasoning: text.trim(), decision: {} }
  let depth = 0, inString = false
  for (let i = startIdx; i < cleaned.length; i++) {
    const ch = cleaned[i]
    if (inString) { if (ch === '\\') { i++; continue }; if (ch === '"') inString = false; continue }
    if (ch === '"') { inString = true; continue }
    if (ch === '{') depth++
    else if (ch === '}') { depth--; if (depth === 0) { try { return JSON.parse(cleaned.slice(startIdx, i + 1)) } catch { break } } }
  }
  return { reasoning: text.trim(), decision: {} }
}

const callPipelineAgent = async (
  systemPrompt: string,
  userMessage: string,
): Promise<{ result: Record<string, unknown>; promptSize: number; responseSize: number }> => {
  const claudeKey = process.env.CLAUDE_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 150000) // 2.5 min per agent call
  const promptSize = systemPrompt.length + userMessage.length

  try {
    if (claudeKey) {
      const res = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': claudeKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 8192, system: systemPrompt, messages: [{ role: 'user', content: userMessage }] }),
        signal: controller.signal,
      })
      if (res.ok) {
        const data = await res.json()
        const responseText = data.content?.[0]?.text || ''
        return { result: parseAgentResponse(responseText), promptSize, responseSize: responseText.length }
      }
    }

    if (geminiKey) {
      const res = await fetch(`${GEMINI_API_URL}?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userMessage }] }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 8192, responseMimeType: 'application/json' },
        }),
        signal: controller.signal,
      })
      if (res.ok) {
        const data = await res.json()
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
        return { result: parseAgentResponse(responseText), promptSize, responseSize: responseText.length }
      }
    }

    throw new Error('No AI API key configured')
  } finally {
    clearTimeout(timeout)
  }
}

const resolvePalette = (
  primary: Record<string, string> | undefined,
  fallback?: Record<string, string> | undefined,
) => {
  const p = primary || {}
  const f = fallback || {}
  const pri = p.primary || f.primary || '#7C3AED'
  return {
    primary: pri,
    primaryHover: p.primaryHover || f.primaryHover || pri,
    secondary: p.secondary || f.secondary || '#06B6D4',
    accent: p.accent || f.accent || '#F59E0B',
    background: p.background || f.background || '#0B0F1A',
    backgroundAlt: p.backgroundAlt || f.backgroundAlt || '#131825',
    text: p.text || f.text || '#F1F5F9',
    textMuted: p.textMuted || f.textMuted || '#94A3B8',
    border: p.border || f.border || '#1E293B',
  }
}

// ─── Industry fallback section maps (server-side fallback) ───────────

const INDUSTRY_SECTION_MAP: Record<string, { type: string; variantId: string }[]> = {
  restaurant: [
    { type: 'navbar', variantId: 'navbar-floating' },
    { type: 'hero', variantId: 'hero-split-image' },
    { type: 'gallery', variantId: 'gallery-masonry' },
    { type: 'features', variantId: 'features-icon-grid' },
    { type: 'testimonials', variantId: 'testimonials-carousel' },
    { type: 'cta', variantId: 'cta-gradient-banner' },
    { type: 'contact', variantId: 'contact-form-map' },
    { type: 'footer', variantId: 'footer-multi-column' },
  ],
  lawyer: [
    { type: 'navbar', variantId: 'navbar-floating' },
    { type: 'hero', variantId: 'hero-minimal-text' },
    { type: 'features', variantId: 'features-zigzag' },
    { type: 'team', variantId: 'team-grid' },
    { type: 'testimonials', variantId: 'testimonials-featured' },
    { type: 'faq', variantId: 'faq-accordion' },
    { type: 'contact', variantId: 'contact-form-map' },
    { type: 'footer', variantId: 'footer-multi-column' },
  ],
  dentist: [
    { type: 'navbar', variantId: 'navbar-floating' },
    { type: 'hero', variantId: 'hero-parallax-layers' },
    { type: 'features', variantId: 'features-bento-grid' },
    { type: 'team', variantId: 'team-featured' },
    { type: 'testimonials', variantId: 'testimonials-star-rating' },
    { type: 'pricing', variantId: 'pricing-animated-cards' },
    { type: 'contact', variantId: 'contact-minimal-form' },
    { type: 'footer', variantId: 'footer-multi-column' },
  ],
  fitness: [
    { type: 'navbar', variantId: 'navbar-transparent' },
    { type: 'hero', variantId: 'hero-fullscreen-video' },
    { type: 'features', variantId: 'features-bento-grid' },
    { type: 'pricing', variantId: 'pricing-toggle' },
    { type: 'testimonials', variantId: 'testimonials-wall' },
    { type: 'stats', variantId: 'stats-counter' },
    { type: 'cta', variantId: 'cta-gradient-banner' },
    { type: 'footer', variantId: 'footer-multi-column' },
  ],
  saas: [
    { type: 'navbar', variantId: 'navbar-floating' },
    { type: 'hero', variantId: 'hero-gradient-mesh' },
    { type: 'features', variantId: 'features-bento-grid' },
    { type: 'pricing', variantId: 'pricing-comparison-table' },
    { type: 'testimonials', variantId: 'testimonials-logo-bar' },
    { type: 'faq', variantId: 'faq-searchable' },
    { type: 'cta', variantId: 'cta-newsletter' },
    { type: 'footer', variantId: 'footer-mega' },
  ],
  'real-estate': [
    { type: 'navbar', variantId: 'navbar-floating' },
    { type: 'hero', variantId: 'hero-fullscreen-video' },
    { type: 'gallery', variantId: 'gallery-filterable' },
    { type: 'features', variantId: 'features-icon-grid' },
    { type: 'testimonials', variantId: 'testimonials-featured' },
    { type: 'stats', variantId: 'stats-counter' },
    { type: 'contact', variantId: 'contact-form-map' },
    { type: 'footer', variantId: 'footer-multi-column' },
  ],
  beauty: [
    { type: 'navbar', variantId: 'navbar-minimal' },
    { type: 'hero', variantId: 'hero-parallax-layers' },
    { type: 'gallery', variantId: 'gallery-masonry' },
    { type: 'features', variantId: 'features-carousel' },
    { type: 'pricing', variantId: 'pricing-animated-cards' },
    { type: 'testimonials', variantId: 'testimonials-glassmorphism' },
    { type: 'contact', variantId: 'contact-minimal-form' },
    { type: 'footer', variantId: 'footer-centered' },
  ],
  plumber: [
    { type: 'navbar', variantId: 'navbar-floating' },
    { type: 'hero', variantId: 'hero-split-image' },
    { type: 'features', variantId: 'features-icon-grid' },
    { type: 'how-it-works', variantId: 'how-it-works-steps' },
    { type: 'testimonials', variantId: 'testimonials-star-rating' },
    { type: 'cta', variantId: 'cta-floating-card' },
    { type: 'contact', variantId: 'contact-form-map' },
    { type: 'footer', variantId: 'footer-minimal' },
  ],
  photographer: [
    { type: 'navbar', variantId: 'navbar-minimal' },
    { type: 'hero', variantId: 'hero-magazine' },
    { type: 'portfolio', variantId: 'portfolio-grid' },
    { type: 'gallery', variantId: 'gallery-lightbox' },
    { type: 'about', variantId: 'about-story' },
    { type: 'testimonials', variantId: 'testimonials-minimal' },
    { type: 'contact', variantId: 'contact-minimal-form' },
    { type: 'footer', variantId: 'footer-centered' },
  ],
  default: [
    { type: 'navbar', variantId: 'navbar-floating' },
    { type: 'hero', variantId: 'hero-gradient-mesh' },
    { type: 'features', variantId: 'features-bento-grid' },
    { type: 'testimonials', variantId: 'testimonials-carousel' },
    { type: 'cta', variantId: 'cta-gradient-banner' },
    { type: 'contact', variantId: 'contact-form-map' },
    { type: 'footer', variantId: 'footer-multi-column' },
  ],
}

/** Generate a unique slug, appending random suffix on collision */
const generateUniqueSlug = async (db: ReturnType<typeof createDb>, baseSlug: string): Promise<string> => {
  let slug = baseSlug
  let attempts = 0
  while (attempts < 5) {
    const [existing] = await db.select({ id: sites.id }).from(sites).where(eq(sites.slug, slug)).limit(1)
    if (!existing) return slug
    slug = `${baseSlug}-${Math.random().toString(36).substring(2, 5)}`
    attempts++
  }
  return `${baseSlug}-${Date.now().toString(36)}`
}

// ─── Variant ID Validation Helpers ────────────────────────────────

const CATEGORY_DEFAULTS: Record<string, string> = {
  navbar: 'navbar-floating', hero: 'hero-gradient-mesh', features: 'features-bento-grid',
  testimonials: 'testimonials-carousel', pricing: 'pricing-animated-cards', cta: 'cta-gradient-banner',
  faq: 'faq-accordion', footer: 'footer-multi-column', gallery: 'gallery-masonry',
  team: 'team-grid', stats: 'stats-counter', contact: 'contact-form-map',
  partners: 'partners-logo-marquee', 'how-it-works': 'how-it-works-steps', blog: 'blog-grid',
  portfolio: 'portfolio-grid', comparison: 'comparison-table', newsletter: 'newsletter-inline',
  about: 'about-story',
}

const validateAndFixVariantIds = (sections: Array<Record<string, unknown>>) => {
  for (const ds of sections) {
    if (ds.variantId && typeof ds.variantId === 'string') {
      const resolved = resolveVariantId(ds.variantId)
      if (resolved && resolved !== ds.variantId) {
        ds.variantId = resolved
      } else if (!resolved) {
        const category = (ds.type as string) || ''
        const fallback = CATEGORY_DEFAULTS[category]
        if (fallback) ds.variantId = fallback
      }
    }
  }
}

// ─── Designer Prompt Extension ────────────────────────────────────

const DESIGNER_VARIANT_KNOWLEDGE = `
CRITICAL: You MUST choose ONLY from these EXACT variantIds. Do NOT invent new IDs.

NAVBAR variants: navbar-transparent, navbar-floating, navbar-sidebar, navbar-mega-menu, navbar-hamburger, navbar-minimal, navbar-split, navbar-command
HERO variants: hero-gradient-mesh, hero-split-image, hero-fullscreen-video, hero-particles, hero-typewriter, hero-3d-globe, hero-parallax-layers, hero-magazine, hero-product-showcase, hero-minimal-text, hero-counter-stats, hero-carousel, hero-aurora, hero-noise-gradient, hero-interactive-cards
FEATURES variants: features-bento-grid, features-tabs, features-accordion, features-zigzag, features-icon-grid, features-carousel, features-comparison, features-timeline, features-video-cards, features-interactive, features-stats-integrated, features-hoverable-cards
TESTIMONIALS variants: testimonials-carousel, testimonials-masonry, testimonials-featured, testimonials-video, testimonials-wall, testimonials-minimal, testimonials-star-rating, testimonials-logo-bar, testimonials-before-after, testimonials-glassmorphism
PRICING variants: pricing-animated-cards, pricing-toggle, pricing-comparison-table, pricing-slider, pricing-minimal, pricing-gradient, pricing-enterprise, pricing-israeli
CTA variants: cta-gradient-banner, cta-split-image, cta-floating-card, cta-newsletter, cta-countdown, cta-sticky-bottom, cta-video-background, cta-glassmorphism
FAQ variants: faq-accordion, faq-searchable, faq-categorized, faq-two-column, faq-chat-style
FOOTER variants: footer-multi-column, footer-minimal, footer-mega, footer-centered, footer-gradient, footer-cta-integrated
GALLERY variants: gallery-masonry, gallery-lightbox, gallery-carousel, gallery-filterable, gallery-fullscreen, gallery-before-after
TEAM variants: team-grid, team-carousel, team-featured, team-minimal
STATS variants: stats-counter, stats-icon-cards, stats-progress-bars, stats-marquee
CONTACT variants: contact-form-map, contact-minimal-form, contact-cards, contact-split-info
PARTNERS variants: partners-logo-marquee, partners-grid, partners-featured
HOW-IT-WORKS variants: how-it-works-steps, how-it-works-vertical, how-it-works-interactive, how-it-works-illustrated
BLOG variants: blog-grid, blog-featured, blog-minimal-list, blog-carousel
PORTFOLIO variants: portfolio-grid, portfolio-case-study, portfolio-fullscreen
COMPARISON variants: comparison-table, comparison-cards
NEWSLETTER variants: newsletter-inline, newsletter-card, newsletter-full-section
ABOUT variants: about-story, about-mission-vision, about-values

Background Effects: floating-orbs, particles-canvas, wave-canvas, grid-pattern, shooting-stars, aurora-gradient, dot-matrix
Section Effects: spotlight-title, glass-card, gradient-border-anim, text-gradient, tilt-card, glow-card, shimmer-button, neon-glow, dot-grid-bg, section-fade
Hebrew Fonts: Heebo, Rubik, Noto Sans Hebrew, Frank Ruhl Libre, David Libre, Secular One, Suez One, Karantina, Assistant, Varela Round, Alef, Open Sans Hebrew, Miriam Libre, Bellefair, Amatic SC
21st.dev patterns: Spotlight cards, lamp effect, neon multi-layer glow, 3D perspective tilt, glassmorphism, animated gradient borders, floating orbs, marquee, bento grid

For EVERY section, choose at least one premium visual effect.
Match hero to industry:
- restaurant/cafe → hero-split-image
- tech/saas → hero-gradient-mesh or hero-aurora
- beauty/health → hero-parallax-layers
- law/finance → hero-minimal-text
- ecommerce → hero-product-showcase
- portfolio/creative → hero-magazine
- real-estate → hero-fullscreen-video`

// ─── Content Merge Helpers ────────────────────────────────────────

const hasProductData = (items: unknown[] | undefined): boolean => {
  if (!items || items.length === 0) return false
  return items.some(item => {
    if (!item || typeof item !== 'object') return false
    const obj = item as Record<string, unknown>
    if (obj.price !== undefined || obj.originalPrice !== undefined) return true
    if (Array.isArray(obj.features) && obj.features.length > 0) return true
    if (typeof obj.title === 'string' && /[A-Z]\d|K\d{1,2}|Ultra|Pro|Max|Plus|Mini|Lite|First|Premium/i.test(obj.title)) return true
    return false
  })
}

const mergeSections = (
  designSections: Array<Record<string, unknown>>,
  contentSections: Array<Record<string, unknown>>,
  globals: { businessName: string; businessType: string; locale: string; generatedImages: Record<string, string> },
) => {
  return designSections.map((ds, i) => {
    const cs = contentSections.find(
      c => (c.variantId && c.variantId === ds.variantId) || (c.type && c.type === ds.type)
    ) || contentSections[i] || {}

    const designItems = ds.items as unknown[] | undefined
    const contentItems = cs.items as unknown[] | undefined
    // Content items win when they have product data (from scan catalog injection)
    // or when design items are empty/generic
    const mergedItems = hasProductData(contentItems)
      ? contentItems
      : hasProductData(designItems) ? designItems
      : (contentItems && contentItems.length > 0) ? contentItems
      : (designItems && designItems.length > 0) ? designItems
      : []

    return {
      ...ds,
      // Content agent output always wins for text fields (enriched with scan data)
      headline: cs.headline || ds.headline || ds.title,
      title: cs.title || cs.headline || ds.title || ds.headline,
      subheadline: cs.subheadline || cs.subtitle || ds.subheadline || ds.description,
      subtitle: cs.subtitle || cs.subheadline || ds.subtitle || ds.description,
      description: cs.description || ds.description,
      cta: cs.cta || ds.cta,
      ctaText: cs.ctaText || (typeof cs.cta === 'object' && cs.cta ? (cs.cta as Record<string,unknown>).text : cs.cta) || ds.ctaText || (typeof ds.cta === 'object' && ds.cta ? (ds.cta as Record<string,unknown>).text : ds.cta) || '',
      ctaSecondary: cs.ctaSecondary || ds.ctaSecondary,
      items: mergedItems,
      variantId: ds.variantId,
      type: ds.type,
      businessName: globals.businessName,
      businessType: globals.businessType,
      locale: globals.locale,
      images: (() => {
        const sectionType = ds.type as string
        const imgs: Record<string, string> = { ...((ds.images as Record<string, string>) || {}) }
        if (globals.generatedImages[sectionType]) imgs.imageUrl = globals.generatedImages[sectionType]
        if (sectionType === 'gallery') {
          const galleryUrls: string[] = []
          for (let gi = 0; gi < 10; gi++) {
            if (globals.generatedImages[`gallery_${gi}`]) galleryUrls.push(globals.generatedImages[`gallery_${gi}`])
          }
          if (galleryUrls.length > 0) imgs.galleryImages = galleryUrls.join('|||')
          if (!imgs.imageUrl && galleryUrls[0]) imgs.imageUrl = galleryUrls[0]
        }
        if (globals.generatedImages.logo) imgs.logoUrl = globals.generatedImages.logo
        return imgs
      })(),
      imageUrl: globals.generatedImages[(ds.type as string)] || (ds.imageUrl as string) || undefined,
    }
  })
}

const sectionsToPageSections = (sections: Array<Record<string, unknown>>): PageSection[] =>
  sections.map((s, i) => ({
    id: `s-${i}`,
    category: ((s.type as string) || 'features') as SectionCategory,
    variantId: (s.variantId as string) || `${s.type}-default`,
    order: i,
    params: s,
    content: s,
    images: (s.images as Record<string, string>) || {},
  }))

// ─── Server-Side Fallback ─────────────────────────────────────────

const buildFallbackSite = (params: {
  siteName: string
  businessType: string
  description: string
  locale: string
}) => {
  const sections = INDUSTRY_SECTION_MAP[params.businessType] || INDUSTRY_SECTION_MAP.default
  const fallbackSections = sections.map((s, i) => ({
    ...s,
    order: i,
    businessName: params.siteName,
    businessType: params.businessType,
    locale: params.locale,
    headline: i === 1 ? params.siteName : undefined, // hero gets business name
    subheadline: i === 1 ? params.description : undefined,
  }))

  const pageSections = sectionsToPageSections(fallbackSections as Array<Record<string, unknown>>)

  const html = composePage({
    id: `fallback-${Date.now()}`,
    siteName: params.siteName,
    locale: params.locale as 'en' | 'he',
    palette: resolvePalette(undefined),
    fonts: {
      heading: params.locale === 'he' ? 'Heebo' : 'Inter',
      body: params.locale === 'he' ? 'Assistant' : 'Inter',
      headingWeight: '700',
      bodyWeight: '400',
    },
    sections: pageSections,
  })

  return { html, sections: fallbackSections, sectionCount: sections.length }
}

// ─── Main Pipeline Route ─────────────────────────────────────────

export const maxDuration = 300

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { description, locale = 'he', discoveryContext, deepScanData, scanJobId, scanMode, sourceOwnership, uploadedLogo, documentText } = body

  // Auth — get userId (fallback to x-user-id header)
  const authUser = await getAuthUser(req)
  const userId = authUser?.userId || req.headers.get('x-user-id') || 'anonymous'

  // V1 validation: reject recreation mode and third_party + copy
  if (scanMode === 'recreation') {
    return new Response(
      JSON.stringify({ ok: false, error: 'recreation mode is not available yet (V2)' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }
  if (sourceOwnership === 'third_party' && scanMode === 'copy') {
    return new Response(
      JSON.stringify({ ok: false, error: 'copy mode requires self_owned source ownership' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  // Load scan context if scanJobId is provided
  let scanGenerationCtx: Record<string, unknown> | null = null
  let scanSourceUrl: string | null = null
  let scanCatalog: Record<string, unknown> | null = null
  let scanContentModel: Record<string, unknown> | null = null
  if (scanJobId) {
    try {
      scanGenerationCtx = await tracker.getArtifact(scanJobId, 'scan_generation_ctx')
      // Load migration artifacts for content injection (V1.2)
      scanCatalog = await tracker.getArtifact(scanJobId, 'content_catalog').catch(() => null)
      scanContentModel = await tracker.getArtifact(scanJobId, 'source_content_model').catch(() => null)
      // Get sourceUrl from scan job
      const scanJobStatus = await tracker.getJobStatus(scanJobId)
      if (scanJobStatus) {
        scanSourceUrl = (scanJobStatus.job as Record<string, unknown>).sourceUrl as string | null
      }
    } catch (scanErr) {
      console.error('[pipeline] Failed to load scan context:', scanErr)
    }
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      let streamClosed = false
      const send = (data: Record<string, unknown>) => {
        if (streamClosed) return
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {
          streamClosed = true
        }
      }

      // ── CREATE JOB + DRAFT SITE ──
      let jobId: string | null = null
      let siteId: string | null = null
      let lastStepName: GenerationStepName = 'strategy'
      const siteName = (discoveryContext?.business_name as string)
        || (discoveryContext?.businessName as string)
        || description?.slice(0, 40)
        || 'New Site'
      const businessType = (discoveryContext?.industry as string)
        || description?.split(' ')[0]
        || 'business'

      try {
        // Create generation job
        jobId = await tracker.createJob({
          userId,
          description: description || '',
          locale,
          discoveryContext: discoveryContext || {},
        })

        // Create draft site
        const db = createDb()
        siteId = prefixedId('site')
        const baseSlug = siteName.toLowerCase().replace(/[^a-z0-9\u0590-\u05fe]+/g, '-').replace(/(^-|-$)/g, '') || 'site'
        const slug = await generateUniqueSlug(db, baseSlug)

        await db.insert(sites).values({
          id: siteId,
          userId,
          name: siteName,
          slug,
          status: 'draft',
          industry: businessType,
          locale,
          sourceUrl: scanSourceUrl || deepScanData?.url as string || undefined,
        })

        // Link site to job
        await tracker.linkSiteToJob(jobId, siteId)
        await tracker.startJob(jobId)

        // Set scanner fields on job if scan-based
        if (scanJobId || scanMode) {
          const { db: rawDb, sql } = await import('@ubuilder/db')
          await rawDb.execute(sql`
            UPDATE generation_jobs
            SET scan_job_id = ${scanJobId || null},
                scan_mode = ${scanMode || null},
                source_ownership = ${sourceOwnership || null}
            WHERE id = ${jobId}
          `)
        }

        // Send job + site IDs as first event
        send({ phase: 'init', jobId, siteId, siteName })

        // Save project_brief artifact — synthesized from scan in copy mode, or from description
        if (scanMode === 'copy' && scanGenerationCtx) {
          // Copy mode: synthesize canonical artifacts from scan context
          const { synthesizeScanArtifacts } = await import('@/lib/scan-to-composition')
          const synthetic = synthesizeScanArtifacts(
            scanGenerationCtx as import('@/lib/scan-to-composition').ScanBasedGenerationContext,
            { sourceUrl: scanSourceUrl || '', locale },
          )
          await tracker.saveArtifact({ jobId, artifactType: 'project_brief', data: synthetic.projectBrief as unknown as Record<string, unknown> })
          await tracker.saveArtifact({ jobId, artifactType: 'site_plan', data: synthetic.sitePlan as unknown as Record<string, unknown> })
          send({ phase: 'strategy', step: 'Scan-derived strategy (copy mode)', scanMode: 'copy' })
        } else {
          // Normal flow: save project_brief from description
          await tracker.saveArtifact({
            jobId,
            artifactType: 'project_brief',
            data: {
              businessName: siteName,
              description: description || '',
              locale,
              industry: businessType,
              discoveryAnswers: discoveryContext || {},
              sourceUrl: scanSourceUrl || deepScanData?.url || null,
              hasUploadedLogo: !!uploadedLogo,
              uploadedLogoSize: uploadedLogo ? uploadedLogo.length : 0,
              hasDocumentText: !!documentText,
              documentTextLength: documentText ? documentText.length : 0,
              documentTextPreview: documentText ? documentText.slice(0, 200) : null,
            },
          })
        }
      } catch (initErr) {
        console.error('[pipeline] Init failed:', initErr)
        send({ phase: 'error', error: 'Failed to initialize generation job' })
        controller.close()
        return
      }

      try {
        const siteContext: SiteContext = {
          siteId: siteId!,
          siteName,
          businessType,
          locale: (locale === 'en' ? 'en' : 'he') as 'en' | 'he',
          pages: [],
        }

        // ── PHASE 1: STRATEGY ──
        send({ phase: 'strategy', agent: '@strategist', status: 'running' })
        const strategyStepId = await tracker.startStep(jobId!, 'strategy', '@strategist'); lastStepName = 'strategy'

        const strategyPrompt = getAgentSystemPrompt('strategy', siteContext)
        // Build document context block if user uploaded documents
        const documentBlock = documentText && documentText.trim().length > 20
          ? `\n\n=== UPLOADED BUSINESS DOCUMENT ===\nThe user uploaded a document with the following content. Use this as PRIMARY source for business details, products, services, pricing, and branding:\n${documentText.slice(0, 6000)}\n=== END DOCUMENT ===\n`
          : ''

        const strategyInput = `Analyze this business and create a website strategy:
Business description: ${description}
Locale: ${locale}
Discovery context: ${JSON.stringify(discoveryContext || {})}
${deepScanData ? `Scan data available: ${JSON.stringify(deepScanData).slice(0, 3000)}` : ''}
${scanCatalog && (scanCatalog.products as unknown[])?.length > 0 ? `\nREAL PRODUCTS from scanned site: ${JSON.stringify((scanCatalog.products as Record<string, unknown>[]).slice(0, 8).map(p => (p.name as Record<string, unknown>)?.value)).slice(0, 500)}` : ''}
${scanContentModel?.faqs ? `\nREAL FAQ questions found: ${((scanContentModel.faqs as Record<string, unknown>[]) || []).slice(0, 5).map(f => (f as Record<string, unknown>).value).join('; ').slice(0, 300)}` : ''}
${documentBlock}
IMPORTANT: The "businessName" field MUST be the actual name from the description or discovery context. Do NOT invent a new name.
${scanCatalog && (scanCatalog.products as unknown[])?.length > 0 ? 'IMPORTANT: Include product-related sections (productOverview, comparisonTable, productGrid) because real product data is available.' : ''}
${documentText ? 'IMPORTANT: Use the uploaded document content as a primary source for business details, products, services, and unique selling points.' : ''}

Return JSON with: { businessName, industry, targetAudience, brandPersonality, conversionGoals, contentTone, uniqueSellingPoints }`

        let strategyOutput: Record<string, unknown>
        try {
          const { result, promptSize, responseSize } = await callPipelineAgent(strategyPrompt, strategyInput)
          strategyOutput = result
          await tracker.completeStep(strategyStepId, { promptSize, responseSize })
          await tracker.saveArtifact({
            jobId: jobId!,
            stepId: strategyStepId,
            artifactType: 'site_plan',
            data: {
              businessName: (result.businessName as string) || siteName,
              industry: (result.industry as string) || businessType,
              targetAudience: (result.targetAudience as string) || '',
              brandPersonality: (result.brandPersonality as string) || '',
              contentTone: (result.contentTone as string) || '',
              uniqueSellingPoints: (result.uniqueSellingPoints as string[]) || [description || ''],
              conversionGoals: (result.conversionGoals as string[]) || ['contact'],
              sectionPriorities: (result.sectionPriorities as string[]) || [],
              visualKeywords: (result.visualKeywords as string[]) || [],
            },
          })
          send({ phase: 'strategy', status: 'complete', data: strategyOutput })
        } catch (strategyErr) {
          await tracker.failStep(strategyStepId, strategyErr instanceof Error ? strategyErr.message : 'Strategy failed')
          throw strategyErr
        }

        // ── PHASE 2: DESIGN (with cross-check) ──
        send({ phase: 'design', agent: '@designer', status: 'running' })
        const designStepId = await tracker.startStep(jobId!, 'design', '@designer'); lastStepName = 'design'

        // Select art direction based on business context
        const { selectArtDirection, buildArtDirectionPrompt } = await import('@/lib/art-direction')
        const artDirection = selectArtDirection({
          industry: (strategyOutput.industry as string) || businessType,
          businessType,
          designDirection: (discoveryContext?.designDirection as string) || undefined,
          targetAudience: (strategyOutput.targetAudience as string) || (discoveryContext?.targetAudience as string) || undefined,
        })
        const artDirectionBlock = buildArtDirectionPrompt(artDirection)
        console.log(`[pipeline] Art direction selected: ${artDirection.id} (${artDirection.name})`)

        const designerPrompt = getAgentSystemPrompt('designer', siteContext) + `\n\nDESIGN RESOURCES — You MUST use these:\n` + DESIGNER_VARIANT_KNOWLEDGE + artDirectionBlock
        const designInput = `Design a premium website for:
${description}
Strategy: ${JSON.stringify(strategyOutput)}
Locale: ${locale}
Business name: ${siteContext.siteName}
Art Direction: ${artDirection.name} — ${artDirection.description}
Dark Mode: ${artDirection.preferDark ? 'YES' : 'NO'}
Typography: Hebrew=${artDirection.typography.hebrewFont}, English=${artDirection.typography.englishFont}

CRITICAL: "siteName" MUST be "${siteContext.siteName}" — the actual business name. Do NOT invent a different name.
All headlines, subheadlines, and content MUST be about this specific business (${description}), in ${locale === 'he' ? 'Hebrew' : 'English'}.
CRITICAL: Follow the "${artDirection.name}" art direction precisely. Every section must align with its visual system.

Return JSON with:
{
  "siteName": "${siteContext.siteName}",
  "colorPalette": { "primary": "#hex", "secondary": "#hex", "accent": "#hex", "background": "#hex", "backgroundAlt": "#hex", "text": "#hex", "textMuted": "#hex", "border": "#hex" },
  "typography": { "headingFont": "...", "bodyFont": "...", "headingWeight": "700", "bodyWeight": "400" },
  "sections": [
    { "type": "navbar", "variantId": "nav-...", "items": [] },
    { "type": "hero", "variantId": "hero-...", "headline": "...", "subheadline": "...", "cta": { "text": "...", "action": "scroll-to-contact" } },
    ... 10-15 more sections with FULL content in items arrays
  ],
  "effects": ["effect1", "effect2"],
  "backgroundEffect": "floating-orbs|particles-canvas|etc",
  "reasoning": "why these choices"
}`

        let finalDesign: Record<string, unknown>
        try {
          const { result: designOutput, promptSize, responseSize } = await callPipelineAgent(designerPrompt, designInput)

          // Cross-check: strategist reviews design
          send({ phase: 'design', agent: '@strategist', status: 'cross-check' })
          const crossCheckStepId = await tracker.startStep(jobId!, 'cross_check', '@strategist'); lastStepName = 'cross_check'
          const designReview = await crossCheck('strategy' as AgentRole, designOutput, siteContext)

          finalDesign = designOutput
          if (designReview.approved === false && designReview.suggestions) {
            send({ phase: 'design', agent: '@designer', status: 'retry', feedback: designReview.suggestions })
            await tracker.markStepRetry(designStepId)
            const retryInput = `Your design was reviewed. Issues: ${JSON.stringify(designReview.issues)}
Suggestions: ${JSON.stringify(designReview.suggestions)}
Original design: ${JSON.stringify(designOutput)}
Please revise and return improved JSON.`
            const { result: retryResult } = await callPipelineAgent(designerPrompt, retryInput)
            finalDesign = retryResult
          }
          await tracker.completeStep(crossCheckStepId)

          // Validate and auto-correct variantIds
          let designSections: Array<Record<string, unknown>> = []
          try {
            const designPagesForValidation = Array.isArray(finalDesign.pages) ? finalDesign.pages : []
            const designSectionsFromPages = designPagesForValidation.flatMap((p: Record<string, unknown>) =>
              Array.isArray(p?.sections) ? (p.sections as Array<unknown>).filter((s): s is Record<string, unknown> => s != null && typeof s === 'object') : []
            )
            const designSectionsFromRoot = Array.isArray(finalDesign.sections) ? (finalDesign.sections as Array<Record<string, unknown>>) : []
            designSections = designSectionsFromPages.length > 0 ? designSectionsFromPages : designSectionsFromRoot
          } catch {
            console.warn('[pipeline] Section validation failed, using empty sections')
          }
          // Deduplicate design sections — AI may return multiple pages or duplicate types
          const seenTypes = new Set<string>()
          const uniqueSections: Array<Record<string, unknown>> = []
          for (const s of designSections) {
            const type = s.type as string
            if (type && !seenTypes.has(type)) {
              seenTypes.add(type)
              uniqueSections.push(s)
            }
          }
          // Cap at 12 sections max for a single homepage
          designSections = uniqueSections.slice(0, 12)

          validateAndFixVariantIds(designSections)

          // ── PREMIUM VARIANT ENFORCEMENT ──
          // Deterministically upgrade key sections to premium variants
          // when business type, scan data, or art direction indicate premium output
          console.log(`[pipeline] Enforcement check: businessType=${businessType}, scanMode=${scanMode}, sections=${designSections.length}, hasCatalog=${!!scanCatalog}`)
          const artDirection = (discoveryContext?.designDirection as string) || (discoveryContext?.designStyle as string) || ''
          const strategyBrand = (strategyOutput.brandPersonality as string) || ''
          const allContext = `${artDirection} ${strategyBrand} ${description}`.toLowerCase()
          const isPremium = allContext.includes('premium') || allContext.includes('apple') || allContext.includes('minimal') || allContext.includes('פרימיום')
          const isFamilySafe = /kids|family|children|ילדים|משפח|בטוח|בטיחות/.test(businessType + ' ' + description)
          const isTech = /saas|tech|ai|fintech|software/.test(businessType)
          const isEcommerce = /ecommerce|retail|shop|store|consumer_electronics/.test(businessType)
          const hasScanProducts = !!(scanCatalog && (scanCatalog.products as unknown[])?.length >= 2)
          // Scan-based copy mode with real products = always premium-worthy
          const isScanCopyWithProducts = scanMode === 'copy' && hasScanProducts

          const variantUpgrades: Record<string, string> = {}

          for (const section of designSections) {
            const type = section.type as string
            const currentVariant = section.variantId as string
            let newVariant: string | null = null
            let reason = ''

            if (type === 'hero') {
              if (isFamilySafe && (isEcommerce || isScanCopyWithProducts)) {
                newVariant = 'hero-family-warm'
                reason = 'family-safe + products → warm trust hero'
              } else if (isEcommerce || isScanCopyWithProducts) {
                newVariant = 'hero-apple-clean'
                reason = 'e-commerce/scan-products → apple-clean product hero'
              } else if (isTech) {
                newVariant = 'hero-tech-dark'
                reason = 'tech/SaaS → dark cinematic hero'
              } else if (isPremium) {
                newVariant = 'hero-apple-clean'
                reason = 'premium direction → apple-clean hero'
              }
            }

            if (type === 'pricing') {
              if (hasScanProducts || isScanCopyWithProducts) {
                if (currentVariant !== 'pricing-premium-showcase' && currentVariant !== 'pricing-israeli') {
                  newVariant = 'pricing-premium-showcase'
                  reason = 'real products/scan copy → premium showcase pricing'
                }
              }
            }

            if (type === 'testimonials') {
              if (isPremium || isEcommerce || isFamilySafe || isScanCopyWithProducts) {
                if (!currentVariant.includes('premium')) {
                  newVariant = 'testimonials-premium'
                  reason = 'premium/ecommerce/family/scan → premium testimonials'
                }
              }
            }

            if (type === 'cta') {
              if (isPremium || isEcommerce || isScanCopyWithProducts) {
                if (!currentVariant.includes('premium')) {
                  newVariant = 'cta-premium-close'
                  reason = 'premium/ecommerce/scan → premium closing CTA'
                }
              }
            }

            if (newVariant && newVariant !== currentVariant) {
              variantUpgrades[type] = `${currentVariant} → ${newVariant} (${reason})`
              section.variantId = newVariant
            }
          }

          if (Object.keys(variantUpgrades).length > 0) {
            console.log('[pipeline] Premium variant enforcement:', JSON.stringify(variantUpgrades))
            send({ phase: 'design', status: 'premium-upgrade', upgrades: variantUpgrades })
          }

          finalDesign.sections = designSections
          // Also update pages[0].sections so downstream code reads enforced variants
          if (Array.isArray(finalDesign.pages) && (finalDesign.pages as Record<string, unknown>[]).length > 0) {
            (finalDesign.pages as Record<string, unknown>[])[0].sections = designSections
          }

          await tracker.completeStep(designStepId, { promptSize, responseSize })

          // Save page_blueprint artifact
          const palette = finalDesign.colorPalette as Record<string, string> | undefined
          const typo = finalDesign.typography as Record<string, string> | undefined
          await tracker.saveArtifact({
            jobId: jobId!,
            stepId: designStepId,
            artifactType: 'page_blueprint',
            data: {
              siteName: (finalDesign.siteName as string) || siteName,
              colorPalette: {
                primary: palette?.primary || '#7C3AED',
                secondary: palette?.secondary || '#06B6D4',
                accent: palette?.accent || '#F59E0B',
                background: palette?.background || '#0B0F1A',
                backgroundAlt: palette?.backgroundAlt || '#131825',
                text: palette?.text || '#F1F5F9',
                textMuted: palette?.textMuted || '#94A3B8',
                border: palette?.border || '#1E293B',
              },
              typography: {
                headingFont: typo?.headingFont || (locale === 'he' ? 'Heebo' : 'Inter'),
                bodyFont: typo?.bodyFont || (locale === 'he' ? 'Assistant' : 'Inter'),
                headingWeight: typo?.headingWeight || '700',
                bodyWeight: typo?.bodyWeight || '400',
              },
              sections: designSections.map((s, i) => ({
                type: s.type,
                variantId: s.variantId,
                order: i,
              })),
              backgroundEffect: (finalDesign.backgroundEffect as string) || null,
              effects: (finalDesign.effects as string[]) || [],
            },
          })
          send({ phase: 'design', status: 'complete', data: finalDesign })
        } catch (designErr) {
          await tracker.failStep(designStepId, designErr instanceof Error ? designErr.message : 'Design failed')
          throw designErr
        }

        // ── PHASE 3: CONTENT ──
        send({ phase: 'content', agent: '@content', status: 'running' })
        const contentStepId = await tracker.startStep(jobId!, 'content', '@content'); lastStepName = 'content'
        let designSections = (finalDesign.sections as Array<Record<string, unknown>>) || []

        // Critical fallback: if design returned empty sections, use industry defaults
        if (designSections.length === 0) {
          console.warn('[pipeline] Design returned empty sections — using industry fallback')
          const industryKey = (strategyOutput.industry as string || businessType || 'default').toLowerCase()
          const fallbackSections = INDUSTRY_SECTION_MAP[industryKey] || INDUSTRY_SECTION_MAP.default
          designSections = fallbackSections.map((s, i) => ({
            type: s.type,
            variantId: s.variantId,
            order: i,
            title: '',
            headline: '',
          }))
          finalDesign.sections = designSections
          send({ phase: 'design', status: 'fallback-sections', count: designSections.length })
        }

        const contentPrompt = getAgentSystemPrompt('content', siteContext)
        const contentDesignPages = (finalDesign.pages || []) as Array<{ sections?: Array<Record<string, unknown>> }>
        const homepageSections = contentDesignPages.length > 0
          ? (contentDesignPages[0].sections || [])
          : designSections.slice(0, 12)

        // V1.2: Build scan data injection block for content step
        let scanDataBlock = ''
        if (scanCatalog || scanContentModel) {
          const parts: string[] = []

          // V1.3: Inject enriched product data (names, prices, descriptions)
          const products = (scanCatalog?.products as Record<string, unknown>[]) || []
          if (products.length > 0) {
            const productLines = products.slice(0, 8).map(p => {
              const name = (p.name as Record<string, unknown>)?.value as string || ''
              const price = (p.price as Record<string, unknown>)?.value
              const originalPrice = (p.originalPrice as Record<string, unknown>)?.value
              const desc = (p.description as Record<string, unknown>)?.value as string || ''
              const category = (p.category as Record<string, unknown>)?.value as string || ''
              const parts: string[] = [name]
              if (price) parts.push(`${price} ₪`)
              if (originalPrice && originalPrice !== price) parts.push(`(was ${originalPrice} ₪)`)
              if (category) parts.push(`[${category}]`)
              if (desc && desc.length > 10) parts.push(`— ${desc.slice(0, 100)}`)
              return parts.join(' ')
            }).filter(Boolean)
            if (productLines.length > 0) {
              parts.push(`REAL PRODUCTS WITH DETAILS (use these exact names and prices):\n${productLines.map((l, i) => `${i + 1}. ${l}`).join('\n')}`)
            }

            // Product categories
            const categories = (scanCatalog?.categories as Record<string, unknown>[]) || []
            if (categories.length > 0) {
              const catNames = categories
                .map(c => (c.name as Record<string, unknown>)?.value as string)
                .filter(Boolean)
              parts.push(`PRODUCT CATEGORIES: ${catNames.join(', ')}`)
            }

            // Product images
            const productsWithImages = products
              .filter(p => (p.image as Record<string, unknown>)?.value)
              .slice(0, 6)
            if (productsWithImages.length > 0) {
              parts.push(`PRODUCT IMAGES AVAILABLE: ${productsWithImages.map(p =>
                `${(p.name as Record<string,unknown>)?.value}: ${(p.image as Record<string,unknown>)?.value}`
              ).join(' | ')}`)
            }
          }

          // Inject real FAQ questions
          const faqs = (scanContentModel?.faqs as Record<string, unknown>[]) || []
          if (faqs.length > 0) {
            const faqTexts = faqs
              .map(f => (f as Record<string, unknown>).value as string)
              .filter(Boolean)
              .slice(0, 10)
            if (faqTexts.length > 0) {
              parts.push(`REAL FAQ QUESTIONS (use these exact questions for the FAQ section):\n${faqTexts.map((q, i) => `${i + 1}. ${q}`).join('\n')}`)
            }
          }

          // Inject real CTAs
          const allCtas = (scanContentModel?.allCtas as Record<string, unknown>[]) || []
          if (allCtas.length > 0) {
            const ctaTexts = allCtas
              .map(c => (c as Record<string, unknown>).value as string)
              .filter(Boolean)
              .slice(0, 5)
            if (ctaTexts.length > 0) {
              parts.push(`REAL CTA TEXTS (prefer these for buttons): ${ctaTexts.join(', ')}`)
            }
          }

          // Inject navigation structure for reference
          const nav = (scanContentModel?.navigation as Record<string, unknown>[]) || []
          if (nav.length > 0) {
            const navTexts = nav
              .map(n => {
                const val = (n as Record<string, unknown>).value as Record<string, unknown>
                return val?.text as string
              })
              .filter(Boolean)
              .slice(0, 10)
            if (navTexts.length > 0) {
              parts.push(`NAVIGATION STRUCTURE: ${navTexts.join(' | ')}`)
            }
          }

          if (parts.length > 0) {
            scanDataBlock = `\n\n=== SCANNED SOURCE DATA (MUST USE) ===\nThis site is being rebuilt from a real scanned website. Use the following REAL business data:\n${parts.join('\n\n')}\n=== END SCANNED DATA ===\n`
          }
        }

        const contentInput = `Generate compelling content for these homepage sections ONLY (max ${homepageSections.length} sections):
Business name: ${siteContext.siteName}
Business description: ${description}
Strategy summary: industry=${(strategyOutput.industry as string)||''}, audience=${JSON.stringify((strategyOutput.targetAudience as Record<string,unknown>)?.primary||'')}, USPs=${JSON.stringify((strategyOutput.uniqueSellingPoints as string[])||[])}
Discovery context: ${JSON.stringify(discoveryContext || {})}
Sections: ${JSON.stringify(homepageSections.map(s => ({ type: (s as Record<string,unknown>).type, variantId: (s as Record<string,unknown>).variantId, title: (s as Record<string,unknown>).title })))}
Locale: ${locale}
${scanDataBlock}
CRITICAL: All content MUST be specifically about "${siteContext.siteName}" (${description}). Do NOT use generic placeholder content or invent a different business name.
${scanCatalog && (scanCatalog.products as unknown[])?.length > 0 ? `CRITICAL: This is a COPY MODE rebuild. You MUST use the REAL product names listed above. Do NOT invent product names.` : ''}
${scanContentModel?.faqs ? `CRITICAL: For the FAQ section, use the REAL FAQ questions listed above. Generate plausible answers based on the business context.` : ''}

ART DIRECTION: ${artDirection.name} — ${artDirection.description}
Content tone: ${artDirection.emotionalTone.join(', ')}
CTA style: ${artDirection.ctaStyle}
Trust tone: ${artDirection.trustTone}
Product presentation: ${artDirection.productPresentation}

PREMIUM CONTENT QUALITY STANDARDS:
- Headlines must be emotionally compelling and specific to THIS business — never generic marketing speak
- Subheadlines must add real value, not just repeat the headline differently
- Product/pricing items MUST include: name, real price if available, 4-6 specific features, compelling CTA
- FAQ items must have thorough, helpful answers (not one-liners) — minimum 2 sentences per answer
- Testimonial items must feel authentic with specific details, not generic praise
- CTA text must be action-oriented and specific: "בחרו דגם" not "לחצו כאן", "Get Started Free" not "Click Here"
- Every section headline should stand alone as compelling — if someone only reads headlines, they should understand the value proposition
- Content tone must match the business personality: family-safe businesses should feel warm and reassuring, tech should feel innovative and precise
- For pricing sections with real product data: include originalPrice for sale items, highlight the most popular option, list genuinely differentiating features per tier

For each section generate:
- headline + subheadline (compelling, specific to THIS business — ${siteContext.siteName})
- items array with rich, specific content about this specific business
- CTA text${scanCatalog ? ' (prefer real CTA texts from scanned data)' : ''}
- All text in ${locale === 'he' ? 'Hebrew' : 'English'}
${documentText ? `\n=== UPLOADED BUSINESS DOCUMENT ===\nUse this document as a PRIMARY source for real product names, services, pricing, and business details:\n${documentText.slice(0, 4000)}\n=== END DOCUMENT ===\nCRITICAL: Prefer real information from the uploaded document over generic placeholders.` : ''}

Return JSON: { "sections": [ { "type": "...", "variantId": "...", "headline": "...", "subheadline": "...", "items": [...], "cta": {...} } ] }`

        let contentOutput: Record<string, unknown> = {}
        try {
          const CONTENT_CHUNK_SIZE = 8
          if (homepageSections.length > CONTENT_CHUNK_SIZE) {
            const allContentSections: Record<string, unknown>[] = []
            for (let i = 0; i < homepageSections.length; i += CONTENT_CHUNK_SIZE) {
              const chunk = homepageSections.slice(i, i + CONTENT_CHUNK_SIZE)
              const chunkInput = contentInput.replace(
                `Generate compelling content for these homepage sections ONLY (max ${homepageSections.length} sections):`,
                `Generate compelling content for these sections (batch ${Math.floor(i / CONTENT_CHUNK_SIZE) + 1}):`
              ).replace(
                `Sections: ${JSON.stringify(homepageSections.map(s => ({ type: (s as Record<string,unknown>).type, variantId: (s as Record<string,unknown>).variantId, title: (s as Record<string,unknown>).title })))}`,
                `Sections: ${JSON.stringify(chunk.map(s => ({ type: (s as Record<string,unknown>).type, variantId: (s as Record<string,unknown>).variantId, title: (s as Record<string,unknown>).title })))}`
              )
              const { result: chunkResult } = await callPipelineAgent(contentPrompt, chunkInput)
              const chunkSections = (chunkResult.sections || []) as Record<string, unknown>[]
              allContentSections.push(...chunkSections)
            }
            contentOutput = { sections: allContentSections }
            await tracker.completeStep(contentStepId)
          } else {
            const { result, promptSize, responseSize } = await callPipelineAgent(contentPrompt, contentInput)
            contentOutput = result
            await tracker.completeStep(contentStepId, { promptSize, responseSize })
          }

          // Save section_content artifact
          await tracker.saveArtifact({
            jobId: jobId!,
            stepId: contentStepId,
            artifactType: 'section_content',
            data: contentOutput,
          })
          send({ phase: 'content', status: 'complete', data: contentOutput })
        } catch (contentErr) {
          console.warn('[pipeline] Content agent failed, using designer content:', contentErr)
          await tracker.failStep(contentStepId, contentErr instanceof Error ? contentErr.message : 'Content failed')
          await tracker.markStepRetry(contentStepId, true)
          contentOutput = { sections: homepageSections }
          send({ phase: 'content', status: 'complete', data: contentOutput, fallback: true })
        }

        // ── PHASE 3.5: IMAGE GENERATION ──
        let generatedImages: Record<string, string> = {}

        // Inject uploaded logo into generatedImages so it flows to navbar/footer
        if (uploadedLogo && typeof uploadedLogo === 'string' && uploadedLogo.startsWith('data:image')) {
          generatedImages.logo = uploadedLogo
          console.log(`[pipeline] Uploaded logo injected (${uploadedLogo.length} chars)`)
        }
        const imageStepId = await tracker.startStep(jobId!, 'images', '@media'); lastStepName = 'images'
        try {
          // Skip AI image generation for scan-based sites (they have real product images)
          // This avoids 1MB+ base64 bloat and keeps the page light
          const skipAiImages = !!(scanCatalog || scanJobId)
          if (skipAiImages) {
            console.log('[pipeline] Skipping AI image generation — scan-based site has real images')
            send({ phase: 'images', status: 'skipped', reason: 'scan-based site uses real product images' })
          } else {
            send({ phase: 'images', status: 'generating' })
          }
          const imageSections = designSections
            .filter(s => ['hero', 'about', 'gallery', 'portfolio', 'team', 'blog', 'features'].includes(s.type as string))
            .map(s => ({ type: s.type as string, title: (s.headline || s.title || '') as string, imagePrompt: (s.imagePrompt || '') as string }))

          if (imageSections.length > 0 && !skipAiImages) {
            const origin = req.nextUrl.origin
            const imageRes = await fetch(`${origin}/api/ai/generate-images`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                businessName: siteContext.siteName,
                businessType: siteContext.businessType,
                locale,
                colorPalette: finalDesign.colorPalette || {},
                sections: imageSections,
              }),
              signal: AbortSignal.timeout(55000),
            })

            if (imageRes.ok) {
              const imageData = await imageRes.json()
              if (imageData.ok && imageData.images) {
                generatedImages = imageData.images as Record<string, string>
                send({ phase: 'images', status: 'complete', count: Object.keys(generatedImages).length })
              } else {
                send({ phase: 'images', status: 'skipped', reason: imageData.error || 'no images returned' })
              }
            } else {
              send({ phase: 'images', status: 'skipped', reason: `HTTP ${imageRes.status}` })
            }
          } else {
            send({ phase: 'images', status: 'skipped', reason: 'no image-eligible sections' })
          }
          // V1.2-3: Inject scan product images as supplements to generated images
          if (scanCatalog) {
            const scanProducts = (scanCatalog.products as Record<string, unknown>[]) || []
            for (const product of scanProducts) {
              const imgUrl = (product.image as Record<string, unknown>)?.value as string | null
              const name = (product.name as Record<string, unknown>)?.value as string | null
              if (imgUrl && name) {
                // Add scan images keyed by product name for section-composer to use
                const key = `scan_product_${name.toLowerCase().replace(/\s+/g, '_').slice(0, 30)}`
                if (!generatedImages[key]) {
                  generatedImages[key] = imgUrl
                }
              }
            }
          }

          await tracker.completeStep(imageStepId)

          // Save asset_manifest artifact
          const assetSlots = designSections
            .filter(s => ['hero', 'about', 'gallery', 'portfolio', 'team', 'blog', 'features'].includes(s.type as string))
            .map(s => ({
              sectionType: s.type as string,
              role: s.type === 'hero' ? 'hero-image' : 'background-image',
              aspectRatio: '16:9',
              styleIntent: (s.headline || s.title || '') as string,
              required: s.type === 'hero',
              fallback: 'unsplash',
              status: generatedImages[s.type as string] ? 'generated' : 'pending',
              url: generatedImages[s.type as string] || null,
              altText: `${siteName} - ${s.type}`,
            }))
          await tracker.saveArtifact({
            jobId: jobId!,
            stepId: imageStepId,
            artifactType: 'asset_manifest',
            data: { slots: assetSlots, generatedCount: Object.keys(generatedImages).length, skippedReasons: {} },
          })
        } catch (imgErr) {
          console.warn('[pipeline] Image generation error (non-fatal):', imgErr)
          await tracker.completeStep(imageStepId) // images are non-fatal
          send({ phase: 'images', status: 'skipped', reason: imgErr instanceof Error ? imgErr.message : 'error' })
        }

        // ── PHASE 4: BUILD ──
        send({ phase: 'build', agent: '@frontend', status: 'running' })
        const buildStepId = await tracker.startStep(jobId!, 'build', '@frontend'); lastStepName = 'build'

        const businessNameResolved = (strategyOutput.businessName as string)
          || (strategyOutput.business_name as string)
          || (finalDesign.siteName as string)
          || siteName
        const businessTypeResolved = (strategyOutput.industry as string) || businessType

        const contentSections = (contentOutput.sections || []) as Array<Record<string, unknown>>
        const validatedDesignSections = designSections.length > 0
          ? designSections
          : ((finalDesign.pages as Array<{ sections?: Array<Record<string, unknown>> }>)?.[0]?.sections || [])

        const mergedSections = mergeSections(
          validatedDesignSections as Array<Record<string, unknown>>,
          contentSections,
          { businessName: businessNameResolved, businessType: businessTypeResolved, locale, generatedImages },
        )

        // ── MIGRATION FIDELITY: Deterministic content bridge ──
        // Replaces scattered scan injection logic with single clean bridge
        if (scanCatalog || scanContentModel) {
          const { bridgeScanContentToSections } = await import('@/lib/scan-content-bridge')
          bridgeScanContentToSections(
            mergedSections,
            scanCatalog,
            scanContentModel,
            generatedImages,
            locale,
            businessNameResolved,
          )
          console.log(`[pipeline] Content bridge applied: ${mergedSections.length} sections`)
        }

        // Legacy placeholder — replaced by bridge above
        if (false && scanCatalog) {
          const sectionTypes = new Set(mergedSections.map(s => s.type as string))
          const footerIdx = mergedSections.findIndex(s => s.type === 'footer')
          const insertIdx = footerIdx >= 0 ? footerIdx : mergedSections.length
          const products = (scanCatalog?.products as Record<string, unknown>[]) || []
          const enrichedProducts = products.filter(p =>
            (p.price as Record<string, unknown>)?.value &&
            (p.price as Record<string, unknown>).confidence as number > 0,
          )
          if (!sectionTypes.has('pricing') && enrichedProducts.length >= 2) {
            const pricingItems = enrichedProducts.slice(0, 4).map((p, i) => ({
              name: (p.name as Record<string, unknown>)?.value as string,
              price: `${(p.price as Record<string, unknown>)?.value}`,
              currency: '₪',
              originalPrice: (p.originalPrice as Record<string, unknown>)?.value ? `${(p.originalPrice as Record<string, unknown>)?.value}` : undefined,
              description: (p.description as Record<string, unknown>)?.value as string || '',
              features: [],
              cta: 'לרכישה',
              popular: i === 1,
            }))
            mergedSections.splice(insertIdx, 0, {
              type: 'pricing',
              variantId: 'pricing-animated-cards',
              headline: locale === 'he' ? 'בחרו את המוצר המתאים לכם' : 'Choose Your Product',
              subheadline: locale === 'he' ? 'מגוון דגמים במחירים משתלמים' : 'Multiple models at great prices',
              items: pricingItems,
              businessName: businessNameResolved,
              locale,
            })
          }

          // Inject FAQ section with real questions if missing
          const faqs = (scanContentModel?.faqs as Record<string, unknown>[]) || []
          if (!sectionTypes.has('faq') && faqs.length >= 3) {
            const faqItems = faqs.slice(0, 8).map(f => ({
              question: (f as Record<string, unknown>).value as string,
              answer: '',  // AI will fill these or section-composer generates defaults
              title: (f as Record<string, unknown>).value as string,
              description: '',
            }))
            const newFooterIdx = mergedSections.findIndex(s => s.type === 'footer')
            const faqInsertIdx = newFooterIdx >= 0 ? newFooterIdx : mergedSections.length
            mergedSections.splice(faqInsertIdx, 0, {
              type: 'faq',
              variantId: 'faq-accordion',
              headline: locale === 'he' ? 'שאלות נפוצות' : 'Frequently Asked Questions',
              subheadline: '',
              items: faqItems,
              businessName: businessNameResolved,
              locale,
            })
          }

          // Inject gallery section with real product images if missing
          const productsWithImages = products.filter(p =>
            (p.image as Record<string, unknown>)?.value,
          )
          if (!sectionTypes.has('gallery') && productsWithImages.length >= 3) {
            const galleryItems = productsWithImages.slice(0, 6).map(p => ({
              title: (p.name as Record<string, unknown>)?.value as string || '',
              description: (p.category as Record<string, unknown>)?.value as string || '',
              image: (p.image as Record<string, unknown>)?.value as string || '',
            }))
            const ctaIdx = mergedSections.findIndex(s => s.type === 'cta')
            const galInsertIdx = ctaIdx >= 0 ? ctaIdx : (mergedSections.findIndex(s => s.type === 'footer') >= 0 ? mergedSections.findIndex(s => s.type === 'footer') : mergedSections.length)
            mergedSections.splice(galInsertIdx, 0, {
              type: 'gallery',
              variantId: 'gallery-masonry',
              headline: locale === 'he' ? 'המוצרים שלנו' : 'Our Products',
              subheadline: '',
              items: galleryItems,
              businessName: businessNameResolved,
              locale,
            })
          }
        }

        const palette = (finalDesign.colorPalette || {}) as Record<string, string>
        const typo = (finalDesign.typography || {}) as Record<string, string>

        // Post-merge product name forcing moved to bridgeScanContentToSections()

        send({ phase: 'build', status: 'composing', plan: { sections: mergedSections.length } })

        let composedHtml = ''
        try {
          composedHtml = composePage({
            id: siteId!,
            siteName: businessNameResolved,
            locale: locale as 'en' | 'he',
            palette: resolvePalette(palette),
            fonts: {
              heading: typo?.headingFont || typo?.heading || (locale === 'he' ? 'Heebo' : 'Inter'),
              body: typo?.bodyFont || typo?.body || (locale === 'he' ? 'Assistant' : 'Inter'),
              headingWeight: typo?.headingWeight || '700',
              bodyWeight: typo?.bodyWeight || '400',
            },
            sections: sectionsToPageSections(mergedSections),
          })

          // Save render_result artifact
          await tracker.saveArtifact({
            jobId: jobId!,
            stepId: buildStepId,
            artifactType: 'render_result',
            data: {
              html: composedHtml,
              sectionCount: mergedSections.length,
              hasNavbar: mergedSections.some(s => s.type === 'navbar'),
              hasFooter: mergedSections.some(s => s.type === 'footer'),
              hasContactSection: mergedSections.some(s => s.type === 'contact'),
              locale,
              byteSize: new TextEncoder().encode(composedHtml).length,
            },
          })

          // Populate designDna on sites table after build step
          if (siteId && palette) {
            try {
              const dbForDna = createDb()
              await dbForDna.update(sites).set({
                designDna: {
                  primaryColor: palette.primary,
                  secondaryColor: palette.secondary || palette.accent,
                  backgroundColor: palette.background,
                  textColor: palette.text,
                  headingFont: typo?.headingFont || 'Inter',
                  bodyFont: typo?.bodyFont || 'Inter',
                  sectionCount: mergedSections.length,
                  artDirection: artDirection.id,
                  artDirectionName: artDirection.name,
                  scanMode: scanMode || null,
                  sourceUrl: scanSourceUrl || null,
                },
                updatedAt: new Date(),
              }).where(eq(sites.id, siteId))
            } catch (dnaErr) {
              console.error('[pipeline] designDna population error (non-blocking):', dnaErr)
            }
          }

          // V1.3.1: Build catalog-aware chatbot context
          const chatbotProducts = ((scanCatalog?.products as Record<string, unknown>[]) || [])
            .filter(p => (p.name as Record<string, unknown>)?.value)
            .slice(0, 10)
            .map(p => {
              const name = (p.name as Record<string, unknown>)?.value as string
              const price = (p.price as Record<string, unknown>)?.value
              const originalPrice = (p.originalPrice as Record<string, unknown>)?.value
              const desc = (p.description as Record<string, unknown>)?.value as string || ''
              const category = (p.category as Record<string, unknown>)?.value as string || ''
              return { name, price: price ? `${price} ₪` : null, originalPrice: originalPrice ? `${originalPrice} ₪` : null, description: desc.slice(0, 150), category }
            })

          const chatbotFaqs = ((scanContentModel?.faqs as Record<string, unknown>[]) || [])
            .map(f => (f as Record<string, unknown>).value as string)
            .filter(Boolean)
            .slice(0, 15)

          // Save chatbot_context artifact
          await tracker.saveArtifact({
            jobId: jobId!,
            stepId: buildStepId,
            artifactType: 'chatbot_context',
            data: {
              businessName: businessNameResolved,
              industry: businessTypeResolved,
              locale,
              description: description || '',
              services: (strategyOutput.uniqueSellingPoints as string[]) || [],
              uniqueSellingPoints: (strategyOutput.uniqueSellingPoints as string[]) || [],
              contactInfo: { phone: null, email: null, address: null },
              faqs: chatbotFaqs,
              products: chatbotProducts,
              leadCaptureGoals: (strategyOutput.conversionGoals as string[]) || ['contact'],
            },
          })

          await tracker.completeStep(buildStepId)
          send({ phase: 'build', status: 'complete', html: composedHtml })
        } catch (composeErr) {
          await tracker.failStep(buildStepId, composeErr instanceof Error ? composeErr.message : 'Composition failed')
          send({ phase: 'build', status: 'compose-failed', error: composeErr instanceof Error ? composeErr.message : 'Composition failed' })
        }

        // ── PHASE 5: QA ──
        send({ phase: 'qa', agent: '@qa', status: 'checking' })
        const qaStepId = await tracker.startStep(jobId!, 'qa', '@qa'); lastStepName = 'qa'

        const qaIssues: string[] = []
        if (!mergedSections || mergedSections.length < 5) qaIssues.push('Too few sections (< 5)')
        const withoutVariant = mergedSections.filter(s => !s.variantId)
        if (withoutVariant.length > 0) qaIssues.push(`${withoutVariant.length} sections missing variantId`)
        const withoutContent = mergedSections.filter(s => !s.headline && (!s.items || (s.items as unknown[]).length === 0))
        if (withoutContent.length > 2) qaIssues.push(`${withoutContent.length} sections have no content`)

        await tracker.completeStep(qaStepId)
        send({ phase: 'qa', status: qaIssues.length > 0 ? 'issues-found' : 'passed', issues: qaIssues })

        // ── PHASE 6: CPO REVIEW ──
        send({ phase: 'cpo', agent: '@cpo', status: 'scoring' })
        const cpoStepId = await tracker.startStep(jobId!, 'cpo', '@cpo'); lastStepName = 'cpo'

        let overall = 7
        try {
          const cpoPrompt = getAgentSystemPrompt('cpo', siteContext)
          const cpoInput = `Score this website build plan:
Business: ${description}
Strategy: ${JSON.stringify(strategyOutput)}
Design: ${JSON.stringify(finalDesign)}
Content: ${JSON.stringify(contentOutput)}

Score each dimension 1-10:
1. Visual Hierarchy (section variety, spacing, contrast)
2. Typography Emotion (fonts match brand mood)
3. Color Harmony (palette consistency)
4. Uniqueness (not template-looking)
5. Content Relevance (specific to this business)
6. Conversion Optimization (CTAs, trust signals)

Return JSON: {
  "approved": true/false (true if overall >= 8),
  "scores": { "visualHierarchy": N, "typography": N, "colorHarmony": N, "uniqueness": N, "contentRelevance": N, "conversionOptimization": N },
  "overall": N.N,
  "feedback": "specific improvements if any"
}`

          const { result: cpoOutput, promptSize, responseSize } = await callPipelineAgent(cpoPrompt, cpoInput)
          overall = (cpoOutput.overall as number) || 7
          await tracker.completeStep(cpoStepId, { promptSize, responseSize })
          send({ phase: 'cpo', status: overall >= 8 ? 'approved' : 'needs-improvement', scores: cpoOutput.scores, overall })
        } catch (cpoErr) {
          await tracker.completeStep(cpoStepId) // CPO is non-fatal
          send({ phase: 'cpo', status: 'skipped', overall: 7 })
        }

        // ── SAVE SITE HTML TO DB ──
        if (composedHtml && siteId) {
          const db = createDb()
          const buildPlan = {
            siteName: businessNameResolved,
            industry: businessTypeResolved,
            colorPalette: palette,
            typography: typo,
            sections: mergedSections.map(s => ({ type: s.type, variantId: s.variantId })),
          }
          await db.update(sites).set({
            html: composedHtml,
            buildPlan,
            primaryColor: palette.primary || '#7C3AED',
            updatedAt: new Date(),
          }).where(eq(sites.id, siteId))
        }

        // ── COMPLETE ──
        await tracker.completeJob(jobId!)
        send({
          phase: 'complete',
          jobId,
          siteId,
          html: composedHtml || '',
          buildPlan: {
            siteName: businessNameResolved,
            industry: businessTypeResolved,
            colorPalette: palette,
            typography: typo,
            sections: mergedSections.map(s => ({ type: s.type, variantId: s.variantId })),
          },
          strategy: strategyOutput,
          design: finalDesign,
          content: contentOutput,
          cpoScore: overall,
          qaIssues,
        })

      } catch (error) {
        console.error('[pipeline] Fatal error:', error)
        const errorMsg = error instanceof Error ? error.message : 'Pipeline failed'

        // Server-side fallback: compose a site from industry section map
        try {
          send({ phase: 'fallback', status: 'running', reason: errorMsg })
          await tracker.markJobFallback(jobId!)

          const fallback = buildFallbackSite({ siteName, businessType, description: description || '', locale })

          if (siteId && fallback.html) {
            const db = createDb()
            await db.update(sites).set({
              html: fallback.html,
              updatedAt: new Date(),
            }).where(eq(sites.id, siteId))

            await tracker.saveArtifact({
              jobId: jobId!,
              artifactType: 'render_result',
              data: {
                html: fallback.html,
                sectionCount: fallback.sectionCount,
                hasNavbar: true,
                hasFooter: true,
                hasContactSection: true,
                locale,
                byteSize: new TextEncoder().encode(fallback.html).length,
              },
            })

            await tracker.completeJob(jobId!)
            send({ phase: 'complete', jobId, siteId, html: fallback.html, fallback: true })
          } else {
            throw new Error('Fallback composition also failed')
          }
        } catch (fallbackErr) {
          console.error('[pipeline] Fallback also failed:', fallbackErr)

          // Mark job as failed + site as generation_failed
          if (jobId) await tracker.failJob(jobId, errorMsg, lastStepName)
          if (siteId) {
            try {
              const db = createDb()
              await db.update(sites).set({ status: 'generation_failed', updatedAt: new Date() }).where(eq(sites.id, siteId))
            } catch { /* best effort */ }
          }

          send({ phase: 'error', error: errorMsg, jobId, siteId })
        }
      } finally {
        if (!streamClosed) {
          try { controller.close() } catch { /* client already disconnected */ }
        }
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
