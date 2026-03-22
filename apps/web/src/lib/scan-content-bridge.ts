/**
 * Scan Content Bridge — Deterministic migration fidelity layer
 *
 * Runs AFTER mergeSections() and BEFORE composePage().
 * Deterministically maps high-confidence scan data into section content.
 * Does NOT rely on AI hints — directly overwrites generic content with real source data.
 *
 * Tracks covered:
 *   Track 4: Product image key fix
 *   Track 1: Deterministic content bridge (products, prices, FAQ, hero)
 *   Track 2: Navigation + footer fidelity
 */

// ─── Types ──────────────────────────────────────────────────────────

type FieldWithProvenance = {
  value: unknown
  sourceType: string
  confidence: number
  sourceLocator?: string
}

type ScanProduct = {
  name: FieldWithProvenance
  price?: FieldWithProvenance
  originalPrice?: FieldWithProvenance
  currency?: FieldWithProvenance
  description?: FieldWithProvenance
  image?: FieldWithProvenance
  additionalImages?: FieldWithProvenance[]
  category?: FieldWithProvenance
  productUrl?: FieldWithProvenance
  onSale?: FieldWithProvenance
}

type MergedSection = Record<string, unknown>

// ─── Helpers ────────────────────────────────────────────────────────

/** Extract value from provenance field, returning null if confidence too low */
const val = <T = string>(field: unknown, minConfidence = 30): T | null => {
  if (!field || typeof field !== 'object') return null
  const f = field as FieldWithProvenance
  if (f.confidence < minConfidence) return null
  return f.value as T
}

/** Get all products with names from catalog */
const getProducts = (catalog: Record<string, unknown> | null): ScanProduct[] => {
  if (!catalog) return []
  const products = (catalog.products as ScanProduct[]) || []
  return products.filter(p => val(p.name))
}

// ─── Main Bridge ────────────────────────────────────────────────────

/**
 * Deterministically bridge scan artifacts into merged sections.
 * Mutates sections in-place for efficiency.
 *
 * @param sections — merged sections from mergeSections()
 * @param scanCatalog — content_catalog artifact
 * @param scanContentModel — source_content_model artifact
 * @param generatedImages — image map (may have scan_product_* keys)
 * @param locale — site locale
 * @param businessName — resolved business name
 */
export const bridgeScanContentToSections = (
  sections: MergedSection[],
  scanCatalog: Record<string, unknown> | null,
  scanContentModel: Record<string, unknown> | null,
  generatedImages: Record<string, string>,
  locale: string,
  businessName: string,
): void => {
  const products = getProducts(scanCatalog)
  const isHe = locale === 'he'

  // ── Track 4: Fix product image mapping ────────────────────────
  // Move scan_product_* images into a lookup by product name
  const productImagesByName = new Map<string, string>()
  for (const [key, url] of Object.entries(generatedImages)) {
    if (key.startsWith('scan_product_')) {
      const name = key.replace('scan_product_', '').replace(/_/g, ' ')
      productImagesByName.set(name, url)
    }
  }
  // Also index by product name directly from catalog
  for (const p of products) {
    const name = val(p.name)
    const img = val(p.image)
    if (name && img && typeof img === 'string') {
      productImagesByName.set(name.toLowerCase(), img)
    }
  }

  for (const section of sections) {
    const type = section.type as string

    // ── Track 1: Hero headline from source ────────────────────
    if (type === 'hero') {
      bridgeHero(section, scanContentModel, products, isHe)
    }

    // ── Track 1: Pricing/product sections ─────────────────────
    if (type === 'pricing') {
      bridgePricing(section, products, productImagesByName, isHe)
    }

    // ── Track 1: Features with product context ────────────────
    if (type === 'features') {
      bridgeFeatures(section, products, scanContentModel, isHe)
    }

    // ── Track 1: FAQ with real questions ──────────────────────
    if (type === 'faq') {
      bridgeFaq(section, scanContentModel, isHe)
    }

    // ── Track 1: Gallery with real product images ─────────────
    if (type === 'gallery') {
      bridgeGallery(section, products, productImagesByName)
    }

    // ── Track 2: Navbar from source navigation ────────────────
    if (type === 'navbar') {
      bridgeNavbar(section, scanContentModel, businessName)
    }

    // ── Track 2: Footer from source footer structure ──────────
    if (type === 'footer') {
      bridgeFooter(section, scanContentModel, businessName, isHe)
    }

    // ── Track 1: CTA sections ─────────────────────────────────
    if (type === 'cta') {
      bridgeCta(section, scanContentModel, products, isHe)
    }

    // ── Track 1: How-it-works with product names ──────────────
    if (type === 'how-it-works') {
      bridgeHowItWorks(section, products, isHe)
    }
  }

  // ── Inject missing critical sections ──────────────────────────
  injectMissingSections(sections, products, scanContentModel, productImagesByName, locale, businessName)
}

