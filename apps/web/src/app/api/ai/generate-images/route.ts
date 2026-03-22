import { NextResponse } from 'next/server'

/** Vercel: allow up to 60s for parallel image generation */
export const maxDuration = 60

const IMAGEN_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict'

/** Sections that require generated images and their aspect ratios */
const SECTION_IMAGE_CONFIG: Record<string, { aspectRatio: string; count: number }> = {
  hero: { aspectRatio: '16:9', count: 1 },
  features: { aspectRatio: '1:1', count: 1 },
  about: { aspectRatio: '16:9', count: 1 },
  gallery: { aspectRatio: '4:3', count: 3 },
  portfolio: { aspectRatio: '4:3', count: 2 },
  team: { aspectRatio: '1:1', count: 2 },
  blog: { aspectRatio: '16:9', count: 2 },
}

/** Max images per request to avoid Vercel timeout */
const MAX_IMAGES_PER_REQUEST = 5

type ColorPalette = {
  primary?: string
  secondary?: string
  background?: string
}

type SectionInput = {
  type: string
  title?: string
  imagePrompt?: string
}

type RequestBody = {
  businessName: string
  businessType: string
  locale?: string
  colorPalette?: ColorPalette
  sections: SectionInput[]
}

/**
 * Determine a color mood string from a hex color palette.
 * Used to guide image prompt atmosphere.
 */
const getColorMood = (palette?: ColorPalette): string => {
  if (!palette?.primary) return 'clean bright'

  const hex = palette.primary.toLowerCase()

  // Warm colors
  if (hex.includes('8b') || hex.includes('d2') || hex.includes('cd') ||
      hex.includes('f5') || hex.includes('ef') || hex.includes('e6')) {
    return 'warm golden'
  }

  // Cool colors
  if (hex.includes('06') || hex.includes('38') || hex.includes('0e') ||
      hex.includes('3a') || hex.includes('7c') || hex.includes('06b')) {
    return 'cool blue'
  }

  // Dark colors
  if (hex.includes('0b') || hex.includes('1a') || hex.includes('11') ||
      hex.startsWith('#0') || hex.startsWith('#1') || hex.startsWith('#2')) {
    return 'dramatic moody'
  }

  return 'clean bright'
}

const PROMPT_SUFFIX = 'professional photography, high quality, no text, no watermarks'

/**
 * Build an image generation prompt for a given section role.
 */
/** Industry-specific image descriptions for much better results */
const INDUSTRY_VISUALS: Record<string, { hero: string; about: string; gallery: string }> = {
  'real-estate': {
    hero: 'luxury modern apartment interior, floor-to-ceiling windows with city skyline view, marble floors, designer furniture, golden hour lighting',
    about: 'professional real estate agent showing luxury property to couple, elegant office setting',
    gallery: 'stunning architectural photography of luxury residence, clean lines, premium finishes',
  },
  'restaurant': {
    hero: 'beautiful restaurant interior, warm ambient lighting, elegantly plated gourmet dish in foreground, cozy atmosphere',
    about: 'chef preparing food in professional kitchen, fresh ingredients on counter, steam rising',
    gallery: 'artistic food photography, gourmet dish beautifully plated on elegant tableware',
  },
  'ecommerce': {
    hero: 'premium product display on minimalist surface, dramatic lighting, luxury packaging',
    about: 'modern warehouse with organized shelving, team packing orders with care',
    gallery: 'product lifestyle photography, premium item in aspirational setting',
  },
  'beauty-salon': {
    hero: 'luxurious spa treatment room, soft lighting, orchids, clean white towels, serene atmosphere',
    about: 'professional aesthetician performing facial treatment, modern clinic interior',
    gallery: 'close-up of skincare treatment, glowing skin, professional beauty tools',
  },
  'law': {
    hero: 'prestigious law firm office, mahogany desk, legal books on shelves, city view through large windows',
    about: 'professional lawyers in meeting room discussing case, modern corporate interior',
    gallery: 'scales of justice on desk, legal documents, premium office details',
  },
  'saas': {
    hero: 'futuristic dashboard interface floating in dark space, glowing data visualizations, holographic UI elements',
    about: 'diverse tech team collaborating in modern open office, screens with code and analytics',
    gallery: 'sleek software interface on laptop screen, modern workspace, clean design',
  },
  'digital-marketing': {
    hero: 'digital marketing analytics dashboard with growth charts, multiple screens showing social media metrics, modern office',
    about: 'creative marketing team brainstorming with sticky notes and screens showing campaigns',
    gallery: 'social media campaign visuals, engagement metrics on screen, creative workspace',
  },
  'fitness': {
    hero: 'modern gym interior with premium equipment, dramatic lighting, motivational atmosphere',
    about: 'personal trainer working with client, professional fitness studio',
    gallery: 'athlete in action, dynamic fitness photography, energy and movement',
  },
  'watches': {
    hero: 'luxury watch display in elegant glass case, dramatic spotlight lighting, velvet background, close-up showing craftsmanship details',
    about: 'master watchmaker examining timepiece with loupe, workshop with precision tools',
    gallery: 'luxury wristwatch on elegant wrist, lifestyle photography, premium timepiece close-up showing dial details',
  },
}

