/**
 * Content + Media Intelligence Layer
 *
 * Extracts structured content from raw page HTML:
 * - Text blocks (headings, paragraphs, lists)
 * - Images with context (product, hero, article, decorative)
 * - Products with full details
 * - Articles/blog posts
 * - FAQ Q&A pairs
 * - Contact info
 * - Navigation structure
 *
 * Outputs structured PageContentModel that can drive redesign.
 */

// ─── Types ──────────────────────────────────────────────────────────

export type ImageAsset = {
  src: string
  alt: string
  width?: number
  height?: number
  role: 'product' | 'hero' | 'article' | 'team' | 'logo' | 'icon' | 'decorative' | 'gallery'
  context?: string // nearby heading or product name
  pageUrl: string
}

export type TextBlock = {
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'li' | 'blockquote'
  text: string
  section?: string // detected section context
}

export type ExtractedProduct = {
  name: string
  price?: number
  originalPrice?: number
  currency?: string
  description?: string
  images: string[]
  features?: string[]
  url?: string
  category?: string
}

export type ExtractedArticle = {
  title: string
  excerpt?: string
  image?: string
  date?: string
  author?: string
  url?: string
  tags?: string[]
}

export type ExtractedFaq = {
  question: string
  answer: string
}

export type PageContentModel = {
  url: string
  path: string
  title: string
  pageType: string

  // Structured content
  headings: TextBlock[]
  paragraphs: TextBlock[]
  lists: string[][]

  // Media
  images: ImageAsset[]
  heroImage?: ImageAsset

  // Business content
  products: ExtractedProduct[]
  articles: ExtractedArticle[]
  faqs: ExtractedFaq[]

  // Contact
  phones: string[]
  emails: string[]
  addresses: string[]

  // SEO
  metaTitle?: string
  metaDescription?: string
  ogImage?: string

  // Stats
  wordCount: number
  imageCount: number
}

export type SiteContentModel = {
  pages: PageContentModel[]
  allProducts: ExtractedProduct[]
  allArticles: ExtractedArticle[]
  allFaqs: ExtractedFaq[]
  allImages: ImageAsset[]
  heroImages: ImageAsset[]
  productImages: ImageAsset[]
  siteWideContact: { phones: string[]; emails: string[]; addresses: string[] }
}

// ─── Main Extraction ────────────────────────────────────────────────

/**
 * Extract structured content from a page's raw HTML.
 * Designed to be called per-page during scan, then aggregated.
 */
export const extractPageContent = (
  html: string,
  url: string,
  path: string,
  pageType: string,
): PageContentModel => {
  const title = extractTitle(html)
  const headings = extractHeadings(html)
  const paragraphs = extractParagraphs(html)
  const lists = extractLists(html)
  const images = extractImages(html, url, headings)
  const products = extractProductsFromPage(html, url)
  const articles = extractArticlesFromPage(html, url)
  const faqs = extractFaqPairs(html)
  const contact = extractContactInfo(html)
  const seo = extractSeoMeta(html)

  const heroImage = images.find(img => img.role === 'hero') ||
    images.find(img => img.width && img.width > 600) ||
    images[0]

  return {
    url,
    path,
    title,
    pageType,
    headings,
    paragraphs,
    lists,
    images,
    heroImage,
    products,
    articles,
    faqs,
    phones: contact.phones,
    emails: contact.emails,
    addresses: contact.addresses,
    metaTitle: seo.title,
    metaDescription: seo.description,
    ogImage: seo.ogImage,
    wordCount: countWords(headings, paragraphs),
    imageCount: images.length,
  }
}

/**
 * Aggregate per-page models into a site-wide content model.
 */
export const aggregateSiteContent = (pages: PageContentModel[]): SiteContentModel => {
  const allProducts: ExtractedProduct[] = []
  const allArticles: ExtractedArticle[] = []
  const allFaqs: ExtractedFaq[] = []
  const allImages: ImageAsset[] = []
  const seenProductNames = new Set<string>()
  const seenArticleTitles = new Set<string>()
  const seenFaqQuestions = new Set<string>()
  const seenImageSrcs = new Set<string>()
  const phones = new Set<string>()
  const emails = new Set<string>()
  const addresses = new Set<string>()

  for (const page of pages) {
    // Deduplicate products
    for (const p of page.products) {
      if (!seenProductNames.has(p.name)) {
        seenProductNames.add(p.name)
        allProducts.push(p)
      }
    }
    // Deduplicate articles
    for (const a of page.articles) {
      if (!seenArticleTitles.has(a.title)) {
        seenArticleTitles.add(a.title)
        allArticles.push(a)
      }
    }
    // Deduplicate FAQs
    for (const f of page.faqs) {
      if (!seenFaqQuestions.has(f.question)) {
        seenFaqQuestions.add(f.question)
        allFaqs.push(f)
      }
    }
    // Deduplicate images
    for (const img of page.images) {
      const key = img.src.split('?')[0].split('~mv2')[0] // Normalize Wix URLs
      if (!seenImageSrcs.has(key)) {
        seenImageSrcs.add(key)
        allImages.push(img)
      }
    }
    // Aggregate contact
    page.phones.forEach(p => phones.add(p))
    page.emails.forEach(e => emails.add(e))
    page.addresses.forEach(a => addresses.add(a))
  }

  return {
    pages,
    allProducts,
    allArticles,
    allFaqs,
    allImages,
    heroImages: allImages.filter(i => i.role === 'hero' || (i.width && i.width > 800)),
    productImages: allImages.filter(i => i.role === 'product'),
    siteWideContact: {
      phones: [...phones],
      emails: [...emails],
      addresses: [...addresses],
    },
  }
}