// ─── Section Bridges ────────────────────────────────────────────────

const bridgeHero = (
  section: MergedSection,
  contentModel: Record<string, unknown> | null,
  products: ScanProduct[],
  isHe: boolean,
): void => {
  // Use source H1 headline if available and high confidence
  const hero = contentModel?.hero as Record<string, unknown> | undefined
  const sourceHeadline = val<string>(hero?.headline, 70)
  if (sourceHeadline && sourceHeadline.length > 5) {
    section.headline = sourceHeadline
    section.title = sourceHeadline
  }

  // Inject product count / price range into subheadline if products exist
  if (products.length >= 2) {
    const prices = products
      .map(p => val<number>(p.price, 50))
      .filter((p): p is number => p !== null && p > 0)
      .sort((a, b) => a - b)

    if (prices.length >= 2) {
      const sub = section.subheadline as string || section.subtitle as string || ''
      if (!sub.includes('₪') && !sub.includes('NIS')) {
        const priceInfo = isHe
          ? `החל מ-${prices[0]}₪`
          : `Starting from ₪${prices[0]}`
        if (sub) {
          section.subheadline = `${sub}. ${priceInfo}`
          section.subtitle = section.subheadline
        }
      }
    }
  }

  // Use source primary CTA
  const sourceCta = val<string>(contentModel?.primaryCta, 60)
  if (sourceCta) {
    section.ctaText = sourceCta
    section.cta = { text: sourceCta, href: '#pricing' }
  }
}

const bridgePricing = (
  section: MergedSection,
  products: ScanProduct[],
  imagesByName: Map<string, string>,
  isHe: boolean,
): void => {
  if (products.length < 2) return

  const pricedProducts = products
    .filter(p => val(p.price, 40) !== null)
    .slice(0, 4)

  // If we have priced products, deterministically build pricing items
  if (pricedProducts.length >= 2) {
    const items = pricedProducts.map((p, i) => {
      const name = val<string>(p.name) || `Product ${i + 1}`
      const price = val<number>(p.price, 40)
      const originalPrice = val<number>(p.originalPrice, 40)
      const desc = val<string>(p.description, 30) || ''
      const img = imagesByName.get(name.toLowerCase()) || val<string>(p.image, 30)

      return {
        name,
        title: name,
        price: price !== null ? `₪${price}` : '',
        originalPrice: originalPrice && originalPrice !== price ? `₪${originalPrice}` : undefined,
        currency: '₪',
        description: desc,
        features: [], // AI fills these
        cta: isHe ? 'לרכישה' : 'Buy Now',
        href: val<string>(p.productUrl, 50) || '#',
        popular: i === 1,
        image: img || undefined,
        onSale: val<boolean>(p.onSale, 50) || false,
      }
    })

    section.items = items
    section.plans = items // pricing generators use 'plans'
  } else {
    // No prices but have product names — at least set names
    const items = (section.items as Record<string, unknown>[]) || (section.plans as Record<string, unknown>[]) || []
    if (items && items.length > 0) {
      for (let i = 0; i < Math.min(items.length, products.length); i++) {
        const realName = val<string>(products[i].name)
        if (realName) {
          items[i].name = realName
          items[i].title = realName
        }
      }
    }
  }
}

const bridgeFeatures = (
  section: MergedSection,
  products: ScanProduct[],
  contentModel: Record<string, unknown> | null,
  isHe: boolean,
): void => {
  // Don't overwrite features content — just ensure product names appear if mentioned
  // Features sections should describe capabilities, not product-specific content
}

