/**
 * Phase 5 — Brand Intelligence
 *
 * Orchestrates the AI-powered brand analysis. Collects text, navigation,
 * hero content, and CTA data from prior phases, sends it to Claude for
 * deep brand strategy analysis, and returns structured BrandIntelligence.
 */

import { buildBrandAnalysisPrompt } from '../prompts/brand-analysis'
import type { BrandAnalysisContext } from '../prompts/brand-analysis'
import { callAI, extractJson } from '../utils/ai-client'
import type { ContentArchitecture, ComponentLibrary } from '../types/scanner'

// ---------------------------------------------------------------------------
// Output type
// ---------------------------------------------------------------------------

export type BrandIntelligence = {
  brandName: string
  tagline: string | null
  personality: {
    traits: string[]
    mood: string
    archetype: string
    archetypeRationale: string
    designLanguage: string
  }
  targetAudience: {
    demographics: string
    psychographics: string
    painPoints: string[]
    desires: string[]
    sophisticationLevel: number
  }
  industry: {
    primary: string
    subCategory: string
    niche: string
    inferredCompetitors: string[]
  }
  valueProposition: {
    headline: string
    subheadline: string
    benefits: string[]
    differentiators: string[]
    proofPoints: string[]
  }
  positioning: {
    marketPosition: string
    competitiveAngle: string
    pricingSignal: string
  }
  contentTone: {
    formality: number
    voice: string
    perspective: string
    sentenceStyle: string
    jargonLevel: number
    samplePhrases: string[]
  }
  designPsychology: {
    colorEmotions: string
    typographyMessage: string
    layoutPriority: string
    overallImpression: string
  }
}

// ---------------------------------------------------------------------------
// HTML text extraction helpers
// ---------------------------------------------------------------------------

/** Strip all HTML tags and collapse whitespace. */
const stripHtml = (html: string): string =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** Pick the most content-rich pages for analysis (about, services, home). */
const selectKeyPages = (
  pages: { url: string; html: string; path: string }[],
  maxPages: number
): { path: string; title: string; text: string }[] => {
  const priority = ['/', '/about', '/services', '/pricing', '/contact']
  const sorted = [...pages].sort((a, b) => {
    const aIdx = priority.indexOf(a.path.replace(/\/$/, '') || '/')
    const bIdx = priority.indexOf(b.path.replace(/\/$/, '') || '/')
    const aScore = aIdx >= 0 ? aIdx : 100
    const bScore = bIdx >= 0 ? bIdx : 100
    return aScore - bScore
  })

  return sorted.slice(0, maxPages).map((p) => {
    const titleMatch = p.html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
    return {
      path: p.path,
      title: titleMatch ? titleMatch[1].trim() : p.path,
      text: stripHtml(p.html).slice(0, 3000),
    }
  })
}

