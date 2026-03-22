import { auth } from './auth'
import { headers } from 'next/headers'

type AuthUser = {
  userId: string
  email: string
}

/**
 * Extract authenticated user from Better Auth session cookie.
 * Falls back to x-user-id header for backward compatibility with client-side calls.
 * Returns null if no valid session found.
 */
export const getAuthUser = async (req?: Request): Promise<AuthUser | null> => {
  try {
    // Try Better Auth session first
    const session = await auth.api.getSession({
      headers: req ? req.headers : await headers(),
    })

    if (session?.user) {
      return {
        userId: session.user.id,
        email: session.user.email,
      }
    }

    // Fallback: x-user-id header (for client-side API calls during migration)
    const headersList = req ? req.headers : await headers()
    const userId = headersList.get('x-user-id')
    if (userId) {
      return { userId, email: '' }
    }

    return null
  } catch (err) {
    console.error('[auth-middleware] Error getting session:', err)

    // Last resort: x-user-id header
    try {
      const headersList = req ? req.headers : await headers()
      const userId = headersList.get('x-user-id')
      if (userId) {
        return { userId, email: '' }
      }
    } catch {
      // ignore
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