const bridgeFaq = (
  section: MergedSection,
  contentModel: Record<string, unknown> | null,
  isHe: boolean,
): void => {
  const faqs = (contentModel?.faqs as FieldWithProvenance[]) || []
  if (faqs.length < 3) return

  const realQuestions = faqs
    .map(f => val<string>(f, 60))
    .filter((q): q is string => q !== null && q.length > 10)
    .slice(0, 10)

  if (realQuestions.length < 3) return

  // Check if current items already have real questions (from AI content step)
  const currentItems = (section.items as Record<string, unknown>[]) || []
  const currentQuestions = currentItems.map(i =>
    (i.question as string || i.title as string || '').trim(),
  ).filter(Boolean)

  // If current questions are generic (short, no Hebrew question marks), replace
  const isGeneric = currentQuestions.length === 0 ||
    currentQuestions.every(q => q.length < 15 || (!q.includes('?') && !q.includes('?')))

  if (isGeneric || currentItems.length === 0) {
    section.items = realQuestions.map(q => ({
      question: q,
      title: q,
      answer: '', // AI or generator provides default
      description: '',
    }))
  } else {
    // Current items have real content — overlay source questions where confidence is higher
    for (let i = 0; i < Math.min(currentItems.length, realQuestions.length); i++) {
      const currentQ = (currentItems[i].question as string || currentItems[i].title as string || '').trim()
      // Only override if current question looks generic
      if (currentQ.length < 15) {
        currentItems[i].question = realQuestions[i]
        currentItems[i].title = realQuestions[i]
      }
    }
  }
}

const bridgeGallery = (
  section: MergedSection,
  products: ScanProduct[],
  imagesByName: Map<string, string>,
): void => {
  const productsWithImages = products.filter(p => {
    const name = val<string>(p.name)
    return name && (imagesByName.has(name.toLowerCase()) || val(p.image, 30))
  })

  if (productsWithImages.length < 2) return

  const items = productsWithImages.slice(0, 6).map(p => {
    const name = val<string>(p.name) || ''
    const img = imagesByName.get(name.toLowerCase()) || val<string>(p.image, 30) || ''
    const category = val<string>(p.category, 30) || ''

    return {
      title: name,
      caption: name,
      description: category,
      alt: name,
      image: img,
      src: img,
    }
  })

  section.items = items
}

const bridgeNavbar = (
  section: MergedSection,
  contentModel: Record<string, unknown> | null,
  businessName: string,
): void => {
  // Set brand name
  section.brand = businessName

  // Use source navigation links if available
  const sourceNav = (contentModel?.navigation as FieldWithProvenance[]) || []
  if (sourceNav.length < 2) return

  const links = sourceNav
    .map(n => {
      const link = val<{ text: string; href: string }>(n, 60)
      return link
    })
    .filter((l): l is { text: string; href: string } => l !== null && !!l.text)
    .slice(0, 8)

  if (links.length >= 2) {
    section.links = links.map(l => ({
      label: l.text,
      text: l.text,
      href: l.href.startsWith('/') ? `#${l.text.toLowerCase().replace(/\s+/g, '-')}` : l.href,
    }))
    section.items = section.links // some generators use items for nav
  }
}

const bridgeFooter = (
  section: MergedSection,
  contentModel: Record<string, unknown> | null,
  businessName: string,
  isHe: boolean,
): void => {
  section.brand = businessName

  // Use source footer structure if available
  const sourceFooter = (contentModel?.footer as FieldWithProvenance[]) || []
  if (sourceFooter.length < 1) return

  const columns = sourceFooter
    .map(f => val<{ title: string; links: Array<{ text: string; href: string }> }>(f, 60))
    .filter((c): c is { title: string; links: Array<{ text: string; href: string }> } =>
      c !== null && !!c.title && Array.isArray(c.links),
    )

  if (columns.length >= 1) {
    section.items = columns.map(col => ({
      title: col.title,
      links: col.links.map(l => ({
        text: l.text,
        label: l.text,
        href: l.href.startsWith('/') ? '#' : l.href,
      })),
    }))
  }
}

const bridgeCta = (
  section: MergedSection,
  contentModel: Record<string, unknown> | null,
  products: ScanProduct[],
  isHe: boolean,
): void => {
  // Use source primary CTA
  const sourceCta = val<string>(contentModel?.primaryCta, 60)
  if (sourceCta) {
    section.ctaText = sourceCta
    if (section.cta && typeof section.cta === 'object') {
      (section.cta as Record<string, unknown>).text = sourceCta
    }
  }

  // Add price anchor if products have prices
  const prices = products
    .map(p => val<number>(p.price, 50))
    .filter((p): p is number => p !== null && p > 0)
    .sort((a, b) => a - b)

  if (prices.length > 0) {
    const priceText = isHe ? `החל מ-${prices[0]}₪` : `Starting from ₪${prices[0]}`
    const sub = (section.subheadline as string) || ''
    if (!sub.includes('₪')) {
      section.subheadline = sub ? `${sub} · ${priceText}` : priceText
      section.subtitle = section.subheadline
    }
  }
}

