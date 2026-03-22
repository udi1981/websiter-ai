import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
])

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

/**
 * POST /api/images/upload
 * Accepts multipart form data with an image file.
 * Validates type and size, returns base64 data URL.
 * TODO: Replace with Cloudflare R2 upload when ready.
 */
export const POST = async (request: Request) => {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: 'No file provided. Send a "file" field in multipart form data.' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          ok: false,
          error: `Unsupported file type: ${file.type}. Allowed: jpg, png, webp, gif, svg.`,
        },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
      return NextResponse.json(
        {
          ok: false,
          error: `File too large: ${sizeMB}MB. Maximum allowed: 5MB.`,
        },
        { status: 400 }
      )
    }

    // Convert to base64 data URL
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    return NextResponse.json({
      ok: true,
      url: dataUrl,
    })
  } catch (err) {
    console.error('Image upload error:', err)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
