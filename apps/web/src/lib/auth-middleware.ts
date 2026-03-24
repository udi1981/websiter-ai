import { auth } from './auth'
import { headers } from 'next/headers'

type AuthUser = {
  userId: string
  email: string
}

/**
 * Check if dev-only auth bypass is allowed.
 * Requires BOTH:
 * 1. DEV_ONLY_AUTH_BYPASS=true env var explicitly set
 * 2. Request originates from localhost
 * Impossible to trigger accidentally in production.
 */
const isDevBypassAllowed = (req?: Request): boolean => {
  if (process.env.DEV_ONLY_AUTH_BYPASS !== 'true') return false
  if (!req) return false
  const host = req.headers.get('host') || ''
  return host.startsWith('localhost') || host.startsWith('127.0.0.1')
}

/**
 * Extract authenticated user from Better Auth session cookie.
 * Dev-only fallback: x-user-id header works ONLY when DEV_ONLY_AUTH_BYPASS=true
 * AND request is from localhost. Impossible to trigger in production.
 * Returns null if no valid session found.
 */
export const getAuthUser = async (req?: Request): Promise<AuthUser | null> => {
  try {
    // Try Better Auth session first (always)
    const session = await auth.api.getSession({
      headers: req ? req.headers : await headers(),
    })

    if (session?.user) {
      return {
        userId: session.user.id,
        email: session.user.email,
      }
    }

    // Dev-only fallback: x-user-id header (localhost + env var only)
    if (isDevBypassAllowed(req)) {
      const headersList = req ? req.headers : await headers()
      const userId = headersList.get('x-user-id')
      if (userId) {
        console.warn(`[auth] Dev bypass: using x-user-id header for user ${userId}`)
        return { userId, email: '' }
      }
    }

    return null
  } catch (err) {
    console.error('[auth-middleware] Error getting session:', err)

    // Dev-only fallback in error case too
    if (isDevBypassAllowed(req)) {
      try {
        const headersList = req ? req.headers : await headers()
        const userId = headersList.get('x-user-id')
        if (userId) {
          console.warn(`[auth] Dev bypass (error fallback): using x-user-id for ${userId}`)
          return { userId, email: '' }
        }
      } catch {
        // ignore
      }
    }

    return null
  }
}

/**
 * Require authentication — returns user or 401 Response.
 * Use in API route handlers: const user = await requireAuth(req); if (user instanceof Response) return user;
 */
export const requireAuth = async (req?: Request): Promise<AuthUser | Response> => {
  const user = await getAuthUser(req)
  if (!user) {
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return user
}