const bridgeHowItWorks = (
  section: MergedSection,
  products: ScanProduct[],
  isHe: boolean,
): void => {
  // Inject real product model names into how-it-works step descriptions
  if (products.length < 2) return

  const modelNames = products
    .map(p => val<string>(p.name))
    .filter((n): n is string => n !== null)
    .slice(0, 4)

  const items = (section.items as Record<string, unknown>[]) || []
  if (items.length > 0 && modelNames.length >= 2) {
    // Find the "choose model" step and inject real names
    for (const item of items) {
      const desc = (item.description as string) || ''
      const title = (item.title as string) || ''
      if (title.includes('בחר') || title.includes('choose') || title.includes('דגם') || title.includes('model')) {
        if (!desc.includes(modelNames[0])) {
          item.description = isHe
            ? `${modelNames.join(', ')} — ${desc}`
            : `${modelNames.join(', ')} — ${desc}`
        }
      }
    }
  }
}

// ─── Missing Section Injection ──────────────────────────────────────

const injectMissingSections = (
  sections: MergedSection[],
  products: ScanProduct[],
  contentModel: Record<string, unknown> | null,
  imagesByName: Map<string, string>,
  locale: string,
  businessName: string,
): void => {
  const isHe = locale === 'he'
  const types = new Set(sections.map(s => s.type as string))
  const footerIdx = sections.findIndex(s => s.type === 'footer')
  const insertBefore = footerIdx >= 0 ? footerIdx : sections.length

  // Inject pricing if missing and products have prices
  const pricedProducts = products.filter(p => val(p.price, 40) !== null)
  if (!types.has('pricing') && pricedProducts.length >= 2) {
    const items = pricedProducts.slice(0, 4).map((p, i) => {
      const name = val<string>(p.name) || `Product ${i + 1}`
      const price = val<number>(p.price, 40)
      const originalPrice = val<number>(p.originalPrice, 40)
      return {
        name,
        title: name,
        price: price ? `₪${price}` : '',
        originalPrice: originalPrice && originalPrice !== price ? `₪${originalPrice}` : undefined,
        currency: '₪',
        description: val<string>(p.description, 30) || '',
        features: [],
        cta: isHe ? 'בחרו דגם' : 'Choose',
        popular: i === 1,
        image: imagesByName.get(name.toLowerCase()) || val<string>(p.image, 30) || undefined,
      }
    })
    sections.splice(insertBefore, 0, {
      type: 'pricing',
      variantId: 'pricing-animated-cards',
      headline: isHe ? 'בחרו את המוצר המתאים לכם' : 'Choose Your Product',
      subheadline: isHe ? 'מגוון דגמים במחירים משתלמים' : 'Multiple models at great prices',
      items,
      plans: items,
      businessName,
      locale,
    })
  }

  // Inject FAQ if missing and real questions exist
  const faqs = (contentModel?.faqs as FieldWithProvenance[]) || []
  const realQuestions = faqs.map(f => val<string>(f, 60)).filter((q): q is string => q !== null && q.length > 10)
  if (!types.has('faq') && realQuestions.length >= 3) {
    const newFooterIdx = sections.findIndex(s => s.type === 'footer')
    const faqIdx = newFooterIdx >= 0 ? newFooterIdx : sections.length
    sections.splice(faqIdx, 0, {
      type: 'faq',
      variantId: 'faq-accordion',
      headline: isHe ? 'שאלות נפוצות' : 'Frequently Asked Questions',
      subheadline: '',
      items: realQuestions.slice(0, 10).map(q => ({
        question: q,
        title: q,
        answer: '',
        description: '',
      })),
      businessName,
      locale,
    })
  }

  // Inject gallery if missing and products have images
  const productsWithImages = products.filter(p => {
    const name = val<string>(p.name)
    return name && (imagesByName.has(name.toLowerCase()) || val(p.image, 30))
  })
  if (!types.has('gallery') && productsWithImages.length >= 3) {
    const ctaIdx = sections.findIndex(s => s.type === 'cta')
    const galIdx = ctaIdx >= 0 ? ctaIdx : (sections.findIndex(s => s.type === 'footer') >= 0 ? sections.findIndex(s => s.type === 'footer') : sections.length)
    sections.splice(galIdx, 0, {
      type: 'gallery',
      variantId: 'gallery-masonry',
      headline: isHe ? 'המוצרים שלנו' : 'Our Products',
      subheadline: '',
      items: productsWithImages.slice(0, 6).map(p => {
        const name = val<string>(p.name) || ''
        return {
          title: name,
          description: val<string>(p.category, 30) || '',
          image: imagesByName.get(name.toLowerCase()) || val<string>(p.image, 30) || '',
        }
      }),
      businessName,
      locale,
    })
  }
}
