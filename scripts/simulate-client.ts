#!/usr/bin/env npx tsx
/**
 * 🎬 Client Simulation: Redesign www.mewatch.co.il
 *
 * Simulates the complete flow a client goes through when they
 * enter a URL in the "שיבוט האתר שלי" (Clone My Site) mode.
 *
 * Since we have no outbound internet, we create realistic mock scan data
 * and feed it through the real pipeline.
 */

const BASE = 'http://localhost:3000'
const COOKIES: Record<string, string> = {}

// ── Helpers ────────────────────────────────────────────────────────────────

const log = (emoji: string, msg: string) => console.log(`${emoji} ${msg}`)
const section = (title: string) => {
  console.log('')
  console.log('━'.repeat(62))
  console.log(`📋 ${title}`)
  console.log('━'.repeat(62))
  console.log('')
}

async function api(method: string, path: string, body?: unknown) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Origin': BASE,
    'Referer': `${BASE}/dashboard/new`,
  }
  if (COOKIES.session) {
    headers['Cookie'] = `better-auth.session_token=${COOKIES.session}`
  }

  const opts: RequestInit = { method, headers }
  if (body) opts.body = JSON.stringify(body)

  log('→', `${method} ${path}`)
  if (body) {
    const preview = JSON.stringify(body).slice(0, 120)
    log('  ', `Body: ${preview}${JSON.stringify(body).length > 120 ? '...' : ''}`)
  }

  const res = await fetch(`${BASE}${path}`, opts)

  // Extract set-cookie
  const setCookie = res.headers.get('set-cookie')
  if (setCookie) {
    const match = setCookie.match(/better-auth\.session_token=([^;]+)/)
    if (match) COOKIES.session = match[1]
  }

  return res
}

async function apiJson(method: string, path: string, body?: unknown) {
  const res = await api(method, path, body)
  const data = await res.json()
  log('←', `${res.status} ${JSON.stringify(data).slice(0, 200)}`)
  return data
}

// ── Mock Scan Data for mewatch.co.il ──────────────────────────────────────

const MOCK_SCAN_GENERATION_CTX = {
  designDna: {
    designStyle: 'tech-modern',
    primaryColor: '#1a1a2e',
    secondaryColor: '#e94560',
    accentColor: '#0f3460',
    backgroundColor: '#0B0F1A',
    textColor: '#F5F5F5',
    headingFont: 'Heebo',
    bodyFont: 'Assistant',
    borderRadius: '12px',
    spacing: '4px',
  },
  sectionPlan: [
    { type: 'navbar', variant: 'floating', order: 0 },
    { type: 'hero', variant: 'fullscreen', order: 1 },
    { type: 'features', variant: 'grid', order: 2 },
    { type: 'products', variant: 'grid', order: 3 },
    { type: 'testimonials', variant: 'carousel', order: 4 },
    { type: 'about', variant: 'split', order: 5 },
    { type: 'faq', variant: 'accordion', order: 6 },
    { type: 'contact', variant: 'split-form', order: 7 },
    { type: 'footer', variant: 'multi-column', order: 8 },
  ],
  contentGuidelines: {
    tone: 'professional, premium, tech-savvy',
    formality: 'neutral',
    ctaPrimary: 'קנו עכשיו',
    ctaSecondary: ['צפו בקולקציה', 'דברו עם מומחה'],
    trustElements: [
      'יבואן רשמי',
      'אחריות מלאה',
      'משלוח חינם',
      '5 testimonials detected',
    ],
  },
  rebuildPlan: {
    preserve: ['brand colors', 'product catalog', 'trust elements', 'navigation'],
    improve: ['mobile experience', 'page speed', 'SEO structure', 'visual hierarchy'],
    add: ['FAQ section', 'comparison table', 'newsletter signup'],
    remove: ['outdated banners', 'broken social links'],
  },
  siteName: 'MeWatch',
  businessType: 'ecommerce',
  industry: 'ecommerce',
}