// ─── Extraction Helpers ─────────────────────────────────────────────

const extractTitle = (html: string): string => {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch) {
    return titleMatch[1]
      .replace(/&[^;]+;/g, ' ')
      .replace(/\s*[|–—-]\s*[^|–—-]+$/, '') // Remove SEO suffix
      .trim()
  }
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
  return h1Match ? h1Match[1].replace(/&[^;]+;/g, ' ').trim() : ''
}

const extractHeadings = (html: string): TextBlock[] => {
  const headings: TextBlock[] = []
  const regex = /<(h[1-4])[^>]*>([\s\S]*?)<\/\1>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    const text = stripTags(match[2]).trim()
    if (text && text.length > 2 && text.length < 200 && text !== '​') {
      headings.push({
        tag: match[1].toLowerCase() as TextBlock['tag'],
        text,
      })
    }
  }
  return headings
}

const extractParagraphs = (html: string): TextBlock[] => {
  const paragraphs: TextBlock[] = []
  const regex = /<p[^>]*>([\s\S]*?)<\/p>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    const text = stripTags(match[1]).trim()
    if (text && text.length > 20 && text.length < 2000) {
      paragraphs.push({ tag: 'p', text })
    }
  }
  return paragraphs.slice(0, 50) // Cap to avoid memory issues
}

const extractLists = (html: string): string[][] => {
  const lists: string[][] = []
  const ulRegex = /<ul[^>]*>([\s\S]*?)<\/ul>/gi
  let match
  while ((match = ulRegex.exec(html)) !== null) {
    const items: string[] = []
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi
    let li
    while ((li = liRegex.exec(match[1])) !== null) {
      const text = stripTags(li[1]).trim()
      if (text && text.length > 3) items.push(text)
    }
    if (items.length >= 2) lists.push(items)
  }
  return lists.slice(0, 10)
}

