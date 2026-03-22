import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/auth/google — Browser-native Google OAuth redirect
 *
 * This endpoint exists because BetterAuth's sign-in/social only accepts POST with JSON,
 * but browsers need a native navigation (not fetch) to properly set __Secure- cookies.
 *
 * Flow: Browser navigates here → we POST to BetterAuth internally → redirect to Google
 */
export async function GET(req: NextRequest) {
  const baseUrl = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    // Call BetterAuth's social sign-in endpoint internally
    const response = await fetch(`${baseUrl}/api/auth/sign-in/social`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'google', callbackURL: '/dashboard' }),
    })

    const data = await response.json()

    if (data?.url) {
      // Forward all Set-Cookie headers from BetterAuth to the browser
      const redirectResponse = NextResponse.redirect(data.url)
      const cookies = response.headers.getSetCookie()
      for (const cookie of cookies) {
        redirectResponse.headers.append('Set-Cookie', cookie)
      }
      return redirectResponse
    }

    // If no URL, Google OAuth is not configured
    return NextResponse.redirect(`${baseUrl}/login?error=google_not_configured`)
  } catch (error) {
    console.error('[Google OAuth] Error:', error)
    return NextResponse.redirect(`${baseUrl}/login?error=oauth_failed`)
  }
}