const MOCK_CONTENT_CATALOG = {
  products: [
    {
      name: { value: 'Apple Watch Ultra 2', confidence: 0.95 },
      price: { value: '₪3,499', confidence: 0.9 },
      originalPrice: { value: '₪3,899', confidence: 0.85 },
      currency: { value: 'ILS', confidence: 1.0 },
      description: { value: 'שעון חכם מתקדם עם GPS דו-תדר, עמידות צלילה, ומסך בהיר במיוחד', confidence: 0.9 },
      image: { value: 'https://mewatch.co.il/images/apple-watch-ultra2.jpg', confidence: 0.95 },
      category: { value: 'Apple Watch', confidence: 0.95 },
    },
    {
      name: { value: 'Samsung Galaxy Watch 6 Classic', confidence: 0.95 },
      price: { value: '₪1,699', confidence: 0.9 },
      originalPrice: { value: '₪1,999', confidence: 0.85 },
      currency: { value: 'ILS', confidence: 1.0 },
      description: { value: 'שעון חכם עם לוח פיזי מסתובב, מדידת לחץ דם, ומעקב שינה מתקדם', confidence: 0.9 },
      image: { value: 'https://mewatch.co.il/images/galaxy-watch6.jpg', confidence: 0.95 },
      category: { value: 'Samsung Galaxy Watch', confidence: 0.95 },
    },
    {
      name: { value: 'Garmin Venu 3', confidence: 0.95 },
      price: { value: '₪2,199', confidence: 0.9 },
      originalPrice: { value: '₪2,499', confidence: 0.8 },
      currency: { value: 'ILS', confidence: 1.0 },
      description: { value: 'שעון ספורט מתקדם עם GPS, מוניטור דופק, ועד 14 ימי סוללה', confidence: 0.9 },
      image: { value: 'https://mewatch.co.il/images/garmin-venu3.jpg', confidence: 0.95 },
      category: { value: 'Garmin', confidence: 0.95 },
    },
    {
      name: { value: 'Xiaomi Watch S3', confidence: 0.9 },
      price: { value: '₪899', confidence: 0.9 },
      originalPrice: { value: '₪1,099', confidence: 0.85 },
      currency: { value: 'ILS', confidence: 1.0 },
      description: { value: 'שעון חכם עם לוניות מתחלפות, GPS מובנה, ו-150+ מצבי אימון', confidence: 0.85 },
      image: { value: 'https://mewatch.co.il/images/xiaomi-s3.jpg', confidence: 0.9 },
      category: { value: 'Xiaomi', confidence: 0.9 },
    },
    {
      name: { value: 'Apple Watch SE 2', confidence: 0.95 },
      price: { value: '₪1,249', confidence: 0.9 },
      currency: { value: 'ILS', confidence: 1.0 },
      description: { value: 'כל מה שאתם צריכים בשעון חכם — מעקב בריאות, כושר, והתראות חירום', confidence: 0.9 },
      image: { value: 'https://mewatch.co.il/images/apple-watch-se2.jpg', confidence: 0.95 },
      category: { value: 'Apple Watch', confidence: 0.95 },
    },
  ],
  categories: [
    { name: 'Apple Watch', count: 5 },
    { name: 'Samsung Galaxy Watch', count: 4 },
    { name: 'Garmin', count: 6 },
    { name: 'Xiaomi', count: 3 },
    { name: 'אביזרים', count: 12 },
  ],
}

