/**
 * Schema.org Extractor — Parses JSON-LD structured data blocks
 *
 * Extracts all `<script type="application/ld+json">` blocks,
 * validates JSON structure, and identifies schema types with key properties.
 */

import type { SchemaOrgData } from '../types/scanner'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Safely parse a JSON string, returning null on failure. */
const safeParse = (text: string): unknown | null => {
  try {
    return JSON.parse(text)
  } catch {
    // Try to fix common issues: trailing commas, single quotes
    try {
      const fixed = text
        .replace(/,\s*([}\]])/g, '$1') // trailing commas
        .replace(/'/g, '"') // single quotes
      return JSON.parse(fixed)
    } catch {
      return null
    }
  }
}

/** Extract the @type from a schema object. */
const getSchemaType = (obj: Record<string, unknown>): string => {
  const type = obj['@type']
  if (typeof type === 'string') return type
  if (Array.isArray(type) && type.length > 0) return String(type[0])
  return 'Unknown'
}

/** Flatten nested @graph arrays into individual items. */
const flattenGraph = (data: unknown): Record<string, unknown>[] => {
  if (!data || typeof data !== 'object') return []

  const obj = data as Record<string, unknown>

  // Handle @graph array
  if (Array.isArray(obj['@graph'])) {
    return obj['@graph']
      .filter((item): item is Record<string, unknown> =>
        item !== null && typeof item === 'object' && !Array.isArray(item),
      )
  }

  // Handle top-level array
  if (Array.isArray(data)) {
    return data.filter(
      (item): item is Record<string, unknown> =>
        item !== null && typeof item === 'object' && !Array.isArray(item),
    )
  }

  // Single object
  if (obj['@type']) {
    return [obj]
  }

  return []
}

/** Extract key properties from a schema item (truncated for size). */
const extractKeyProps = (item: Record<string, unknown>): Record<string, unknown> => {
  const props: Record<string, unknown> = {}
  const maxKeys = 15

  let count = 0
  for (const [key, value] of Object.entries(item)) {
    if (count >= maxKeys) break
    if (key.startsWith('@')) {
      props[key] = value
      count++
      continue
    }

    // Truncate long string values
    if (typeof value === 'string') {
      props[key] = value.slice(0, 200)
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      props[key] = value
    } else if (Array.isArray(value)) {
      props[key] = `[${value.length} items]`
    } else if (value && typeof value === 'object') {
      const nested = value as Record<string, unknown>
      if (nested['@type']) {
        props[key] = { '@type': nested['@type'] }
      } else {
        props[key] = '{...}'
      }
    }
    count++
  }

  return props
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

/**
 * Extract and parse all JSON-LD structured data from HTML.
 *
 * @param html - Raw HTML string
 * @returns Parsed schema.org data with types, items, and validation status
 */
export const extractSchemaOrg = (html: string): SchemaOrgData => {
  const types: string[] = []
  const items: { type: string; properties: Record<string, unknown> }[] = []
  let isValid = true

  // Find all JSON-LD script blocks
  const regex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match: RegExpExecArray | null

  while ((match = regex.exec(html)) !== null) {
    const rawJson = match[1].trim()
    if (!rawJson) continue

    const parsed = safeParse(rawJson)
    if (!parsed) {
      isValid = false
      continue
    }

    const schemaItems = flattenGraph(parsed)

    for (const item of schemaItems) {
      const type = getSchemaType(item)
      if (type && type !== 'Unknown') {
        if (!types.includes(type)) types.push(type)
        items.push({
          type,
          properties: extractKeyProps(item),
        })
      }
    }
  }

  return { types, items, isValid }
}
