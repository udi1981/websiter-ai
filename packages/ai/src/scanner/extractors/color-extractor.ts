/**
 * Color extraction engine — finds, normalises, and classifies all colors
 * from CSS sources (inline styles, style blocks, external sheets, Tailwind classes).
 *
 * @module scanner/extractors/color-extractor
 */

import type { ColorToken, ColorSystem, ContrastPair } from '@ubuilder/types'

// =============================================================================
// Normalisation helpers
// =============================================================================

/** Normalise a hex color to 6-char lowercase form. Returns null if invalid. */
export const normalizeHex = (raw: string): string | null => {
  const h = raw.replace('#', '').toLowerCase()
  if (h.length === 3) return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`
  if (h.length === 6) return `#${h}`
  if (h.length === 8) return `#${h.slice(0, 6)}`
  return null
}

/** Convert rgb(r,g,b) values to #rrggbb. */
export const rgbToHex = (r: number, g: number, b: number): string => {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)))
  return '#' + [r, g, b].map(v => clamp(v).toString(16).padStart(2, '0')).join('')
}

/** Convert hsl(h,s%,l%) values to #rrggbb. */
export const hslToHex = (h: number, s: number, l: number): string => {
  const sn = s / 100
  const ln = l / 100
  const a = sn * Math.min(ln, 1 - ln)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    return ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
  }
  return rgbToHex(Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255))
}

/** Parse hex to [r,g,b] array. */
const hexToRgb = (hex: string): [number, number, number] | null => {
  const norm = normalizeHex(hex)
  if (!norm) return null
  const r = parseInt(norm.slice(1, 3), 16)
  const g = parseInt(norm.slice(3, 5), 16)
  const b = parseInt(norm.slice(5, 7), 16)
  return [r, g, b]
}

// =============================================================================
// Contrast calculation (WCAG 2.1)
// =============================================================================