const MOCK_SOURCE_CONTENT_MODEL = {
  faqs: [
    { value: 'מה ההבדל בין Apple Watch Ultra ל-Apple Watch רגיל?' },
    { value: 'האם יש אחריות על השעונים?' },
    { value: 'כמה זמן משלוח?' },
    { value: 'האם אפשר להחזיר מוצר?' },
    { value: 'איך בוחרים שעון חכם שמתאים לי?' },
  ],
  navigation: [
    { text: 'דף הבית', href: '/' },
    { text: 'Apple Watch', href: '/apple-watch' },
    { text: 'Samsung', href: '/samsung' },
    { text: 'Garmin', href: '/garmin' },
    { text: 'אביזרים', href: '/accessories' },
    { text: 'מבצעים', href: '/deals' },
    { text: 'צור קשר', href: '/contact' },
  ],
  footerColumns: [
    {
      title: 'קטגוריות',
      links: [
        { text: 'Apple Watch', href: '/apple-watch' },
        { text: 'Samsung Galaxy Watch', href: '/samsung' },
        { text: 'Garmin', href: '/garmin' },
        { text: 'Xiaomi', href: '/xiaomi' },
      ],
    },
    {
      title: 'שירות לקוחות',
      links: [
        { text: 'משלוחים והחזרות', href: '/shipping' },
        { text: 'אחריות', href: '/warranty' },
        { text: 'שאלות נפוצות', href: '/faq' },
        { text: 'צור קשר', href: '/contact' },
      ],
    },
    {
      title: 'אודות',
      links: [
        { text: 'הסיפור שלנו', href: '/about' },
        { text: 'תנאי שימוש', href: '/terms' },
        { text: 'מדיניות פרטיות', href: '/privacy' },
      ],
    },
  ],
  heroImage: 'https://mewatch.co.il/images/hero-banner.jpg',
  ctas: [
    { text: 'קנו עכשיו', href: '/shop' },
    { text: 'צפו בקולקציה', href: '/collection' },
  ],
}

const MOCK_SITE_CONTENT_MODEL = {
  pages: [
    {
      path: '/',
      title: 'MeWatch - שעונים חכמים | יבואן רשמי',
      images: [
        { src: 'https://mewatch.co.il/images/hero-banner.jpg', alt: 'MeWatch Hero Banner' },
        { src: 'https://mewatch.co.il/images/apple-watch-ultra2.jpg', alt: 'Apple Watch Ultra 2' },
        { src: 'https://mewatch.co.il/images/galaxy-watch6.jpg', alt: 'Galaxy Watch 6' },
        { src: 'https://mewatch.co.il/images/garmin-venu3.jpg', alt: 'Garmin Venu 3' },
      ],
      products: MOCK_CONTENT_CATALOG.products.map(p => ({
        name: p.name.value,
        price: p.price.value,
        image: p.image.value,
      })),
    },
    {
      path: '/apple-watch',
      title: 'Apple Watch - כל הדגמים | MeWatch',
      images: [
        { src: 'https://mewatch.co.il/images/apple-watch-ultra2.jpg', alt: 'Apple Watch Ultra 2' },
        { src: 'https://mewatch.co.il/images/apple-watch-se2.jpg', alt: 'Apple Watch SE 2' },
      ],
    },
    {
      path: '/about',
      title: 'אודות MeWatch - הסיפור שלנו',
      images: [
        { src: 'https://mewatch.co.il/images/store.jpg', alt: 'חנות MeWatch' },
      ],
    },
  ],
}

