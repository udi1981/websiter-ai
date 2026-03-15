import type { ScanResult, DetectedSection } from './scanner'
import type { ColorPalette, FontCombo, IndustryPreset } from './design-presets'
import { detectIndustryFromScan } from './design-presets'
import type { MotionIntensity, MotionPreset } from './motion-presets'
import { getMotionPreset, INDUSTRY_MOTION_DEFAULTS } from './motion-presets'
import { generateMotionCSS } from './motion-css'
import { generateMotionJS } from './motion-runtime'
import { generateEcommerceSite } from './ecommerce-template'
import * as sections from './section-templates'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RebuildOptions = {
  overridePalette?: Partial<ColorPalette>
  overrideFonts?: Partial<FontCombo>
  overrideBusinessType?: string
  overrideName?: string
  includeSections?: string[]
  excludeSections?: string[]
  darkMode?: boolean
  heroStyle?: 'fullscreen-image' | 'split' | 'gradient' | 'minimal'
  motionPreset?: MotionIntensity
  mediaStyle?: string
}

type ResolvedPalette = {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  textLight: string
  border: string
}

// ---------------------------------------------------------------------------
// Curated Unsplash photo IDs per industry
// ---------------------------------------------------------------------------

const UNSPLASH_PHOTOS: Record<string, string[]> = {
  restaurant: [
    '1517248135467-4c7edcad34c4',
    '1414235077428-338989a2e8c0',
    '1555396273-367ea4eb4db5',
    '1504674900247-0877df9cc836',
    '1466978913421-dad2ebd01d17',
  ],
  dental: [
    '1629909613654-28e377c37b09',
    '1588776814546-1ffcf47267a5',
    '1606811841689-23dfddce3e95',
    '1598256989800-fe5f95da9787',
    '1445527815219-ecbfec67d3f4',
  ],
  law: [
    '1589829545856-d10d557cf95f',
    '1497366216548-37526070297c',
    '1521587760476-6c12a4b040da',
    '1450101499163-c8848e968838',
    '1507679799987-c73779587ccf',
  ],
  realestate: [
    '1600596542815-ffad4c1539a9',
    '1600585154340-be6161a56a0c',
    '1512917774080-9991f1c4c750',
    '1560448204-e02f11c3d0e2',
    '1600607687939-ce8a6c25118c',
  ],
  fitness: [
    '1534438327276-14e5300c3a48',
    '1571019614242-c5c5dee9f50b',
    '1517836357463-d25dfeac3438',
    '1540497077202-8b9cf3a2e4f6',
    '1476480862126-209bfaa8edc8',
  ],
  photography: [
    '1452587925148-ce544e77e70d',
    '1493863641943-9b68992a8d07',
    '1502920917128-1aa500764cbd',
    '1554080353-a576cf803bda',
    '1542038784456-1ea8e935640e',
  ],
  saas: [
    '1460925895917-afdab827c52f',
    '1551434678-e076c223a692',
    '1519389950473-47ba0277781c',
    '1553877522-43269d4ea984',
    '1531482615713-2afd69097998',
  ],
  ecommerce: [
    '1472851294608-062f824d29cc',
    '1441986300917-64674bd600d8',
    '1556742049-0cfed4f6a45d',
    '1483985988355-763728e1935b',
    '1607082349566-187342175e2f',
  ],
  general: [
    '1497366216548-37526070297c',
    '1497215728101-856f4ea42174',
    '1522071820081-009f0129c71c',
    '1504384308090-c894fdcc538d',
    '1556761175-5973dc0f32e7',
  ],
}

const PORTRAIT_PHOTOS = [
  '1507003211169-0a1dd7228f2d',
  '1494790108377-be9c29b29330',
  '1500648767791-00dcc994a43e',
  '1438761681033-6461ffad8d80',
  '1472099645785-5658abf4ff4e',
  '1544005313-94ddf0286df2',
]

// ---------------------------------------------------------------------------
// Recommended sections per industry
// ---------------------------------------------------------------------------