/** Relative luminance per WCAG 2.1. */
const relativeLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/** Calculate WCAG contrast ratio between two hex colors. */
export const contrastRatio = (hex1: string, hex2: string): number => {
  const rgb1 = hexToRgb(hex1)
  const rgb2 = hexToRgb(hex2)
  if (!rgb1 || !rgb2) return 0
  const l1 = relativeLuminance(...rgb1)
  const l2 = relativeLuminance(...rgb2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

// =============================================================================
// Tailwind color map (subset of common colors)
// =============================================================================

const TAILWIND_COLORS: Record<string, string> = {
  'red-500': '#ef4444', 'red-600': '#dc2626', 'red-700': '#b91c1c',
  'orange-500': '#f97316', 'orange-600': '#ea580c',
  'amber-500': '#f59e0b', 'amber-600': '#d97706',
  'yellow-500': '#eab308',
  'green-500': '#22c55e', 'green-600': '#16a34a',
  'emerald-500': '#10b981', 'emerald-600': '#059669',
  'teal-500': '#14b8a6', 'teal-600': '#0d9488',
  'cyan-500': '#06b6d4', 'cyan-600': '#0891b2',
  'sky-500': '#0ea5e9', 'sky-600': '#0284c7',
  'blue-500': '#3b82f6', 'blue-600': '#2563eb', 'blue-700': '#1d4ed8',
  'indigo-500': '#6366f1', 'indigo-600': '#4f46e5',
  'violet-500': '#8b5cf6', 'violet-600': '#7c3aed',
  'purple-500': '#a855f7', 'purple-600': '#9333ea',
  'fuchsia-500': '#d946ef', 'fuchsia-600': '#c026d3',
  'pink-500': '#ec4899', 'pink-600': '#db2777',
  'rose-500': '#f43f5e', 'rose-600': '#e11d48',
  'gray-50': '#f9fafb', 'gray-100': '#f3f4f6', 'gray-200': '#e5e7eb',
  'gray-300': '#d1d5db', 'gray-400': '#9ca3af', 'gray-500': '#6b7280',
  'gray-600': '#4b5563', 'gray-700': '#374151', 'gray-800': '#1f2937',
  'gray-900': '#111827', 'gray-950': '#030712',
  'slate-50': '#f8fafc', 'slate-100': '#f1f5f9', 'slate-200': '#e2e8f0',
  'slate-300': '#cbd5e1', 'slate-400': '#94a3b8', 'slate-500': '#64748b',
  'slate-600': '#475569', 'slate-700': '#334155', 'slate-800': '#1e293b',
  'slate-900': '#0f172a',
  'zinc-800': '#27272a', 'zinc-900': '#18181b',
  'neutral-800': '#262626', 'neutral-900': '#171717',
  'white': '#ffffff', 'black': '#000000',
}

/** Try to resolve a Tailwind color utility class to hex. */
const tailwindToHex = (cls: string): string | null => {
  const m = cls.match(
    /(?:bg|text|border|ring|accent|outline|fill|stroke|decoration|from|to|via)-([a-z]+-\d{2,3}|white|black)/,
  )
  if (!m) return null
  return TAILWIND_COLORS[m[1]] ?? null
}

/** Classify color usage based on the CSS property or class prefix. */
const classifyUsage = (context: string): ColorToken['usageRole'] => {
  const c = context.toLowerCase()
  if (c.includes('background') || c.startsWith('bg') || c.includes('bg-')) return 'background'
  if (c.includes('border') || c.startsWith('border')) return 'border'
  if (c.includes('shadow') || c.includes('box-shadow')) return 'shadow'
  if (c.includes('gradient') || c.includes('from-') || c.includes('to-')) return 'gradient'
  if (c.includes('color') || c.startsWith('text')) return 'text'
  return 'unknown'
}

// =============================================================================
// Main extraction
// =============================================================================

type RawColorEntry = {
  hex: string
  usage: ColorToken['usageRole']
  cssProperty: string
  page: string
}

/**
 * Extract all colors from combined CSS text and HTML class attributes.
 *
 * @param cssSources - Array of { css, pagePath } for each page
 * @param htmlSources - Array of { html, pagePath } for Tailwind class scanning
 * @returns Complete ColorSystem
 */
export const extractColorSystem = (
  cssSources: Array<{ css: string; pagePath: string }>,
  htmlSources: Array<{ html: string; pagePath: string }>,
): ColorSystem => {
  const entries: RawColorEntry[] = []

  for (const { css, pagePath } of cssSources) {
    // Hex colors
    const hexRegex = /([\w-]+)\s*:\s*(#(?:[0-9a-fA-F]{3}){1,2})\b/g
    let m: RegExpExecArray | null
    while ((m = hexRegex.exec(css)) !== null) {
      const hex = normalizeHex(m[2])
      if (hex) entries.push({ hex, usage: classifyUsage(m[1]), cssProperty: m[1], page: pagePath })
    }

    // rgb() colors
    const rgbRegex = /([\w-]+)\s*:\s*[^;]*rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g
    while ((m = rgbRegex.exec(css)) !== null) {
      const hex = rgbToHex(Number(m[2]), Number(m[3]), Number(m[4]))
      entries.push({ hex, usage: classifyUsage(m[1]), cssProperty: m[1], page: pagePath })
    }

    // hsl() colors
    const hslRegex = /([\w-]+)\s*:\s*[^;]*hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)/g
    while ((m = hslRegex.exec(css)) !== null) {
      const hex = hslToHex(Number(m[2]), Number(m[3]), Number(m[4]))
      entries.push({ hex, usage: classifyUsage(m[1]), cssProperty: m[1], page: pagePath })
    }

    // CSS variable definitions with color values
    const varRegex = /(--[\w-]+)\s*:\s*(#(?:[0-9a-fA-F]{3}){1,2})\b/g
    while ((m = varRegex.exec(css)) !== null) {
      const hex = normalizeHex(m[2])
      if (hex) entries.push({ hex, usage: 'unknown', cssProperty: m[1], page: pagePath })
    }
  }

  // Tailwind classes from HTML
  for (const { html, pagePath } of htmlSources) {
    const classRegex = /class\s*=\s*["']([^"']+)["']/gi
    let cm: RegExpExecArray | null
    while ((cm = classRegex.exec(html)) !== null) {
      const classes = cm[1].split(/\s+/)
      for (const cls of classes) {
        const hex = tailwindToHex(cls)
        if (hex) {
          entries.push({ hex, usage: classifyUsage(cls), cssProperty: cls, page: pagePath })
        }
      }
    }
  }

  // Aggregate into tokens
  const tokenMap = new Map<string, { usage: ColorToken['usageRole']; frequency: number; pages: Set<string>; cssProperty: string }>()

  for (const entry of entries) {
    const existing = tokenMap.get(entry.hex)
    if (existing) {
      existing.frequency++
      existing.pages.add(entry.page)
    } else {
      tokenMap.set(entry.hex, {
        usage: entry.usage,
        frequency: 1,
        pages: new Set([entry.page]),
        cssProperty: entry.cssProperty,
      })
    }
  }

  const palette: ColorToken[] = [...tokenMap.entries()]
    .sort((a, b) => b[1].frequency - a[1].frequency)
    .map(([hex, data]) => ({
      hex,
      usageRole: data.usage,
      frequency: data.frequency,
      pagesUsedOn: [...data.pages],
      cssProperty: data.cssProperty,
    }))

  // Derive semantic roles
  const semantic = deriveSemanticColors(palette)

  // Calculate contrast pairs for key combinations
  const contrastPairs = calculateContrastPairs(semantic)

  // Detect dark mode
  const darkMode = detectDarkMode(cssSources.map(s => s.css).join('\n'))

  return {
    palette,
    ...semantic,
    darkMode,
    contrastPairs,
  }
}

/** Derive semantic color roles from the sorted palette. */
const deriveSemanticColors = (
  palette: ColorToken[],
): Pick<ColorSystem, 'primary' | 'secondary' | 'accent' | 'background' | 'surface' | 'text' | 'textSecondary' | 'border'> => {
  const bgColors = palette.filter(c => c.usageRole === 'background')
  const textColors = palette.filter(c => c.usageRole === 'text')
  const borderColors = palette.filter(c => c.usageRole === 'border')

  // Filter out pure black/white from "interesting" colors
  const interesting = palette.filter(
    c => c.hex !== '#ffffff' && c.hex !== '#000000' && c.hex !== '#fff' && c.hex !== '#000',
  )

  return {
    primary: interesting[0]?.hex ?? null,
    secondary: interesting[1]?.hex ?? null,
    accent: interesting[2]?.hex ?? null,
    background: bgColors[0]?.hex ?? null,
    surface: bgColors[1]?.hex ?? null,
    text: textColors[0]?.hex ?? null,
    textSecondary: textColors[1]?.hex ?? null,
    border: borderColors[0]?.hex ?? null,
  }
}

/** Calculate WCAG contrast pairs for the key semantic colors. */
const calculateContrastPairs = (
  semantic: Pick<ColorSystem, 'primary' | 'background' | 'text'>,
): ContrastPair[] => {
  const pairs: ContrastPair[] = []

  const addPair = (fg: string | null, bg: string | null) => {
    if (!fg || !bg) return
    const ratio = contrastRatio(fg, bg)
    pairs.push({
      foreground: fg,
      background: bg,
      ratio: Math.round(ratio * 100) / 100,
      passAA: ratio >= 4.5,
      passAAA: ratio >= 7,
    })
  }

  addPair(semantic.text, semantic.background)
  addPair(semantic.primary, semantic.background)
  addPair('#ffffff', semantic.primary)
  addPair('#000000', semantic.background)

  return pairs
}

/** Detect whether the site has a dark mode / prefers-color-scheme. */
const detectDarkMode = (css: string): boolean =>
  /prefers-color-scheme\s*:\s*dark/i.test(css) ||
  /\[data-theme\s*=\s*["']dark["']\]/i.test(css) ||
  /\.dark\s*\{/i.test(css) ||
  /dark-mode|darkMode/i.test(css)