// ── Main Flow ─────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║  🎬 סימולציית לקוח — Redesign www.mewatch.co.il           ║')
  console.log('║  Mode 3: שיבוט האתר שלי (self_owned + copy)              ║')
  console.log('╚══════════════════════════════════════════════════════════════╝')

  // ── STEP 1: Register + Login ──
  section('שלב 1/5: רישום + התחברות')

  const email = `mewatch-test-${Date.now()}@example.com`
  const regRes = await api('POST', '/api/auth/sign-up/email', {
    name: 'MeWatch Owner',
    email,
    password: 'SecurePass123!',
  })
  const regData = await regRes.json()
  log('←', `Register: ${regRes.status} — User ID: ${regData?.user?.id || 'N/A'}`)

  // Verify session
  const sessRes = await apiJson('GET', '/api/auth/get-session')
  const userId = sessRes?.user?.id
  if (!userId) {
    log('❌', 'Auth failed — cannot proceed')
    process.exit(1)
  }
  log('✅', `Logged in as: ${sessRes.user.name} (${userId})`)

  // ── STEP 2: Check Scan Cache ──
  section('שלב 2/5: בדיקת סריקה קיימת')

  const checkRes = await apiJson('GET', '/api/scan/check?url=https://www.mewatch.co.il')
  log('📋', `Scan cache: ${checkRes?.ok ? 'Found existing scan' : 'No previous scan — need fresh scan'}`)

  // ── STEP 3: Deep Scan (Simulated) ──
  section('שלב 3/5: סריקה מעמיקה (Mock — אין גישת אינטרנט)')

  log('🔍', 'Simulating deep scan of https://www.mewatch.co.il ...')
  log('  ', '')

  // Simulate the 7 scan phases
  const scanPhases = [
    { phase: 'discovery', description: 'Crawling homepage + 5 internal pages', duration: 8 },
    { phase: 'visual-dna', description: 'Extracting colors, fonts, spacing', duration: 3 },
    { phase: 'components', description: 'Detecting reusable patterns', duration: 2 },
    { phase: 'content', description: 'Extracting text, images, products', duration: 5 },
    { phase: 'brand-intelligence', description: 'Analyzing brand positioning', duration: 3 },
    { phase: 'technical', description: 'SEO, performance, accessibility', duration: 2 },
    { phase: 'strategic-insights', description: 'Formulating rebuild strategy', duration: 3 },
  ]

  for (const p of scanPhases) {
    const start = Date.now()
    log('  ', `[${p.phase}] ${p.description}...`)
    await new Promise(r => setTimeout(r, 300)) // Small delay for visual effect
    log('  ', `[${p.phase}] ✅ Done (${p.duration}s simulated)`)
  }

  log('', '')
  log('📊', 'Scan Results Summary:')
  log('  ', `🏢 Business: ${MOCK_SCAN_GENERATION_CTX.siteName} (${MOCK_SCAN_GENERATION_CTX.industry})`)
  log('  ', `🎨 Design: ${MOCK_SCAN_GENERATION_CTX.designDna.designStyle}`)
  log('  ', `   Primary: ${MOCK_SCAN_GENERATION_CTX.designDna.primaryColor} | Secondary: ${MOCK_SCAN_GENERATION_CTX.designDna.secondaryColor}`)
  log('  ', `   Fonts: ${MOCK_SCAN_GENERATION_CTX.designDna.headingFont} / ${MOCK_SCAN_GENERATION_CTX.designDna.bodyFont}`)
  log('  ', `📦 Sections: ${MOCK_SCAN_GENERATION_CTX.sectionPlan.length} detected`)
  for (const s of MOCK_SCAN_GENERATION_CTX.sectionPlan) {
    log('  ', `   → ${s.type} (${s.variant})`)
  }
  log('  ', `🛍️  Products: ${MOCK_CONTENT_CATALOG.products.length} found`)
  for (const p of MOCK_CONTENT_CATALOG.products) {
    log('  ', `   → ${p.name.value} — ${p.price.value}${p.originalPrice ? ` (was ${p.originalPrice.value})` : ''}`)
  }
  log('  ', `❓ FAQs: ${MOCK_SOURCE_CONTENT_MODEL.faqs.length} questions`)
  log('  ', `🧭 Navigation: ${MOCK_SOURCE_CONTENT_MODEL.navigation.length} items`)

  // ── STEP 4: Save Scan Artifacts to DB (mimicking what deep-scan route does) ──
  section('שלב 4/5: שמירת תוצאות סריקה + הפעלת Pipeline')

  log('💾', 'Saving scan artifacts to DB...')

  // We need to create a generation job for the scan, then save artifacts
  // The pipeline will load these artifacts by scanJobId
  // Instead, we'll pass deepScanData directly to the pipeline (which is how the frontend does it)

  log('🚀', 'Triggering generation pipeline...')
  log('  ', 'POST /api/ai/pipeline (SSE Stream)')
  log('  ', '{')
  log('  ', '  description: "https://www.mewatch.co.il",')
  log('  ', '  locale: "he",')
  log('  ', '  scanMode: "copy",')
  log('  ', '  sourceOwnership: "self_owned",')
  log('  ', '  deepScanData: { ...scanResult, _source: "deep-scan-v2" }')
  log('  ', '}')
  log('', '')

  const pipelineBody = {
    description: 'https://www.mewatch.co.il',
    locale: 'he',
    scanMode: 'copy',
    sourceOwnership: 'self_owned',
    deepScanData: {
      ...MOCK_SCAN_GENERATION_CTX,
      url: 'https://www.mewatch.co.il',
      businessName: MOCK_SCAN_GENERATION_CTX.siteName,
      _source: 'deep-scan-v2',
    },
    discoveryContext: {
      business_name: 'MeWatch',
      industry: 'ecommerce',
      target_audience: 'חובבי טכנולוגיה וגאדג\'טים בישראל, גילאי 25-45',
      services: 'מכירת שעונים חכמים מכל המותגים המובילים',
      unique_value: 'יבואן רשמי, אחריות מלאה, משלוח חינם, מומחיות בשעונים חכמים',
      design_direction: 'מודרני, טכנולוגי, פרימיום — חווית קנייה יוקרתית',
    },
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cookie': `better-auth.session_token=${COOKIES.session}`,
  }

  const startTime = Date.now()

  try {
    const pipelineRes = await fetch(`${BASE}/api/ai/pipeline`, {
      method: 'POST',
      headers,
      body: JSON.stringify(pipelineBody),
    })

    log('←', `Pipeline response: ${pipelineRes.status} ${pipelineRes.headers.get('content-type')}`)
    log('', '')

    if (!pipelineRes.ok) {
      const errText = await pipelineRes.text()
      log('❌', `Pipeline error: ${errText.slice(0, 300)}`)
      return
    }

    // Read SSE stream
    log('📡', 'Reading SSE stream events:')
    log('', '')

    const reader = pipelineRes.body?.getReader()
    if (!reader) {
      log('❌', 'No response body')
      return
    }

    const decoder = new TextDecoder()
    let buffer = ''
    let lastPhase = ''
    let jobId = ''
    let siteId = ''
    let htmlSize = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // Parse SSE events
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // Keep incomplete line

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue

        try {
          const data = JSON.parse(line.slice(6))
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
          const phase = data.phase || 'unknown'

          if (phase !== lastPhase) {
            if (lastPhase) log('', '')
            log('📌', `━━━ Phase: ${phase.toUpperCase()} (${elapsed}s) ━━━`)
            lastPhase = phase
          }

          // Log event details
          if (data.phase === 'init') {
            jobId = data.jobId || ''
            siteId = data.siteId || ''
            log('  ', `Job: ${jobId}`)
            log('  ', `Site: ${siteId}`)
            log('  ', `Name: ${data.siteName}`)
          } else if (data.phase === 'strategy') {
            log('  ', `Status: ${data.status || data.step || ''}`)
            if (data.scanMode) log('  ', `Mode: ${data.scanMode} (scan-derived, skipping AI)`)
            if (data.data) {
              const d = data.data as Record<string, unknown>
              log('  ', `Industry: ${d.industry || '?'}`)
              log('  ', `Tone: ${d.contentTone || d.brandPersonality || '?'}`)
            }
          } else if (data.phase === 'design') {
            log('  ', `Status: ${data.status || ''}`)
            if (data.agent) log('  ', `Agent: ${data.agent}`)
            if (data.upgrades) log('  ', `Premium upgrades: ${JSON.stringify(data.upgrades).slice(0, 100)}`)
            if (data.data) {
              const d = data.data as Record<string, unknown>
              const sections = d.sections as unknown[] || []
              log('  ', `Sections designed: ${sections.length}`)
            }
          } else if (data.phase === 'content') {
            log('  ', `Status: ${data.status || ''}`)
            if (data.chunks) log('  ', `Processing ${data.chunks} chunks`)
            if (data.chunk) log('  ', `Chunk ${data.chunk}/${data.total} done`)
          } else if (data.phase === 'images') {
            log('  ', `Status: ${data.status || ''}`)
            if (data.count) log('  ', `Images: ${data.count}`)
            if (data.reason) log('  ', `Reason: ${data.reason}`)
          } else if (data.phase === 'build') {
            log('  ', `Status: ${data.status || ''}`)
            if (data.html) {
              htmlSize = data.html.length
              log('  ', `HTML generated: ${(htmlSize / 1024).toFixed(1)} KB`)
            }
            if (data.pageCount) log('  ', `Inner pages: ${data.pageCount}`)
          } else if (data.phase === 'qa') {
            log('  ', `Status: ${data.status || ''}`)
            if (data.issues) log('  ', `Issues: ${JSON.stringify(data.issues).slice(0, 150)}`)
          } else if (data.phase === 'cpo') {
            log('  ', `Status: ${data.status || ''}`)
            if (data.overall) log('  ', `Score: ${data.overall}/10`)
            if (data.scores) log('  ', `Scores: ${JSON.stringify(data.scores).slice(0, 200)}`)
          } else if (data.phase === 'complete') {
            log('  ', `🎉 Generation complete!`)
            log('  ', `Job: ${data.jobId}`)
            log('  ', `Site: ${data.siteId}`)
            if (data.html) log('  ', `Final HTML: ${(data.html.length / 1024).toFixed(1)} KB`)
            if (data.fallback) log('  ', `⚠️ Used fallback generation`)
            if (data.cpoScore) log('  ', `CPO Score: ${data.cpoScore}/10`)
          } else if (data.phase === 'error') {
            log('❌', `Error: ${data.error}`)
          } else if (data.phase === 'fallback') {
            log('⚠️', `Fallback: ${data.status} — ${data.reason || ''}`)
          } else {
            log('  ', JSON.stringify(data).slice(0, 200))
          }
        } catch {
          // Skip non-JSON lines
        }
      }
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)

    // ── STEP 5: Summary ──
    section('שלב 5/5: סיכום')

    log('⏱️', `Total time: ${totalTime}s`)
    log('🆔', `Job ID: ${jobId}`)
    log('🆔', `Site ID: ${siteId}`)
    log('📄', `HTML size: ${(htmlSize / 1024).toFixed(1)} KB`)
    log('🔗', `Editor URL: ${BASE}/editor/${siteId}`)
    log('🌐', `Published URL: ${BASE}/site/${siteId}`)

    // Check DB state
    log('', '')
    log('📊', 'Checking DB state...')

    if (siteId) {
      const siteRes = await apiJson('GET', `/api/sites/${siteId}`)
      if (siteRes?.ok) {
        const site = siteRes.data
        log('  ', `Site name: ${site.name}`)
        log('  ', `Status: ${site.status}`)
        log('  ', `Slug: ${site.slug}`)
        log('  ', `Industry: ${site.industry}`)
        log('  ', `HTML: ${site.html ? `${(site.html.length / 1024).toFixed(1)} KB` : 'N/A'}`)
      }
    }

    if (jobId) {
      const jobRes = await apiJson('GET', `/api/generation/${jobId}`)
      if (jobRes?.ok) {
        const job = jobRes.data.job
        const artifacts = jobRes.data.generationArtifacts || []
        log('  ', `Job status: ${job.status}`)
        log('  ', `Artifacts: ${artifacts.length}`)
        for (const a of artifacts) {
          log('  ', `  → ${a.artifactType} (${JSON.stringify(a.data).length} bytes)`)
        }
      }
    }

  } catch (err) {
    log('❌', `Pipeline failed: ${err}`)
  }
}

main().catch(console.error)