const INDUSTRY_SECTIONS: Record<string, string[]> = {
  restaurant: ['navbar', 'hero', 'menu', 'about', 'testimonials', 'gallery', 'contact', 'footer'],
  dental: ['navbar', 'hero', 'services', 'about', 'team', 'testimonials', 'contact', 'footer'],
  law: ['navbar', 'hero', 'services', 'about', 'team', 'testimonials', 'contact', 'footer'],
  realestate: ['navbar', 'hero', 'features', 'gallery', 'testimonials', 'contact', 'footer'],
  fitness: ['navbar', 'hero', 'services', 'about', 'pricing', 'testimonials', 'contact', 'footer'],
  photography: ['navbar', 'hero', 'gallery', 'about', 'services', 'testimonials', 'contact', 'footer'],
  saas: ['navbar', 'hero', 'features', 'pricing', 'testimonials', 'cta', 'footer'],
  ecommerce: ['navbar', 'hero', 'features', 'gallery', 'testimonials', 'cta', 'footer'],
  general: ['navbar', 'hero', 'features', 'about', 'testimonials', 'contact', 'footer'],
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns an Unsplash image URL for the given industry.
 */
const getUnsplashImage = (industry: string, width: number, index: number): string => {
  const photos = UNSPLASH_PHOTOS[industry] ?? UNSPLASH_PHOTOS.saas ?? []
  const id = photos[index % photos.length] ?? '1460925895917-afdab827c52f'
  return `https://images.unsplash.com/photo-${id}?w=${width}&h=${Math.round(width * 0.6)}&fit=crop&q=80`
}

/**
 * Returns a portrait Unsplash URL for team / avatar sections.
 */
const getPortraitImage = (index: number, width = 400): string => {
  const id = PORTRAIT_PHOTOS[index % PORTRAIT_PHOTOS.length]
  return `https://images.unsplash.com/photo-${id}?w=${width}&h=${width}&fit=crop&crop=face&q=80`
}

/**
 * Resolves the final color palette from scan data, preset, overrides, and dark mode.
 */
const resolvePalette = (
  scan: ScanResult,
  preset: IndustryPreset,
  overrides?: Partial<ColorPalette>,
  darkMode?: boolean,
): ResolvedPalette => {
  const scanColors = scan.colors ?? []
  const findColor = (usage: string) => scanColors.find((c) => c.usage === usage)?.hex
  const presetPalette = preset.palette

  const base: ResolvedPalette = {
    primary: findColor('primary') ?? presetPalette.primary ?? '#2563eb',
    secondary: findColor('secondary') ?? presetPalette.secondary ?? '#7c3aed',
    accent: findColor('accent') ?? presetPalette.accent ?? '#f59e0b',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    textLight: '#64748b',
    border: '#e2e8f0',
  }

  // Apply overrides
  if (overrides) {
    if (overrides.primary) base.primary = overrides.primary
    if (overrides.secondary) base.secondary = overrides.secondary
    if (overrides.accent) base.accent = overrides.accent
  }

  // Dark mode swaps
  if (darkMode) {
    base.background = '#0f172a'
    base.surface = '#1e293b'
    base.text = '#f1f5f9'
    base.textLight = '#94a3b8'
    base.border = '#334155'
  }

  return base
}

/**
 * Resolves font families from scan, preset, and overrides.
 */
const resolveFonts = (
  scan: ScanResult,
  preset: IndustryPreset,
  overrides?: Partial<FontCombo>,
): { heading: string; body: string } => {
  const scanFonts = scan.fonts ?? []
  const findFont = (usage: string) => scanFonts.find((f) => f.usage === usage)?.family
  const presetFonts = preset.fonts
  return {
    heading: overrides?.heading ?? findFont('heading') ?? presetFonts?.heading ?? 'Inter',
    body: overrides?.body ?? findFont('body') ?? presetFonts?.body ?? 'Inter',
  }
}

/**
 * Determines which sections should be included in the rebuilt page.
 */
const resolveSections = (
  scan: ScanResult,
  industry: string,
  options?: RebuildOptions,
): string[] => {
  const scannedTypes = (scan.sections ?? []).map((s: DetectedSection) => s.type)
  const recommended = INDUSTRY_SECTIONS[industry] ?? INDUSTRY_SECTIONS.general

  // Start with scanned sections or recommended if too few
  let result = scannedTypes.length >= 4 ? scannedTypes : [...recommended]

  // Ensure navbar, hero, and footer are always present
  if (!result.includes('navbar')) result.unshift('navbar')
  if (!result.includes('hero')) {
    const idx = result.indexOf('navbar')
    result.splice(idx + 1, 0, 'hero')
  }
  if (!result.includes('footer')) result.push('footer')

  // Apply include / exclude filters
  if (options?.includeSections) {
    const always = new Set(['navbar', 'hero', 'footer'])
    result = result.filter(
      (s) => always.has(s) || options.includeSections!.includes(s),
    )
  }
  if (options?.excludeSections) {
    const exclude = new Set(options.excludeSections)
    result = result.filter((s) => !exclude.has(s))
  }

  // Deduplicate while preserving order
  const seen = new Set<string>()
  result = result.filter((s) => {
    if (seen.has(s)) return false
    seen.add(s)
    return true
  })

  return result
}

/**
 * Retrieves scanned content for a given section type, if available.
 */
const getScannedContent = (
  scan: ScanResult,
  sectionType: string,
): DetectedSection | undefined =>
  (scan.sections ?? []).find((s: DetectedSection) => s.type === sectionType)

// ---------------------------------------------------------------------------
// Section HTML generators
// ---------------------------------------------------------------------------

const generateNavbar = (
  siteName: string,
  navLinks: string[],
  palette: ResolvedPalette,
): string => {
  const links = navLinks
    .map(
      (l) =>
        `<a href="#${l.toLowerCase().replace(/\s+/g, '-')}" class="text-sm font-medium hover:text-primary transition-colors">${l}</a>`,
    )
    .join('\n            ')

  return `
  <nav class="fixed top-0 inset-x-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-border">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
      <a href="#" class="text-xl font-bold font-heading text-primary">${siteName}</a>
      <div class="hidden md:flex items-center gap-8">
        ${links}
        <a href="#contact" class="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">Get Started</a>
      </div>
      <button id="mobile-menu-btn" class="md:hidden p-2 rounded-lg hover:bg-surface transition-colors" aria-label="Toggle menu">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
    </div>
    <div id="mobile-menu" class="md:hidden hidden border-t border-border bg-white dark:bg-slate-900 px-4 pb-4 space-y-3 pt-3">
      ${navLinks.map((l) => `<a href="#${l.toLowerCase().replace(/\s+/g, '-')}" class="block text-sm font-medium hover:text-primary transition-colors">${l}</a>`).join('\n      ')}
      <a href="#contact" class="block w-full text-center px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">Get Started</a>
    </div>
  </nav>`
}

const generateHero = (
  siteName: string,
  tagline: string,
  subtitle: string,
  cta1: string,
  cta2: string,
  heroImgUrl: string,
  industry: string,
  palette: ResolvedPalette,
  style: RebuildOptions['heroStyle'],
  motion: MotionPreset,
): string => {
  const heroAttr = motion.hero.titleAnimation !== 'none' ? ` data-hero-animation="${motion.hero.titleAnimation}"` : ''
  const titleSplit = motion.hero.titleAnimation === 'splitWords' ? ' data-split-words' : ''
  const parallaxAttr = motion.scroll.parallaxDepth > 0 ? ` data-parallax-speed="${motion.scroll.parallaxDepth}"` : ''
  const glowColor = `--motion-glow-color: ${palette.primary}40;`

  if (style === 'minimal') {
    return `
  <section class="pt-32 pb-20 px-4 bg-background"${heroAttr}>
    <div class="max-w-4xl mx-auto text-center" style="${glowColor}">
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-text leading-tight mb-6 motion-hero-title"${titleSplit}>${tagline}</h1>
      <p class="text-lg sm:text-xl text-textLight max-w-2xl mx-auto mb-10 motion-hero-subtitle">${subtitle}</p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center motion-hero-cta">
        <a href="#contact" class="px-8 py-3.5 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity motion-hover-button">${cta1}</a>
        <a href="#about" class="px-8 py-3.5 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-colors motion-hover-button">${cta2}</a>
      </div>
    </div>
  </section>`
  }

  if (style === 'split') {
    return `
  <section class="pt-24 lg:pt-32 pb-16 px-4 bg-background"${heroAttr}>
    <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center" style="${glowColor}">
      <div>
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-text leading-tight mb-6 motion-hero-title"${titleSplit}>${tagline}</h1>
        <p class="text-lg text-textLight mb-8 max-w-lg motion-hero-subtitle">${subtitle}</p>
        <div class="flex flex-col sm:flex-row gap-4 motion-hero-cta">
          <a href="#contact" class="px-8 py-3.5 bg-primary text-white rounded-xl font-semibold text-center hover:opacity-90 transition-opacity motion-hover-button">${cta1}</a>
          <a href="#about" class="px-8 py-3.5 border-2 border-primary text-primary rounded-xl font-semibold text-center hover:bg-primary hover:text-white transition-colors motion-hover-button">${cta2}</a>
        </div>
      </div>
      <div class="motion-reveal">
        <img src="${heroImgUrl}" alt="${siteName}" class="w-full h-[400px] lg:h-[500px] object-cover rounded-2xl shadow-2xl motion-hover-image" loading="lazy"${parallaxAttr}/>
      </div>
    </div>
  </section>`
  }

  if (style === 'gradient') {
    return `
  <section class="relative pt-32 pb-24 px-4 overflow-hidden${motion.hero.gradientShift ? ' motion-gradient-shift' : ''}" style="background: linear-gradient(135deg, ${palette.primary}15, ${palette.secondary}15);${glowColor}"${heroAttr}>
    <div class="max-w-4xl mx-auto text-center relative z-10">
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-text leading-tight mb-6 motion-hero-title"${titleSplit}>${tagline}</h1>
      <p class="text-lg sm:text-xl text-textLight max-w-2xl mx-auto mb-10 motion-hero-subtitle">${subtitle}</p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center motion-hero-cta">
        <a href="#contact" class="px-8 py-3.5 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity motion-hover-button">${cta1}</a>
        <a href="#about" class="px-8 py-3.5 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-colors motion-hover-button">${cta2}</a>
      </div>
    </div>
  </section>`
  }

  // Default: fullscreen-image
  return `
  <section class="relative min-h-[90vh] flex items-center justify-center px-4"${heroAttr}>
    <img src="${heroImgUrl}" alt="${siteName}" class="absolute inset-0 w-full h-full object-cover"${parallaxAttr}/>
    <div class="hero-overlay absolute inset-0"></div>
    <div class="relative z-10 text-center max-w-4xl mx-auto" style="${glowColor}">
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-white leading-tight mb-6 drop-shadow-lg motion-hero-title"${titleSplit}>${tagline}</h1>
      <p class="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-10 drop-shadow motion-hero-subtitle">${subtitle}</p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center motion-hero-cta">
        <a href="#contact" class="px-8 py-3.5 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg motion-hover-button">${cta1}</a>
        <a href="#about" class="px-8 py-3.5 bg-white/20 backdrop-blur text-white border border-white/30 rounded-xl font-semibold hover:bg-white/30 transition-colors motion-hover-button">${cta2}</a>
      </div>
    </div>
  </section>`
}

const generateFeatures = (
  industry: string,
  motion: MotionPreset,
  scan: ScanResult,
  scanned?: DetectedSection,
): string => {
  const icons = [
    'M13 10V3L4 14h7v7l9-11h-7z',
    'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
    'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064',
  ]

  // Use actual scanned headings for feature titles
  const scannedHeadings = scan.headings.filter((h) => h.level >= 2 && h.level <= 3 && h.text.length < 60)
  const scannedParagraphs = scan.paragraphs.filter((p) => p.length > 20 && p.length < 200)

  const defaults = [
    { title: 'Expert Team', desc: 'Our seasoned professionals bring years of industry experience to every project.' },
    { title: 'Quality First', desc: 'We never compromise on quality, ensuring every detail meets the highest standards.' },
    { title: 'Fast Delivery', desc: 'Efficient processes and modern tools allow us to deliver results ahead of schedule.' },
    { title: '24/7 Support', desc: 'Round-the-clock assistance ensures you always have help when you need it.' },
  ]

  // Build features from scanned content first, fill with defaults
  const features: { title: string; desc: string }[] = []
  const usedHeadings = new Set<number>()
  const usedParagraphs = new Set<number>()

  // Skip first heading (likely hero) and first paragraph (likely hero subtitle)
  const startH = scannedHeadings.length > 1 ? 1 : 0
  const startP = scannedParagraphs.length > 1 ? 1 : 0

  for (let i = 0; i < 4; i++) {
    const hIdx = startH + i
    const pIdx = startP + i
    if (hIdx < scannedHeadings.length && !usedHeadings.has(hIdx)) {
      usedHeadings.add(hIdx)
      const desc = pIdx < scannedParagraphs.length && !usedParagraphs.has(pIdx)
        ? (usedParagraphs.add(pIdx), scannedParagraphs[pIdx])
        : defaults[i]?.desc ?? ''
      features.push({ title: scannedHeadings[hIdx].text, desc })
    } else {
      features.push(defaults[i] ?? { title: `Feature ${i + 1}`, desc: '' })
    }
  }

  // Section title from scanned content
  const sectionTitle = scanned?.title || (scannedHeadings.length > 0 ? scannedHeadings[0].text : 'Why Choose Us')
  const tiltAttr = motion.hover.cards === 'tilt' ? ' data-motion-tilt' : ''

  const items = features
    .map(
      (f, i) => `
        <div class="bg-surface rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300 border border-border motion-reveal motion-stagger-${i + 1} motion-hover-card"${tiltAttr}>
          <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
            <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${icons[i % icons.length]}"/></svg>
          </div>
          <h3 class="text-xl font-bold font-heading text-text mb-3">${f.title}</h3>
          <p class="text-textLight leading-relaxed">${f.desc}</p>
        </div>`,
    )
    .join('')

  return `
  <section id="features" class="py-20 px-4 bg-background">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-16 motion-reveal">
        <h2 class="text-3xl sm:text-4xl font-bold font-heading text-text mb-4">${sectionTitle}</h2>
        <p class="text-textLight max-w-2xl mx-auto text-lg">Everything you need to succeed, all in one place.</p>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">${items}
      </div>
    </div>
  </section>`
}

const generateAbout = (
  siteName: string,
  industry: string,
  scan: ScanResult,
  scanned?: DetectedSection,
): string => {
  // Use scanned about image or fallback to Unsplash
  const aboutImg = scan.images.find((img) => img.role !== 'logo' && img.role !== 'icon' && img.role !== 'hero')
  const imgUrl = aboutImg?.src ?? getUnsplashImage(industry, 800, 1)

  // Use actual scanned content for about section
  const aboutTitle = scanned?.title || `About ${siteName}`
  const aboutParagraphs = scan.paragraphs.filter((p) => p.length > 40)
  const p1 = aboutParagraphs.length > 2 ? aboutParagraphs[2] : (aboutParagraphs[0] ?? 'With years of experience and a passion for excellence, we have built a reputation for delivering outstanding results.')
  const p2 = aboutParagraphs.length > 3 ? aboutParagraphs[3] : (aboutParagraphs[1] ?? 'We believe in transparency, innovation, and building lasting relationships with every client we serve.')

  return `
  <section id="about" class="py-20 px-4 bg-surface">
    <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
      <div class="motion-reveal">
        <img src="${imgUrl}" alt="About ${siteName}" class="w-full h-[400px] object-cover rounded-2xl shadow-lg" loading="lazy"/>
      </div>
      <div class="motion-reveal">
        <h2 class="text-3xl sm:text-4xl font-bold font-heading text-text mb-6">${aboutTitle}</h2>
        <p class="text-textLight text-lg leading-relaxed mb-6">${p1}</p>
        <p class="text-textLight text-lg leading-relaxed mb-8">${p2}</p>
        <a href="#contact" class="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
          Learn more about us
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
        </a>
      </div>
    </div>
  </section>`
}

const generateServices = (
  industry: string,
  scan: ScanResult,
  scanned?: DetectedSection,
): string => {
  const defaultServices = [
    { title: 'Consultation', desc: 'In-depth analysis and expert guidance tailored to your goals.' },
    { title: 'Strategy', desc: 'Custom roadmaps built on data and proven methodologies.' },
    { title: 'Implementation', desc: 'Seamless execution with attention to every detail.' },
    { title: 'Support', desc: 'Ongoing maintenance and optimization for lasting success.' },
    { title: 'Training', desc: 'Empowering your team with knowledge and best practices.' },
    { title: 'Analytics', desc: 'Comprehensive reporting to measure impact and growth.' },
  ]

  // Try to use scanned headings for service names
  const scannedH3s = scan.headings.filter((h) => h.level >= 2 && h.level <= 4 && h.text.length < 50)
  const servicesList = scannedH3s.length >= 4
    ? scannedH3s.slice(0, 6).map((h, i) => ({
        title: h.text,
        desc: scan.paragraphs[i + 2] ?? defaultServices[i]?.desc ?? '',
      }))
    : defaultServices

  const cards = servicesList
    .map(
      (s, i) => `
        <div class="group bg-background rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-border motion-reveal">
          <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
            <span class="text-primary font-bold group-hover:text-white transition-colors">${String(i + 1).padStart(2, '0')}</span>
          </div>
          <h3 class="text-lg font-bold font-heading text-text mb-2">${s.title}</h3>
          <p class="text-textLight text-sm leading-relaxed">${s.desc}</p>
        </div>`,
    )
    .join('')

  return `
  <section id="services" class="py-20 px-4 bg-surface">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-16 motion-reveal">
        <h2 class="text-3xl sm:text-4xl font-bold font-heading text-text mb-4">Our Services</h2>
        <p class="text-textLight max-w-2xl mx-auto text-lg">Comprehensive solutions designed to help you thrive.</p>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">${cards}
      </div>
    </div>
  </section>`
}

const generateTestimonials = (industry: string): string => {
  const testimonials = [
    { name: 'Sarah Johnson', role: 'CEO, TechStart', text: 'Working with this team transformed our business. Their attention to detail and creative solutions exceeded all expectations.' },
    { name: 'Michael Chen', role: 'Founder, GrowthLab', text: 'The results speak for themselves. We saw a 200% increase in engagement within the first three months.' },
    { name: 'Emily Rodriguez', role: 'Director, BrightPath', text: 'Professional, responsive, and truly dedicated to delivering excellence. I could not recommend them more highly.' },
  ]

  const cards = testimonials
    .map(
      (t, i) => `
        <div class="bg-background rounded-2xl p-8 border border-border motion-reveal">
          <div class="flex gap-1 mb-4">
            ${Array(5).fill('<svg class="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>').join('')}
          </div>
          <p class="text-text leading-relaxed mb-6">"${t.text}"</p>
          <div class="flex items-center gap-4">
            <img src="${getPortraitImage(i)}" alt="${t.name}" class="w-12 h-12 rounded-full object-cover" loading="lazy"/>
            <div>
              <p class="font-semibold text-text">${t.name}</p>
              <p class="text-sm text-textLight">${t.role}</p>
            </div>
          </div>
        </div>`,
    )
    .join('')

  return `
  <section id="testimonials" class="py-20 px-4 bg-surface">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-16 motion-reveal">
        <h2 class="text-3xl sm:text-4xl font-bold font-heading text-text mb-4">What Our Clients Say</h2>
        <p class="text-textLight max-w-2xl mx-auto text-lg">Trusted by businesses worldwide.</p>
      </div>
      <div class="grid md:grid-cols-3 gap-8">${cards}
      </div>
    </div>
  </section>`
}

const generatePricing = (): string => {
  const plans = [
    { name: 'Starter', price: '29', features: ['Up to 5 projects', 'Basic analytics', 'Email support', '1 GB storage'] },
    { name: 'Professional', price: '79', features: ['Unlimited projects', 'Advanced analytics', 'Priority support', '50 GB storage', 'Custom domain', 'Team collaboration'], popular: true },
    { name: 'Enterprise', price: '199', features: ['Everything in Pro', 'Dedicated manager', 'SLA guarantee', 'Unlimited storage', 'API access', 'Custom integrations'] },
  ]

  const cards = plans
    .map(
      (p) => `
        <div class="relative bg-background rounded-2xl p-8 border ${p.popular ? 'border-primary shadow-xl scale-105' : 'border-border'} motion-reveal">
          ${p.popular ? '<div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-sm font-semibold px-4 py-1 rounded-full">Most Popular</div>' : ''}
          <h3 class="text-xl font-bold font-heading text-text mb-2">${p.name}</h3>
          <div class="mb-6"><span class="text-4xl font-extrabold text-text">$${p.price}</span><span class="text-textLight">/mo</span></div>
          <ul class="space-y-3 mb-8">
            ${p.features.map((f) => `<li class="flex items-center gap-3 text-textLight"><svg class="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>${f}</li>`).join('\n            ')}
          </ul>
          <a href="#contact" class="block text-center px-6 py-3 rounded-xl font-semibold transition-colors ${p.popular ? 'bg-primary text-white hover:opacity-90' : 'border-2 border-primary text-primary hover:bg-primary hover:text-white'}">Get Started</a>
        </div>`,
    )
    .join('')

  return `
  <section id="pricing" class="py-20 px-4 bg-background">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-16 motion-reveal">
        <h2 class="text-3xl sm:text-4xl font-bold font-heading text-text mb-4">Simple, Transparent Pricing</h2>
        <p class="text-textLight max-w-2xl mx-auto text-lg">Choose the plan that fits your needs. Upgrade or downgrade anytime.</p>
      </div>
      <div class="grid md:grid-cols-3 gap-8 items-start">${cards}
      </div>
    </div>
  </section>`
}

const generateGallery = (industry: string, scan: ScanResult): string => {
  // Prefer scanned images from the original site
  const scannedGalleryImgs = scan.images
    .filter((img) => img.role !== 'logo' && img.role !== 'icon' && img.src.startsWith('http'))
    .slice(0, 6)

  const images = scannedGalleryImgs.length >= 3
    ? scannedGalleryImgs.map((img) => img.src)
    : Array.from({ length: 6 }, (_, i) => getUnsplashImage(industry, 600, i))

  return `
  <section id="gallery" class="py-20 px-4 bg-background">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-16 motion-reveal">
        <h2 class="text-3xl sm:text-4xl font-bold font-heading text-text mb-4">Our Gallery</h2>
        <p class="text-textLight max-w-2xl mx-auto text-lg">A glimpse into our work and the experiences we create.</p>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${images.map((src, i) => `<div class="overflow-hidden rounded-xl motion-reveal"><img src="${src}" alt="Gallery image ${i + 1}" class="w-full h-64 object-cover hover:scale-110 transition-transform duration-500" loading="lazy"/></div>`).join('\n        ')}
      </div>
    </div>
  </section>`
}

const generateTeam = (industry: string): string => {
  const members = [
    { name: 'David Miller', role: 'Founder & CEO' },
    { name: 'Lisa Park', role: 'Lead Designer' },
    { name: 'James Wilson', role: 'Head of Operations' },
    { name: 'Anna Martinez', role: 'Client Relations' },
  ]

  const cards = members
    .map(
      (m, i) => `
        <div class="text-center motion-reveal">
          <img src="${getPortraitImage(i)}" alt="${m.name}" class="w-32 h-32 rounded-full object-cover mx-auto mb-4 shadow-lg" loading="lazy"/>
          <h3 class="text-lg font-bold font-heading text-text">${m.name}</h3>
          <p class="text-textLight text-sm">${m.role}</p>
        </div>`,
    )
    .join('')

  return `
  <section id="team" class="py-20 px-4 bg-surface">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-16 motion-reveal">
        <h2 class="text-3xl sm:text-4xl font-bold font-heading text-text mb-4">Meet Our Team</h2>
        <p class="text-textLight max-w-2xl mx-auto text-lg">Passionate people behind every success story.</p>
      </div>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-8">${cards}
      </div>
    </div>
  </section>`
}

const generateCTA = (siteName: string, palette: ResolvedPalette): string => `
  <section class="py-20 px-4" style="background: linear-gradient(135deg, ${palette.primary}, ${palette.secondary});">
    <div class="max-w-3xl mx-auto text-center motion-reveal">
      <h2 class="text-3xl sm:text-4xl font-bold font-heading text-white mb-6">Ready to Get Started?</h2>
      <p class="text-white/90 text-lg mb-10 max-w-xl mx-auto">Join thousands of satisfied customers who trust ${siteName}. Let us help you achieve your goals.</p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="#contact" class="px-8 py-3.5 bg-white text-primary rounded-xl font-semibold hover:bg-white/90 transition-colors shadow-lg">Start Now</a>
        <a href="#about" class="px-8 py-3.5 border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-colors">Learn More</a>
      </div>
    </div>
  </section>`

const generateContact = (siteName: string): string => `
  <section id="contact" class="py-20 px-4 bg-background">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-16 motion-reveal">
        <h2 class="text-3xl sm:text-4xl font-bold font-heading text-text mb-4">Get in Touch</h2>
        <p class="text-textLight max-w-2xl mx-auto text-lg">Have a question or ready to start? We would love to hear from you.</p>
      </div>
      <div class="grid md:grid-cols-2 gap-12">
        <div class="motion-reveal space-y-6">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </div>
            <div>
              <p class="font-semibold text-text">Email</p>
              <p class="text-textLight">hello@${siteName.toLowerCase().replace(/\s+/g, '')}.com</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
            </div>
            <div>
              <p class="font-semibold text-text">Phone</p>
              <p class="text-textLight">+1 (555) 123-4567</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
            <div>
              <p class="font-semibold text-text">Address</p>
              <p class="text-textLight">123 Business Ave, Suite 100</p>
            </div>
          </div>
        </div>
        <form class="space-y-4 motion-reveal" onsubmit="event.preventDefault()">
          <div class="grid sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Your Name" class="w-full px-4 py-3 rounded-xl border border-border bg-surface text-text placeholder:text-textLight focus:outline-none focus:ring-2 focus:ring-primary/50 transition"/>
            <input type="email" placeholder="Your Email" class="w-full px-4 py-3 rounded-xl border border-border bg-surface text-text placeholder:text-textLight focus:outline-none focus:ring-2 focus:ring-primary/50 transition"/>
          </div>
          <input type="text" placeholder="Subject" class="w-full px-4 py-3 rounded-xl border border-border bg-surface text-text placeholder:text-textLight focus:outline-none focus:ring-2 focus:ring-primary/50 transition"/>
          <textarea placeholder="Your Message" rows="5" class="w-full px-4 py-3 rounded-xl border border-border bg-surface text-text placeholder:text-textLight focus:outline-none focus:ring-2 focus:ring-primary/50 transition resize-none"></textarea>
          <button type="submit" class="w-full px-6 py-3.5 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity">Send Message</button>
        </form>
      </div>
    </div>
  </section>`

const generateMenu = (industry: string): string => {
  const categories = [
    {
      name: 'Starters',
      items: [
        { name: 'Bruschetta', desc: 'Toasted bread with tomato, basil, and garlic', price: '$12' },
        { name: 'Caesar Salad', desc: 'Romaine lettuce, parmesan, croutons', price: '$14' },
        { name: 'Soup of the Day', desc: 'Ask your server for today\'s selection', price: '$10' },
      ],
    },
    {
      name: 'Main Courses',
      items: [
        { name: 'Grilled Salmon', desc: 'Atlantic salmon with seasonal vegetables', price: '$28' },
        { name: 'Ribeye Steak', desc: '12oz prime cut with truffle mash', price: '$36' },
        { name: 'Mushroom Risotto', desc: 'Arborio rice with wild mushrooms', price: '$22' },
      ],
    },
  ]

  return `
  <section id="menu" class="py-20 px-4 bg-surface">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-16 motion-reveal">
        <h2 class="text-3xl sm:text-4xl font-bold font-heading text-text mb-4">Our Menu</h2>
        <p class="text-textLight max-w-2xl mx-auto text-lg">Fresh ingredients, bold flavors, crafted with passion.</p>
      </div>
      ${categories
        .map(
          (cat) => `
      <div class="mb-12 motion-reveal">
        <h3 class="text-2xl font-bold font-heading text-text mb-6 pb-2 border-b border-border">${cat.name}</h3>
        <div class="space-y-6">
          ${cat.items
            .map(
              (item) => `
          <div class="flex justify-between items-start gap-4">
            <div>
              <h4 class="font-semibold text-text">${item.name}</h4>
              <p class="text-textLight text-sm">${item.desc}</p>
            </div>
            <span class="text-primary font-bold whitespace-nowrap">${item.price}</span>
          </div>`,
            )
            .join('')}
        </div>
      </div>`,
        )
        .join('')}
    </div>
  </section>`
}

const generateFooter = (
  siteName: string,
  navLinks: string[],
  palette: ResolvedPalette,
): string => `
  <footer class="bg-text py-16 px-4">
    <div class="max-w-7xl mx-auto">
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div>
          <h3 class="text-xl font-bold font-heading text-white mb-4">${siteName}</h3>
          <p class="text-white/60 text-sm leading-relaxed">Building exceptional experiences with passion, precision, and purpose.</p>
        </div>
        <div>
          <h4 class="font-semibold text-white mb-4">Quick Links</h4>
          <ul class="space-y-2">
            ${navLinks.map((l) => `<li><a href="#${l.toLowerCase().replace(/\s+/g, '-')}" class="text-white/60 text-sm hover:text-white transition-colors">${l}</a></li>`).join('\n            ')}
          </ul>
        </div>
        <div>
          <h4 class="font-semibold text-white mb-4">Contact</h4>
          <ul class="space-y-2 text-white/60 text-sm">
            <li>hello@${siteName.toLowerCase().replace(/\s+/g, '')}.com</li>
            <li>+1 (555) 123-4567</li>
            <li>123 Business Ave, Suite 100</li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold text-white mb-4">Follow Us</h4>
          <div class="flex gap-4">
            <a href="#" class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors" aria-label="Twitter">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
            </a>
            <a href="#" class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors" aria-label="LinkedIn">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="#" class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors" aria-label="Instagram">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
          </div>
        </div>
      </div>
      <div class="border-t border-white/10 pt-8 text-center">
        <p class="text-white/40 text-sm">&copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
      </div>
    </div>
  </footer>`

// ---------------------------------------------------------------------------
// Section dispatcher
// ---------------------------------------------------------------------------

const generateSection = (
  type: string,
  siteName: string,
  industry: string,
  palette: ResolvedPalette,
  scan: ScanResult,
  motion: MotionPreset,
  options?: RebuildOptions,
): string => {
  const scanned = getScannedContent(scan, type)

  switch (type) {
    case 'features':
      return generateFeatures(industry, motion, scan, scanned)
    case 'about':
      return generateAbout(siteName, industry, scan, scanned)
    case 'services':
      return generateServices(industry, scan, scanned)
    case 'testimonials':
      return generateTestimonials(industry)
    case 'pricing':
      return generatePricing()
    case 'gallery':
      return generateGallery(industry, scan)
    case 'team':
      return generateTeam(industry)
    case 'cta':
      return generateCTA(siteName, palette)
    case 'contact':
      return generateContact(siteName)
    case 'menu':
      return generateMenu(industry)
    default:
      return generateFeatures(industry, motion, scan, scanned)
  }
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Rebuilds a complete, production-quality HTML page from scan results.
 * Uses scanned content where available, falls back to industry presets.
 */
export const rebuildSite = (scan: ScanResult, options?: RebuildOptions): string => {
  // 1. Detect industry
  const businessType = options?.overrideBusinessType ?? scan.businessType ?? 'general'
  const preset = detectIndustryFromScan(businessType)
  const industry = preset.id

  // E-commerce sites use a specialized fashion template
  const isEcommerce = industry === 'ecommerce' || businessType === 'ecommerce' ||
    /shop|store|product|cart|add.to.cart|checkout|buy|price|ecommerce|fashion|clothing/i.test(
      (scan.title ?? '') + ' ' + (scan.description ?? '') + ' ' + scan.sections.map(s => s.type).join(' ')
    )

  if (isEcommerce) {
    const siteName = options?.overrideName ?? scan.businessName ?? scan.title ?? 'My Store'
    const motionIntensity = options?.motionPreset ?? INDUSTRY_MOTION_DEFAULTS[industry] ?? 'subtle'
    const motion = getMotionPreset(motionIntensity)
    return generateEcommerceSite({ siteName, motion, scan })
  }

  // 2. Resolve palette and fonts
  const palette = resolvePalette(scan, preset, options?.overridePalette, options?.darkMode)
  const fonts = resolveFonts(scan, preset, options?.overrideFonts)

  // 3. Site name
  const siteName = options?.overrideName ?? scan.businessName ?? scan.title ?? 'My Website'

  // 4. Resolve sections
  const sectionList = resolveSections(scan, industry, options)

  // 5. Build navigation links — prefer scanned nav, fall back to section names
  const skipNav = new Set(['navbar', 'hero', 'footer', 'cta'])
  const navLinks = scan.navigation && scan.navigation.length >= 2
    ? scan.navigation.slice(0, 8).map((n) => n.text).filter((t) => t.length > 0 && t.length < 30)
    : sectionList
        .filter((s) => !skipNav.has(s))
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))

  // 6. Hero tagline + subtitle from real scanned content
  const heroScanned = getScannedContent(scan, 'hero')
  const tagline =
    heroScanned?.title ??
    (scan.headings.length > 0 ? scan.headings[0].text : null) ??
    scan.description ??
    `Welcome to ${siteName}`
  // Get real subtitle from scanned paragraphs
  const heroSubtitle =
    (scan.paragraphs.length > 0 ? scan.paragraphs[0] : null) ??
    scan.description ??
    `We bring expertise, passion, and innovation to everything we do. Discover what makes ${siteName} different.`
  // Get real CTA text from scanned buttons
  const heroCta1 = scan.ctaButtons.length > 0 ? scan.ctaButtons[0].text : 'Get Started'
  const heroCta2 = scan.ctaButtons.length > 1 ? scan.ctaButtons[1].text : 'Learn More'
  // Get hero image from scanned images or Unsplash
  const scannedHeroImg = scan.images.find((img) => img.role === 'hero')?.src
  const heroImgUrl = scannedHeroImg ?? getUnsplashImage(industry, 1920, 0)

  // 7. Hero style
  const heroStyle = options?.heroStyle ?? 'fullscreen-image'

  // 8. Resolve motion preset
  const motionIntensity = options?.motionPreset ?? INDUSTRY_MOTION_DEFAULTS[industry] ?? 'subtle'
  const motion = getMotionPreset(motionIntensity)

  // 9. Build the full HTML
  const headingFont = fonts.heading.replace(/\s+/g, '+')
  const bodyFont = fonts.body.replace(/\s+/g, '+')

  const sectionHtml = sectionList
    .filter((s) => s !== 'navbar' && s !== 'hero' && s !== 'footer')
    .map((s) => generateSection(s, siteName, industry, palette, scan, motion, options))
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en" style="scroll-behavior: smooth;">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${siteName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=${headingFont}:wght@400;500;600;700;800&family=${bodyFont}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            heading: ['${fonts.heading}', 'sans-serif'],
            body: ['${fonts.body}', 'sans-serif'],
          },
          colors: {
            primary: '${palette.primary}',
            secondary: '${palette.secondary}',
            accent: '${palette.accent}',
            background: '${palette.background}',
            surface: '${palette.surface}',
            text: '${palette.text}',
            textLight: '${palette.textLight}',
            border: '${palette.border}',
          },
        },
      },
    }
  </script>
  <style>
    body { font-family: '${fonts.body}', sans-serif; background-color: ${palette.background}; color: ${palette.text}; }
    .font-heading { font-family: '${fonts.heading}', sans-serif; }
    .hero-overlay { background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%); }
    ${generateMotionCSS(motion)}
  </style>
</head>
<body class="bg-background text-text antialiased">
${generateNavbar(siteName, navLinks, palette)}
${generateHero(siteName, tagline, heroSubtitle, heroCta1, heroCta2, heroImgUrl, industry, palette, heroStyle, motion)}
${sectionHtml}
${generateFooter(siteName, navLinks, palette)}

  <script>
    ${generateMotionJS(motion)}
  </script>
</body>
</html>`
}