const extractImages = (html: string, pageUrl: string, headings: TextBlock[]): ImageAsset[] => {
  const images: ImageAsset[] = []
  const seen = new Set<string>()

  // Match <img> tags
  const imgRegex = /<img[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi
  let match
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1]
    if (!src || src.startsWith('data:image/svg') || src.includes('pixel') || src.includes('spacer')) continue

    const baseKey = src.split('?')[0].split('~mv2')[0]
    if (seen.has(baseKey)) continue
    seen.add(baseKey)

    const fullTag = match[0]
    const alt = (fullTag.match(/alt=["']([^"']*)["']/i) || [])[1] || ''
    const widthMatch = fullTag.match(/width=["']?(\d+)/i) || src.match(/w_(\d+)/)
    const heightMatch = fullTag.match(/height=["']?(\d+)/i) || src.match(/h_(\d+)/)
    const width = widthMatch ? parseInt(widthMatch[1]) : undefined
    const height = heightMatch ? parseInt(heightMatch[1]) : undefined

    // Skip tiny images (icons, spacers)
    if (width && width < 50) continue
    if (height && height < 50) continue

    // Determine role
    const role = classifyImageRole(src, alt, width, height, fullTag, pageUrl)

    // Find context from nearby heading
    const imgPos = match.index
    const nearbyHeading = headings.find(h => {
      const hPos = html.indexOf(h.text)
      return hPos > 0 && Math.abs(hPos - imgPos) < 2000
    })

    const absoluteSrc = resolveUrl(src, pageUrl)

    images.push({
      src: absoluteSrc,
      alt,
      width,
      height,
      role,
      context: nearbyHeading?.text || alt,
      pageUrl,
    })
  }

  // Also extract CSS background images (hero banners)
  const bgRegex = /background(?:-image)?:\s*url\(["']?([^)"']+)["']?\)/gi
  while ((match = bgRegex.exec(html)) !== null) {
    const src = match[1]
    if (!src || src.startsWith('data:') || src.includes('gradient')) continue
    const baseKey = src.split('?')[0]
    if (seen.has(baseKey)) continue
    seen.add(baseKey)

    const absoluteSrc = resolveUrl(src, pageUrl)
    images.push({
      src: absoluteSrc,
      alt: '',
      role: 'hero',
      pageUrl,
    })
  }

  return images.slice(0, 30) // Cap per page
}

const classifyImageRole = (
  src: string, alt: string, width?: number, height?: number, tag?: string, pageUrl?: string
): ImageAsset['role'] => {
  const srcLower = src.toLowerCase()
  const altLower = alt.toLowerCase()

  // Logo detection
  if (altLower.includes('logo') || srcLower.includes('logo')) return 'logo'

  // Product image patterns
  if (srcLower.includes('product') || srcLower.includes('mewatch') || srcLower.includes('watch') || srcLower.includes('tab')) {
    return 'product'
  }
  if (/K\d+|Ultra|Light|Prime|Tab\d/i.test(alt)) return 'product'

  // Hero images (large, first on page)
  if (width && width > 800) return 'hero'
  if (srcLower.includes('hero') || srcLower.includes('banner')) return 'hero'

  // Article/blog images
  if (srcLower.includes('blog') || srcLower.includes('article') || srcLower.includes('post')) return 'article'

  // Team member photos
  if (altLower.includes('team') || altLower.includes('founder') || altLower.includes('ceo')) return 'team'

  // Icon detection (small SVG or tiny images)
  if (srcLower.endsWith('.svg') || (width && width < 80)) return 'icon'

  // Gallery images (medium-large without specific role)
  if (width && width > 300) return 'gallery'

  return 'decorative'
}

const extractProductsFromPage = (html: string, url: string): ExtractedProduct[] => {
  const products: ExtractedProduct[] = []

  // Strategy 1: JSON-LD Product
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1])
      if (data['@type'] === 'Product') {
        const offers = data.offers || {}
        products.push({
          name: data.name || '',
          price: offers.price ? parseFloat(offers.price) : undefined,
          currency: offers.priceCurrency || '₪',
          description: data.description || '',
          images: [data.image].flat().filter(Boolean),
          url,
        })
      }
    } catch { /* invalid JSON-LD */ }
  }

  // Strategy 2: Wix product data attributes
  const wixPriceMatch = html.match(/data-wix-price="([0-9,.]+)"/i)
  const wixOriginalMatch = html.match(/data-wix-original-price="([0-9,.]+)"/i)
  if (wixPriceMatch && products.length === 0) {
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
    products.push({
      name: titleMatch ? stripTags(titleMatch[1]).trim() : '',
      price: parseFloat(wixPriceMatch[1].replace(',', '')),
      originalPrice: wixOriginalMatch ? parseFloat(wixOriginalMatch[1].replace(',', '')) : undefined,
      currency: '₪',
      images: [],
      url,
    })
  }

  // Strategy 3: JSON price in script tags
  if (products.length === 0) {
    const jsonPriceMatch = html.match(/"price"\s*:\s*([0-9.]+)/i)
    if (jsonPriceMatch) {
      const nameMatch = html.match(/"name"\s*:\s*"([^"]+)"/i) || html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
      products.push({
        name: nameMatch ? stripTags(nameMatch[1]).trim() : '',
        price: parseFloat(jsonPriceMatch[1]),
        currency: '₪',
        images: [],
        url,
      })
    }
  }

  return products
}

const extractArticlesFromPage = (html: string, pageUrl: string): ExtractedArticle[] => {
  const articles: ExtractedArticle[] = []

  // Look for article-like cards (common blog index pattern)
  // <article> or <div class="...post..."> with h2/h3 + p + img
  const articleRegex = /<(?:article|div)[^>]*(?:class="[^"]*(?:post|article|blog|card)[^"]*")[^>]*>([\s\S]*?)<\/(?:article|div)>/gi
  let match
  while ((match = articleRegex.exec(html)) !== null) {
    const block = match[1]
    const titleMatch = block.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i)
    if (!titleMatch) continue

    const title = stripTags(titleMatch[1]).trim()
    if (!title || title.length < 5) continue

    const excerptMatch = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
    const imgMatch = block.match(/<img[^>]*src=["']([^"']+)["']/i)
    const linkMatch = block.match(/<a[^>]*href=["']([^"']+)["']/i)
    const dateMatch = block.match(/<time[^>]*>([^<]+)<\/time>/i) ||
      block.match(/(\d{1,2}[./]\d{1,2}[./]\d{2,4})/)

    articles.push({
      title,
      excerpt: excerptMatch ? stripTags(excerptMatch[1]).trim().slice(0, 200) : undefined,
      image: imgMatch ? resolveUrl(imgMatch[1], pageUrl) : undefined,
      date: dateMatch ? dateMatch[1].trim() : undefined,
      url: linkMatch ? resolveUrl(linkMatch[1], pageUrl) : undefined,
    })
  }

  return articles.slice(0, 20)
}