const buildPrompt = (
  role: string,
  businessName: string,
  businessType: string,
  colorMood: string,
  primary?: string,
  secondary?: string,
  customPrompt?: string,
  sectionTitle?: string,
): string => {
  if (customPrompt) {
    return `${customPrompt}, ${PROMPT_SUFFIX}`
  }

  // Try to find industry-specific visuals
  const industry = INDUSTRY_VISUALS[businessType] || null
  const titleHint = sectionTitle ? `, related to "${sectionTitle}"` : ''

  switch (role) {
    case 'hero':
      return industry
        ? `${industry.hero}, ${colorMood} atmosphere, ${PROMPT_SUFFIX}`
        : `${businessName}: premium ${businessType} showcase, ${colorMood} atmosphere, stunning interior or product display, cinematic lighting, ${PROMPT_SUFFIX}`

    case 'about':
      return industry
        ? `${industry.about}, ${PROMPT_SUFFIX}`
        : `professional team of ${businessName} in their ${businessType} workspace, candid moment, warm lighting${titleHint}, ${PROMPT_SUFFIX}`

    case 'features':
      return `abstract minimalist illustration representing ${businessType} services, gradient from ${primary ?? '#7C3AED'} to ${secondary ?? '#06B6D4'}, modern geometric design, ${PROMPT_SUFFIX}`

    case 'gallery':
      return industry
        ? `${industry.gallery}${titleHint}, ${PROMPT_SUFFIX}`
        : `${businessName} ${businessType} product or service in premium setting, detail shot${titleHint}, ${PROMPT_SUFFIX}`

    case 'portfolio':
      return `${businessType} project showcase, professional result photography${titleHint}, ${PROMPT_SUFFIX}`

    case 'team':
      return `professional headshot portrait, neutral background, friendly confident expression, business ${businessType} context, ${PROMPT_SUFFIX}`

    case 'blog':
      return `editorial photography for ${businessType} article${titleHint}, magazine quality, ${PROMPT_SUFFIX}`

    case 'logo':
      return `minimal modern logo symbol for "${businessName}", ${businessType} industry, single elegant icon, flat vector design, white background, ${PROMPT_SUFFIX}`

    default:
      return `${businessName} ${businessType} premium professional image, ${colorMood} atmosphere${titleHint}, ${PROMPT_SUFFIX}`
  }
}

/**
 * Call Google Imagen 4.0 Fast API to generate a single image.
 */