/** Extract hero heading, subheading, and CTA from the homepage. */
const extractHero = (
  html: string
): BrandAnalysisContext['heroContent'] => {
  const heroMatch = html.match(
    /<(?:section|div|header)[^>]*(?:class|id)=["'][^"']*hero[^"']*["'][^>]*>([\s\S]*?)(?=<(?:section|div|footer|main)[^>]*(?:class|id))/i
  )
  if (!heroMatch) return null

  const block = heroMatch[1]
  const headings = block.match(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi) || []
  const heading = headings[0]
    ? headings[0].replace(/<[^>]+>/g, '').trim()
    : ''
  const subheading = headings[1]
    ? headings[1].replace(/<[^>]+>/g, '').trim()
    : ''

  const ctaMatch = block.match(
    /<a[^>]*class=["'][^"']*(?:btn|button|cta)[^"']*["'][^>]*>([\s\S]*?)<\/a>/i
  )
  const ctaText = ctaMatch
    ? ctaMatch[1].replace(/<[^>]+>/g, '').trim()
    : ''

  return heading ? { heading, subheading, ctaText } : null
}

/** Collect all CTA button texts across pages. */
const collectCtas = (pages: { html: string }[]): string[] => {
  const ctas = new Set<string>()
  const regex =
    /<(?:a|button)[^>]*class=["'][^"']*(?:btn|button|cta)[^"']*["'][^>]*>([\s\S]*?)<\/(?:a|button)>/gi
  for (const page of pages) {
    let match
    while ((match = regex.exec(page.html)) !== null) {
      const text = match[1].replace(/<[^>]+>/g, '').trim()
      if (text && text.length < 60) ctas.add(text)
    }
  }
  return [...ctas].slice(0, 20)
}

/** Extract primary nav links. */
const extractNav = (
  html: string
): BrandAnalysisContext['navigationStructure']['primary'] => {
  const navMatch = html.match(/<nav[^>]*>([\s\S]*?)<\/nav>/i)
  if (!navMatch) return []
  const links: { text: string; href: string }[] = []
  const aRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  let m
  while ((m = aRegex.exec(navMatch[1])) !== null) {
    const text = m[2].replace(/<[^>]+>/g, '').trim()
    if (text && text.length < 50) links.push({ text, href: m[1] })
  }
  return links
}

/** Extract footer link groups. */
const extractFooterGroups = (
  html: string
): BrandAnalysisContext['navigationStructure']['footer'] => {
  const footerMatch = html.match(/<footer[^>]*>([\s\S]*?)<\/footer>/i)
  if (!footerMatch) return []

  const groups: { title: string; links: { text: string }[] }[] = []
  const headings = footerMatch[1].match(
    /<(?:h[2-6]|strong|b)[^>]*>([\s\S]*?)<\/(?:h[2-6]|strong|b)>/gi
  ) || []

  for (const h of headings.slice(0, 6)) {
    const title = h.replace(/<[^>]+>/g, '').trim()
    if (!title) continue
    // Grab next sibling list
    const afterHeading = footerMatch[1].split(h)[1]?.slice(0, 1000) || ''
    const linkTexts: { text: string }[] = []
    const aRegex = /<a[^>]*>([\s\S]*?)<\/a>/gi
    let m
    while ((m = aRegex.exec(afterHeading)) !== null) {
      const t = m[1].replace(/<[^>]+>/g, '').trim()
      if (t && t.length < 50) linkTexts.push({ text: t })
      if (linkTexts.length >= 8) break
    }
    if (linkTexts.length > 0) groups.push({ title, links: linkTexts })
  }
  return groups
}

// ---------------------------------------------------------------------------
// Main phase function
// ---------------------------------------------------------------------------

/**
 * Extract brand intelligence using AI analysis of page content,
 * navigation, hero, CTAs, colors, and typography.
 *
 * Falls back to basic programmatic extraction if all AI providers fail.
 */
export const extractBrandIntelligence = async (
  pages: { url: string; html: string; path: string }[],
  _siteMap: unknown,
  visualDna: {
    colors?: { hex: string; usage: string }[]
    fonts?: { family: string; usage: string }[]
  },
  _contentArch: ContentArchitecture | null
): Promise<BrandIntelligence> => {
  const homepage = pages.find((p) => p.path === '/' || p.path === '') || pages[0]
  if (!homepage) return fallbackBrand('Unknown', '')

  const homepageText = stripHtml(homepage.html).slice(0, 6000)
  const allPageTexts = selectKeyPages(pages, 5)
  const heroContent = extractHero(homepage.html)
  const ctaTexts = collectCtas(pages)
  const navPrimary = extractNav(homepage.html)
  const footerGroups = extractFooterGroups(homepage.html)

  const colors = (visualDna.colors || []).slice(0, 12)
  const fonts = visualDna.fonts || []
  const headingFont = fonts.find((f) => f.usage === 'heading')?.family || ''
  const bodyFont = fonts.find((f) => f.usage === 'body')?.family || headingFont

  const sectionTypes: string[] = []
  if (_contentArch?.pages) {
    for (const page of _contentArch.pages) {
      for (const sec of page.sectionOrder) {
        if (!sectionTypes.includes(sec)) sectionTypes.push(sec)
      }
    }
  }

  const domain = (() => {
    try { return new URL(homepage.url).hostname } catch { return '' }
  })()

  const context: BrandAnalysisContext = {
    homepageText,
    allPageTexts,
    navigationStructure: { primary: navPrimary, footer: footerGroups },
    sectionTypes,
    colorPalette: colors,
    typography: { headingFont, bodyFont },
    ctaTexts,
    heroContent,
    domain,
    pageCount: pages.length,
  }

  const { system, user } = buildBrandAnalysisPrompt(context)

  try {
    const raw = await callAI(system, user, { maxTokens: 4096 })
    const json = extractJson(raw)
    const parsed = JSON.parse(json) as BrandIntelligence
    return validateBrand(parsed, domain)
  } catch (err) {
    console.error('[Phase 5] AI brand analysis failed:', err)
    return fallbackBrand(
      extractSiteName(homepage.html, domain),
      homepageText
    )
  }
}

// ---------------------------------------------------------------------------
// Validation & fallback
// ---------------------------------------------------------------------------

/** Ensure all required fields exist; fill gaps with defaults. */
const validateBrand = (
  raw: Partial<BrandIntelligence>,
  domain: string
): BrandIntelligence => ({
  brandName: raw.brandName || domain,
  tagline: raw.tagline ?? null,
  personality: {
    traits: raw.personality?.traits?.slice(0, 5) || ['professional'],
    mood: raw.personality?.mood || 'neutral',
    archetype: raw.personality?.archetype || 'Sage',
    archetypeRationale: raw.personality?.archetypeRationale || '',
    designLanguage: raw.personality?.designLanguage || 'corporate-clean',
  },
  targetAudience: {
    demographics: raw.targetAudience?.demographics || 'general audience',
    psychographics: raw.targetAudience?.psychographics || '',
    painPoints: raw.targetAudience?.painPoints || [],
    desires: raw.targetAudience?.desires || [],
    sophisticationLevel: raw.targetAudience?.sophisticationLevel ?? 5,
  },
  industry: {
    primary: raw.industry?.primary || 'Business',
    subCategory: raw.industry?.subCategory || '',
    niche: raw.industry?.niche || '',
    inferredCompetitors: raw.industry?.inferredCompetitors || [],
  },
  valueProposition: {
    headline: raw.valueProposition?.headline || '',
    subheadline: raw.valueProposition?.subheadline || '',
    benefits: raw.valueProposition?.benefits || [],
    differentiators: raw.valueProposition?.differentiators || [],
    proofPoints: raw.valueProposition?.proofPoints || [],
  },
  positioning: {
    marketPosition: raw.positioning?.marketPosition || 'mid-market',
    competitiveAngle: raw.positioning?.competitiveAngle || '',
    pricingSignal: raw.positioning?.pricingSignal || 'unclear',
  },
  contentTone: {
    formality: raw.contentTone?.formality ?? 5,
    voice: raw.contentTone?.voice || 'professional',
    perspective: raw.contentTone?.perspective || 'mixed',
    sentenceStyle: raw.contentTone?.sentenceStyle || 'standard',
    jargonLevel: raw.contentTone?.jargonLevel ?? 3,
    samplePhrases: raw.contentTone?.samplePhrases || [],
  },
  designPsychology: {
    colorEmotions: raw.designPsychology?.colorEmotions || '',
    typographyMessage: raw.designPsychology?.typographyMessage || '',
    layoutPriority: raw.designPsychology?.layoutPriority || '',
    overallImpression: raw.designPsychology?.overallImpression || '',
  },
})

/** Extract site name from <title> or domain. */
const extractSiteName = (html: string, domain: string): string => {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  if (m) {
    const parts = m[1].split(/[|\-–—]/)
    return parts[0].trim() || domain
  }
  return domain
}

/** Minimal programmatic fallback when AI is unavailable. */
const fallbackBrand = (
  name: string,
  text: string
): BrandIntelligence => ({
  brandName: name,
  tagline: null,
  personality: {
    traits: ['professional'],
    mood: 'neutral',
    archetype: 'Sage',
    archetypeRationale: 'Default — AI analysis unavailable',
    designLanguage: 'corporate-clean',
  },
  targetAudience: {
    demographics: 'general audience',
    psychographics: '',
    painPoints: [],
    desires: [],
    sophisticationLevel: 5,
  },
  industry: {
    primary: detectBasicIndustry(text),
    subCategory: '',
    niche: '',
    inferredCompetitors: [],
  },
  valueProposition: {
    headline: '',
    subheadline: '',
    benefits: [],
    differentiators: [],
    proofPoints: [],
  },
  positioning: {
    marketPosition: 'mid-market',
    competitiveAngle: '',
    pricingSignal: 'unclear',
  },
  contentTone: {
    formality: 5,
    voice: 'professional',
    perspective: 'mixed',
    sentenceStyle: 'standard',
    jargonLevel: 3,
    samplePhrases: [],
  },
  designPsychology: {
    colorEmotions: '',
    typographyMessage: '',
    layoutPriority: '',
    overallImpression: '',
  },
})

/** Very basic keyword-based industry detection. */
const detectBasicIndustry = (text: string): string => {
  const lower = text.toLowerCase()
  const map: [string, string[]][] = [
    ['Technology', ['software', 'saas', 'platform', 'api', 'cloud']],
    ['Healthcare', ['health', 'medical', 'clinic', 'patient', 'doctor']],
    ['Food & Beverage', ['restaurant', 'menu', 'dining', 'food', 'chef']],
    ['E-commerce', ['shop', 'store', 'cart', 'product', 'buy']],
    ['Real Estate', ['property', 'real estate', 'listing', 'home']],
    ['Education', ['course', 'learn', 'student', 'education']],
    ['Agency', ['agency', 'creative', 'marketing', 'branding']],
    ['Fitness', ['fitness', 'gym', 'workout', 'training']],
    ['Legal', ['law', 'attorney', 'legal', 'lawyer']],
  ]
  for (const [industry, keywords] of map) {
    if (keywords.some((kw) => lower.includes(kw))) return industry
  }
  return 'Business'
}