const extractFaqPairs = (html: string): ExtractedFaq[] => {
  const faqs: ExtractedFaq[] = []

  // Strategy 1: Schema.org FAQ
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1])
      if (data['@type'] === 'FAQPage' && data.mainEntity) {
        for (const item of data.mainEntity) {
          if (item.name && item.acceptedAnswer?.text) {
            faqs.push({
              question: item.name,
              answer: stripTags(item.acceptedAnswer.text).trim(),
            })
          }
        }
      }
    } catch { /* invalid JSON-LD */ }
  }

  // Strategy 2: Heading pairs — H3 question followed by next p/div
  if (faqs.length === 0) {
    // Find FAQ section
    const faqSectionMatch = html.match(/(?:שאלות נפוצות|FAQ|שאלות ותשובות)([\s\S]{0,10000}?)(?=<(?:footer|section|div[^>]*class="[^"]*footer)|$)/i)
    if (faqSectionMatch) {
      const faqHtml = faqSectionMatch[1]
      const qRegex = /<h[34][^>]*>([\s\S]*?)<\/h[34]>/gi
      const questions: { text: string; pos: number }[] = []
      let q
      while ((q = qRegex.exec(faqHtml)) !== null) {
        const text = stripTags(q[1]).trim()
        if (text && text.length > 10 && text.includes('?')) {
          questions.push({ text, pos: q.index + q[0].length })
        }
      }

      for (let i = 0; i < questions.length; i++) {
        const start = questions[i].pos
        const end = i + 1 < questions.length ? questions[i + 1].pos - 100 : start + 2000
        const answerHtml = faqHtml.slice(start, end)
        const answerMatch = answerHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
        faqs.push({
          question: questions[i].text,
          answer: answerMatch ? stripTags(answerMatch[1]).trim().slice(0, 500) : '',
        })
      }
    }
  }

  return faqs.slice(0, 20)
}

const extractContactInfo = (html: string): { phones: string[]; emails: string[]; addresses: string[] } => {
  const phones: string[] = []
  const emails: string[] = []
  const addresses: string[] = []

  // Phone patterns (Israeli + international)
  const phoneRegex = /(?:0[2-9]\d{1,2}[-.]?\d{7}|(?:\+972|972)[-.]?\d{1,2}[-.]?\d{7}|\d{2,3}[-.]?\d{3}[-.]?\d{4})/g
  const phoneMatches = html.match(phoneRegex) || []
  const seenPhones = new Set<string>()
  for (const p of phoneMatches) {
    const normalized = p.replace(/[-.\s]/g, '')
    if (!seenPhones.has(normalized) && normalized.length >= 9) {
      seenPhones.add(normalized)
      phones.push(p)
    }
  }

  // Email patterns
  const emailRegex = /[\w.+-]+@[\w-]+\.[\w.]+/g
  const emailMatches = html.match(emailRegex) || []
  const seenEmails = new Set<string>()
  for (const e of emailMatches) {
    if (!seenEmails.has(e) && !e.includes('wix') && !e.includes('sentry') && !e.includes('cloudflare')) {
      seenEmails.add(e)
      emails.push(e)
    }
  }

  return { phones: phones.slice(0, 5), emails: emails.slice(0, 5), addresses: addresses.slice(0, 3) }
}

const extractSeoMeta = (html: string): { title?: string; description?: string; ogImage?: string } => {
  const title = (html.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1]?.trim()
  const desc = (html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)/i) || [])[1]?.trim()
  const ogImage = (html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)/i) || [])[1]?.trim()
  return { title, description: desc, ogImage }
}

// ─── Utility ────────────────────────────────────────────────────────

const stripTags = (html: string): string =>
  html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, ' ').replace(/\s+/g, ' ')

const countWords = (headings: TextBlock[], paragraphs: TextBlock[]): number =>
  [...headings, ...paragraphs].reduce((acc, b) => acc + b.text.split(/\s+/).length, 0)

const resolveUrl = (src: string, pageUrl: string): string => {
  if (src.startsWith('http')) return src
  if (src.startsWith('//')) return `https:${src}`
  try {
    return new URL(src, pageUrl).href
  } catch {
    return src
  }
}