const generateImage = async (
  prompt: string,
  aspectRatio: string,
  apiKey: string,
): Promise<string | null> => {
  const start = Date.now()

  try {
    const response = await fetch(`${IMAGEN_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio,
          outputOptions: { mimeType: 'image/jpeg' },
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[generate-images] Imagen API error (${response.status}): ${errorText}`)
      return null
    }

    const data = await response.json()
    const base64 = data?.predictions?.[0]?.bytesBase64Encoded

    if (!base64) {
      console.error('[generate-images] No image data in Imagen response')
      return null
    }

    const elapsed = Date.now() - start
    console.log(`[generate-images] Generated image in ${elapsed}ms (${aspectRatio})`)

    return `data:image/jpeg;base64,${base64}`
  } catch (err) {
    const elapsed = Date.now() - start
    console.error(`[generate-images] Failed after ${elapsed}ms:`, err)
    return null
  }
}

/**
 * POST /api/ai/generate-images
 *
 * Generates custom images for website sections using Google Imagen 4.0 Fast.
 * Returns base64 data URLs keyed by role (hero, logo, about, etc.).
 */
export const POST = async (request: Request) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: 'GEMINI_API_KEY not configured' },
        { status: 500 },
      )
    }

    const body = (await request.json()) as RequestBody
    const { businessName, businessType, sections } = body

    if (!businessName || !businessType || !sections?.length) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields: businessName, businessType, sections' },
        { status: 400 },
      )
    }

    const colorMood = getColorMood(body.colorPalette)
    const primary = body.colorPalette?.primary
    const secondary = body.colorPalette?.secondary

    // Build the list of image generation tasks
    const tasks: { key: string; prompt: string; aspectRatio: string }[] = []

    // Always generate a logo
    tasks.push({
      key: 'logo',
      prompt: buildPrompt('logo', businessName, businessType, colorMood, primary, secondary),
      aspectRatio: '1:1',
    })

    // Generate images for qualifying sections
    for (const section of sections) {
      const config = SECTION_IMAGE_CONFIG[section.type]
      if (!config) continue

      if (section.type === 'gallery') {
        // Gallery produces multiple images
        for (let i = 0; i < config.count; i++) {
          tasks.push({
            key: `gallery_${i}`,
            prompt: buildPrompt(
              'gallery', businessName, businessType, colorMood,
              primary, secondary, section.imagePrompt, section.title,
            ),
            aspectRatio: config.aspectRatio,
          })
        }
      } else {
        tasks.push({
          key: section.type,
          prompt: buildPrompt(
            section.type, businessName, businessType, colorMood,
            primary, secondary, section.imagePrompt, section.title,
          ),
          aspectRatio: config.aspectRatio,
        })
      }
    }

    // Cap to MAX_IMAGES_PER_REQUEST to stay within timeout
    const cappedTasks = tasks.slice(0, MAX_IMAGES_PER_REQUEST)

    if (cappedTasks.length < tasks.length) {
      console.log(
        `[generate-images] Capped from ${tasks.length} to ${cappedTasks.length} images`,
      )
    }

    const totalStart = Date.now()
    console.log(`[generate-images] Generating ${cappedTasks.length} images for "${businessName}" (${businessType})`)

    // Run all image generations in parallel
    const results = await Promise.all(
      cappedTasks.map(async (task) => {
        const dataUrl = await generateImage(task.prompt, task.aspectRatio, apiKey)
        return { key: task.key, dataUrl }
      }),
    )

    // Collect successful results into a record
    const images: Record<string, string> = {}
    let successCount = 0

    for (const result of results) {
      if (result.dataUrl) {
        images[result.key] = result.dataUrl
        successCount++
      }
    }

    const totalElapsed = Date.now() - totalStart
    console.log(
      `[generate-images] Completed: ${successCount}/${cappedTasks.length} images in ${totalElapsed}ms`,
    )

    return NextResponse.json({ ok: true, images })
  } catch (err) {
    console.error('[generate-images] Unexpected error:', err)
    return NextResponse.json(
      { ok: false, error: 'Failed to generate images' },
      { status: 500 },
    )
  }
}
