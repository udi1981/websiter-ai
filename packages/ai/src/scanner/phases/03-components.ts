/**
 * Phase 3 — Component Library Detection
 *
 * Identifies reusable UI patterns across all crawled pages.
 * Detects section types, classifies them, and extracts component patterns
 * (buttons, cards, forms, etc.) with variant grouping.
 */

import type { ComponentLibrary, SectionType } from '../types/scanner'
import { detectSections } from '../extractors/section-detector'
import { detectComponents } from '../extractors/component-detector'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PageInput = {
  url: string
  html: string
}

type VisualDna = {
  colors?: unknown[]
  fonts?: unknown[]
  [key: string]: unknown
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

/**
 * Extract the complete component library from all crawled pages.
 *
 * Runs section detection and component pattern extraction on each page,
 * then aggregates and deduplicates results across the entire site.
 *
 * @param pages - Array of crawled pages with URL and HTML
 * @param _visualDna - Visual DNA from Phase 2 (reserved for future use)
 * @returns Aggregated component library with sections and component patterns
 */
export const extractComponentLibrary = async (
  pages: PageInput[],
  _visualDna: VisualDna,
): Promise<ComponentLibrary> => {
  const allSections: ComponentLibrary['sections'] = []
  const allComponents: ComponentLibrary['components'] = []
  const sectionTypeDistribution: Record<SectionType, number> = {} as Record<SectionType, number>

  for (const page of pages) {
    // Strip script/style for cleaner analysis
    const cleanHtml = page.html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')

    // Detect sections and attach page URL for per-page filtering
    const sections = detectSections(cleanHtml, page.url)
    for (const section of sections) {
      ;(section as Record<string, unknown>).pageUrl = page.url
      allSections.push(section)

      // Track distribution
      const current = sectionTypeDistribution[section.type] || 0
      sectionTypeDistribution[section.type] = current + 1
    }

    // Detect components
    const components = detectComponents(cleanHtml)
    for (const component of components) {
      // Merge with existing variant or add new
      const existing = allComponents.find(
        c => c.type === component.type && c.variant === component.variant,
      )
      if (existing) {
        existing.count += component.count
      } else {
        allComponents.push({ ...component })
      }
    }
  }

  // Deduplicate sections by type+variant (keep first occurrence, increment if repeated)
  const deduped = deduplicateSections(allSections)

  return {
    sections: deduped,
    components: allComponents.sort((a, b) => b.count - a.count),
    sectionTypeDistribution,
    totalSections: allSections.length,
    totalComponents: allComponents.reduce((sum, c) => sum + c.count, 0),
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Deduplicate sections, keeping unique type+variant combinations. */
const deduplicateSections = (
  sections: ComponentLibrary['sections'],
): ComponentLibrary['sections'] => {
  const seen = new Map<string, ComponentLibrary['sections'][0]>()

  for (const section of sections) {
    const key = `${section.type}:${section.variant}`
    if (!seen.has(key)) {
      seen.set(key, section)
    }
    // Keep the one with more content info
    else {
      const existing = seen.get(key)!
      if (section.htmlSnapshot.length > existing.htmlSnapshot.length) {
        seen.set(key, section)
      }
    }
  }

  return [...seen.values()].sort((a, b) => a.order - b.order)
}
